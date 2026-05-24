import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CommonActions } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AlertCircle, CalendarDays, Dumbbell, Play, UserRound } from 'lucide-react-native';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { useMyTrainer } from '@/features/trainer-link/hooks/use-trainer-link';
import { useRoutines } from '@/features/training/hooks/use-routines';
import { theme } from '@/theme';
import type { TrainerLinkStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<TrainerLinkStackParamList, 'AssignedRoutine'>;

const DAY_LABELS: Record<string, string> = {
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miércoles',
  thursday: 'Jueves',
  friday: 'Viernes',
  saturday: 'Sábado',
  sunday: 'Domingo',
};

export default function AssignedRoutineScreen({ navigation }: Props) {
  const { data, isLoading: trainerLoading, isError: trainerError, refetch: refetchTrainer } = useMyTrainer();
  const { data: routines, isLoading: routinesLoading, isError: routinesError, refetch: refetchRoutines } = useRoutines();
  const trainer = data?.trainer ?? null;

  const activeRoutine = routines?.find((r) => r.isActive) ?? null;
  const displayRoutine = activeRoutine;

  const startWorkout = React.useCallback(() => {
    navigation.getParent()?.dispatch(
      CommonActions.navigate({
        name: 'MainTabs',
        params: {
          screen: 'Workout',
          params: { screen: 'WorkoutStart' },
        },
      }),
    );
  }, [navigation]);

  const isLoading = trainerLoading || routinesLoading;
  const isError = trainerError || routinesError;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.primary} size="large" />
          <Text style={styles.centerText}>Cargando rutina asignada...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <StateBlock
          icon={<AlertCircle size={42} color={theme.colors.error} />}
          title="No pudimos cargar la rutina"
          text="Revisa tu conexion e intenta nuevamente."
          actionLabel="Reintentar"
          onAction={() => {
            refetchTrainer();
            refetchRoutines();
          }}
        />
      </SafeAreaView>
    );
  }

  if (!data?.hasTrainer || !trainer) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <StateBlock
          icon={<Dumbbell size={42} color={theme.colors.textMuted} />}
          title="No hay rutina asignada"
          text="Cuando tengas un entrenador vinculado, sus rutinas asignadas apareceran aqui."
          actionLabel="Buscar entrenador"
          onAction={() => navigation.replace('SearchTrainer')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Rutina asignada</Text>
          <Text style={styles.subtitle}>
            Sigue la rutina que tu entrenador preparo para tu siguiente bloque.
          </Text>
        </View>

        <View style={styles.trainerCard}>
          <View style={styles.trainerAvatar}>
            <UserRound size={26} color={theme.colors.primary} />
          </View>
          <View style={styles.trainerCopy}>
            <Text style={styles.trainerLabel}>Asignada por</Text>
            <Text style={styles.trainerName}>{trainer.displayName}</Text>
            <Text style={styles.trainerCode}>{trainer.trainerCode ?? 'Entrenador Endure'}</Text>
          </View>
        </View>

        {displayRoutine ? (
          <>
            <View style={styles.routineHero}>
              <View style={styles.routineIcon}>
                <Dumbbell size={30} color={theme.colors.background} />
              </View>
              <View style={styles.routineHeroCopy}>
                <Text style={styles.routineName}>{displayRoutine.name}</Text>
                <Text style={styles.routineMeta}>
                  {displayRoutine.dayOfWeeks.length} dias · Activa
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Plan semanal</Text>
              {displayRoutine.days.map((day) => (
                <View key={day.dayOfWeek} style={styles.dayCard}>
                  <Text style={styles.dayTitle}>
                    {DAY_LABELS[day.dayOfWeek] ?? day.dayOfWeek}
                  </Text>
                  {day.exercises.map((exercise) => (
                    <View key={exercise.id} style={styles.exerciseRow}>
                      <View style={styles.exerciseDot} />
                      <Text style={styles.exerciseText}>
                        {exercise.name}
                        {Array.isArray(exercise.sets)
                          ? ` · ${exercise.sets.length} series`
                          : typeof exercise.sets === 'number'
                            ? ` · ${exercise.sets} series`
                            : ''}
                      </Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </>
        ) : (
          <View style={styles.routineHero}>
            <View style={styles.routineIcon}>
              <Dumbbell size={30} color={theme.colors.background} />
            </View>
            <View style={styles.routineHeroCopy}>
              <Text style={styles.routineName}>Sin rutina activa</Text>
              <Text style={styles.routineMeta}>
                Crea o activa una rutina para empezar a entrenar con tu entrenador.
              </Text>
            </View>
          </View>
        )}

        <View style={styles.actions}>
          <PrimaryButton
            label="Empezar entrenamiento"
            onPress={startWorkout}
            icon={<Play size={18} color={theme.colors.background} />}
          />
          <SecondaryButton
            label="Ver entrenador"
            onPress={() => navigation.navigate('TrainerProfile', { trainerId: trainer.trainerId })}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function StateBlock({
  icon,
  title,
  text,
  actionLabel,
  onAction,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <View style={styles.center}>
      <View style={styles.stateIcon}>{icon}</View>
      <Text style={styles.centerTitle}>{title}</Text>
      <Text style={styles.centerText}>{text}</Text>
      <PrimaryButton label={actionLabel} onPress={onAction} />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scroll: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
    gap: theme.spacing.lg,
  },
  header: {
    gap: theme.spacing.sm,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading1.fontSize,
    lineHeight: theme.typography.heading1.lineHeight,
    fontWeight: theme.typography.heading1.fontWeight,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
  },
  trainerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
  },
  trainerAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  trainerCopy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  trainerLabel: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    textTransform: 'uppercase',
  },
  trainerName: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: theme.typography.bodyStrong.fontWeight,
  },
  trainerCode: {
    color: theme.colors.primary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    fontWeight: '700',
  },
  routineHero: {
    minHeight: 120,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg,
    backgroundColor: theme.colors.primaryMuted,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    padding: theme.spacing.lg,
  },
  routineIcon: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  routineHeroCopy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  routineName: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading2.fontSize,
    lineHeight: theme.typography.heading2.lineHeight,
    fontWeight: theme.typography.heading2.fontWeight,
  },
  routineMeta: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  noteCard: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
  },
  noteText: {
    flex: 1,
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
  },
  section: {
    gap: theme.spacing.md,
  },
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading3.fontSize,
    lineHeight: theme.typography.heading3.lineHeight,
    fontWeight: theme.typography.heading3.fontWeight,
  },
  dayCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  dayTitle: {
    color: theme.colors.primary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: theme.typography.bodyStrong.fontWeight,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  exerciseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  exerciseText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
  },
  actions: {
    gap: theme.spacing.md,
  },
  center: {
    flex: 1,
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
  },
  stateIcon: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading2.fontSize,
    lineHeight: theme.typography.heading2.lineHeight,
    fontWeight: theme.typography.heading2.fontWeight,
    textAlign: 'center',
  },
  centerText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    textAlign: 'center',
  },
});

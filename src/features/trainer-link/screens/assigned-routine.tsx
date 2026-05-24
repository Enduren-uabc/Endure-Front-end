import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Dumbbell,
  Lock,
  Play,
  RefreshCcw,
  UserRound,
} from 'lucide-react-native';
import { BaseCard } from '@/components/ui/BaseCard';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import {
  TrainingV2ProgressBar,
  TrainingV2Screen,
  TrainingV2SectionHeader,
  TrainingV2Tag,
} from '@/features/training/screens/v2/TrainingV2Primitives';
import { theme } from '@/theme';
import type { TrainerLinkStackParamList } from '@/navigation/types';
import { useAssignedRoutine } from '../hooks/use-assigned-routine';
import type { AssignedRoutineDay, AssignedRoutineDetail } from '../types/assigned-routine';

type Props = NativeStackScreenProps<TrainerLinkStackParamList, 'AssignedRoutine'>;

export default function AssignedRoutineScreen({ navigation }: Props) {
  const assignedRoutine = useAssignedRoutine();

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

  if (assignedRoutine.isLoading) {
    return (
      <AssignedRoutineState
        title="Cargando rutina"
        description="Estamos preparando la rutina que tu entrenador asigno."
        icon={<ActivityIndicator color={theme.colors.primary} size="large" />}
        onBack={() => navigation.goBack()}
      />
    );
  }

  if (assignedRoutine.isError) {
    return (
      <AssignedRoutineState
        title="No pudimos cargar la rutina"
        description={assignedRoutine.error?.message ?? 'Revisa tu conexion e intenta nuevamente.'}
        icon={<AlertCircle size={38} color={theme.colors.error} />}
        actionLabel="Reintentar"
        onAction={assignedRoutine.refetch}
        onBack={() => navigation.goBack()}
      />
    );
  }

  if (!assignedRoutine.hasTrainer) {
    return (
      <AssignedRoutineState
        title="Sin entrenador vinculado"
        description="Necesitas vincularte con un entrenador para recibir rutinas asignadas."
        icon={<Lock size={38} color={theme.colors.warning} />}
        actionLabel="Buscar entrenador"
        onAction={() => navigation.replace('SearchTrainer')}
        onBack={() => navigation.goBack()}
      />
    );
  }

  if (!assignedRoutine.data) {
    return (
      <AssignedRoutineState
        title="No hay rutina asignada"
        description="Cuando tu entrenador te asigne una rutina, aparecera aqui con el plan semanal."
        icon={<Dumbbell size={38} color={theme.colors.textMuted} />}
        actionLabel="Ver entrenador"
        onAction={() => navigation.navigate('MyTrainer')}
        onBack={() => navigation.goBack()}
      />
    );
  }

  const routine = assignedRoutine.data;

  return (
    <AssignedRoutineContent
      routine={routine}
      onBack={() => navigation.goBack()}
      onStartWorkout={startWorkout}
      onViewTrainer={() =>
        navigation.navigate('TrainerProfile', { trainerId: routine.trainer.id })
      }
    />
  );
}

function AssignedRoutineContent({
  routine,
  onBack,
  onStartWorkout,
  onViewTrainer,
}: {
  routine: AssignedRoutineDetail;
  onBack: () => void;
  onStartWorkout: () => void;
  onViewTrainer: () => void;
}) {
  const totalExercises = routine.days.reduce((total, day) => total + day.exercises.length, 0);
  const completedDays = routine.days.filter((day) => day.status === 'completed').length;

  return (
    <TrainingV2Screen
      title="Rutina asignada"
      subtitle="Plan preparado por tu entrenador"
      titleColor={theme.colors.textPrimary}
      onBack={onBack}
      footer={
        <View style={styles.footerActions}>
          <SecondaryButton label="Ver entrenador" onPress={onViewTrainer} style={styles.footerButton} />
          <PrimaryButton
            label="Empezar"
            onPress={onStartWorkout}
            icon={<Play size={18} color={theme.colors.background} />}
            style={styles.footerButton}
          />
        </View>
      }
    >
      <BaseCard style={styles.heroCard}>
        <View style={styles.heroTop}>
          <View style={styles.heroIcon}>
            <Dumbbell size={30} color={theme.colors.background} />
          </View>
          <View style={styles.heroCopy}>
            <Text style={styles.routineName}>{routine.name}</Text>
            <Text style={styles.routineMeta}>
              {routine.durationMinutes} min - {routine.level} - {totalExercises} ejercicios
            </Text>
          </View>
        </View>
        <View style={styles.tagRow}>
          <TrainingV2Tag label={routine.goal} tone="primary" />
          <TrainingV2Tag label={`${routine.days.length} dias`} />
          <TrainingV2Tag label={routine.status === 'active' ? 'Activa' : 'Pendiente'} tone="success" />
        </View>
        <TrainingV2ProgressBar
          progress={routine.adherenceTarget}
          label={`Meta de adherencia ${Math.round(routine.adherenceTarget * 100)}%`}
        />
      </BaseCard>

      <BaseCard style={styles.trainerCard}>
        <View style={styles.trainerAvatar}>
          <UserRound size={24} color={theme.colors.primary} />
        </View>
        <View style={styles.trainerCopy}>
          <Text style={styles.trainerLabel}>Asignada por</Text>
          <Text style={styles.trainerName}>{routine.trainer.name}</Text>
          <Text style={styles.trainerMeta}>{routine.trainer.code ?? 'Entrenador Endure'}</Text>
        </View>
        <CalendarDays size={20} color={theme.colors.textSecondary} />
      </BaseCard>

      <BaseCard style={styles.noteCard}>
        <Text style={styles.noteLabel}>Nota del entrenador</Text>
        <Text style={styles.noteText}>{routine.note}</Text>
        <Text style={styles.noteMeta}>
          Asignada {formatDate(routine.assignedAt)} - inicia {formatDate(routine.startsAt)}
        </Text>
      </BaseCard>

      <View style={styles.metricsRow}>
        <MetricCard label="Completados" value={`${completedDays}/${routine.days.length}`} />
        <MetricCard label="Ejercicios" value={String(totalExercises)} />
        <MetricCard label="Duracion" value={`${routine.durationMinutes}m`} />
      </View>

      <TrainingV2SectionHeader title="Plan semanal" />
      <View style={styles.days}>
        {routine.days.map((day) => (
          <AssignedRoutineDayCard key={day.id} day={day} />
        ))}
      </View>

      <BaseCard style={styles.integrationCard}>
        <Text style={styles.integrationTitle}>Preparada para integracion</Text>
        <Text style={styles.integrationText}>
          Esta vista consume `useAssignedRoutine()`. Hoy usa un mock aislado; la conexion real debe
          reemplazar ese hook sin cambiar la pantalla.
        </Text>
      </BaseCard>
    </TrainingV2Screen>
  );
}

function AssignedRoutineDayCard({ day }: { day: AssignedRoutineDay }) {
  const isToday = day.status === 'today';
  const isCompleted = day.status === 'completed';

  return (
    <BaseCard style={[styles.dayCard, isToday ? styles.dayCardToday : null]}>
      <View style={styles.dayHeader}>
        <View>
          <Text style={styles.dayTitle}>{day.label}</Text>
          <Text style={styles.dayHint}>{day.dateHint}</Text>
        </View>
        {isCompleted ? (
          <CheckCircle2 size={22} color={theme.colors.success} />
        ) : (
          <TrainingV2Tag label={isToday ? 'Hoy' : 'Pendiente'} tone={isToday ? 'primary' : 'default'} />
        )}
      </View>
      <View style={styles.exerciseList}>
        {day.exercises.map((exercise) => (
          <View key={exercise.id} style={styles.exerciseRow}>
            <View style={styles.exerciseIcon}>
              <Dumbbell size={16} color={theme.colors.primary} />
            </View>
            <View style={styles.exerciseCopy}>
              <Text style={styles.exerciseName}>{exercise.name}</Text>
              <Text style={styles.exerciseMeta}>
                {exercise.target} - {exercise.restLabel} - {exercise.muscleGroup}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </BaseCard>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <BaseCard style={styles.metricCard}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </BaseCard>
  );
}

function AssignedRoutineState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  onBack,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  onBack?: () => void;
}) {
  return (
    <TrainingV2Screen title="Rutina asignada" titleColor={theme.colors.textPrimary} onBack={onBack}>
      <BaseCard style={styles.stateCard}>
        <View style={styles.stateIcon}>{icon}</View>
        <Text style={styles.stateTitle}>{title}</Text>
        <Text style={styles.stateText}>{description}</Text>
        {actionLabel && onAction ? (
          <PrimaryButton
            label={actionLabel}
            onPress={onAction}
            icon={actionLabel === 'Reintentar' ? <RefreshCcw size={18} color={theme.colors.background} /> : undefined}
          />
        ) : null}
      </BaseCard>
    </TrainingV2Screen>
  );
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

const styles = StyleSheet.create({
  heroCard: {
    gap: theme.spacing.md,
    backgroundColor: theme.colors.surfaceElevated,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  heroIcon: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCopy: {
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
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  trainerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  trainerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primaryMuted,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trainerCopy: {
    flex: 1,
    gap: 2,
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
  trainerMeta: {
    color: theme.colors.primary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    fontWeight: '700',
  },
  noteCard: {
    gap: theme.spacing.xs,
  },
  noteLabel: {
    color: theme.colors.primary,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  noteText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
  },
  noteMeta: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  metricCard: {
    flex: 1,
    minHeight: 82,
    padding: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  metricValue: {
    color: theme.colors.textPrimary,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
  },
  metricLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
  },
  days: {
    gap: theme.spacing.md,
  },
  dayCard: {
    gap: theme.spacing.md,
  },
  dayCardToday: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryMuted,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  dayTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading3.fontSize,
    lineHeight: theme.typography.heading3.lineHeight,
    fontWeight: theme.typography.heading3.fontWeight,
  },
  dayHint: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  exerciseList: {
    gap: theme.spacing.sm,
  },
  exerciseRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    alignItems: 'center',
  },
  exerciseIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseCopy: {
    flex: 1,
    gap: 2,
  },
  exerciseName: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: theme.typography.bodyStrong.fontWeight,
  },
  exerciseMeta: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  integrationCard: {
    gap: theme.spacing.xs,
  },
  integrationTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    fontWeight: '800',
  },
  integrationText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  footerActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  footerButton: {
    flex: 1,
  },
  stateCard: {
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.xxl,
  },
  stateIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading3.fontSize,
    lineHeight: theme.typography.heading3.lineHeight,
    fontWeight: theme.typography.heading3.fontWeight,
    textAlign: 'center',
  },
  stateText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    textAlign: 'center',
  },
});

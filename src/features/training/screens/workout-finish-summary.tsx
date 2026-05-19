import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CheckCircle2 } from 'lucide-react-native';
import { BaseCard } from '@/components/ui/BaseCard';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { useWorkoutSessionDetail } from '@/features/training/hooks/use-workout-session';
import { DAY_OF_WEEK_LABELS } from '@/features/training/types/routine';
import type { WorkoutStackParamList } from '@/navigation/types';
import { theme } from '@/theme';

type Props = NativeStackScreenProps<
  WorkoutStackParamList,
  'WorkoutFinishSummary'
>;

function formatDuration(durationMinutes: number | null): string {
  if (durationMinutes === null) {
    return 'Sin duración';
  }
  if (durationMinutes < 1) {
    return 'Menos de 1 min';
  }
  return `${durationMinutes} min`;
}

export default function WorkoutFinishSummaryScreen({ navigation, route }: Props) {
  const { sessionId } = route.params;
  const sessionQuery = useWorkoutSessionDetail(sessionId);
  const session = sessionQuery.data;

  const stats = React.useMemo(() => {
    const exercises = session?.exercises ?? [];
    const sets = exercises.flatMap((exercise) => exercise.workoutSets);
    const completedSets = sets.filter((set) => set.completed).length;

    return {
      exercises: exercises.length,
      completedSets,
      pendingSets: sets.length - completedSets,
      totalSets: sets.length,
    };
  }, [session]);

  if (sessionQuery.isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (sessionQuery.isError || !session) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorState}>
          <Text style={styles.title}>No se pudo cargar el resumen</Text>
          <PrimaryButton label="Reintentar" onPress={() => sessionQuery.refetch()} />
          <SecondaryButton
            label="Volver"
            onPress={() => navigation.navigate('WorkoutStart')}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.hero}>
          <View style={styles.iconCircle}>
            <CheckCircle2 size={42} color={theme.colors.success} />
          </View>
          <Text style={styles.title}>Sesión guardada</Text>
          <Text style={styles.subtitle}>
            {session.routineName} · {DAY_OF_WEEK_LABELS[session.dayOfWeek]}
          </Text>
        </View>

        <View style={styles.statsGrid}>
          <BaseCard style={styles.statCard}>
            <Text style={styles.statValue}>{stats.exercises}</Text>
            <Text style={styles.statLabel}>Ejercicios</Text>
          </BaseCard>
          <BaseCard style={styles.statCard}>
            <Text style={styles.statValue}>{stats.completedSets}</Text>
            <Text style={styles.statLabel}>Sets hechos</Text>
          </BaseCard>
          <BaseCard style={styles.statCard}>
            <Text style={styles.statValue}>{stats.pendingSets}</Text>
            <Text style={styles.statLabel}>Pendientes</Text>
          </BaseCard>
          <BaseCard style={styles.statCard}>
            <Text style={styles.statValue}>
              {formatDuration(session.durationMinutes)}
            </Text>
            <Text style={styles.statLabel}>Duración</Text>
          </BaseCard>
        </View>

        <BaseCard style={styles.detailCard}>
          <Text style={styles.sectionTitle}>Detalle</Text>
          {session.exercises.map((exercise, index) => {
            const completed = exercise.workoutSets.filter(
              (set) => set.completed,
            ).length;
            return (
              <View key={exercise.exerciseId} style={styles.exerciseRow}>
                <View style={styles.exerciseIndex}>
                  <Text style={styles.exerciseIndexText}>{index + 1}</Text>
                </View>
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName}>{exercise.exerciseName}</Text>
                  <Text style={styles.exerciseMeta}>
                    {completed}/{exercise.workoutSets.length} sets completados
                  </Text>
                </View>
              </View>
            );
          })}
        </BaseCard>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          label="Volver a entrenamiento"
          onPress={() => navigation.navigate('WorkoutStart')}
        />
        <SecondaryButton
          label="Ver historial"
          onPress={() => navigation.navigate('WorkoutHistory')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: 180,
    gap: theme.spacing.lg,
  },
  hero: {
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  iconCircle: {
    width: 82,
    height: 82,
    borderRadius: 41,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${theme.colors.success}18`,
    marginBottom: theme.spacing.sm,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading1.fontSize,
    lineHeight: theme.typography.heading1.lineHeight,
    fontWeight: theme.typography.heading1.fontWeight,
    textAlign: 'center',
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    minHeight: 96,
    justifyContent: 'center',
    gap: theme.spacing.xs,
  },
  statValue: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading2.fontSize,
    lineHeight: theme.typography.heading2.lineHeight,
    fontWeight: theme.typography.heading2.fontWeight,
  },
  statLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  detailCard: {
    gap: theme.spacing.md,
  },
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading3.fontSize,
    lineHeight: theme.typography.heading3.lineHeight,
    fontWeight: theme.typography.heading3.fontWeight,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  exerciseIndex: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseIndexText: {
    color: theme.colors.primary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    fontWeight: '700',
  },
  exerciseInfo: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  exerciseName: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    fontWeight: '700',
  },
  exerciseMeta: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
    gap: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderTopColor: theme.colors.border,
    borderTopWidth: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
});

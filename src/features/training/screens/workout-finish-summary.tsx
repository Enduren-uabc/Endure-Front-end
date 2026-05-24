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
  if (durationMinutes === null) return 'Sin duración';
  if (durationMinutes < 1) return 'Menos de 1 min';
  return `${durationMinutes} min`;
}

function formatSetLabel(
  repsPerformed: number | null,
  weightUsed: number | null,
  targetReps: number | null,
  targetWeight: number | null,
): string {
  const actualReps = repsPerformed ?? targetReps ?? 0;
  const actualWeight = weightUsed ?? targetWeight ?? 0;
  const weightText = actualWeight > 0 ? ` · ${actualWeight}kg` : '';
  return `${actualReps} reps${weightText}`;
}

function hasDiff(
  repsPerformed: number | null,
  weightUsed: number | null,
  targetReps: number | null,
  targetWeight: number | null,
): boolean {
  if (repsPerformed === null && targetReps === null) return false;
  if (repsPerformed !== targetReps) return true;
  if (weightUsed !== targetWeight) return true;
  return false;
}

function formatTarget(
  targetReps: number | null,
  targetWeight: number | null,
): string {
  const weightText =
    targetWeight && targetWeight > 0 ? ` · ${targetWeight}kg` : '';
  return `${targetReps ?? '-'} reps${weightText}`;
}

function formatActual(
  repsPerformed: number | null,
  weightUsed: number | null,
): string {
  if (repsPerformed === null && weightUsed === null) return '—';
  const weightText =
    weightUsed && weightUsed > 0 ? ` · ${weightUsed}kg` : '';
  return `${repsPerformed ?? '-'} reps${weightText}`;
}

export default function WorkoutFinishSummaryScreen({
  navigation,
  route,
}: Props) {
  const { sessionId } = route.params;
  const sessionQuery = useWorkoutSessionDetail(sessionId);
  const session = sessionQuery.data;

  const stats = React.useMemo(() => {
    const exercises = session?.exercises ?? [];
    const sets = exercises.flatMap((exercise) => exercise.workoutSets);
    const completedSets = sets.filter((set) => set.completed).length;
    const modifiedSets = sets.filter(
      (set) =>
        set.completed &&
        hasDiff(
          set.repsPerformed,
          set.weightUsed,
          set.targetReps,
          set.targetWeight,
        ),
    ).length;

    return {
      exercises: exercises.length,
      completedSets,
      pendingSets: sets.length - completedSets,
      totalSets: sets.length,
      modifiedSets,
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
          <Text style={styles.sectionTitle}>Detalle por ejercicio</Text>
          {session.exercises.map((exercise, index) => {
            const completed = exercise.workoutSets.filter(
              (set) => set.completed,
            ).length;
            return (
              <View key={exercise.exerciseId} style={styles.exerciseBlock}>
                <View style={styles.exerciseHeader}>
                  <View style={styles.exerciseIndex}>
                    <Text style={styles.exerciseIndexText}>{index + 1}</Text>
                  </View>
                  <View style={styles.exerciseInfo}>
                    <Text style={styles.exerciseName}>
                      {exercise.exerciseName}
                    </Text>
                    <Text style={styles.exerciseMeta}>
                      {completed}/{exercise.workoutSets.length} sets completados
                    </Text>
                  </View>
                </View>

                {/* Set breakdown with planned vs actual */}
                <View style={styles.setsBreakdown}>
                  <View style={styles.setHeaderRow}>
                    <Text style={styles.setHeaderCell}>Set</Text>
                    <Text style={styles.setHeaderCell}>Planeado</Text>
                    <Text style={styles.setHeaderCell}>Real</Text>
                  </View>
                  {exercise.workoutSets.map((set) => {
                    const differs = hasDiff(
                      set.repsPerformed,
                      set.weightUsed,
                      set.targetReps,
                      set.targetWeight,
                    );
                    return (
                      <View
                        key={set.setNumber}
                        style={[
                          styles.setRow,
                          differs && styles.setRowModified,
                        ]}
                      >
                        <Text style={styles.setCell}>
                          {set.setNumber}
                          {set.completed ? ' ✓' : ' ○'}
                        </Text>
                        <Text style={styles.setCell}>
                          {formatTarget(set.targetReps, set.targetWeight)}
                        </Text>
                        <Text
                          style={[
                            styles.setCell,
                            set.completed
                              ? styles.setCellActual
                              : styles.setCellPending,
                            differs && styles.setCellModified,
                          ]}
                        >
                          {set.completed
                            ? formatActual(set.repsPerformed, set.weightUsed)
                            : '—'}
                        </Text>
                      </View>
                    );
                  })}
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
  exerciseBlock: {
    gap: theme.spacing.sm,
  },
  exerciseHeader: {
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
  setsBreakdown: {
    marginLeft: 46,
    gap: theme.spacing.xs,
    borderLeftWidth: 1,
    borderLeftColor: theme.colors.border,
    paddingLeft: theme.spacing.md,
  },
  setHeaderRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.xs,
  },
  setHeaderCell: {
    flex: 1,
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  setRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.sm,
  },
  setRowModified: {
    backgroundColor: `${theme.colors.warning}14`,
    paddingHorizontal: theme.spacing.sm,
    marginHorizontal: -theme.spacing.sm,
  },
  setCell: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  setCellActual: {
    color: theme.colors.success,
    fontWeight: '700',
  },
  setCellPending: {
    color: theme.colors.textMuted,
  },
  setCellModified: {
    color: theme.colors.warning,
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

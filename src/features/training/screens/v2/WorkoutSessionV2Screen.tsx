import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AlertCircle, Pause, Play, TimerReset, X, Zap } from 'lucide-react-native';
import { BaseCard } from '@/components/ui/BaseCard';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { theme } from '@/theme';
import {
  TrainingV2FieldPreview,
  TrainingV2ProgressBar,
  TrainingV2Screen,
  TrainingV2SheetPreview,
  TrainingV2Tag,
} from './TrainingV2Primitives';
import { ExerciseSetList } from '../../components/ExerciseSetList';
import {
  useWorkoutSessionDetail,
  useRegisterWorkoutSet,
  useCompleteWorkoutSet,
  useAddWorkoutSet,
  useRemoveWorkoutSet,
  useAdvanceWorkoutExercise,
  useFinishWorkoutSession,
  useDiscardWorkoutSession,
} from '@/features/training/hooks/use-workout-session';
import { useTrainingStrategies } from '@/features/training/hooks/use-training-strategies';
import { calculateNextSet } from '@/features/training/hooks/use-training-strategy';
import { useRoutineDetail } from '@/features/training/hooks/use-routines';
import type { WorkoutStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<WorkoutStackParamList, 'WorkoutSession'>;

const REST_DURATIONS: Record<string, number> = {
  straight: 90,
  ascending: 60,
  descending: 60,
  drop_sets: 120,
  wave_loading: 90,
};

function getRestDuration(strategyKey: string | null | undefined): number {
  if (strategyKey && REST_DURATIONS[strategyKey]) return REST_DURATIONS[strategyKey];
  return 90;
}

const STRATEGY_LABELS: Record<string, string> = {
  straight: 'Estática',
  ascending: 'Ascendente',
  descending: 'Descendente',
  drop_sets: 'Drop Sets',
  wave_loading: 'Wave',
};

export default function WorkoutSessionV2Screen({ navigation, route }: Props) {
  const { data: session, isLoading, isError, refetch } = useWorkoutSessionDetail(route.params.sessionId);
  const registerSet = useRegisterWorkoutSet();
  const completeSet = useCompleteWorkoutSet();
  const addSet = useAddWorkoutSet();
  const removeSet = useRemoveWorkoutSet();
  const advanceExercise = useAdvanceWorkoutExercise();
  const finishSessionMut = useFinishWorkoutSession();
  const discardSession = useDiscardWorkoutSession();
  const { data: strategies } = useTrainingStrategies();
  const { data: routine } = useRoutineDetail(session?.routineId ?? '');

  const strategyKey = routine?.trainingStrategyKey ?? null;
  const strategy = strategies?.find((s) => s.key === strategyKey) ?? null;

  const [showExitConfirm, setShowExitConfirm] = React.useState(false);
  const [showTransitionCard, setShowTransitionCard] = React.useState(false);
  const [hasDeclinedTransition, setHasDeclinedTransition] = React.useState(false);
  const [restTimeLeft, setRestTimeLeft] = React.useState(0);
  const restTimerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const [selectedExerciseIdx, setSelectedExerciseIdx] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (session && selectedExerciseIdx === null) {
      setSelectedExerciseIdx(session.currentExerciseIndex ?? 0);
    }
  }, [session]);

  React.useEffect(() => {
    if (session) {
      setSelectedExerciseIdx(session.currentExerciseIndex ?? 0);
    }
  }, [session?.currentExerciseIndex]);

  const currentExerciseIdx = selectedExerciseIdx ?? session?.currentExerciseIndex ?? 0;
  const currentExercise = session?.exercises?.[currentExerciseIdx];
  const allWorkoutSets = currentExercise?.workoutSets ?? [];
  const completedCount = allWorkoutSets.filter((s) => s.completed).length;
  const totalSets = allWorkoutSets.length;
  const allCompleted = totalSets > 0 && completedCount === totalSets;
  const isLastExercise = currentExerciseIdx + 1 >= (session?.exercises?.length ?? 0);

  const completedSetsCount = session?.exercises?.reduce(
    (sum, ex) => sum + (ex.workoutSets?.filter((s) => s.completed).length ?? 0), 0
  ) ?? 0;
  const totalSetsCount = session?.exercises?.reduce(
    (sum, ex) => sum + (ex.workoutSets?.length ?? ex.targetSets?.length ?? 0), 0
  ) ?? 0;

  const targetReps = currentExercise?.targetSets?.[0]?.reps ?? 8;
  const targetWeight = currentExercise?.targetSets?.[0]?.weight ?? 0;
  const completedSetsData = allWorkoutSets
    .filter((s) => s.completed)
    .map((s) => ({
      setNumber: s.setNumber,
      reps: s.repsPerformed ?? s.targetReps ?? targetReps,
      weight: s.weightUsed ?? s.targetWeight ?? targetWeight,
    }));

  const nextSuggested = calculateNextSet(
    strategy?.rules ?? null,
    completedSetsData,
    targetWeight,
    targetReps,
  );

  const suggestedReps = nextSuggested.reps;
  const suggestedWeight = nextSuggested.weight;

  const restDuration = getRestDuration(strategyKey);
  const strategyLabel = strategyKey ? STRATEGY_LABELS[strategyKey] ?? strategyKey : null;

  function startRestTimer() {
    if (restTimerRef.current) clearInterval(restTimerRef.current);
    setRestTimeLeft(restDuration);
    restTimerRef.current = setInterval(() => {
      setRestTimeLeft((prev) => {
        if (prev <= 1) {
          if (restTimerRef.current) clearInterval(restTimerRef.current);
          restTimerRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function stopRestTimer() {
    if (restTimerRef.current) {
      clearInterval(restTimerRef.current);
      restTimerRef.current = null;
    }
    setRestTimeLeft(0);
  }

  React.useEffect(() => {
    if (allCompleted) {
      startRestTimer();
      setHasDeclinedTransition(false);
      setShowTransitionCard(true);
    } else {
      setShowTransitionCard(false);
      setHasDeclinedTransition(false);
    }
    return () => {
      if (restTimerRef.current) clearInterval(restTimerRef.current);
    };
  }, [allCompleted]);

  const handleAdvance = React.useCallback(() => {
    if (!session) return;
    stopRestTimer();
    advanceExercise.mutate(
      { sessionId: session.id, allowIncomplete: true },
      { onSuccess: () => refetch() },
    );
  }, [session, advanceExercise, refetch]);

  const handleFinish = React.useCallback(() => {
    if (!session) return;
    stopRestTimer();
    finishSessionMut.mutate({ sessionId: session.id }, {
      onSuccess: () => {
        navigation.replace('WorkoutFinishSummary', { sessionId: session.id });
      },
    });
  }, [session, finishSessionMut, navigation]);

  const handleDiscard = React.useCallback(() => {
    if (!session) return;
    stopRestTimer();
    discardSession.mutate({ sessionId: session.id }, {
      onSuccess: () => {
        navigation.navigate('WorkoutStart');
      },
    });
  }, [session, discardSession, navigation]);

  const handleRegisterSet = React.useCallback(async (args: {
    sessionId: string;
    exerciseIndex: number;
    setNumber: number;
    repsPerformed: number;
    weightUsed: number;
  }) => {
    try {
      await registerSet.mutateAsync(args);
    } catch (err) {
      console.error('Error al registrar set:', err);
    }
  }, [registerSet]);

  const handleCompleteSet = React.useCallback(async (args: {
    sessionId: string;
    exerciseIndex: number;
    setNumber: number;
  }) => {
    try {
      await completeSet.mutateAsync(args);
    } catch (err) {
      console.error('Error al completar/descompletar set:', err);
      throw err;
    }
  }, [completeSet]);

  const handleAddSet = React.useCallback((args: {
    sessionId: string;
    exerciseIndex: number;
    reps: number;
    weight: number;
  }) => {
    addSet.mutate(args);
  }, [addSet]);

  const handleRemoveSet = React.useCallback((args: {
    sessionId: string;
    exerciseIndex: number;
    setNumber: number;
  }) => {
    removeSet.mutate(args);
  }, [removeSet]);

  const isPending = registerSet.isPending || completeSet.isPending || addSet.isPending || removeSet.isPending;

  if (isLoading) {
    return (
      <TrainingV2Screen title="Entrenamiento" backgroundColor="#000000">
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.primary} size="large" />
          <Text style={styles.centerText}>Cargando sesion...</Text>
        </View>
      </TrainingV2Screen>
    );
  }

  if (isError || !session) {
    return (
      <TrainingV2Screen title="Entrenamiento" backgroundColor="#000000">
        <View style={styles.center}>
          <AlertCircle size={44} color={theme.colors.error} />
          <Text style={styles.centerTitle}>No pudimos cargar la sesion</Text>
          <Text style={styles.centerText}>Revisa tu conexion e intenta nuevamente.</Text>
          <SecondaryButton label="Reintentar" onPress={() => refetch()} />
        </View>
      </TrainingV2Screen>
    );
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <TrainingV2Screen
      title={session.routineName ?? 'Entrenamiento'}
      titleColor={theme.colors.textPrimary}
      backgroundColor="#000000"
      footer={
        <View style={styles.footerActions}>
          <SecondaryButton
            label="Salir de la sesión"
            onPress={() => setShowExitConfirm(true)}
            style={styles.centeredFooterButton}
          />
        </View>
      }
    >
      <View style={styles.topActions}>
        <View style={styles.topActionsLeft}>
          <View style={styles.sessionPill}>
            <Pause size={16} color={theme.colors.primary} />
            <Text style={styles.sessionPillText}>
              {session.status === 'finished' ? 'Finalizada' : 'En progreso'}
            </Text>
          </View>
          {strategyLabel ? (
            <View style={styles.strategyPill}>
              <Zap size={14} color={theme.colors.warning} />
              <Text style={styles.strategyPillText}>{strategyLabel}</Text>
            </View>
          ) : null}
        </View>
        <TouchableOpacity
          activeOpacity={0.78}
          onPress={() => setShowExitConfirm(true)}
          style={styles.closeButton}
          accessibilityRole="button"
          accessibilityLabel="Cerrar entrenamiento"
        >
          <X size={20} color={theme.colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {session.exercises && session.exercises.length > 1 && (
        <View style={styles.exerciseTabsWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.exerciseTabsRow}
          >
            {session.exercises.map((ex, idx) => {
              const isActive = currentExerciseIdx === idx;
              const isExCompleted = ex.workoutSets?.every((s) => s.completed) && ex.workoutSets.length > 0;
              
              return (
                <TouchableOpacity
                  key={ex.exerciseId || String(idx)}
                  activeOpacity={0.7}
                  onPress={() => {
                    setSelectedExerciseIdx(idx);
                  }}
                  style={[
                    styles.exerciseTab,
                    isActive && styles.exerciseTabActive,
                    isExCompleted && styles.exerciseTabCompleted
                  ]}
                >
                  <Text style={[
                    styles.exerciseTabText,
                    isActive && styles.exerciseTabTextActive,
                    isExCompleted && styles.exerciseTabTextCompleted
                  ]}>
                    {ex.exerciseName} {isExCompleted ? '✓' : ''}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {currentExercise ? (
        <BaseCard style={styles.exerciseCard}>
          <Text style={styles.exerciseTitle}>{currentExercise.exerciseName}</Text>
          <View style={styles.tagRow}>
            {currentExercise.targetSets?.[0] ? (
              <>
                <TrainingV2Tag
                  label={`${currentExercise.targetSets[0].reps} reps objetivo`}
                  tone="primary"
                />
                <TrainingV2Tag
                  label={`${currentExercise.targetSets[0].weight} kg objetivo`}
                />
              </>
            ) : null}
          </View>
          <Text style={styles.exerciseProgress}>
            {completedCount} de {totalSets} series completadas
          </Text>
        </BaseCard>
      ) : null}

      {currentExercise ? (
        <ExerciseSetList
          workoutSets={currentExercise.workoutSets}
          targetSets={currentExercise.targetSets}
          exerciseIndex={currentExerciseIdx}
          onRegisterSet={handleRegisterSet}
          onCompleteSet={handleCompleteSet}
          onAddSet={handleAddSet}
          onRemoveSet={handleRemoveSet}
          sessionId={session.id}
          isPending={isPending}
          suggestedReps={suggestedReps}
          suggestedWeight={suggestedWeight}
        />
      ) : null}

      {allCompleted && showTransitionCard && (
        <BaseCard style={styles.transitionCard}>
          <View style={styles.transitionHeader}>
            <View style={styles.transitionBadge}>
              <Zap size={16} color={theme.colors.primary} />
              <Text style={styles.transitionBadgeText}>¡Ejercicio Completado!</Text>
            </View>
          </View>
          
          <Text style={styles.transitionTitle}>
            {isLastExercise 
              ? "¿Listo para finalizar tu entrenamiento?" 
              : "¿Deseas avanzar al siguiente ejercicio?"}
          </Text>
          
          {!isLastExercise && session.exercises && session.exercises[currentExerciseIdx + 1] && (
            <Text style={styles.transitionSubtitle}>
              Próximo: {session.exercises[currentExerciseIdx + 1].exerciseName}
            </Text>
          )}

          <View style={styles.transitionActions}>
            <SecondaryButton
              label="Quedarme aquí"
              onPress={() => {
                setHasDeclinedTransition(true);
                setShowTransitionCard(false);
              }}
              style={styles.transitionSecondaryBtn}
            />
            <PrimaryButton
              label={isLastExercise ? "Finalizar" : "Avanzar"}
              onPress={isLastExercise ? handleFinish : handleAdvance}
              loading={isLastExercise ? finishSessionMut.isPending : advanceExercise.isPending}
              style={styles.transitionPrimaryBtn}
            />
          </View>
        </BaseCard>
      )}

      {allCompleted && hasDeclinedTransition && (
        <View style={styles.declinedTransitionContainer}>
          <PrimaryButton
            label={isLastExercise ? "Finalizar entrenamiento" : "Siguiente ejercicio"}
            onPress={isLastExercise ? handleFinish : handleAdvance}
            loading={isLastExercise ? finishSessionMut.isPending : advanceExercise.isPending}
            style={styles.declinedTransitionButton}
          />
        </View>
      )}

      {allCompleted && restTimeLeft > 0 && (
        <BaseCard style={styles.restCard}>
          <TouchableOpacity
            onPress={stopRestTimer}
            style={styles.restContent}
            activeOpacity={0.78}
          >
            <Play size={18} color={theme.colors.primary} />
            <View>
              <Text style={styles.restTimer}>{formatTime(restTimeLeft)}</Text>
              <Text style={styles.restLabel}>Descanso — toca para saltar</Text>
            </View>
          </TouchableOpacity>
        </BaseCard>
      )}

      <View style={styles.metaGrid}>
        <TrainingV2FieldPreview
          label="Siguiente"
          value={!isLastExercise && session.exercises
            ? session.exercises[currentExerciseIdx + 1].exerciseName
            : 'Ultimo ejercicio'}
          helper={!isLastExercise ? 'Siguiente' : 'Finalizar'}
        />
        <TrainingV2FieldPreview
          label="Descanso"
          value={`${restDuration}s`}
          helper={strategyLabel ? `Segun ${strategyLabel}` : 'Entre series'}
        />
      </View>

      <BaseCard style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <TimerReset size={20} color={theme.colors.primary} />
          <Text style={styles.progressTitle}>Avance de rutina</Text>
        </View>
        <TrainingV2ProgressBar
          progress={totalSetsCount > 0 ? completedSetsCount / totalSetsCount : 0}
          label={`${completedSetsCount} de ${totalSetsCount} series completadas`}
        />
      </BaseCard>

      {showExitConfirm ? (
        <TrainingV2SheetPreview
          title="Abandonar entrenamiento"
          description="Si sales ahora, la sesion quedara descartada."
        >
          <View style={styles.exitActions}>
            <SecondaryButton
              label="Seguir entrenando"
              onPress={() => setShowExitConfirm(false)}
              style={styles.footerButton}
            />
            <SecondaryButton
              label="Descartar sesion"
              onPress={handleDiscard}
              style={styles.footerButton}
            />
          </View>
        </TrainingV2SheetPreview>
      ) : null}
    </TrainingV2Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.xl,
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
  topActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topActionsLeft: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    alignItems: 'center',
    flex: 1,
  },
  sessionPill: {
    minHeight: 36,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primaryMuted,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  sessionPillText: {
    color: theme.colors.primary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    fontWeight: '700',
  },
  strategyPill: {
    minHeight: 36,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.warning,
    paddingHorizontal: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  strategyPillText: {
    color: theme.colors.warning,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    fontWeight: '700',
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseCard: {
    backgroundColor: '#050505',
    gap: theme.spacing.sm,
  },
  exerciseTitle: {
    color: theme.colors.textPrimary,
    fontSize: 36,
    lineHeight: 42,
    fontWeight: '800',
  },
  tagRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    flexWrap: 'wrap',
  },
  exerciseProgress: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  restCard: {
    backgroundColor: theme.colors.primaryMuted,
    borderColor: theme.colors.primary,
    borderWidth: 1,
  },
  restContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  restTimer: {
    color: theme.colors.primary,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
  },
  restLabel: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
  },
  metaGrid: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  progressCard: {
    gap: theme.spacing.md,
    backgroundColor: '#050505',
  },
  progressHeader: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    alignItems: 'center',
  },
  progressTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: theme.typography.bodyStrong.fontWeight,
  },
  exitActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  footerActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    justifyContent: 'center',
    width: '100%',
  },
  footerButton: {
    flex: 1,
  },
  centeredFooterButton: {
    flex: 1,
    maxWidth: 240,
  },
  transitionCard: {
    backgroundColor: '#0F0F12',
    borderColor: theme.colors.primary,
    borderWidth: 1,
    padding: theme.spacing.lg,
    marginTop: theme.spacing.md,
    borderRadius: theme.radius.lg,
    gap: theme.spacing.md,
  },
  transitionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transitionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.primaryMuted,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  transitionBadgeText: {
    color: theme.colors.primary,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  transitionTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading3.fontSize,
    lineHeight: theme.typography.heading3.lineHeight,
    fontWeight: '800',
  },
  transitionSubtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  transitionActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.xs,
  },
  transitionPrimaryBtn: {
    flex: 1,
  },
  transitionSecondaryBtn: {
    flex: 1,
  },
  declinedTransitionContainer: {
    marginTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.xs,
  },
  declinedTransitionButton: {
    width: '100%',
  },
  exerciseTabsWrapper: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  exerciseTabsRow: {
    paddingHorizontal: theme.spacing.sm,
    gap: theme.spacing.sm,
    alignItems: 'center',
    height: 48,
  },
  exerciseTab: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderSoft,
  },
  exerciseTabActive: {
    backgroundColor: theme.colors.primaryMuted,
    borderColor: theme.colors.primary,
  },
  exerciseTabCompleted: {
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    borderColor: 'rgba(34, 197, 94, 0.35)',
  },
  exerciseTabText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    fontWeight: '700',
  },
  exerciseTabTextActive: {
    color: theme.colors.primary,
  },
  exerciseTabTextCompleted: {
    color: theme.colors.success,
  },
});

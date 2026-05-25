import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AlertCircle, Check, Pause, TimerReset, X, Zap } from 'lucide-react-native';
import { BaseCard } from '@/components/ui/BaseCard';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { TextInput } from '@/components/ui/TextInput';
import { theme } from '@/theme';
import {
  TrainingV2FieldPreview,
  TrainingV2ProgressBar,
  TrainingV2Screen,
  TrainingV2SheetPreview,
  TrainingV2Tag,
} from './TrainingV2Primitives';
import {
  useWorkoutSessionDetail,
  useRegisterWorkoutSet,
  useAdvanceWorkoutExercise,
  useFinishWorkoutSession,
  useDiscardWorkoutSession,
} from '@/features/training/hooks/use-workout-session';
import { useTrainingStrategies } from '@/features/training/hooks/use-training-strategies';
import { useRoutineDetail } from '@/features/training/hooks/use-routines';
import { calculateNextSet } from '@/features/training/hooks/use-training-strategy';
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
  const advanceExercise = useAdvanceWorkoutExercise();
  const finishSessionMut = useFinishWorkoutSession();
  const discardSession = useDiscardWorkoutSession();
  const { data: strategies } = useTrainingStrategies();
  const { data: routine } = useRoutineDetail(session?.routineId ?? '');

  const strategyKey = routine?.trainingStrategyKey ?? null;
  const strategy = strategies?.find((s) => s.key === strategyKey) ?? null;
  const rules = strategy?.rules ?? null;

  const [reps, setReps] = React.useState('');
  const [weight, setWeight] = React.useState('');
  const [setCompleted, setSetCompleted] = React.useState(false);
  const [showExitConfirm, setShowExitConfirm] = React.useState(false);
  const [restTimeLeft, setRestTimeLeft] = React.useState(0);
  const restTimerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const currentExerciseIdx = session?.currentExerciseIndex ?? 0;
  const currentExercise = session?.exercises?.[currentExerciseIdx];
  const currentSet = currentExercise?.workoutSets?.find((s) => !s.completed)
    ?? currentExercise?.targetSets?.[0];
  const currentSetNumber = currentSet?.setNumber ?? 1;
  const totalSetsInExercise = currentExercise?.workoutSets?.length ?? currentExercise?.targetSets?.length ?? 0;
  const completedSetsCount = session?.exercises?.reduce(
    (sum, ex) => sum + (ex.workoutSets?.filter((s) => s.completed).length ?? 0), 0
  ) ?? 0;
  const totalSetsCount = session?.exercises?.reduce(
    (sum, ex) => sum + (ex.workoutSets?.length ?? ex.targetSets?.length ?? 0), 0
  ) ?? 0;

  const completedSets = currentExercise?.workoutSets?.filter((s) => s.completed) ?? [];
  const nextSuggested = calculateNextSet(
    rules,
    completedSets.map((s) => ({
      setNumber: s.setNumber,
      reps: s.repsPerformed ?? s.targetReps ?? 8,
      weight: s.weightUsed ?? s.targetWeight ?? 0,
    })),
    currentSet?.targetWeight ?? currentSet?.weight ?? 0,
    currentSet?.targetReps ?? currentSet?.reps ?? 8,
  );

  const suggestedReps = setCompleted ? '' : String(nextSuggested.reps);
  const suggestedWeight = setCompleted ? '' : String(nextSuggested.weight);

  const isValid = Number(reps) > 0 && Number(weight) >= 0;

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
    return () => {
      if (restTimerRef.current) clearInterval(restTimerRef.current);
    };
  }, []);

  const handleCompleteSet = React.useCallback(() => {
    if (!session || !currentExercise) return;

    if (setCompleted) {
      stopRestTimer();
      finishSessionMut.mutate({ sessionId: session.id }, {
        onSuccess: () => {
          navigation.replace('WorkoutFinishSummary', { sessionId: session.id });
        },
      });
      return;
    }

    registerSet.mutate(
      {
        sessionId: session.id,
        exerciseIndex: currentExerciseIdx,
        setNumber: currentSetNumber,
        repsPerformed: Number(reps),
        weightUsed: Number(weight),
      },
      {
        onSuccess: () => {
          setSetCompleted(true);
          startRestTimer();
        },
      },
    );
  }, [session, currentExercise, currentExerciseIdx, currentSetNumber, reps, weight, setCompleted, registerSet, finishSessionMut, navigation]);

  const handleAdvance = React.useCallback(() => {
    if (!session) return;
    stopRestTimer();
    advanceExercise.mutate(
      { sessionId: session.id, allowIncomplete: true },
      {
        onSuccess: () => {
          setSetCompleted(false);
          setReps(suggestedReps);
          setWeight(suggestedWeight);
        },
      },
    );
  }, [session, advanceExercise, suggestedReps, suggestedWeight]);

  const handleDiscard = React.useCallback(() => {
    if (!session) return;
    stopRestTimer();
    discardSession.mutate({ sessionId: session.id }, {
      onSuccess: () => {
        navigation.navigate('WorkoutStart');
      },
    });
  }, [session, discardSession, navigation]);

  const handleManualRestart = React.useCallback(() => {
    if (restTimeLeft > 0) {
      stopRestTimer();
    } else {
      startRestTimer();
    }
  }, [restTimeLeft]);

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
          {setCompleted ? (
            <>
              {restTimeLeft > 0 ? (
                <TouchableOpacity
                  onPress={handleManualRestart}
                  style={styles.restTimerButton}
                  activeOpacity={0.78}
                >
                  <Text style={styles.restTimerCountdown}>{formatTime(restTimeLeft)}</Text>
                  <Text style={styles.restTimerLabel}>Toca para saltar descanso</Text>
                </TouchableOpacity>
              ) : (
                <SecondaryButton
                  label="Reiniciar descanso"
                  onPress={handleManualRestart}
                  style={styles.footerButton}
                />
              )}
              <PrimaryButton
                label="Siguiente"
                onPress={handleAdvance}
                loading={advanceExercise.isPending}
                style={styles.footerButton}
              />
            </>
          ) : (
            <>
              <SecondaryButton
                label="Salir"
                onPress={() => setShowExitConfirm(true)}
                style={styles.footerButton}
              />
              <PrimaryButton
                label="Completar serie"
                onPress={handleCompleteSet}
                disabled={!isValid || registerSet.isPending}
                loading={registerSet.isPending}
                icon={<Check size={18} color={theme.colors.background} />}
                style={styles.footerButton}
              />
            </>
          )}
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
              <Zap size={14} color={theme.colors.primary} />
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

      {currentExercise ? (
        <BaseCard style={styles.exerciseCard}>
          <Text style={styles.exerciseCounter}>
            Serie {currentSetNumber} de {totalSetsInExercise}
          </Text>
          <Text style={styles.exerciseTitle}>{currentExercise.exerciseName}</Text>
          <View style={styles.tagRow}>
            <TrainingV2Tag label={`${'targetReps' in (currentSet ?? {}) ? (currentSet as any).targetReps : (currentSet as any).reps ?? 0} reps objetivo`} tone="primary" />
            <TrainingV2Tag label={`${'targetWeight' in (currentSet ?? {}) ? (currentSet as any).targetWeight : (currentSet as any).weight ?? 0} kg objetivo`} />
          </View>
        </BaseCard>
      ) : null}

      {!setCompleted ? (
        <View style={styles.inputGrid}>
          <TextInput
            label="Reps reales"
            value={reps}
            onChangeText={setReps}
            placeholder={suggestedReps || String('targetReps' in (currentSet ?? {}) ? (currentSet as any).targetReps ?? 8 : (currentSet as any).reps ?? 8)}
            keyboardType="numeric"
            inputMode="numeric"
            error={Number(reps) <= 0 && reps.length > 0 ? 'Ingresa reps validas.' : undefined}
          />
          <TextInput
            label="Peso usado"
            value={weight}
            onChangeText={setWeight}
            placeholder={suggestedWeight || String('targetWeight' in (currentSet ?? {}) ? (currentSet as any).targetWeight ?? 0 : (currentSet as any).weight ?? 0)}
            keyboardType="numeric"
            inputMode="decimal"
            error={Number(weight) < 0 ? 'El peso no puede ser negativo.' : undefined}
          />
        </View>
      ) : null}

      {setCompleted && nextSuggested && (
        <BaseCard style={styles.suggestionCard}>
          <Zap size={16} color={theme.colors.primary} />
          <Text style={styles.suggestionText}>
            Siguiente serie sugerida: <Text style={styles.suggestionBold}>{nextSuggested.reps} reps</Text> con <Text style={styles.suggestionBold}>{nextSuggested.weight} kg</Text>
          </Text>
        </BaseCard>
      )}

      <View style={styles.metaGrid}>
        <TrainingV2FieldPreview
          label="Siguiente"
          value={currentExerciseIdx + 1 < (session.exercises?.length ?? 0)
            ? session.exercises[currentExerciseIdx + 1].exerciseName
            : 'Ultimo ejercicio'}
          helper={currentExerciseIdx + 1 < (session.exercises?.length ?? 0) ? 'Siguiente' : 'Finalizar'}
        />
        <TrainingV2FieldPreview label="Descanso" value={`${restDuration}s`} helper={strategyLabel ? `Segun estrategia ${strategyLabel}` : 'Entre series'} />
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

      {setCompleted ? (
        <TrainingV2SheetPreview
          title={restTimeLeft > 0 ? `Descanso ${formatTime(restTimeLeft)}` : 'Serie completada'}
          description={`Registraste ${reps} reps con ${weight} kg. Puedes avanzar al siguiente ejercicio o finalizar.`}
        >
          <View style={styles.restTimerActions}>
            {restTimeLeft > 0 ? (
              <TouchableOpacity
                onPress={handleManualRestart}
                style={styles.restTimerBigButton}
                activeOpacity={0.78}
              >
                <Text style={styles.restTimerBigText}>{formatTime(restTimeLeft)}</Text>
                <Text style={styles.restTimerBigLabel}>Saltar descanso</Text>
              </TouchableOpacity>
            ) : null}
            <PrimaryButton
              label="Siguiente ejercicio"
              onPress={handleAdvance}
              loading={advanceExercise.isPending}
            />
            <SecondaryButton label="Finalizar sesion" onPress={handleCompleteSet} />
          </View>
        </TrainingV2SheetPreview>
      ) : null}

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
            <PrimaryButton
              label="Descartar sesion"
              onPress={handleDiscard}
              loading={discardSession.isPending}
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
    minHeight: 190,
    justifyContent: 'center',
  },
  exerciseCounter: {
    color: theme.colors.primary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    fontWeight: '800',
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
  inputGrid: {
    gap: theme.spacing.md,
  },
  suggestionCard: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    alignItems: 'center',
    backgroundColor: theme.colors.primaryMuted,
    borderColor: theme.colors.primary,
    borderWidth: 1,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
  },
  suggestionText: {
    flex: 1,
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  suggestionBold: {
    color: theme.colors.primary,
    fontWeight: '800',
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
  restTimerActions: {
    gap: theme.spacing.md,
  },
  restTimerButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primaryMuted,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    flex: 1,
  },
  restTimerCountdown: {
    color: theme.colors.primary,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
  },
  restTimerLabel: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
  },
  restTimerBigButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primaryMuted,
    borderRadius: theme.radius.lg,
    paddingVertical: theme.spacing.xl,
  },
  restTimerBigText: {
    color: theme.colors.primary,
    fontSize: 48,
    lineHeight: 56,
    fontWeight: '800',
  },
  restTimerBigLabel: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    marginTop: theme.spacing.xs,
  },
  exitActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  footerActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  footerButton: {
    flex: 1,
  },
});

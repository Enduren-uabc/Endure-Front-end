import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AlertCircle, Check, Pause, TimerReset, X } from 'lucide-react-native';
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
import type { WorkoutStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<WorkoutStackParamList, 'WorkoutSession'>;

export default function WorkoutSessionV2Screen({ navigation, route }: Props) {
  const { data: session, isLoading, isError, refetch } = useWorkoutSessionDetail(route.params.sessionId);
  const registerSet = useRegisterWorkoutSet();
  const advanceExercise = useAdvanceWorkoutExercise();
  const finishSessionMut = useFinishWorkoutSession();
  const discardSession = useDiscardWorkoutSession();

  const [reps, setReps] = React.useState('');
  const [weight, setWeight] = React.useState('');
  const [setCompleted, setSetCompleted] = React.useState(false);
  const [showExitConfirm, setShowExitConfirm] = React.useState(false);

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

  const isValid = Number(reps) > 0 && Number(weight) >= 0;

  const handleCompleteSet = React.useCallback(() => {
    if (!session || !currentExercise) return;

    if (setCompleted) {
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
        },
      },
    );
  }, [session, currentExercise, currentExerciseIdx, currentSetNumber, reps, weight, setCompleted, registerSet, finishSessionMut, navigation]);

  const handleAdvance = React.useCallback(() => {
    if (!session) return;
    advanceExercise.mutate(
      { sessionId: session.id, allowIncomplete: true },
      {
        onSuccess: () => {
          setSetCompleted(false);
          setReps('');
          setWeight('');
        },
      },
    );
  }, [session, advanceExercise]);

  const handleDiscard = React.useCallback(() => {
    if (!session) return;
    discardSession.mutate({ sessionId: session.id }, {
      onSuccess: () => {
        navigation.navigate('WorkoutStart');
      },
    });
  }, [session, discardSession, navigation]);

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

  return (
    <TrainingV2Screen
      title={session.routineName ?? 'Entrenamiento'}
      titleColor={theme.colors.textPrimary}
      backgroundColor="#000000"
      footer={
        <View style={styles.footerActions}>
          {setCompleted ? (
            <>
              <SecondaryButton
                label="Siguiente ejercicio"
                onPress={handleAdvance}
                style={styles.footerButton}
              />
              <PrimaryButton
                label="Finalizar sesion"
                onPress={handleCompleteSet}
                icon={<Check size={18} color={theme.colors.background} />}
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
        <View style={styles.sessionPill}>
          <Pause size={16} color={theme.colors.primary} />
          <Text style={styles.sessionPillText}>
            {session.status === 'finished' ? 'Finalizada' : 'En progreso'}
          </Text>
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
            placeholder={String('targetReps' in (currentSet ?? {}) ? (currentSet as any).targetReps ?? 8 : (currentSet as any).reps ?? 8)}
            keyboardType="numeric"
            inputMode="numeric"
            error={Number(reps) <= 0 && reps.length > 0 ? 'Ingresa reps validas.' : undefined}
          />
          <TextInput
            label="Peso usado"
            value={weight}
            onChangeText={setWeight}
            placeholder={String('targetWeight' in (currentSet ?? {}) ? (currentSet as any).targetWeight ?? 0 : (currentSet as any).weight ?? 0)}
            keyboardType="numeric"
            inputMode="decimal"
            error={Number(weight) < 0 ? 'El peso no puede ser negativo.' : undefined}
          />
        </View>
      ) : null}

      <View style={styles.metaGrid}>
        <TrainingV2FieldPreview
          label="Siguiente"
          value={currentExerciseIdx + 1 < (session.exercises?.length ?? 0)
            ? session.exercises[currentExerciseIdx + 1].exerciseName
            : 'Ultimo ejercicio'}
          helper={currentExerciseIdx + 1 < (session.exercises?.length ?? 0) ? 'Siguiente' : 'Finalizar'}
        />
        <TrainingV2FieldPreview label="Descanso" value="90s" helper="Entre series" />
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
          title="Serie completada"
          description={`Registraste ${reps} reps con ${weight} kg. Puedes avanzar al siguiente ejercicio o finalizar.`}
        >
          <View style={styles.restTimer}>
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
  exerciseMeta: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
  },
  tagRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    flexWrap: 'wrap',
  },
  inputGrid: {
    gap: theme.spacing.md,
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
  restTimer: {
    gap: theme.spacing.md,
  },
  restTimerText: {
    color: theme.colors.textPrimary,
    fontSize: 48,
    lineHeight: 56,
    fontWeight: '800',
    textAlign: 'center',
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

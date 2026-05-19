import React from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ArrowLeft, Check, ChevronRight, Save } from 'lucide-react-native';
import { BaseCard } from '@/components/ui/BaseCard';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import {
  useAdvanceWorkoutExercise,
  useCompleteWorkoutSet,
  useFinishWorkoutSession,
  useWorkoutSessionDetail,
} from '@/features/training/hooks/use-workout-session';
import type {
  WorkoutExercise,
  WorkoutSession,
  WorkoutSet,
} from '@/features/training/types/workout-session';
import type { WorkoutStackParamList } from '@/navigation/types';
import { theme } from '@/theme';

type Props = NativeStackScreenProps<WorkoutStackParamList, 'WorkoutSession'>;

function getSetTarget(set: WorkoutSet): string {
  const reps = set.repsPerformed ?? set.targetReps ?? 0;
  const weight = set.weightUsed ?? set.targetWeight ?? 0;
  const weightText = weight > 0 ? ` · ${weight}kg` : '';
  return `${reps} reps${weightText}`;
}

function getExerciseProgress(exercise: WorkoutExercise) {
  const completed = exercise.workoutSets.filter((set) => set.completed).length;
  return {
    completed,
    total: exercise.workoutSets.length,
  };
}

export default function WorkoutSessionScreen({ navigation, route }: Props) {
  const { sessionId } = route.params;
  const sessionQuery = useWorkoutSessionDetail(sessionId);
  const completeSetMutation = useCompleteWorkoutSet();
  const advanceMutation = useAdvanceWorkoutExercise();
  const finishMutation = useFinishWorkoutSession();

  const [mutationError, setMutationError] = React.useState<string | null>(null);

  const session = sessionQuery.data;
  const currentExercise = session?.exercises[session.currentExerciseIndex];
  const exerciseProgress = currentExercise
    ? getExerciseProgress(currentExercise)
    : { completed: 0, total: 0 };
  const isBusy =
    completeSetMutation.isPending ||
    advanceMutation.isPending ||
    finishMutation.isPending;
  const isLastExercise = session
    ? session.currentExerciseIndex >= session.exercises.length - 1
    : false;
  const progressPercent =
    session && exerciseProgress.total > 0
      ? ((session.currentExerciseIndex +
          exerciseProgress.completed / exerciseProgress.total) /
          session.exercises.length) *
        100
      : 0;

  React.useEffect(() => {
    if (session?.status === 'finished') {
      navigation.replace('WorkoutFinishSummary', { sessionId: session.id });
    }
  }, [navigation, session]);

  const finishSession = React.useCallback(
    (targetSession: WorkoutSession) => {
      finishMutation.mutate(
        { sessionId: targetSession.id },
        {
          onSuccess: (finishedSession) => {
            navigation.replace('WorkoutFinishSummary', {
              sessionId: finishedSession.id,
            });
          },
          onError: (error) => setMutationError(error.message),
        },
      );
    },
    [finishMutation, navigation],
  );

  const autoAdvanceIfNeeded = React.useCallback(
    (updatedSession: WorkoutSession, exerciseIndex: number) => {
      const updatedExercise = updatedSession.exercises[exerciseIndex];
      if (!updatedExercise?.workoutSets.every((set) => set.completed)) {
        return;
      }

      if (exerciseIndex >= updatedSession.exercises.length - 1) {
        finishSession(updatedSession);
        return;
      }

      advanceMutation.mutate(
        { sessionId: updatedSession.id, allowIncomplete: false },
        {
          onError: (error) => setMutationError(error.message),
        },
      );
    },
    [advanceMutation, finishSession],
  );

  const handleCompleteSet = (set: WorkoutSet) => {
    if (!session || !currentExercise || set.completed || isBusy) return;
    setMutationError(null);

    completeSetMutation.mutate(
      {
        sessionId: session.id,
        exerciseIndex: session.currentExerciseIndex,
        setNumber: set.setNumber,
      },
      {
        onSuccess: (updatedSession) => {
          autoAdvanceIfNeeded(updatedSession, session.currentExerciseIndex);
        },
        onError: (error) => setMutationError(error.message),
      },
    );
  };

  const handleManualNext = () => {
    if (!session || isLastExercise || isBusy) return;
    setMutationError(null);
    advanceMutation.mutate(
      { sessionId: session.id, allowIncomplete: true },
      {
        onError: (error) => setMutationError(error.message),
      },
    );
  };

  const handleFinishEarly = () => {
    if (!session || isBusy) return;

    Alert.alert(
      'Terminar sesión',
      'Se guardarán los sets completados y los pendientes quedarán como no realizados.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Terminar y guardar',
          style: 'destructive',
          onPress: () => {
            setMutationError(null);
            finishSession(session);
          },
        },
      ],
    );
  };

  if (sessionQuery.isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (sessionQuery.isError || !session || !currentExercise) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorState}>
          <Text style={styles.errorTitle}>No se pudo cargar la sesión</Text>
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
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.navigate('WorkoutStart')}
        >
          <ArrowLeft size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.title}>Sesión activa</Text>
          <Text style={styles.subtitle}>
            Ejercicio {session.currentExerciseIndex + 1} de{' '}
            {session.exercises.length}
          </Text>
        </View>
        <View style={styles.iconButton} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${progressPercent}%` },
            ]}
          />
        </View>

        <BaseCard style={styles.exerciseCard}>
          <Text style={styles.exerciseOrder}>
            {session.currentExerciseIndex + 1}/{session.exercises.length}
          </Text>
          <Text style={styles.exerciseName}>{currentExercise.exerciseName}</Text>
          <Text style={styles.exerciseMeta}>
            {exerciseProgress.completed} de {exerciseProgress.total} sets
            completados
          </Text>
        </BaseCard>

        <View style={styles.setsList}>
          {currentExercise.workoutSets.map((set) => (
            <TouchableOpacity
              key={set.setNumber}
              activeOpacity={0.8}
              disabled={set.completed || isBusy}
              onPress={() => handleCompleteSet(set)}
            >
              <BaseCard
                style={[
                  styles.setCard,
                  set.completed && styles.setCardCompleted,
                ]}
              >
                <View style={styles.setRow}>
                  <View
                    style={[
                      styles.checkCircle,
                      set.completed && styles.checkCircleCompleted,
                    ]}
                  >
                    {set.completed && (
                      <Check size={16} color={theme.colors.background} />
                    )}
                  </View>
                  <View style={styles.setTextBlock}>
                    <Text style={styles.setTitle}>Set {set.setNumber}</Text>
                    <Text style={styles.setMeta}>{getSetTarget(set)}</Text>
                  </View>
                  {!set.completed && (
                    <Text style={styles.tapHint}>Tocar al terminar</Text>
                  )}
                </View>
              </BaseCard>
            </TouchableOpacity>
          ))}
        </View>

        {mutationError && <Text style={styles.errorText}>{mutationError}</Text>}
      </ScrollView>

      <View style={styles.footer}>
        {!isLastExercise && (
          <SecondaryButton
            label="Siguiente ejercicio"
            onPress={handleManualNext}
            disabled={isBusy}
          />
        )}
        <TouchableOpacity
          style={[styles.finishButton, isBusy && styles.finishButtonDisabled]}
          onPress={handleFinishEarly}
          disabled={isBusy}
        >
          <Save size={18} color={theme.colors.textPrimary} />
          <Text style={styles.finishButtonText}>Terminar y guardar</Text>
          <ChevronRight size={18} color={theme.colors.textMuted} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading3.fontSize,
    lineHeight: theme.typography.heading3.lineHeight,
    fontWeight: theme.typography.heading3.fontWeight,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 180,
    gap: theme.spacing.md,
  },
  progressTrack: {
    height: 8,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfaceElevated,
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primary,
  },
  exerciseCard: {
    gap: theme.spacing.sm,
  },
  exerciseOrder: {
    color: theme.colors.primary,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    fontWeight: '700',
  },
  exerciseName: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading2.fontSize,
    lineHeight: theme.typography.heading2.lineHeight,
    fontWeight: theme.typography.heading2.fontWeight,
  },
  exerciseMeta: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
  },
  setsList: {
    gap: theme.spacing.md,
  },
  setCard: {
    padding: theme.spacing.md,
  },
  setCardCompleted: {
    borderColor: theme.colors.success,
    backgroundColor: `${theme.colors.success}14`,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  checkCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleCompleted: {
    backgroundColor: theme.colors.success,
    borderColor: theme.colors.success,
  },
  setTextBlock: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  setTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    fontWeight: '700',
  },
  setMeta: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  tapHint: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    textAlign: 'center',
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
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  finishButton: {
    minHeight: 48,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  finishButtonDisabled: {
    opacity: 0.6,
  },
  finishButtonText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.button.fontSize,
    lineHeight: theme.typography.button.lineHeight,
    fontWeight: theme.typography.button.fontWeight,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  errorTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading3.fontSize,
    lineHeight: theme.typography.heading3.lineHeight,
    fontWeight: theme.typography.heading3.fontWeight,
    textAlign: 'center',
  },
});

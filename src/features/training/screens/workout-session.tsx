import React from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  List,
  Maximize2,
  Minimize2,
  Play,
  Plus,
  Save,
  Trash2,
  X,
} from 'lucide-react-native';
import { BaseCard } from '@/components/ui/BaseCard';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import {
  useAddWorkoutSet,
  useAdvanceWorkoutExercise,
  useCompleteWorkoutSet,
  useDiscardWorkoutSession,
  useFinishWorkoutSession,
  useRegisterWorkoutSet,
  useRemoveWorkoutSet,
  useWorkoutSessionDetail,
} from '@/features/training/hooks/use-workout-session';
import {
  useWorkoutSessionStore,
  type WorkoutSessionStoreState,
  type WorkoutSessionStoreActions,
} from '@/features/training/stores/workout-session-store';
import type {
  WorkoutExercise,
  WorkoutSession,
  WorkoutSet,
} from '@/features/training/types/workout-session';
import type { WorkoutStackParamList } from '@/navigation/types';
import { theme } from '@/theme';

type Props = NativeStackScreenProps<WorkoutStackParamList, 'WorkoutSession'>;

function getExerciseProgress(exercise: WorkoutExercise) {
  const completed = exercise.workoutSets.filter((set) => set.completed).length;
  return { completed, total: exercise.workoutSets.length };
}

function RestTimer() {
  const restTimerActive = useWorkoutSessionStore((s) => s.restTimerActive);
  const restEndTime = useWorkoutSessionStore((s) => s.restEndTime);
  const stopRestTimer = useWorkoutSessionStore((s) => s.stopRestTimer);
  const [displaySeconds, setDisplaySeconds] = React.useState(0);

  React.useEffect(() => {
    if (!restTimerActive || restEndTime === null) {
      setDisplaySeconds(0);
      return;
    }

    const tick = () => {
      const remaining = Math.max(0, Math.floor((restEndTime - Date.now()) / 1000));
      setDisplaySeconds(remaining);
      if (remaining <= 0) {
        stopRestTimer();
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [restTimerActive, restEndTime, stopRestTimer]);

  if (!restTimerActive) return null;

  const minutes = Math.floor(displaySeconds / 60);
  const seconds = displaySeconds % 60;

  return (
    <View style={styles.restTimerBanner}>
      <Clock size={20} color={theme.colors.warning} />
      <Text style={styles.restTimerText}>
        Descanso {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </Text>
      <TouchableOpacity onPress={stopRestTimer} style={styles.restTimerDismiss}>
        <X size={18} color={theme.colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );
}

function OverviewTab({
  exercises,
  currentExerciseIndex,
  viewingExerciseIndex,
  onSelectExercise,
  onBackToSingle,
}: {
  exercises: WorkoutExercise[];
  currentExerciseIndex: number;
  viewingExerciseIndex: number;
  onSelectExercise: (index: number) => void;
  onBackToSingle: () => void;
}) {
  return (
    <View style={styles.overviewContainer}>
      <TouchableOpacity style={styles.overviewBackButton} onPress={onBackToSingle}>
        <Minimize2 size={16} color={theme.colors.primary} />
        <Text style={styles.overviewBackText}>Vista individual</Text>
      </TouchableOpacity>

      {exercises.map((exercise, index) => {
        const progress = getExerciseProgress(exercise);
        const isCurrent = index === currentExerciseIndex;
        const isViewing = index === viewingExerciseIndex;
        const isComplete = progress.completed === progress.total && progress.total > 0;
        const isPartial = progress.completed > 0 && progress.completed < progress.total;

        return (
          <TouchableOpacity
            key={exercise.exerciseId}
            activeOpacity={0.7}
            onPress={() => onSelectExercise(index)}
          >
            <BaseCard
              style={[
                styles.overviewCard,
                isViewing && styles.overviewCardSelected,
                isComplete && styles.overviewCardComplete,
              ]}
            >
              <View style={styles.overviewCardRow}>
                <View style={styles.overviewCardIndex}>
                  <Text style={styles.overviewCardIndexText}>{index + 1}</Text>
                </View>
                <View style={styles.overviewCardInfo}>
                  <Text style={styles.overviewCardName}>{exercise.exerciseName}</Text>
                  <Text style={styles.overviewCardMeta}>
                    {progress.completed}/{progress.total} sets
                    {isCurrent ? ' · Actual' : ''}
                  </Text>
                </View>
                <View style={styles.overviewCardStatus}>
                  {isComplete && <Check size={18} color={theme.colors.success} />}
                  {isPartial && (
                    <Text style={styles.overviewCardPartial}>
                      {Math.round((progress.completed / progress.total) * 100)}%
                    </Text>
                  )}
                </View>
              </View>
            </BaseCard>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function WorkoutSessionScreen({ navigation, route }: Props) {
  const { sessionId } = route.params;
  const sessionQuery = useWorkoutSessionDetail(sessionId);
  const completeSetMutation = useCompleteWorkoutSet();
  const registerSetMutation = useRegisterWorkoutSet();
  const advanceMutation = useAdvanceWorkoutExercise();
  const finishMutation = useFinishWorkoutSession();
  const addSetMutation = useAddWorkoutSet();
  const removeSetMutation = useRemoveWorkoutSet();

  const viewingExerciseIndex = useWorkoutSessionStore((s) => s.viewingExerciseIndex);
  const viewMode = useWorkoutSessionStore((s) => s.viewMode);
  const localEdits = useWorkoutSessionStore((s) => s.localEdits);
  const mutationError = useWorkoutSessionStore((s) => s.mutationError);
  const restTimerActive = useWorkoutSessionStore((s) => s.restTimerActive);
  const getEditKey = useWorkoutSessionStore((s) => s.getEditKey);
  const {
    setSessionId,
    clearStore,
    setViewingExerciseIndex,
    setViewMode,
    setMutationError,
    setLocalEdit,
    clearLocalEdit,
    startRestTimer,
    stopRestTimer,
  } = useWorkoutSessionStore.getState();

  React.useEffect(() => {
    setSessionId(sessionId);
    return () => {
      clearStore();
    };
  }, [sessionId, setSessionId, clearStore]);

  const session = sessionQuery.data;
  const currentExerciseIndex = session?.currentExerciseIndex ?? 0;
  const currentExercise = session?.exercises[viewingExerciseIndex] ?? null;
  const exerciseProgress = currentExercise
    ? getExerciseProgress(currentExercise)
    : { completed: 0, total: 0 };
  const isMutating =
    completeSetMutation.isPending ||
    advanceMutation.isPending ||
    finishMutation.isPending ||
    registerSetMutation.isPending ||
    addSetMutation.isPending ||
    removeSetMutation.isPending;

  const progressPercent = session
    ? ((currentExerciseIndex +
        exerciseProgress.completed / Math.max(exerciseProgress.total, 1)) /
        session.exercises.length) *
      100
    : 0;

  React.useEffect(() => {
    if (session?.status === 'finished') {
      navigation.replace('WorkoutFinishSummary', { sessionId: session.id });
    }
  }, [navigation, session]);

  React.useEffect(() => {
    setViewingExerciseIndex(currentExerciseIndex);
  }, [currentExerciseIndex, setViewingExerciseIndex]);

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
    [finishMutation, navigation, setMutationError],
  );

  const autoAdvanceIfNeeded = React.useCallback(
    (updatedSession: WorkoutSession, exerciseIdx: number) => {
      const updatedExercise = updatedSession.exercises[exerciseIdx];
      if (!updatedExercise?.workoutSets.every((set) => set.completed)) return;

      if (exerciseIdx >= updatedSession.exercises.length - 1) {
        finishSession(updatedSession);
        return;
      }

      advanceMutation.mutate(
        { sessionId: updatedSession.id, allowIncomplete: false },
        {
          onSuccess: (advancedSession) => {
            setViewingExerciseIndex(advancedSession.currentExerciseIndex);
          },
          onError: (error) => setMutationError(error.message),
        },
      );
    },
    [advanceMutation, finishSession, setViewingExerciseIndex, setMutationError],
  );

  const handleCompleteSet = (set: WorkoutSet) => {
    if (!session || !currentExercise || set.completed || isMutating) return;
    setMutationError(null);

    const key = getEditKey(viewingExerciseIndex, set.setNumber);
    const edit = localEdits[key];
    const reps = edit ? parseInt(edit.reps, 10) : set.targetReps;
    const weight = edit ? parseFloat(edit.weight) : set.targetWeight;

    if (!reps || reps < 1) {
      setMutationError('Las repeticiones deben ser al menos 1.');
      return;
    }
    if (weight === null || weight === undefined || weight < 0) {
      setMutationError('El peso no puede ser negativo.');
      return;
    }

    const hasChanges =
      reps !== set.targetReps || weight !== set.targetWeight;

    const doComplete = (updatedSession: WorkoutSession) => {
      completeSetMutation.mutate(
        {
          sessionId: updatedSession.id,
          exerciseIndex: viewingExerciseIndex,
          setNumber: set.setNumber,
        },
        {
          onSuccess: (completedSession) => {
            clearLocalEdit(viewingExerciseIndex, set.setNumber);
            autoAdvanceIfNeeded(completedSession, viewingExerciseIndex);
          },
          onError: (error) => setMutationError(error.message),
        },
      );
    };

    if (hasChanges) {
      registerSetMutation.mutate(
        {
          sessionId: session.id,
          exerciseIndex: viewingExerciseIndex,
          setNumber: set.setNumber,
          repsPerformed: reps,
          weightUsed: weight,
        },
        {
          onSuccess: (updatedSession) => doComplete(updatedSession),
          onError: (error) => setMutationError(error.message),
        },
      );
    } else {
      doComplete(session);
    }
  };

  const handleAddSet = () => {
    if (!session || !currentExercise || isMutating) return;
    setMutationError(null);

    addSetMutation.mutate(
      {
        sessionId: session.id,
        exerciseIndex: viewingExerciseIndex,
        reps: 10,
        weight: 0,
      },
      { onError: (error) => setMutationError(error.message) },
    );
  };

  const handleRemoveSet = (setNumber: number) => {
    if (!session || isMutating) return;
    setMutationError(null);

    removeSetMutation.mutate(
      {
        sessionId: session.id,
        exerciseIndex: viewingExerciseIndex,
        setNumber,
      },
      { onError: (error) => setMutationError(error.message) },
    );
  };

  const handlePreviousExercise = () => {
    if (viewingExerciseIndex <= 0) return;
    setViewingExerciseIndex(viewingExerciseIndex - 1);
    setViewMode('single');
  };

  const handleNextExercise = () => {
    if (!session) return;
    if (viewingExerciseIndex >= session.exercises.length - 1) return;

    if (viewingExerciseIndex === currentExerciseIndex) {
      advanceMutation.mutate(
        { sessionId: session.id, allowIncomplete: true },
        {
          onSuccess: (updatedSession) => {
            setViewingExerciseIndex(updatedSession.currentExerciseIndex);
          },
          onError: (error) => setMutationError(error.message),
        },
      );
    } else {
      setViewingExerciseIndex(viewingExerciseIndex + 1);
    }
  };

  const discardSessionMutation = useDiscardWorkoutSession();

  const handleDiscard = () => {
    if (!session || isMutating) return;

    Alert.alert(
      'Descartar sesión',
      'Todo el progreso de esta sesión se perderá permanentemente. Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Descartar',
          style: 'destructive',
          onPress: () => {
            setMutationError(null);
            discardSessionMutation.mutate(
              { sessionId: session.id },
              {
                onSuccess: () => {
                  navigation.navigate('WorkoutStart');
                },
                onError: (error) => setMutationError(error.message),
              },
            );
          },
        },
      ],
    );
  };

  const handleFinishEarly = () => {
    if (!session || isMutating) return;

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

  const isLastExercise = session
    ? viewingExerciseIndex >= session.exercises.length - 1
    : false;
  const isFirstExercise = viewingExerciseIndex <= 0;

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
            {viewingExerciseIndex !== currentExerciseIndex
              ? `Viendo ejercicio ${viewingExerciseIndex + 1}`
              : `Ejercicio ${viewingExerciseIndex + 1} de ${session.exercises.length}`}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() =>
            setViewMode(
              viewMode === 'single' ? 'overview' : 'single',
            )
          }
        >
          {viewMode === 'single' ? (
            <List size={24} color={theme.colors.primary} />
          ) : (
            <Maximize2 size={24} color={theme.colors.primary} />
          )}
        </TouchableOpacity>
      </View>

      <RestTimer />

      {viewMode === 'overview' ? (
        <OverviewTab
          exercises={session.exercises}
          currentExerciseIndex={currentExerciseIndex}
          viewingExerciseIndex={viewingExerciseIndex}
          onSelectExercise={(index) => {
            setViewingExerciseIndex(index);
            setViewMode('single');
          }}
          onBackToSingle={() => setViewMode('single')}
        />
      ) : (
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
              {viewingExerciseIndex + 1}/{session.exercises.length}
              {viewingExerciseIndex !== currentExerciseIndex && (
                <Text style={styles.exerciseOrderNote}>
                  {'  (navegación libre)'}
                </Text>
              )}
            </Text>
            <Text style={styles.exerciseName}>{currentExercise.exerciseName}</Text>
            <Text style={styles.exerciseMeta}>
              {exerciseProgress.completed} de {exerciseProgress.total} sets
              completados
            </Text>
          </BaseCard>

          <View style={styles.setsList}>
            {currentExercise.workoutSets.map((set) => (
              <BaseCard
                key={set.setNumber}
                style={[
                  styles.setCard,
                  set.completed && styles.setCardCompleted,
                ]}
              >
                <View style={styles.setRow}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    disabled={set.completed || isMutating}
                    onPress={() => handleCompleteSet(set)}
                    style={styles.checkCircleTouchable}
                  >
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
                  </TouchableOpacity>

                  <View style={styles.setTextBlock}>
                    <View style={styles.setTitleRow}>
                      <Text style={styles.setTitle}>Set {set.setNumber}</Text>
                      {currentExercise.workoutSets.length > 1 && !set.completed && (
                        <TouchableOpacity
                          onPress={() => handleRemoveSet(set.setNumber)}
                          style={styles.removeSetButtonInline}
                        >
                          <Trash2 size={14} color={theme.colors.error} />
                        </TouchableOpacity>
                      )}
                    </View>

                    {!set.completed ? (
                      <View style={styles.editInputsRow}>
                        <View style={styles.editInputGroup}>
                          <TextInput
                            style={styles.editInput}
                            value={
                              localEdits[
                                getEditKey(viewingExerciseIndex, set.setNumber)
                              ]?.reps ?? String(set.targetReps ?? '')
                            }
                            onChangeText={(text) =>
                              setLocalEdit(
                                viewingExerciseIndex,
                                set.setNumber,
                                text,
                                localEdits[
                                  getEditKey(viewingExerciseIndex, set.setNumber)
                                ]?.weight ?? String(set.targetWeight ?? '0'),
                              )
                            }
                            keyboardType="numeric"
                            placeholder="Reps"
                            placeholderTextColor={theme.colors.textMuted}
                          />
                          <Text style={styles.inputLabel}>reps</Text>
                        </View>
                        <View style={styles.editInputGroup}>
                          <TextInput
                            style={styles.editInput}
                            value={
                              localEdits[
                                getEditKey(viewingExerciseIndex, set.setNumber)
                              ]?.weight ?? String(set.targetWeight ?? '0')
                            }
                            onChangeText={(text) =>
                              setLocalEdit(
                                viewingExerciseIndex,
                                set.setNumber,
                                localEdits[
                                  getEditKey(viewingExerciseIndex, set.setNumber)
                                ]?.reps ?? String(set.targetReps ?? ''),
                                text,
                              )
                            }
                            keyboardType="numeric"
                            placeholder="kg"
                            placeholderTextColor={theme.colors.textMuted}
                          />
                          <Text style={styles.inputLabel}>kg</Text>
                        </View>
                      </View>
                    ) : (
                      <Text style={styles.setMeta}>
                        {set.repsPerformed !== null
                          ? `${set.repsPerformed} reps${set.weightUsed && set.weightUsed > 0 ? ` · ${set.weightUsed}kg` : ''}`
                          : `${set.targetReps ?? '-'} reps`}
                        {set.completed && set.repsPerformed !== null && ' (real)'}
                      </Text>
                    )}
                  </View>
                </View>
              </BaseCard>
            ))}
          </View>

          {currentExercise.workoutSets.length < 10 && (
            <TouchableOpacity
              style={styles.addSetButton}
              onPress={handleAddSet}
              disabled={isMutating}
            >
              <Plus size={20} color={theme.colors.primary} />
              <Text style={styles.addSetText}>Agregar set</Text>
            </TouchableOpacity>
          )}

          <View style={styles.restTimerRow}>
            <TouchableOpacity
              style={styles.restTimerButton}
              onPress={() => startRestTimer(90)}
              disabled={restTimerActive}
            >
              <Play size={16} color={theme.colors.primary} />
              <Text style={styles.restTimerButtonText}>Descanso 90s</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.restTimerButton}
              onPress={() => startRestTimer(180)}
              disabled={restTimerActive}
            >
              <Play size={16} color={theme.colors.primary} />
              <Text style={styles.restTimerButtonText}>Descanso 3min</Text>
            </TouchableOpacity>
          </View>

          {mutationError && (
            <Text style={styles.errorText}>{mutationError}</Text>
          )}
        </ScrollView>
      )}

      <View style={styles.footer}>
        <View style={styles.footerNavRow}>
          <TouchableOpacity
            style={[styles.navButton, (isFirstExercise || isMutating) && styles.navButtonDisabled]}
            onPress={handlePreviousExercise}
            disabled={isFirstExercise || isMutating}
          >
            <ChevronLeft size={18} color={isFirstExercise ? theme.colors.textMuted : theme.colors.primary} />
            <Text style={[styles.navButtonText, (isFirstExercise || isMutating) && styles.navButtonTextDisabled]}>
              Anterior
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.navButton,
              (isLastExercise && viewingExerciseIndex === currentExerciseIndex || isMutating) && styles.navButtonDisabled,
            ]}
            onPress={handleNextExercise}
            disabled={(isLastExercise && viewingExerciseIndex === currentExerciseIndex) || isMutating}
          >
            <Text style={[
              styles.navButtonText,
              (isLastExercise && viewingExerciseIndex === currentExerciseIndex || isMutating) && styles.navButtonTextDisabled,
            ]}>
              {isLastExercise ? 'Último' : 'Siguiente'}
            </Text>
            <ChevronRight size={18} color={(isLastExercise && viewingExerciseIndex === currentExerciseIndex) ? theme.colors.textMuted : theme.colors.primary} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[styles.finishButton, isMutating && styles.finishButtonDisabled]}
          onPress={handleFinishEarly}
          disabled={isMutating}
        >
          <Save size={18} color={theme.colors.textPrimary} />
          <Text style={styles.finishButtonText}>Terminar y guardar</Text>
          <ChevronRight size={18} color={theme.colors.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.discardButton, isMutating && styles.finishButtonDisabled]}
          onPress={handleDiscard}
          disabled={isMutating || discardSessionMutation.isPending}
        >
          <Trash2 size={18} color={theme.colors.error} />
          <Text style={styles.discardButtonText}>Descartar sesión</Text>
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
  restTimerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: `${theme.colors.warning}18`,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.warning,
  },
  restTimerText: {
    color: theme.colors.warning,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  restTimerDismiss: {
    position: 'absolute',
    right: theme.spacing.sm,
    padding: theme.spacing.xs,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 200,
    gap: theme.spacing.md,
    paddingTop: theme.spacing.md,
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
  exerciseOrderNote: {
    color: theme.colors.textMuted,
    fontStyle: 'italic',
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
  checkCircleTouchable: {
    padding: 4,
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
  setTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  setTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    fontWeight: '700',
  },
  removeSetButtonInline: {
    padding: 2,
  },
  setMeta: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  editInputsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  editInputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  editInput: {
    backgroundColor: theme.colors.surfaceElevated,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    color: theme.colors.textPrimary,
    fontSize: theme.typography.small.fontSize,
    minWidth: 50,
    textAlign: 'center',
  },
  inputLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
  },
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    backgroundColor: `${theme.colors.primary}11`,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
  },
  addSetText: {
    color: theme.colors.primary,
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
  },
  restTimerRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  restTimerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceElevated,
  },
  restTimerButtonText: {
    color: theme.colors.primary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    fontWeight: '600',
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
  footerNavRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
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
  navButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    minHeight: 44,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
  },
  navButtonDisabled: {
    borderColor: theme.colors.borderSoft,
  },
  navButtonText: {
    color: theme.colors.primary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    fontWeight: '600',
  },
  navButtonTextDisabled: {
    color: theme.colors.textMuted,
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
  discardButton: {
    minHeight: 44,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.error + '40',
    paddingHorizontal: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  discardButtonText: {
    color: theme.colors.error,
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
  overviewContainer: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    gap: theme.spacing.md,
    paddingBottom: 200,
  },
  overviewBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
  },
  overviewBackText: {
    color: theme.colors.primary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    fontWeight: '600',
  },
  overviewCard: {
    padding: theme.spacing.md,
  },
  overviewCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}11`,
  },
  overviewCardComplete: {
    borderColor: theme.colors.success,
  },
  overviewCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  overviewCardIndex: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overviewCardIndexText: {
    color: theme.colors.primary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    fontWeight: '700',
  },
  overviewCardInfo: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  overviewCardName: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    fontWeight: '700',
  },
  overviewCardMeta: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  overviewCardStatus: {
    minWidth: 30,
    alignItems: 'center',
  },
  overviewCardPartial: {
    color: theme.colors.warning,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    fontWeight: '700',
  },
});

import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BaseCard } from '@/components/ui/BaseCard';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { TextInput } from '@/components/ui/TextInput';
import { theme } from '@/theme';
import {
  useAdvanceExercise,
  useFinishWorkout,
  useRegisterSet,
  useWorkoutSession,
} from '@/shared/api/services/trainingService';
import type { WorkoutExerciseResponseDto, WorkoutSetResponseDto } from '@/shared/api/types/training';

export default function ActiveWorkoutScreen() {
  const router = useRouter();
  const { sessionId: sessionIdParam } = useLocalSearchParams<{ sessionId: string }>();
  const sessionId = Array.isArray(sessionIdParam) ? sessionIdParam[0] : sessionIdParam ?? '';
  const { data: session, isLoading, isError, refetch, isRefetching } = useWorkoutSession(sessionId);
  const registerSet = useRegisterSet();
  const advanceExercise = useAdvanceExercise();
  const finishWorkout = useFinishWorkout();
  const [reps, setReps] = React.useState('');
  const [weight, setWeight] = React.useState('');
  const [formError, setFormError] = React.useState<string | null>(null);

  const currentExercise = session?.exercises[session.currentExerciseIndex];
  const currentSet = currentExercise?.workoutSets.find((set) => !set.completed);
  const allCurrentSetsCompleted = Boolean(
    currentExercise && currentExercise.workoutSets.every((set) => set.completed),
  );
  const isLastExercise = Boolean(
    session && session.currentExerciseIndex >= session.exercises.length - 1,
  );
  const isMutating = registerSet.isPending || advanceExercise.isPending || finishWorkout.isPending;

  React.useEffect(() => {
    if (!currentExercise || !currentSet) return;
    setReps(String(currentSet.repsPerformed ?? currentExercise.repsPerSet));
    setWeight(String(currentSet.weightUsed ?? currentExercise.weight));
    setFormError(null);
  }, [currentExercise?.exerciseId, currentSet?.setNumber]);

  const handleCompleteSet = () => {
    if (!currentExercise || !currentSet || !session) return;

    const repsPerformed = Number.parseInt(reps, 10);
    const weightUsed = Number.parseFloat(weight.replace(',', '.'));

    if (!Number.isInteger(repsPerformed) || repsPerformed < 1) {
      setFormError('Ingresa repeticiones validas.');
      return;
    }

    if (!Number.isFinite(weightUsed) || weightUsed < 0) {
      setFormError('Ingresa un peso valido.');
      return;
    }

    setFormError(null);
    registerSet.mutate(
      {
        sessionId: session.id,
        exerciseIndex: session.currentExerciseIndex,
        setNumber: currentSet.setNumber,
        repsPerformed,
        weightUsed,
      },
      {
        onError: (error) => {
          setFormError(error.message);
        },
      },
    );
  };

  const handleAdvance = () => {
    if (!session) return;
    advanceExercise.mutate(session.id, {
      onError: (error) => setFormError(error.message),
    });
  };

  const handleFinish = () => {
    if (!session) return;
    finishWorkout.mutate(session.id, {
      onSuccess: () => router.replace('/training'),
      onError: (error) => setFormError(error.message),
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Workout activo</Text>
          <Text style={styles.subtitle}>
            {session?.routineName ?? 'Registra cada serie para avanzar.'}
          </Text>
        </View>

        {isLoading && (
          <View style={styles.centerBlock}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.mutedText}>Cargando sesion...</Text>
          </View>
        )}

        {isError && (
          <BaseCard>
            <View style={styles.centerBlock}>
              <Text style={styles.errorText}>No pudimos cargar la sesion.</Text>
              <PrimaryButton label="Reintentar" onPress={() => refetch()} disabled={isRefetching} />
            </View>
          </BaseCard>
        )}

        {!isLoading && !isError && session && session.exercises.length === 0 && (
          <BaseCard>
            <View style={styles.centerBlock}>
              <Text style={styles.emptyTitle}>Esta rutina no tiene ejercicios.</Text>
              <SecondaryButton label="Volver" onPress={() => router.replace('/training')} />
            </View>
          </BaseCard>
        )}

        {!isLoading && !isError && session && currentExercise ? (
          <>
            <ExerciseSummary
              exercise={currentExercise}
              exerciseNumber={session.currentExerciseIndex + 1}
              totalExercises={session.exercises.length}
            />

            {currentSet ? (
              <BaseCard style={styles.formCard}>
                <View style={styles.setHeader}>
                  <Text style={styles.sectionTitle}>Serie {currentSet.setNumber}</Text>
                  <Text style={styles.mutedText}>Objetivo: {currentExercise.repsPerSet} reps</Text>
                </View>
                <View style={styles.inputsRow}>
                  <View style={styles.inputColumn}>
                    <TextInput
                      label="Reps"
                      value={reps}
                      onChangeText={setReps}
                      keyboardType="numeric"
                      placeholder="10"
                    />
                  </View>
                  <View style={styles.inputColumn}>
                    <TextInput
                      label="Peso kg"
                      value={weight}
                      onChangeText={setWeight}
                      keyboardType="numeric"
                      placeholder="0"
                    />
                  </View>
                </View>
                {formError ? <Text style={styles.errorText}>{formError}</Text> : null}
                <PrimaryButton
                  label="Completar serie"
                  onPress={handleCompleteSet}
                  loading={registerSet.isPending}
                  disabled={isMutating}
                />
              </BaseCard>
            ) : null}

            {allCurrentSetsCompleted ? (
              <BaseCard style={styles.nextCard}>
                <Text style={styles.sectionTitle}>Ejercicio completado</Text>
                <Text style={styles.mutedText}>
                  {isLastExercise ? 'Puedes finalizar el workout.' : 'Avanza al siguiente ejercicio.'}
                </Text>
                {formError ? <Text style={styles.errorText}>{formError}</Text> : null}
                <PrimaryButton
                  label={isLastExercise ? 'Finalizar workout' : 'Siguiente ejercicio'}
                  onPress={isLastExercise ? handleFinish : handleAdvance}
                  loading={advanceExercise.isPending || finishWorkout.isPending}
                  disabled={isMutating}
                />
              </BaseCard>
            ) : null}

            <SecondaryButton label="Salir sin finalizar" onPress={() => router.replace('/training')} />
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

interface ExerciseSummaryProps {
  exercise: WorkoutExerciseResponseDto;
  exerciseNumber: number;
  totalExercises: number;
}

function ExerciseSummary({ exercise, exerciseNumber, totalExercises }: ExerciseSummaryProps) {
  return (
    <BaseCard style={styles.exerciseCard}>
      <View style={styles.progressRow}>
        <Text style={styles.progressText}>
          Ejercicio {exerciseNumber} de {totalExercises}
        </Text>
        <Text style={styles.progressText}>{getCompletedSets(exercise.workoutSets)}/{exercise.sets}</Text>
      </View>
      <Text style={styles.exerciseName}>{exercise.exerciseName}</Text>
      <Text style={styles.routineMeta}>
        {exercise.sets} series · {exercise.repsPerSet} reps · {exercise.weight} kg sugeridos
      </Text>
      <View style={styles.setsRow}>
        {exercise.workoutSets.map((set) => (
          <View key={set.setNumber} style={[styles.setPill, set.completed && styles.setPillDone]}>
            <Text style={[styles.setPillText, set.completed && styles.setPillTextDone]}>
              {set.setNumber}
            </Text>
          </View>
        ))}
      </View>
    </BaseCard>
  );
}

function getCompletedSets(sets: WorkoutSetResponseDto[]) {
  return sets.filter((set) => set.completed).length;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    gap: theme.spacing.lg,
  },
  header: {
    gap: theme.spacing.xs,
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
  centerBlock: {
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.xl,
  },
  mutedText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
  },
  emptyTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading3.fontSize,
    lineHeight: theme.typography.heading3.lineHeight,
    fontWeight: theme.typography.heading3.fontWeight,
    textAlign: 'center',
  },
  exerciseCard: {
    gap: theme.spacing.md,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    color: theme.colors.primary,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  exerciseName: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading2.fontSize,
    lineHeight: theme.typography.heading2.lineHeight,
    fontWeight: theme.typography.heading2.fontWeight,
  },
  routineMeta: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
  },
  setsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  setPill: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setPillDone: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  setPillText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    fontWeight: '700',
  },
  setPillTextDone: {
    color: theme.colors.background,
  },
  formCard: {
    gap: theme.spacing.md,
  },
  setHeader: {
    gap: theme.spacing.xs,
  },
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading3.fontSize,
    lineHeight: theme.typography.heading3.lineHeight,
    fontWeight: theme.typography.heading3.fontWeight,
  },
  inputsRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  inputColumn: {
    flex: 1,
  },
  nextCard: {
    gap: theme.spacing.md,
  },
});

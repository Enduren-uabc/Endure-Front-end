import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CalendarDays, Clock, History, Play, RotateCcw } from 'lucide-react-native';
import { ApiError } from '@/lib/api-client';
import { BaseCard } from '@/components/ui/BaseCard';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { useRoutines } from '@/features/training/hooks/use-routines';
import {
  useStartWorkoutSession,
  useWorkoutSessionInProgress,
  useFinishWorkoutSession,
  useDiscardWorkoutSession,
} from '@/features/training/hooks/use-workout-session';
import {
  DAY_OF_WEEK_LABELS,
  DAY_OF_WEEK_ORDER,
  type DayOfWeek,
  type ExerciseConfig,
  type ExerciseSet,
  type Routine,
} from '@/features/training/types/routine';
import PendingSessionModal from '@/features/training/components/PendingSessionModal';
import type { AppTabsParamList, WorkoutStackParamList } from '@/navigation/types';
import { theme } from '@/theme';

type Props = NativeStackScreenProps<WorkoutStackParamList, 'WorkoutStart'>;
type AppTabsNavigation = BottomTabNavigationProp<AppTabsParamList>;

const JS_DAY_TO_DAY_OF_WEEK: DayOfWeek[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

function getTodayDayOfWeek(): DayOfWeek {
  return JS_DAY_TO_DAY_OF_WEEK[new Date().getDay()];
}

function getExerciseSets(exercise: ExerciseConfig): ExerciseSet[] {
  if (Array.isArray(exercise.sets)) {
    return exercise.sets;
  }
  if (exercise.detailedSets && exercise.detailedSets.length > 0) {
    return exercise.detailedSets;
  }
  if (typeof exercise.sets === 'number' && exercise.sets > 0) {
    return Array.from({ length: exercise.sets }, (_, index) => ({
      setNumber: index + 1,
      reps: exercise.repsPerSet ?? 10,
      weight: exercise.weight ?? 0,
      restSeconds: null,
    }));
  }
  return [
    { setNumber: 1, reps: 10, weight: 0, restSeconds: null },
    { setNumber: 2, reps: 10, weight: 0, restSeconds: null },
    { setNumber: 3, reps: 10, weight: 0, restSeconds: null },
  ];
}

function getAvailableDays(routine: Routine): DayOfWeek[] {
  return routine.days
    .filter((day) => day.exercises.length > 0)
    .map((day) => day.dayOfWeek)
    .sort((a, b) => DAY_OF_WEEK_ORDER.indexOf(a) - DAY_OF_WEEK_ORDER.indexOf(b));
}

function countSets(exercises: ExerciseConfig[]): number {
  return exercises.reduce(
    (total, exercise) => total + getExerciseSets(exercise).length,
    0,
  );
}

function formatSetPreview(set: ExerciseSet): string {
  const weight = set.weight > 0 ? ` · ${set.weight}kg` : '';
  return `Set ${set.setNumber}: ${set.reps} reps${weight}`;
}

export default function WorkoutStartScreen({ navigation }: Props) {
  const { data: routines = [], isLoading: routinesLoading, refetch } = useRoutines();
  const inProgressQuery = useWorkoutSessionInProgress();
  const startMutation = useStartWorkoutSession();
  const finishMutation = useFinishWorkoutSession();
  const discardMutation = useDiscardWorkoutSession();

  const [showPendingModal, setShowPendingModal] = React.useState(false);

  const [selectedDay, setSelectedDay] = React.useState<DayOfWeek | null>(null);

  const activeRoutine = routines.find((routine) => routine.isActive);
  const availableDays = activeRoutine ? getAvailableDays(activeRoutine) : [];
  const today = React.useMemo(() => getTodayDayOfWeek(), []);
  const selectedRoutineDay = activeRoutine?.days.find(
    (day) => day.dayOfWeek === selectedDay,
  );
  const selectedExercises = React.useMemo(
    () =>
      [...(selectedRoutineDay?.exercises ?? [])].sort(
        (a, b) => a.order - b.order,
      ),
    [selectedRoutineDay],
  );

  const inProgressError =
    inProgressQuery.error instanceof ApiError &&
    inProgressQuery.error.status !== 404
      ? inProgressQuery.error.message
      : null;

  React.useEffect(() => {
    if (!activeRoutine || selectedDay) return;

    if (availableDays.includes(today)) {
      setSelectedDay(today);
      return;
    }

    setSelectedDay(availableDays[0] ?? null);
  }, [activeRoutine, availableDays, selectedDay, today]);

  const handleStart = () => {
    if (!activeRoutine || !selectedDay) return;

    if (inProgress) {
      setShowPendingModal(true);
      return;
    }

    startMutation.mutate(
      { routineId: activeRoutine.id, dayOfWeek: selectedDay },
      {
        onSuccess: (session) => {
          navigation.navigate('WorkoutSession', { sessionId: session.id });
        },
      },
    );
  };

  const handleResume = () => {
    setShowPendingModal(false);
    navigation.navigate('WorkoutSession', { sessionId: inProgress!.id });
  };

  const handleDiscardAndStart = () => {
    if (!activeRoutine || !selectedDay || !inProgress) return;

    discardMutation.mutate(
      { sessionId: inProgress.id },
      {
        onSuccess: () => {
          startMutation.mutate(
            { routineId: activeRoutine.id, dayOfWeek: selectedDay },
            {
              onSuccess: (session) => {
                setShowPendingModal(false);
                navigation.navigate('WorkoutSession', { sessionId: session.id });
              },
            },
          );
        },
      },
    );
  };

  const handleFinishAndStart = () => {
    if (!activeRoutine || !selectedDay || !inProgress) return;

    finishMutation.mutate(
      { sessionId: inProgress.id },
      {
        onSuccess: () => {
          startMutation.mutate(
            { routineId: activeRoutine.id, dayOfWeek: selectedDay },
            {
              onSuccess: (session) => {
                setShowPendingModal(false);
                navigation.navigate('WorkoutSession', { sessionId: session.id });
              },
            },
          );
        },
      },
    );
  };

  const isLoading = routinesLoading || inProgressQuery.isLoading;
  const inProgress = inProgressQuery.data;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Entrenamiento</Text>
          <TouchableOpacity
            style={styles.historyButton}
            onPress={() => navigation.navigate('WorkoutHistory')}
          >
            <History size={18} color={theme.colors.primary} />
            <Text style={styles.historyButtonText}>Historial</Text>
          </TouchableOpacity>
        </View>

        {isLoading && (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        )}

        {showPendingModal && inProgress && (
          <PendingSessionModal
            visible={showPendingModal}
            session={inProgress}
            onResume={handleResume}
            onDiscardAndStart={handleDiscardAndStart}
            onFinishAndStart={handleFinishAndStart}
            onClose={() => setShowPendingModal(false)}
            isDiscarding={discardMutation.isPending}
            isFinishing={finishMutation.isPending}
          />
        )}

        {!isLoading && inProgressError && (
          <BaseCard>
            <Text style={styles.errorText}>{inProgressError}</Text>
            <PrimaryButton label="Reintentar" onPress={() => inProgressQuery.refetch()} />
          </BaseCard>
        )}

        {!isLoading && !activeRoutine && (
          <BaseCard style={styles.emptyCard}>
            <Text style={styles.cardTitle}>No hay rutina activa</Text>
            <Text style={styles.cardText}>
              Activa una rutina para iniciar una sesión de entrenamiento.
            </Text>
            <PrimaryButton
              label="Ver rutinas"
              onPress={() =>
                navigation.getParent<AppTabsNavigation>()?.navigate('Routines', {
                  screen: 'RoutinesList',
                })
              }
            />
          </BaseCard>
        )}

        {!isLoading && activeRoutine && availableDays.length === 0 && (
          <BaseCard style={styles.emptyCard}>
            <Text style={styles.cardTitle}>{activeRoutine.name}</Text>
            <Text style={styles.cardText}>
              La rutina activa no tiene ejercicios configurados en sus días.
            </Text>
            <PrimaryButton label="Actualizar rutina" onPress={() => refetch()} />
          </BaseCard>
        )}

        {!isLoading && activeRoutine && availableDays.length > 0 && (
          <View style={styles.section}>
            <BaseCard>
              <View style={styles.cardIconRow}>
                <CalendarDays size={22} color={theme.colors.primary} />
                <View style={styles.cardHeaderText}>
                  <Text style={styles.cardTitle}>{activeRoutine.name}</Text>
                  <Text style={styles.cardText}>
                    {selectedExercises.length} ejercicios ·{' '}
                    {countSets(selectedExercises)} sets
                  </Text>
                </View>
              </View>

              <View style={styles.daySelector}>
                {availableDays.map((day) => (
                  <TouchableOpacity
                    key={day}
                    onPress={() => setSelectedDay(day)}
                    style={[
                      styles.dayChip,
                      selectedDay === day && styles.dayChipSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayChipText,
                        selectedDay === day && styles.dayChipTextSelected,
                      ]}
                    >
                      {DAY_OF_WEEK_LABELS[day]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {!availableDays.includes(today) && (
                <View style={styles.noticeRow}>
                  <Clock size={16} color={theme.colors.warning} />
                  <Text style={styles.noticeText}>
                    Hoy no hay rutina configurada para este día. Selecciona uno
                    disponible antes de confirmar.
                  </Text>
                </View>
              )}
            </BaseCard>

            <View style={styles.previewList}>
              {selectedExercises.map((exercise, index) => {
                const sets = getExerciseSets(exercise);
                return (
                  <BaseCard key={exercise.id} style={styles.exerciseCard}>
                    <Text style={styles.exerciseIndex}>Ejercicio {index + 1}</Text>
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    <View style={styles.setsPreview}>
                      {sets.map((set) => (
                        <Text
                          key={`${exercise.id}-${set.setNumber}`}
                          style={styles.setPreviewText}
                        >
                          {formatSetPreview(set)}
                        </Text>
                      ))}
                    </View>
                  </BaseCard>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      {!isLoading && activeRoutine && availableDays.length > 0 && (
        <View style={styles.footer}>
          <PrimaryButton
            label="Confirmar e iniciar"
            onPress={handleStart}
            loading={startMutation.isPending}
            disabled={!selectedDay || startMutation.isPending}
          />
        </View>
      )}
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
    paddingTop: theme.spacing.lg,
    paddingBottom: 120,
    gap: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading1.fontSize,
    lineHeight: theme.typography.heading1.lineHeight,
    fontWeight: theme.typography.heading1.fontWeight,
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  historyButtonText: {
    color: theme.colors.primary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    fontWeight: '700',
  },
  center: {
    paddingVertical: theme.spacing.xxxl,
    alignItems: 'center',
  },
  section: {
    gap: theme.spacing.md,
  },
  resumeCard: {
    gap: theme.spacing.md,
  },
  emptyCard: {
    gap: theme.spacing.md,
  },
  cardIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  cardHeaderText: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  cardTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading3.fontSize,
    lineHeight: theme.typography.heading3.lineHeight,
    fontWeight: theme.typography.heading3.fontWeight,
  },
  cardText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
  },
  daySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
  },
  dayChip: {
    minWidth: 48,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceElevated,
    paddingHorizontal: theme.spacing.md,
  },
  dayChipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  dayChipText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    fontWeight: '700',
  },
  dayChipTextSelected: {
    color: theme.colors.background,
  },
  noticeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  noticeText: {
    flex: 1,
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  previewList: {
    gap: theme.spacing.md,
  },
  exerciseCard: {
    gap: theme.spacing.sm,
  },
  exerciseIndex: {
    color: theme.colors.primary,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    fontWeight: '700',
  },
  exerciseName: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    fontWeight: '700',
  },
  setsPreview: {
    gap: theme.spacing.xs,
  },
  setPreviewText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    marginBottom: theme.spacing.md,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
    backgroundColor: theme.colors.background,
    borderTopColor: theme.colors.border,
    borderTopWidth: 1,
  },
});

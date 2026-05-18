import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  TextInput as RNTextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import type { 
  NativeStackNavigationProp,
  NativeStackScreenProps 
} from "@react-navigation/native-stack";
import { ArrowLeft, Trash2, ChevronRight, Search, Plus } from "lucide-react-native";
import {
  useRoutineDetail,
  useActivateRoutine,
  useDeactivateRoutine,
  useDeleteRoutine,
} from "@/features/training/hooks/use-routines";
import { useSyncRoutine } from "@/features/training/hooks/use-sync-routine";
import { useQueryClient } from "@tanstack/react-query";
import { useRoutineDraftStore } from "@/features/training/stores/routine-draft-store";
import { BaseCard } from "@/components/ui/BaseCard";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { generateId } from "@/lib/generate-id";
import { theme } from "@/theme";
import {
  DAY_OF_WEEK_LABELS,
  DAY_OF_WEEK_ORDER,
  type DayOfWeek,
  type ExerciseConfig,
  type ExerciseSet,
} from "@/features/training/types/routine";
import type { RootStackParamList, TrainingStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<TrainingStackParamList, "RoutineDetail">;
type RootNavigation = NativeStackNavigationProp<RootStackParamList>;

function getExerciseSets(exercise: ExerciseConfig): ExerciseSet[] {
  if (Array.isArray(exercise.sets)) {
    return exercise.sets;
  }
  return exercise.detailedSets ?? [];
}

function formatExerciseMeta(exercise: ExerciseConfig): string {
  const detailedSets = getExerciseSets(exercise);

  if (detailedSets.length > 0) {
    const [firstSet] = detailedSets;
    const sameReps = detailedSets.every((set) => set.reps === firstSet.reps);
    const sameWeight = detailedSets.every((set) => set.weight === firstSet.weight);

    if (sameReps && sameWeight) {
      return `${detailedSets.length} sets x ${firstSet.reps} reps${
        firstSet.weight > 0 ? ` @ ${firstSet.weight}kg` : ""
      }`;
    }

    return `${detailedSets.length} sets configurados`;
  }

  if (typeof exercise.sets === "number" && exercise.sets > 0) {
    return `${exercise.sets} sets x ${exercise.repsPerSet ?? 0} reps${
      (exercise.weight ?? 0) > 0 ? ` @ ${exercise.weight}kg` : ""
    }`;
  }

  return "Sin sets configurados";
}

function formatSetLine(set: ExerciseSet): string {
  const rest = set.restSeconds ? ` · descanso ${set.restSeconds}s` : "";
  const weight = set.weight > 0 ? ` · ${set.weight}kg` : "";
  return `Set ${set.setNumber}: ${set.reps} reps${weight}${rest}`;
}

export default function RoutineDetailScreen({ navigation, route }: Props) {
  const rootNavigation = useNavigation<RootNavigation>();
  const { id } = route.params;

  const { data: routine, isLoading } = useRoutineDetail(id);
  const activateMutation = useActivateRoutine();
  const deactivateMutation = useDeactivateRoutine();
  const deleteMutation = useDeleteRoutine();
  const syncRoutineMutation = useSyncRoutine();
  const draftStore = useRoutineDraftStore();

  const [selectedDay, setSelectedDay] = React.useState<DayOfWeek | null>(null);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [newExerciseName, setNewExerciseName] = React.useState("");
  const [selectedDaysForNewExercise, setSelectedDaysForNewExercise] = React.useState<DayOfWeek[]>([]);
  const [mutationError, setMutationError] = React.useState<string | null>(null);
  const [showAddDayModal, setShowAddDayModal] = React.useState(false);
  const [selectedNewDays, setSelectedNewDays] = React.useState<DayOfWeek[]>([]);

  React.useEffect(() => {
    if (showAddModal && selectedDay) {
      setSelectedDaysForNewExercise([selectedDay]);
    } else if (!showAddModal) {
      setSelectedDaysForNewExercise([]);
    }
  }, [showAddModal, selectedDay]);

  const queryClient = useQueryClient();
  const catalogProcessingRef = React.useRef(false);

  // Watch for exercise name selected from catalog
  useFocusEffect(
    React.useCallback(() => {
      const pendingName = draftStore.pendingExerciseName;
      const pendingConfig = draftStore.pendingCatalogConfig;
      if (!pendingName || !pendingConfig || !routine || catalogProcessingRef.current) {
        return;
      }

      catalogProcessingRef.current = true;

      // Create a copy of current routine days to mutate
      const updatedDays = routine.days.map((day) => ({
        dayOfWeek: day.dayOfWeek,
        exercises: day.exercises.map((ex) => ({
          id: ex.id,
          name: ex.name,
          order: ex.order,
          sets: getExerciseSets(ex).map((s) => ({
            setNumber: s.setNumber,
            reps: s.reps,
            weight: s.weight,
            restSeconds: s.restSeconds ?? undefined,
          })),
        })),
      }));

      // Add the new exercise from catalog to selected days
      pendingConfig.days.forEach((dayOfWeek) => {
        let dayObj = updatedDays.find((d) => d.dayOfWeek === dayOfWeek);
        if (!dayObj) {
          dayObj = { dayOfWeek, exercises: [] };
          updatedDays.push(dayObj);
        }
        const order = dayObj.exercises.length;
        dayObj.exercises.push({
          id: generateId(),
          name: pendingName,
          order,
          sets: [],
        });
      });

      syncRoutineMutation.mutate(
        { routineId: id, days: updatedDays },
        {
          onSuccess: () => {
            draftStore.setPendingExerciseName(null);
            draftStore.setPendingCatalogConfig(null);
            queryClient.invalidateQueries({ queryKey: ["routine", id] });
            queryClient.invalidateQueries({ queryKey: ["routines"] });
            catalogProcessingRef.current = false;
          },
          onError: () => {
            catalogProcessingRef.current = false;
            draftStore.setPendingExerciseName(null);
            draftStore.setPendingCatalogConfig(null);
          },
        }
      );
    }, [id, routine, syncRoutineMutation])
  );

  const handleAddExercise = () => {
    if (selectedDaysForNewExercise.length === 0) {
      setMutationError("Selecciona al menos un día para el ejercicio");
      return;
    }
    if (!newExerciseName.trim()) {
      setMutationError("Ingresa un nombre para el ejercicio");
      return;
    }
    if (!routine) return;

    const name = newExerciseName.trim();
    setMutationError(null);

    const updatedDays = routine.days.map((day) => ({
      dayOfWeek: day.dayOfWeek,
      exercises: day.exercises.map((ex) => ({
        id: ex.id,
        name: ex.name,
        order: ex.order,
        sets: getExerciseSets(ex).map((s) => ({
          setNumber: s.setNumber,
          reps: s.reps,
          weight: s.weight,
          restSeconds: s.restSeconds ?? undefined,
        })),
      })),
    }));

    selectedDaysForNewExercise.forEach((dayOfWeek) => {
      let dayObj = updatedDays.find((d) => d.dayOfWeek === dayOfWeek);
      if (!dayObj) {
        dayObj = { dayOfWeek, exercises: [] };
        updatedDays.push(dayObj);
      }
      const order = dayObj.exercises.length;
      dayObj.exercises.push({
        id: generateId(),
        name,
        order,
        sets: [],
      });
    });

    syncRoutineMutation.mutate(
      { routineId: id, days: updatedDays },
      {
        onSuccess: () => {
          setNewExerciseName("");
          setShowAddModal(false);
          setMutationError(null);
        },
        onError: (error) => {
          setMutationError(error.message || "Error al agregar ejercicio");
        },
      }
    );
  };

  const toggleDayForNewExercise = (day: DayOfWeek) => {
    setSelectedDaysForNewExercise((prev) => {
      if (prev.includes(day)) {
        return prev.filter((d) => d !== day);
      }
      return [...prev, day];
    });
  };

  const toggleNewDay = (day: DayOfWeek) => {
    setSelectedNewDays((prev) => {
      if (prev.includes(day)) {
        return prev.filter((d) => d !== day);
      }
      return [...prev, day];
    });
  };

  const handleAddDays = () => {
    if (selectedNewDays.length === 0 || !routine) return;

    const updatedDays = routine.days.map((day) => ({
      dayOfWeek: day.dayOfWeek,
      exercises: day.exercises.map((ex) => ({
        id: ex.id,
        name: ex.name,
        order: ex.order,
        sets: getExerciseSets(ex).map((s) => ({
          setNumber: s.setNumber,
          reps: s.reps,
          weight: s.weight,
          restSeconds: s.restSeconds ?? undefined,
        })),
      })),
    }));

    selectedNewDays.forEach((dayOfWeek) => {
      if (!updatedDays.find((d) => d.dayOfWeek === dayOfWeek)) {
        updatedDays.push({ dayOfWeek, exercises: [] });
      }
    });

    syncRoutineMutation.mutate(
      { routineId: id, days: updatedDays },
      {
        onSuccess: () => {
          setSelectedNewDays([]);
          setShowAddDayModal(false);
          queryClient.invalidateQueries({ queryKey: ["routine", id] });
          queryClient.invalidateQueries({ queryKey: ["routines"] });
        },
      },
    );
  };

  React.useEffect(() => {
    if (routine && (routine.dayOfWeeks ?? []).length > 0 && !selectedDay) {
      setSelectedDay(routine.dayOfWeeks[0]);
    }
  }, [routine, selectedDay]);

  const handleActivate = () => {
    activateMutation.mutate(id);
  };

  const handleDeactivate = () => {
    deactivateMutation.mutate(id);
  };

  const handleDelete = () => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        navigation.goBack();
      },
    });
  };

  const currentDayExercises =
    (routine?.days ?? []).find((d) => d.dayOfWeek === selectedDay)?.exercises ??
    [];

  const sortedDays = [...(routine?.dayOfWeeks ?? [])].sort(
    (a, b) => DAY_OF_WEEK_ORDER.indexOf(a) - DAY_OF_WEEK_ORDER.indexOf(b),
  );

  const availableDays = DAY_OF_WEEK_ORDER.filter(
    (day) => !routine?.dayOfWeeks?.includes(day),
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>{routine?.name ?? "Rutina"}</Text>
          {routine?.isActive && (
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>ACTIVA</Text>
            </View>
          )}
        </View>
        <View style={styles.backButton} />
      </View>

      {isLoading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      )}

      {!isLoading && routine && (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Day selector */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.daysRow}
          >
            {sortedDays.map((day) => (
              <TouchableOpacity
                key={day}
                onPress={() => setSelectedDay(day)}
                style={[
                  styles.dayTab,
                  selectedDay === day && styles.dayTabSelected,
                ]}
              >
                <Text
                  style={[
                    styles.dayTabText,
                    selectedDay === day && styles.dayTabTextSelected,
                  ]}
                >
                  {DAY_OF_WEEK_LABELS[day]}
                </Text>
              </TouchableOpacity>
            ))}
            {availableDays.length > 0 && (
              <TouchableOpacity
                onPress={() => setShowAddDayModal(true)}
                style={styles.addDayTab}
              >
                <Plus size={16} color={theme.colors.primary} />
              </TouchableOpacity>
            )}
          </ScrollView>

          {/* Exercises for selected day */}
          <View style={styles.exercisesSection}>
            {currentDayExercises.length === 0 ? (
              <BaseCard>
                <View style={styles.emptyDay}>
                  <Text style={styles.emptyDayText}>
                    No hay ejercicios para este día
                  </Text>
                  <View style={styles.emptyDayButton}>
                    <PrimaryButton
                      label="Agregar ejercicio"
                      onPress={() => setShowAddModal(true)}
                    />
                  </View>
                </View>
              </BaseCard>
            ) : (
              [...currentDayExercises]
                .sort((a, b) => a.order - b.order)
                .map((exercise) => {
                  const detailedSets = getExerciseSets(exercise);

                  return (
                    <TouchableOpacity
                      key={exercise.id}
                      activeOpacity={0.7}
                      onPress={() =>
                        navigation.navigate("ExerciseDetail", {
                          routineId: id,
                          exercise,
                        })
                      }
                    >
                      <BaseCard style={styles.exerciseCard}>
                        <View style={styles.exerciseRow}>
                          <View style={styles.exerciseInfo}>
                            <Text style={styles.exerciseName}>{exercise.name}</Text>
                            <Text style={styles.exerciseMeta}>
                              {formatExerciseMeta(exercise)}
                            </Text>
                            {detailedSets.length > 0 ? (
                              <View style={styles.setsList}>
                                {detailedSets.map((set) => (
                                  <Text
                                    key={set.id ?? `${exercise.id}-${set.setNumber}`}
                                    style={styles.setLine}
                                  >
                                    {formatSetLine(set)}
                                  </Text>
                                ))}
                              </View>
                            ) : null}
                          </View>
                          <ChevronRight size={20} color={theme.colors.textMuted} />
                        </View>
                      </BaseCard>
                    </TouchableOpacity>
                  );
                })
            )}

            {currentDayExercises.length > 0 && (
              <PrimaryButton
                label="Agregar otro ejercicio"
                onPress={() => setShowAddModal(true)}
              />
            )}
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            {routine.isActive ? (
              <SecondaryButton
                label="Desactivar rutina"
                onPress={handleDeactivate}
                disabled={deactivateMutation.isPending}
              />
            ) : (
              <SecondaryButton
                label="Activar rutina"
                onPress={handleActivate}
                disabled={activateMutation.isPending}
              />
            )}

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => setShowDeleteModal(true)}
            >
              <Trash2 size={18} color={theme.colors.error} />
              <Text style={styles.deleteText}>Eliminar rutina</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* Add Exercise Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <BaseCard style={styles.modalCard}>
            <Text style={styles.modalTitle}>Nuevo Ejercicio</Text>
            <Text style={styles.modalLabel}>Días</Text>
            <View style={styles.daysChipsRow}>
              {sortedDays.map((day) => {
                const isSelected = selectedDaysForNewExercise.includes(day);
                return (
                  <TouchableOpacity
                    key={day}
                    onPress={() => toggleDayForNewExercise(day)}
                    style={[
                      styles.dayChip,
                      isSelected && styles.dayChipSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayChipText,
                        isSelected && styles.dayChipTextSelected,
                      ]}
                    >
                      {DAY_OF_WEEK_LABELS[day]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {selectedDaysForNewExercise.length === 0 && (
              <Text style={styles.modalHintText}>
                Selecciona al menos un día
              </Text>
            )}
            <Text style={styles.modalLabel}>Nombre</Text>
            <TouchableOpacity
              style={styles.catalogButton}
              onPress={() => {
                setShowAddModal(false);
                draftStore.setPendingCatalogConfig({
                  days: selectedDaysForNewExercise,
                });
                rootNavigation.navigate("ExerciseCatalogModal");
              }}
            >
              <Search size={18} color={theme.colors.primary} />
              <Text style={styles.catalogButtonText}>Buscar en catálogo</Text>
            </TouchableOpacity>
            <View style={styles.orDivider}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>o escribe manualmente</Text>
              <View style={styles.orLine} />
            </View>
            <RNTextInput
              style={styles.modalInput}
              value={newExerciseName}
              onChangeText={setNewExerciseName}
              placeholder="Ej. Press de banca"
              placeholderTextColor={theme.colors.textMuted}
            />
            {mutationError && showAddModal && (
              <Text style={styles.modalErrorText}>{mutationError}</Text>
            )}
            <View style={styles.modalButtons}>
              <SecondaryButton
                label="Cancelar"
                onPress={() => setShowAddModal(false)}
              />
              <PrimaryButton
                label="Agregar"
                onPress={handleAddExercise}
                disabled={
                  selectedDaysForNewExercise.length === 0 ||
                  !newExerciseName.trim()
                }
              />
            </View>
          </BaseCard>
        </KeyboardAvoidingView>
      </Modal>

      {/* Add Day Modal */}
      <Modal
        visible={showAddDayModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddDayModal(false)}
      >
        <View style={styles.modalOverlay}>
          <BaseCard style={styles.modalCard}>
            <Text style={styles.modalTitle}>Agregar días</Text>
            <Text style={styles.modalLabel}>
              Selecciona los días que quieres agregar a la rutina
            </Text>
            <View style={styles.daysChipsRow}>
              {availableDays.map((day) => {
                const isSelected = selectedNewDays.includes(day);
                return (
                  <TouchableOpacity
                    key={day}
                    onPress={() => toggleNewDay(day)}
                    style={[
                      styles.dayChip,
                      isSelected && styles.dayChipSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayChipText,
                        isSelected && styles.dayChipTextSelected,
                      ]}
                    >
                      {DAY_OF_WEEK_LABELS[day]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {selectedNewDays.length === 0 && (
              <Text style={styles.modalHintText}>
                Selecciona al menos un día
              </Text>
            )}
            <View style={styles.modalButtons}>
              <SecondaryButton
                label="Cancelar"
                onPress={() => {
                  setSelectedNewDays([]);
                  setShowAddDayModal(false);
                }}
              />
              <PrimaryButton
                label="Agregar"
                onPress={handleAddDays}
                disabled={selectedNewDays.length === 0}
                loading={syncRoutineMutation.isPending}
              />
            </View>
          </BaseCard>
        </View>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <BaseCard style={styles.modalCard}>
            <Text style={styles.modalTitle}>¿Eliminar rutina?</Text>
            <Text style={styles.modalText}>
              Esta acción no se puede deshacer. Se eliminará "{routine?.name}" y
              todos sus ejercicios.
            </Text>
            <View style={styles.modalButtons}>
              <SecondaryButton
                label="Cancelar"
                onPress={() => setShowDeleteModal(false)}
              />
              <PrimaryButton
                label="Eliminar"
                onPress={handleDelete}
                loading={deleteMutation.isPending}
                disabled={deleteMutation.isPending}
              />
            </View>
          </BaseCard>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading3.fontSize,
    lineHeight: theme.typography.heading3.lineHeight,
    fontWeight: theme.typography.heading3.fontWeight,
  },
  activeBadge: {
    backgroundColor: `${theme.colors.primary}33`,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.md,
  },
  activeBadgeText: {
    color: theme.colors.primary,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    fontWeight: "700",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxxl,
    gap: theme.spacing.lg,
  },
  daysRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
  },
  dayTab: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceElevated,
    borderColor: theme.colors.border,
    borderWidth: 1,
  },
  dayTabSelected: {
    backgroundColor: `${theme.colors.primary}33`,
    borderColor: theme.colors.primary,
  },
  dayTabText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    fontWeight: "500",
  },
  dayTabTextSelected: {
    color: theme.colors.primary,
    fontWeight: "700",
  },
  addDayTab: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceElevated,
    borderColor: theme.colors.primary,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  exercisesSection: {
    gap: theme.spacing.md,
  },
  exerciseCard: {
    padding: theme.spacing.md,
  },
  exerciseRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  exerciseInfo: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  exerciseName: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    fontWeight: "600",
  },
  exerciseMeta: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  setsList: {
    gap: theme.spacing.xs,
    marginTop: theme.spacing.xs,
  },
  setLine: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
  },
  emptyDay: {
    alignItems: "center",
    paddingVertical: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  emptyDayText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
  },
  emptyDayButton: {
    marginTop: theme.spacing.sm,
  },
  actions: {
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
  },
  deleteText: {
    color: theme.colors.error,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.lg,
  },
  modalCard: {
    width: "100%",
    gap: theme.spacing.md,
  },
  modalTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading3.fontSize,
    lineHeight: theme.typography.heading3.lineHeight,
    fontWeight: theme.typography.heading3.fontWeight,
    textAlign: "center",
  },
  modalText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    textAlign: "center",
  },
  modalLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  daysChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  dayChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.border,
    borderWidth: 1.5,
  },
  dayChipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  dayChipText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    fontWeight: "500",
  },
  dayChipTextSelected: {
    color: theme.colors.background,
    fontWeight: "700",
  },
  modalHintText: {
    color: theme.colors.error,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  modalInput: {
    backgroundColor: theme.colors.surfaceElevated,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    minHeight: 48,
  },
  modalErrorText: {
    color: theme.colors.error,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    textAlign: "center",
  },
  catalogButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
    backgroundColor: `${theme.colors.primary}22`,
    borderColor: theme.colors.primary,
    borderWidth: 1.5,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  catalogButtonText: {
    color: theme.colors.primary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    fontWeight: "600",
  },
  orDivider: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  orText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  modalButtons: {
    gap: theme.spacing.md,
  },
});

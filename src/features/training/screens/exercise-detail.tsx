import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ArrowLeft, Dumbbell, Plus, Trash2 } from "lucide-react-native";
import { BaseCard } from "@/components/ui/BaseCard";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { theme } from "@/theme";
import type {
  ExerciseConfig,
  ExerciseSet,
  Routine,
} from "@/features/training/types/routine";
import type { TrainingStackParamList } from "@/navigation/types";
import { useRoutineDetail, useRoutines } from "@/features/training/hooks/use-routines";
import { useSyncRoutine } from "@/features/training/hooks/use-sync-routine";
import { exerciseSetsSchema } from "@/features/training/validations/routine";

type Props = NativeStackScreenProps<TrainingStackParamList, "ExerciseDetail">;

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

export default function ExerciseDetailScreen({ navigation, route }: Props) {
  const { routineId, exercise: initialExercise } = route.params;
  const { data: routine } = useRoutineDetail(routineId);
  const syncRoutineMutation = useSyncRoutine();

  const [isEditing, setIsEditing] = useState(false);
  // localSets will store the currently edited state of sets
  const [localSets, setLocalSets] = useState<ExerciseSet[]>(() => {
    const sets = getExerciseSets(initialExercise);
    // If no sets are configured initially, start with one empty set when editing
    return sets.length > 0 ? sets : [];
  });

  const handleEditToggle = () => {
    if (!isEditing && localSets.length === 0) {
      // If entering edit mode and there are no sets, add one by default with 15 reps
      setLocalSets([{ setNumber: 1, reps: 15, weight: 0 }]);
    }
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    // Revert to initial state
    setLocalSets(getExerciseSets(initialExercise));
    setIsEditing(false);
  };

  const handleSave = () => {
    if (!routine) return;

    // Validate using Zod schema
    const validationResult = exerciseSetsSchema.safeParse(localSets);
    if (!validationResult.success) {
      // Find a specific error message if possible
      const firstIssue = validationResult.error.issues[0];
      const field = firstIssue.path[firstIssue.path.length - 1]; // e.g., 'reps', 'weight'
      const setIndex = typeof firstIssue.path[0] === 'number' ? firstIssue.path[0] + 1 : null;
      
      let errorMessage = "Revisa los datos ingresados.";
      if (field === "reps") {
        errorMessage = setIndex 
          ? `Las repeticiones en el Set ${setIndex} deben ser entre 1 y 50.` 
          : "Las repeticiones deben ser entre 1 y 50.";
      } else if (firstIssue.code === "too_small" && firstIssue.path.length === 0) {
        errorMessage = "Debes tener al menos 1 set configurado.";
      } else if (firstIssue.code === "too_big" && firstIssue.path.length === 0) {
        errorMessage = "No puedes tener más de 10 sets.";
      }

      Alert.alert("Error de validación", errorMessage);
      return;
    }

    // Build full sync payload updating only this specific exercise
    const updatedDays = routine.days.map((day) => ({
      dayOfWeek: day.dayOfWeek,
      exercises: day.exercises.map((ex) => {
        if (ex.id === initialExercise.id) {
          return {
            id: ex.id,
            name: ex.name,
            order: ex.order,
            sets: localSets.map((s) => ({
              setNumber: s.setNumber,
              reps: s.reps,
              weight: s.weight,
              restSeconds: s.restSeconds ?? undefined,
            })),
          };
        }
        
        // Pass other exercises exactly as they are currently configured
        return {
          id: ex.id,
          name: ex.name,
          order: ex.order,
          sets: getExerciseSets(ex).map((s) => ({
            setNumber: s.setNumber,
            reps: s.reps,
            weight: s.weight,
            restSeconds: s.restSeconds ?? undefined,
          })),
        };
      }),
    }));

    syncRoutineMutation.mutate(
      { routineId, days: updatedDays },
      {
        onSuccess: () => {
          setIsEditing(false);
          // Wait for query invalidation from useSyncRoutine to refresh the UI
        },
      }
    );
  };

  const handleAddSet = () => {
    setLocalSets((prev) => [
      ...prev,
      {
        setNumber: prev.length + 1,
        reps: prev[prev.length - 1]?.reps ?? 10,
        weight: prev[prev.length - 1]?.weight ?? 0,
      },
    ]);
  };

  const handleUpdateSet = (
    index: number,
    field: "reps" | "weight" | "restSeconds",
    value: string
  ) => {
    const numericValue = value === "" ? 0 : Number(value);
    setLocalSets((prev) =>
      prev.map((set, i) => {
        if (i === index) {
          const newSet = { ...set, [field]: numericValue };
          // If restSeconds is 0 or empty, we can just remove it
          if (field === "restSeconds" && numericValue === 0) {
             delete newSet.restSeconds;
          }
          return newSet;
        }
        return set;
      })
    );
  };

  const handleRemoveSet = (indexToRemove: number) => {
    setLocalSets((prev) => {
      const filtered = prev.filter((_, i) => i !== indexToRemove);
      return filtered.map((set, i) => ({
        ...set,
        setNumber: i + 1,
      }));
    });
  };

  const currentExerciseConfig: ExerciseConfig = {
    ...initialExercise,
    detailedSets: localSets,
    sets: localSets,
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          {initialExercise.name}
        </Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Summary Card */}
        <BaseCard style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Dumbbell size={24} color={theme.colors.primary} />
            <View style={styles.summaryInfo}>
              <Text style={styles.summaryMeta}>
                {formatExerciseMeta(currentExerciseConfig)}
              </Text>
            </View>
          </View>
        </BaseCard>

        {/* Sets Detail */}
        <View style={styles.setsSection}>
          <Text style={styles.sectionTitle}>Detalle de sets</Text>
          {localSets.length > 0 ? (
            localSets.map((set, index) => (
              <BaseCard
                key={`set-${index}`}
                style={[styles.setCard, isEditing && styles.setCardEditing]}
              >
                <View style={styles.setRow}>
                  <Text style={styles.setNumber}>Set {set.setNumber}</Text>
                  <View style={styles.setValues}>
                    {isEditing ? (
                      <>
                        <View style={styles.inputGroup}>
                          <TextInput
                            style={styles.editInput}
                            value={set.reps === 0 && !isEditing ? "" : String(set.reps)}
                            onChangeText={(text) =>
                              handleUpdateSet(index, "reps", text)
                            }
                            keyboardType="numeric"
                            placeholder="Reps"
                            placeholderTextColor={theme.colors.textMuted}
                          />
                          <Text style={styles.inputLabel}>reps</Text>
                        </View>
                        <View style={styles.inputGroup}>
                          <TextInput
                            style={styles.editInput}
                            value={set.weight === 0 && !isEditing ? "" : String(set.weight)}
                            onChangeText={(text) =>
                              handleUpdateSet(index, "weight", text)
                            }
                            keyboardType="numeric"
                            placeholder="kg"
                            placeholderTextColor={theme.colors.textMuted}
                          />
                          <Text style={styles.inputLabel}>kg</Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => handleRemoveSet(index)}
                          style={styles.removeSetButton}
                        >
                          <Trash2 size={18} color={theme.colors.error} />
                        </TouchableOpacity>
                      </>
                    ) : (
                      <>
                        <Text style={styles.setValue}>{set.reps} reps</Text>
                        {set.weight > 0 && (
                          <Text style={styles.setValue}>{set.weight} kg</Text>
                        )}
                        {set.restSeconds ? (
                          <Text style={styles.setValue}>
                            {set.restSeconds}s descanso
                          </Text>
                        ) : null}
                      </>
                    )}
                  </View>
                </View>
              </BaseCard>
            ))
          ) : (
            <BaseCard style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                No hay sets configurados para este ejercicio.
              </Text>
              <Text style={styles.emptySub}>
                Presiona "Editar ejercicio" para agregarlos.
              </Text>
            </BaseCard>
          )}

          {isEditing && localSets.length < 10 && (
            <TouchableOpacity style={styles.addSetButton} onPress={handleAddSet}>
              <Plus size={20} color={theme.colors.primary} />
              <Text style={styles.addSetText}>Agregar set</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {isEditing ? (
            <>
              <PrimaryButton
                label="Guardar cambios"
                onPress={handleSave}
                loading={syncRoutineMutation.isPending}
                disabled={syncRoutineMutation.isPending}
              />
              <SecondaryButton
                label="Cancelar"
                onPress={handleCancelEdit}
                disabled={syncRoutineMutation.isPending}
              />
            </>
          ) : (
            <>
              <PrimaryButton
                label="Editar ejercicio"
                onPress={handleEditToggle}
              />
              <SecondaryButton
                label="Volver a la rutina"
                onPress={() => navigation.goBack()}
              />
            </>
          )}
        </View>
      </ScrollView>
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
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading3.fontSize,
    lineHeight: theme.typography.heading3.lineHeight,
    fontWeight: theme.typography.heading3.fontWeight,
    flex: 1,
    textAlign: "center",
    marginHorizontal: theme.spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxxl,
    gap: theme.spacing.lg,
  },
  summaryCard: {
    padding: theme.spacing.md,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  summaryInfo: {
    flex: 1,
  },
  summaryMeta: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    fontWeight: "600",
  },
  setsSection: {
    gap: theme.spacing.md,
  },
  sectionTitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  setCard: {
    padding: theme.spacing.md,
  },
  setCardEditing: {
    paddingVertical: theme.spacing.sm,
  },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  setNumber: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    fontWeight: "600",
  },
  setValues: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  setValue: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
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
    textAlign: "center",
  },
  inputLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
  },
  removeSetButton: {
    padding: theme.spacing.xs,
    marginLeft: theme.spacing.xs,
  },
  addSetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    backgroundColor: `${theme.colors.primary}11`,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderStyle: "dashed",
    marginTop: theme.spacing.xs,
  },
  addSetText: {
    color: theme.colors.primary,
    fontSize: theme.typography.body.fontSize,
    fontWeight: "600",
  },
  emptyCard: {
    padding: theme.spacing.xl,
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  emptyText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    textAlign: "center",
  },
  emptySub: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    textAlign: "center",
  },
  actions: {
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
});

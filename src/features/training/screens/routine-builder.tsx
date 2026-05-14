import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput as RNTextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, Plus, Trash2, ChevronUp, ChevronDown, Search } from 'lucide-react-native';
import { useRoutineDetail } from '@/features/training/hooks/use-routines';
import { useSyncRoutine } from '@/features/training/hooks/use-sync-routine';
import { useTrainingStrategies } from '@/features/training/hooks/use-training-strategies';
import { useSetRoutineStrategy } from '@/features/training/hooks/use-set-routine-strategy';
import { useGenerateExerciseSets } from '@/features/training/hooks/use-generate-exercise-sets';
import { useRoutineDraftStore } from '@/features/training/stores/routine-draft-store';
import { TrainingStrategySelector } from '@/features/training/components/TrainingStrategySelector';
import { ExerciseSetsTable } from '@/features/training/components/ExerciseSetsTable';
import type { TrainingStackParamList } from '@/navigation/types';
import { BaseCard } from '@/components/ui/BaseCard';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { theme } from '@/theme';
import {
  DAY_OF_WEEK_LABELS,
  DAY_OF_WEEK_ORDER,
  type DayOfWeek,
  type ExerciseConfig,
  type ExerciseSet,
} from '@/features/training/types/routine';

export default function RoutineBuilderScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<TrainingStackParamList>>();
  const route = useRoute<RouteProp<TrainingStackParamList, 'RoutineBuilder'>>();
  const { id } = route.params;

  const { data: routine, isLoading } = useRoutineDetail(id);
  const { data: strategies } = useTrainingStrategies();
  const syncRoutineMutation = useSyncRoutine();
  const setStrategyMutation = useSetRoutineStrategy();
  const generateSetsMutation = useGenerateExerciseSets();

  const draftStore = useRoutineDraftStore();

  const [selectedDay, setSelectedDay] = React.useState<DayOfWeek | null>(null);
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [newExerciseName, setNewExerciseName] = React.useState('');
  const [selectedDaysForNewExercise, setSelectedDaysForNewExercise] = React.useState<DayOfWeek[]>([]);
  const [editingExercise, setEditingExercise] = React.useState<string | null>(null);
  const [editValues, setEditValues] = React.useState({ sets: '', repsPerSet: '', weight: '' });
  const [autoGenValues, setAutoGenValues] = React.useState({ sets: '4', weight: '0', reps: '10' });
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState<string | null>(null);
  const [mutationError, setMutationError] = React.useState<string | null>(null);

  const hasInitializedRef = React.useRef(false);

  // Reset state when navigating to a different routine
  React.useEffect(() => {
    hasInitializedRef.current = false;
    setSelectedDay(null);
    setShowAddModal(false);
    setNewExerciseName('');
    setSelectedDaysForNewExercise([]);
    setEditingExercise(null);
    setShowDeleteConfirm(null);
    setMutationError(null);
    draftStore.clearDraft();
  }, [id]);

  // Initialize selected days for new exercise when modal opens
  React.useEffect(() => {
    if (showAddModal && selectedDay) {
      setSelectedDaysForNewExercise([selectedDay]);
    } else if (!showAddModal) {
      setSelectedDaysForNewExercise([]);
    }
  }, [showAddModal, selectedDay]);

  // Initialize draft store from routine data
  React.useEffect(() => {
    if (routine && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      draftStore.clearDraft();
      (routine.days ?? []).forEach((day) => {
        const exercises = (day.exercises ?? []).map((ex) => {
          const backendSets = (ex as unknown as { sets?: Array<{ setNumber: number; reps: number; weight: number }> }).sets;
          const isArray = Array.isArray(backendSets);
          const detailedSets: ExerciseSet[] | undefined = isArray
            ? backendSets.map((s) => ({ setNumber: s.setNumber, reps: s.reps, weight: s.weight }))
            : undefined;
          const setCount = isArray ? backendSets.length : (ex.sets as number) || 0;
          const firstSet = detailedSets?.[0];
          return {
            ...ex,
            sets: setCount,
            repsPerSet: firstSet?.reps ?? ex.repsPerSet ?? 0,
            weight: firstSet?.weight ?? ex.weight ?? 0,
            detailedSets,
          };
        });
        draftStore.setDraftExercises(day.dayOfWeek, exercises);
        exercises.forEach((ex) => {
          if (ex.detailedSets && ex.detailedSets.length > 0) {
            draftStore.setGeneratedSets(ex.id, ex.detailedSets);
          }
        });
      });
      if ((routine.dayOfWeeks ?? []).length > 0) {
        setSelectedDay(routine.dayOfWeeks[0]);
      }
    }
  }, [routine]);

  const sortedDays = [...(routine?.dayOfWeeks ?? [])].sort(
    (a, b) => DAY_OF_WEEK_ORDER.indexOf(a) - DAY_OF_WEEK_ORDER.indexOf(b),
  );

  const currentExercises = selectedDay ? draftStore.draftExercises[selectedDay] ?? [] : [];
  const hasStrategy = !!routine?.trainingStrategyKey;

  const buildSyncPayload = () => {
    const days = sortedDays.map((day) => ({
      dayOfWeek: day,
      exercises: (draftStore.draftExercises[day] ?? []).map((ex) => {
        const detailedSets = draftStore.generatedSets[ex.id];
        const hasConfig = ex.sets > 0 && ex.repsPerSet > 0;
        const payload: { id: string; name: string; order: number; sets?: Array<{ setNumber: number; reps: number; weight: number }> } = {
          id: ex.id,
          name: ex.name,
          order: ex.order,
        };
        if (detailedSets && detailedSets.length > 0) {
          payload.sets = detailedSets;
        } else if (hasConfig) {
          payload.sets = Array.from({ length: ex.sets }, (_, i) => ({
            setNumber: i + 1,
            reps: ex.repsPerSet,
            weight: ex.weight,
          }));
        }
        return payload;
      }),
    }));
    return { routineId: id, days };
  };

  const handleAddExercise = () => {
    if (selectedDaysForNewExercise.length === 0) {
      setMutationError('Selecciona al menos un día para el ejercicio');
      return;
    }
    if (!newExerciseName.trim()) {
      setMutationError('Ingresa un nombre para el ejercicio');
      return;
    }
    const name = newExerciseName.trim();
    setMutationError(null);

    selectedDaysForNewExercise.forEach((day) => {
      const order = draftStore.draftExercises[day]?.length ?? 0;
      draftStore.addDraftExercise(day, {
        id: crypto.randomUUID(),
        name,
        order,
        sets: 0,
        repsPerSet: 0,
        weight: 0,
      });
    });

    setNewExerciseName('');
    setShowAddModal(false);
    setMutationError(null);
  };

  const toggleDayForNewExercise = (day: DayOfWeek) => {
    setSelectedDaysForNewExercise((prev) => {
      if (prev.includes(day)) {
        return prev.filter((d) => d !== day);
      }
      return [...prev, day];
    });
  };

  const handleRemoveExercise = (exerciseId: string) => {
    if (!selectedDay) return;
    setMutationError(null);
    draftStore.removeDraftExercise(selectedDay, exerciseId);
    setShowDeleteConfirm(null);
  };

  const startEditing = (exercise: ExerciseConfig) => {
    setEditingExercise(exercise.id);
    const existingGenerated = draftStore.generatedSets[exercise.id];
    const existingDetailed = exercise.detailedSets;

    if (!existingGenerated && existingDetailed && existingDetailed.length > 0) {
      draftStore.setGeneratedSets(exercise.id, existingDetailed);
    } else if (!existingGenerated) {
      draftStore.setGeneratedSets(exercise.id, []);
    }

    setEditValues({
      sets: String(exercise.sets || 4),
      repsPerSet: String(exercise.repsPerSet || 10),
      weight: String(exercise.weight || 0),
    });
    setAutoGenValues({
      sets: String(exercise.sets || 4),
      weight: String(exercise.weight || 0),
      reps: String(exercise.repsPerSet || 10),
    });
  };

  const saveExerciseConfig = (exerciseId: string) => {
    if (!selectedDay) return;
    const detailedSets = draftStore.generatedSets[exerciseId] ?? [];
    const sets = detailedSets.length || parseInt(editValues.sets, 10) || 1;
    const repsPerSet = detailedSets.length > 0
      ? detailedSets[0].reps
      : (parseInt(editValues.repsPerSet, 10) || 1);
    const weight = detailedSets.length > 0
      ? detailedSets[0].weight
      : (parseFloat(editValues.weight) || 0);

    setMutationError(null);
    draftStore.updateDraftExercise(selectedDay, exerciseId, {
      sets,
      repsPerSet,
      weight,
      detailedSets: detailedSets.length > 0 ? detailedSets : undefined,
    });
    setEditingExercise(null);
  };

  const handleGenerateSets = (exerciseId: string) => {
    if (!routine?.trainingStrategyKey) return;
    const numberOfSets = parseInt(autoGenValues.sets, 10) || 4;
    const initialWeight = parseFloat(autoGenValues.weight) || 0;
    const initialReps = parseInt(autoGenValues.reps, 10) || 10;

    setMutationError(null);
    generateSetsMutation.mutate(
      {
        routineId: id,
        strategyKey: routine.trainingStrategyKey,
        numberOfSets,
        initialWeight,
        initialReps,
      },
      {
        onSuccess: (sets) => {
          draftStore.setGeneratedSets(exerciseId, sets);
        },
        onError: (error) => {
          setMutationError(error.message || 'Error al generar sets');
        },
      },
    );
  };

  const handleSaveChanges = () => {
    setMutationError(null);
    syncRoutineMutation.mutate(buildSyncPayload(), {
      onSuccess: () => {
        navigation.goBack();
      },
      onError: (error) => {
        setMutationError(error.message || 'Error al guardar cambios');
      },
    });
  };

  const handleStrategyChange = (key: string | null) => {
    setMutationError(null);
    setStrategyMutation.mutate(
      { routineId: id, strategyKey: key },
      {
        onError: (error) => {
          setMutationError(error.message || 'Error al guardar estrategia');
        },
      },
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>{routine?.name ?? 'Editar Rutina'}</Text>
        <View style={styles.backButton} />
      </View>

      {isLoading && (
        <View style={styles.center}>
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      )}

      {mutationError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{mutationError}</Text>
        </View>
      )}

      {!isLoading && routine && (
        <>
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
          </ScrollView>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            <TrainingStrategySelector
              strategies={strategies ?? []}
              selectedKey={routine.trainingStrategyKey}
              onSelect={handleStrategyChange}
              disabled={setStrategyMutation.isPending}
            />

            <View style={styles.exercisesHeader}>
              <Text style={styles.sectionTitle}>
                Ejercicios · {DAY_OF_WEEK_LABELS[selectedDay ?? 'monday']}
              </Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowAddModal(true)}
              >
                <Plus size={18} color={theme.colors.primary} />
                <Text style={styles.addButtonText}>Agregar</Text>
              </TouchableOpacity>
            </View>

            {currentExercises.length === 0 ? (
              <BaseCard>
                <View style={styles.emptyDay}>
                  <Text style={styles.emptyDayText}>Sin ejercicios</Text>
                  <Text style={styles.emptyDaySub}>
                    Presiona "Agregar" para crear el primero
                  </Text>
                </View>
              </BaseCard>
            ) : (
              currentExercises.map((exercise, index) => (
                <BaseCard key={exercise.id} style={styles.exerciseCard}>
                  {editingExercise === exercise.id ? (
                    <View style={styles.editForm}>
                      <Text style={styles.exerciseName}>{exercise.name}</Text>

                      {hasStrategy && (
                        <View style={styles.autoGenSection}>
                          <Text style={styles.editLabel}>Configuración rápida</Text>
                          <View style={styles.editRow}>
                            <View style={styles.editField}>
                              <Text style={styles.editLabel}>Sets</Text>
                              <RNTextInput
                                style={styles.editInput}
                                value={autoGenValues.sets}
                                onChangeText={(t) => setAutoGenValues((v) => ({ ...v, sets: t }))}
                                keyboardType="numeric"
                                placeholder="4"
                                placeholderTextColor={theme.colors.textMuted}
                              />
                            </View>
                            <View style={styles.editField}>
                              <Text style={styles.editLabel}>Peso inicial (kg)</Text>
                              <RNTextInput
                                style={styles.editInput}
                                value={autoGenValues.weight}
                                onChangeText={(t) => setAutoGenValues((v) => ({ ...v, weight: t }))}
                                keyboardType="numeric"
                                placeholder="0"
                                placeholderTextColor={theme.colors.textMuted}
                              />
                            </View>
                            <View style={styles.editField}>
                              <Text style={styles.editLabel}>Reps iniciales</Text>
                              <RNTextInput
                                style={styles.editInput}
                                value={autoGenValues.reps}
                                onChangeText={(t) => setAutoGenValues((v) => ({ ...v, reps: t }))}
                                keyboardType="numeric"
                                placeholder="10"
                                placeholderTextColor={theme.colors.textMuted}
                              />
                            </View>
                          </View>
                          <PrimaryButton
                            label="Generar sets"
                            onPress={() => handleGenerateSets(exercise.id)}
                            loading={generateSetsMutation.isPending}
                            disabled={generateSetsMutation.isPending}
                          />
                        </View>
                      )}

                      {!hasStrategy && (
                        <View style={styles.editRow}>
                          <View style={styles.editField}>
                            <Text style={styles.editLabel}>Sets</Text>
                            <RNTextInput
                              style={styles.editInput}
                              value={editValues.sets}
                              onChangeText={(t) => setEditValues((v) => ({ ...v, sets: t }))}
                              keyboardType="numeric"
                              placeholder="4"
                              placeholderTextColor={theme.colors.textMuted}
                            />
                          </View>
                          <View style={styles.editField}>
                            <Text style={styles.editLabel}>Reps</Text>
                            <RNTextInput
                              style={styles.editInput}
                              value={editValues.repsPerSet}
                              onChangeText={(t) => setEditValues((v) => ({ ...v, repsPerSet: t }))}
                              keyboardType="numeric"
                              placeholder="8"
                              placeholderTextColor={theme.colors.textMuted}
                            />
                          </View>
                          <View style={styles.editField}>
                            <Text style={styles.editLabel}>Peso (kg)</Text>
                            <RNTextInput
                              style={styles.editInput}
                              value={editValues.weight}
                              onChangeText={(t) => setEditValues((v) => ({ ...v, weight: t }))}
                              keyboardType="numeric"
                              placeholder="0"
                              placeholderTextColor={theme.colors.textMuted}
                            />
                          </View>
                        </View>
                      )}

                      {hasStrategy && (
                        <View style={styles.tableSection}>
                          <Text style={styles.editLabel}>Sets generados</Text>
                          <ExerciseSetsTable
                            sets={draftStore.generatedSets[exercise.id] ?? []}
                            onChange={(sets) => draftStore.setGeneratedSets(exercise.id, sets)}
                          />
                        </View>
                      )}

                      <View style={styles.editActions}>
                        <SecondaryButton
                          label="Cancelar"
                          onPress={() => setEditingExercise(null)}
                        />
                        <PrimaryButton
                          label="Guardar"
                          onPress={() => saveExerciseConfig(exercise.id)}
                        />
                      </View>
                    </View>
                  ) : (
                    <View style={styles.exerciseRow}>
                      <View style={styles.exerciseMain}>
                        <Text style={styles.exerciseName}>{exercise.name}</Text>
                        <Text style={styles.exerciseMeta}>
                          {exercise.sets} sets × {exercise.repsPerSet} reps
                          {exercise.weight > 0 ? ` @ ${exercise.weight}kg` : ''}
                        </Text>
                      </View>
                      <View style={styles.exerciseActions}>
                        <View style={styles.reorderButtons}>
                          <TouchableOpacity
                            onPress={() =>
                              draftStore.reorderDraftExercise(
                                selectedDay as DayOfWeek,
                                exercise.id,
                                'up',
                              )
                            }
                            disabled={index === 0}
                            style={[styles.iconBtn, index === 0 && styles.iconBtnDisabled]}
                          >
                            <ChevronUp size={18} color={theme.colors.textSecondary} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() =>
                              draftStore.reorderDraftExercise(
                                selectedDay as DayOfWeek,
                                exercise.id,
                                'down',
                              )
                            }
                            disabled={index === currentExercises.length - 1}
                            style={[
                              styles.iconBtn,
                              index === currentExercises.length - 1 && styles.iconBtnDisabled,
                            ]}
                          >
                            <ChevronDown size={18} color={theme.colors.textSecondary} />
                          </TouchableOpacity>
                        </View>
                        <TouchableOpacity
                          onPress={() => startEditing(exercise)}
                          style={styles.iconBtn}
                        >
                          <Text style={styles.editText}>Editar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => setShowDeleteConfirm(exercise.id)}
                          style={styles.iconBtn}
                        >
                          <Trash2 size={18} color={theme.colors.error} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </BaseCard>
              ))
            )}

            <PrimaryButton
              label="Guardar Cambios"
              onPress={handleSaveChanges}
              loading={syncRoutineMutation.isPending}
            />
          </ScrollView>
        </>
      )}

      {/* Add Exercise Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
              <Text style={styles.modalHintText}>Selecciona al menos un día</Text>
            )}
            <Text style={styles.modalLabel}>Nombre</Text>
            <TouchableOpacity
              style={styles.catalogButton}
              onPress={() => {
                setShowAddModal(false);
                navigation.navigate('ExerciseCatalog', {
                  onSelect: (name: string) => {
                    setNewExerciseName(name);
                    selectedDaysForNewExercise.forEach((day) => {
                      const order = draftStore.draftExercises[day]?.length ?? 0;
                      draftStore.addDraftExercise(day, {
                        id: crypto.randomUUID(),
                        name,
                        order,
                        sets: 0,
                        repsPerSet: 0,
                        weight: 0,
                      });
                    });
                    setShowAddModal(false);
                  },
                });
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
              <SecondaryButton label="Cancelar" onPress={() => setShowAddModal(false)} />
              <PrimaryButton
                label="Agregar"
                onPress={handleAddExercise}
                disabled={selectedDaysForNewExercise.length === 0 || !newExerciseName.trim()}
              />
            </View>
          </BaseCard>
        </KeyboardAvoidingView>
      </Modal>

      {/* Delete Exercise Confirmation */}
      <Modal
        visible={!!showDeleteConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteConfirm(null)}
      >
        <View style={styles.modalOverlay}>
          <BaseCard style={styles.modalCard}>
            <Text style={styles.modalTitle}>¿Eliminar ejercicio?</Text>
            <Text style={styles.modalText}>Esta acción no se puede deshacer.</Text>
            <View style={styles.modalButtons}>
              <SecondaryButton label="Cancelar" onPress={() => setShowDeleteConfirm(null)} />
              <PrimaryButton
                label="Eliminar"
                onPress={() => showDeleteConfirm && handleRemoveExercise(showDeleteConfirm)}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading3.fontSize,
    lineHeight: theme.typography.heading3.lineHeight,
    fontWeight: theme.typography.heading3.fontWeight,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
  },
  daysRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
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
    fontWeight: '500',
  },
  dayTabTextSelected: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxxl,
    gap: theme.spacing.md,
  },
  exercisesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.sm,
  },
  sectionTitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  addButtonText: {
    color: theme.colors.primary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    fontWeight: '600',
  },
  exerciseCard: {
    padding: theme.spacing.md,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  exerciseMain: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  exerciseName: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    fontWeight: '600',
  },
  exerciseMeta: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  exerciseActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  reorderButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    padding: theme.spacing.xs,
    minWidth: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnDisabled: {
    opacity: 0.3,
  },
  editText: {
    color: theme.colors.primary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    fontWeight: '600',
  },
  editForm: {
    gap: theme.spacing.md,
  },
  autoGenSection: {
    gap: theme.spacing.md,
  },
  tableSection: {
    gap: theme.spacing.sm,
  },
  editRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  editField: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  editLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  editInput: {
    backgroundColor: theme.colors.surfaceElevated,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    minHeight: 44,
  },
  editActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  emptyDay: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  emptyDayText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
  },
  emptyDaySub: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  modalCard: {
    width: '100%',
    gap: theme.spacing.md,
  },
  modalTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading3.fontSize,
    lineHeight: theme.typography.heading3.lineHeight,
    fontWeight: theme.typography.heading3.fontWeight,
    textAlign: 'center',
  },
  modalLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  daysChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
    fontWeight: '500',
  },
  dayChipTextSelected: {
    color: theme.colors.background,
    fontWeight: '700',
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
  modalText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    textAlign: 'center',
  },
  modalErrorText: {
    color: theme.colors.error,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    textAlign: 'center',
  },
  modalButtons: {
    gap: theme.spacing.md,
  },
  errorBanner: {
    backgroundColor: `${theme.colors.error}22`,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    marginHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: `${theme.colors.error}44`,
  },
  errorBannerText: {
    color: theme.colors.error,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    textAlign: 'center',
  },
  catalogButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
    fontWeight: '600',
  },
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
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
});

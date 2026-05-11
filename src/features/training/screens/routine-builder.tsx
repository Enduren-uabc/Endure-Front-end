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
import { ArrowLeft, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react-native';
import { useRoutineDetail } from '@/features/training/hooks/use-routines';
import {
  useAddExercise,
  useRemoveExercise,
  useConfigureExercise,
} from '@/features/training/hooks/use-create-routine';
import { useRoutineDraftStore } from '@/features/training/stores/routine-draft-store';
import type { TrainingStackParamList } from '@/navigation/types';
import { BaseCard } from '@/components/ui/BaseCard';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { theme } from '@/theme';
import {
  DAY_OF_WEEK_LABELS,
  DAY_OF_WEEK_ORDER,
  type DayOfWeek,
} from '@/features/training/types/routine';

export default function RoutineBuilderScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<TrainingStackParamList>>();
  const route = useRoute<RouteProp<TrainingStackParamList, 'RoutineBuilder'>>();
  const { id } = route.params;

  const { data: routine, isLoading } = useRoutineDetail(id);
  const addExerciseMutation = useAddExercise();
  const removeExerciseMutation = useRemoveExercise();
  const configureMutation = useConfigureExercise();

  const draftStore = useRoutineDraftStore();

  const [selectedDay, setSelectedDay] = React.useState<DayOfWeek | null>(null);
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [newExerciseName, setNewExerciseName] = React.useState('');
  const [editingExercise, setEditingExercise] = React.useState<string | null>(null);
  const [editValues, setEditValues] = React.useState({ sets: '', repsPerSet: '', weight: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState<string | null>(null);
  const [mutationError, setMutationError] = React.useState<string | null>(null);

  const hasInitializedRef = React.useRef(false);

  // Reset state when navigating to a different routine
  React.useEffect(() => {
    hasInitializedRef.current = false;
    setSelectedDay(null);
    setShowAddModal(false);
    setNewExerciseName('');
    setEditingExercise(null);
    setShowDeleteConfirm(null);
    setMutationError(null);
    draftStore.clearDraft();
  }, [id]);

  // Initialize draft store from routine data
  React.useEffect(() => {
    if (routine && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      draftStore.clearDraft();
      (routine.days ?? []).forEach((day) => {
        draftStore.setDraftExercises(day.dayOfWeek, day.exercises ?? []);
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

  const handleAddExercise = () => {
    if (!selectedDay || !newExerciseName.trim()) {
      setMutationError(!selectedDay ? 'Selecciona un día primero' : 'Ingresa un nombre para el ejercicio');
      return;
    }
    const name = newExerciseName.trim();
    const order = currentExercises.length;
    setMutationError(null);
    addExerciseMutation.mutate(
      { routineId: id, dayOfWeek: selectedDay, name, order },
      {
        onSuccess: (data) => {
          draftStore.addDraftExercise(selectedDay, { ...data, order });
          setNewExerciseName('');
          setShowAddModal(false);
          setMutationError(null);
        },
        onError: (error) => {
          setMutationError(error.message || 'Error al agregar ejercicio');
        },
      },
    );
  };

  const handleRemoveExercise = (exerciseId: string) => {
    if (!selectedDay) return;
    setMutationError(null);
    removeExerciseMutation.mutate(
      { routineId: id, dayOfWeek: selectedDay, exerciseId },
      {
        onSuccess: () => {
          draftStore.removeDraftExercise(selectedDay, exerciseId);
          setShowDeleteConfirm(null);
          setMutationError(null);
        },
        onError: (error) => {
          setMutationError(error.message || 'Error al eliminar ejercicio');
        },
      },
    );
  };

  const startEditing = (exerciseId: string, sets: number, repsPerSet: number, weight: number) => {
    setEditingExercise(exerciseId);
    setEditValues({
      sets: String(sets),
      repsPerSet: String(repsPerSet),
      weight: String(weight),
    });
  };

  const saveExerciseConfig = (exerciseId: string) => {
    if (!selectedDay) return;
    const sets = parseInt(editValues.sets, 10) || 1;
    const repsPerSet = parseInt(editValues.repsPerSet, 10) || 1;
    const weight = parseFloat(editValues.weight) || 0;

    setMutationError(null);
    configureMutation.mutate(
      { routineId: id, dayOfWeek: selectedDay, exerciseId, sets, repsPerSet, weight },
      {
        onSuccess: () => {
          draftStore.updateDraftExercise(selectedDay, exerciseId, { sets, repsPerSet, weight });
          setEditingExercise(null);
          setMutationError(null);
        },
        onError: (error) => {
          setMutationError(error.message || 'Error al guardar configuración');
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
                      <View style={styles.editActions}>
                        <SecondaryButton
                          label="Cancelar"
                          onPress={() => setEditingExercise(null)}
                        />
                        <PrimaryButton
                          label="Guardar"
                          onPress={() => saveExerciseConfig(exercise.id)}
                          loading={configureMutation.isPending}
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
                          onPress={() =>
                            startEditing(exercise.id, exercise.sets, exercise.repsPerSet, exercise.weight)
                          }
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
              onPress={() => navigation.goBack()}
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
            <Text style={styles.modalLabel}>Nombre</Text>
            <RNTextInput
              style={styles.modalInput}
              value={newExerciseName}
              onChangeText={setNewExerciseName}
              placeholder="Ej. Press de banca"
              placeholderTextColor={theme.colors.textMuted}
              autoFocus
            />
            {mutationError && showAddModal && (
              <Text style={styles.modalErrorText}>{mutationError}</Text>
            )}
            <View style={styles.modalButtons}>
              <SecondaryButton label="Cancelar" onPress={() => setShowAddModal(false)} />
              <PrimaryButton
                label="Agregar"
                onPress={handleAddExercise}
                loading={addExerciseMutation.isPending}
                disabled={!newExerciseName.trim() || addExerciseMutation.isPending}
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
                loading={removeExerciseMutation.isPending}
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
});

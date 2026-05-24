import React from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GripVertical, Plus, Save, Trash2 } from 'lucide-react-native';
import { BaseCard } from '@/components/ui/BaseCard';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { TextInput } from '@/components/ui/TextInput';
import { Chip } from '@/components/ui/Chip';
import { theme } from '@/theme';
import {
  TrainingV2FieldPreview,
  TrainingV2Screen,
  TrainingV2SectionHeader,
  TrainingV2SheetPreview,
  TrainingV2Tag,
} from './TrainingV2Primitives';
import { useCreateRoutine, useRoutineDetail } from '@/features/training/hooks/use-routines';
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';
import type { DayOfWeek } from '@/features/training/types/routine';
import type { TrainingStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<TrainingStackParamList, 'RoutineBuilder'>;

const DAY_MAP: Record<string, DayOfWeek> = {
  L: 'monday', M: 'tuesday', X: 'wednesday', J: 'thursday',
  V: 'friday', S: 'saturday', D: 'sunday',
};

const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: 'Lunes', tuesday: 'Martes', wednesday: 'Miercoles',
  thursday: 'Jueves', friday: 'Viernes', saturday: 'Sabado', sunday: 'Domingo',
};

const DAY_OPTIONS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

interface SetEntry {
  id: string;
  reps: string;
  weight: string;
}

let setIdCounter = 0;
function newSetId() { return `set-${++setIdCounter}`; }

export default function RoutineBuilderV2Screen({ navigation, route }: Props) {
  const isNewRoutine = route.params.id === 'new';
  const { data: existingRoutine, isLoading: loadingExisting, refetch: refetchRoutine } = useRoutineDetail(
    isNewRoutine ? '' : route.params.id,
  );
  const createRoutine = useCreateRoutine();

  const [routineName, setRoutineName] = React.useState('');
  const [selectedDayKeys, setSelectedDayKeys] = React.useState<string[]>([]);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [routineId, setRoutineId] = React.useState(isNewRoutine ? '' : route.params.id);
  const [created, setCreated] = React.useState(!isNewRoutine);

  const [selectedDayForExercise, setSelectedDayForExercise] = React.useState('');
  const [exerciseName, setExerciseName] = React.useState('');
  const [exerciseSets, setExerciseSets] = React.useState<SetEntry[]>([
    { id: newSetId(), reps: '8', weight: '0' },
  ]);
  const [addingExercise, setAddingExercise] = React.useState(false);

  React.useEffect(() => {
    if (existingRoutine) {
      setRoutineName(existingRoutine.name);
      setSelectedDayKeys(
        existingRoutine.dayOfWeeks.map((d) => {
          const entry = Object.entries(DAY_MAP).find(([, v]) => v === d);
          return entry ? entry[0] : d.slice(0, 1).toUpperCase();
        }),
      );
      setRoutineId(existingRoutine.id);
      setCreated(true);
    }
  }, [existingRoutine]);

  const missingName = routineName.trim().length === 0;
  const missingDays = selectedDayKeys.length === 0;
  const canSaveRoutine = !missingName && !missingDays && !createRoutine.isPending;

  const exercisesByDay = created && existingRoutine
    ? existingRoutine.days.map((day) => ({
        dayOfWeek: day.dayOfWeek,
        dayLabel: DAY_LABELS[day.dayOfWeek] ?? day.dayOfWeek,
        exercises: day.exercises,
      }))
    : [];

  function handleCreateRoutine() {
    if (!canSaveRoutine) return;

    createRoutine.mutate(
      { name: routineName.trim(), dayOfWeeks: selectedDayKeys.map((k) => DAY_MAP[k]).filter(Boolean) },
      {
        onSuccess: (routine) => {
          setRoutineId(routine.id);
          setCreated(true);
          setRoutineName(routine.name);
        },
        onError: () => {
          setSaveError('No pudimos guardar la rutina. Intenta nuevamente.');
        },
      },
    );
  }

  function addSetRow() {
    setExerciseSets((prev) => [...prev, { id: newSetId(), reps: '8', weight: '0' }]);
  }

  function updateSet(id: string, field: 'reps' | 'weight', value: string) {
    setExerciseSets((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    );
  }

  function removeSet(id: string) {
    setExerciseSets((prev) => prev.filter((s) => s.id !== id));
  }

  async function handleAddExercise() {
    if (!routineId || !selectedDayForExercise || !exerciseName.trim()) {
      Alert.alert('Completa los campos', 'Selecciona un dia y escribe el nombre del ejercicio.');
      return;
    }

    const parsedSets = exerciseSets.map((s, i) => ({
      setNumber: i + 1,
      reps: parseInt(s.reps, 10) || 0,
      weight: parseFloat(s.weight) || 0,
      restSeconds: 90,
    }));

    if (parsedSets.length === 0) {
      Alert.alert('Sin series', 'Agrega al menos una serie antes de guardar.');
      return;
    }

    setAddingExercise(true);
    try {
      const dayOfWeek = DAY_MAP[selectedDayForExercise];
      const order = (existingRoutine?.days.find((d) => d.dayOfWeek === dayOfWeek)?.exercises.length ?? 0) + 1;

      const createdRes: any = await apiClient.post(
        API_ENDPOINTS.routines.addExercise(routineId, dayOfWeek),
        { name: exerciseName.trim(), order },
      );

      const newExerciseId = createdRes?.days
        ?.find((d: any) => d.dayOfWeek === dayOfWeek)
        ?.exercises
        ?.find((e: any) => e.name === exerciseName.trim())
        ?.id ?? null;

      if (newExerciseId) {
        await apiClient.patch(
          API_ENDPOINTS.routines.configureExercise(routineId, dayOfWeek, newExerciseId),
          { sets: parsedSets },
        );
      }

      await refetchRoutine();
      setExerciseName('');
      setExerciseSets([{ id: newSetId(), reps: '8', weight: '0' }]);
    } catch {
      Alert.alert('Error', 'No se pudo agregar el ejercicio.');
    } finally {
      setAddingExercise(false);
    }
  }

  async function handleRemoveExercise(exerciseId: string) {
    if (!routineId || !existingRoutine) return;

    const dayOfWeek = existingRoutine.days.find((d) =>
      d.exercises.some((e) => e.id === exerciseId),
    )?.dayOfWeek;
    if (!dayOfWeek) return;

    try {
      await apiClient.del(API_ENDPOINTS.routines.removeExercise(routineId, dayOfWeek, exerciseId));
      await refetchRoutine();
    } catch {
      Alert.alert('Error', 'No se pudo eliminar el ejercicio.');
    }
  }

  if (loadingExisting) {
    return (
      <TrainingV2Screen title="Rutina" titleColor={theme.colors.textPrimary} onBack={navigation.goBack}>
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.primary} size="large" />
          <Text style={styles.centerText}>Cargando rutina...</Text>
        </View>
      </TrainingV2Screen>
    );
  }

  return (
    <TrainingV2Screen
      title={created ? 'Editar rutina' : 'Nueva rutina'}
      titleColor={theme.colors.textPrimary}
      subtitle={created ? 'Administra los ejercicios de tu rutina.' : 'Define el nombre y los dias de entrenamiento.'}
      onBack={navigation.goBack}
    >
      <BaseCard style={styles.formCard}>
        <TextInput
          label="Nombre"
          value={routineName}
          onChangeText={setRoutineName}
          placeholder="Ej. Fuerza full body"
          maxLength={50}
          allowEmoji={false}
          disabled={created}
        />

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Dias de entrenamiento</Text>
          <View style={styles.dayRow}>
            {DAY_OPTIONS.map((day) => {
              const selected = selectedDayKeys.includes(day);
              return (
                <Text
                  key={day}
                  onPress={() => {
                    if (!created) {
                      setSelectedDayKeys((current) =>
                        current.includes(day) ? current.filter((item) => item !== day) : [...current, day],
                      );
                      setSaveError(null);
                    }
                  }}
                  style={[styles.dayChip, selected ? styles.dayChipSelected : null, created ? styles.dayChipDisabled : null]}
                >
                  {day}
                </Text>
              );
            })}
          </View>
        </View>

        <View style={styles.previewGrid}>
          <TrainingV2FieldPreview
            label="Dias"
            value={`${selectedDayKeys.length}`}
            helper={selectedDayKeys.map((k) => k).join(' / ') || 'Ninguno'}
          />
        </View>

        {!created ? (
          <PrimaryButton
            label={createRoutine.isPending ? 'Creando...' : 'Crear rutina'}
            onPress={handleCreateRoutine}
            disabled={!canSaveRoutine}
            loading={createRoutine.isPending}
          />
        ) : null}

        {saveError ? (
          <Text style={styles.errorText}>{saveError}</Text>
        ) : null}
      </BaseCard>

      {created ? (
        <>
          <TrainingV2SectionHeader title="Agregar ejercicio" />

          <BaseCard style={styles.formCard}>
            <TextInput
              label="Nombre del ejercicio"
              value={exerciseName}
              onChangeText={setExerciseName}
              placeholder="Ej. Sentadilla trasera"
              maxLength={50}
              allowEmoji={false}
            />

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Dia</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.dayRow}>
                  {selectedDayKeys.map((dayKey) => (
                    <Chip
                      key={dayKey}
                      label={dayKey}
                      selected={selectedDayForExercise === dayKey}
                      onPress={() => setSelectedDayForExercise(dayKey)}
                    />
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={styles.fieldGroup}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.label}>Series</Text>
                <TouchableOpacity onPress={addSetRow} style={styles.addSetButton}>
                  <Plus size={16} color={theme.colors.primary} />
                  <Text style={styles.addSetText}>Agregar serie</Text>
                </TouchableOpacity>
              </View>

              {exerciseSets.map((set, index) => (
                <View key={set.id} style={styles.exerciseInputRow}>
                  <View style={styles.setIndexCol}>
                    <Text style={styles.setIndexText}>{index + 1}</Text>
                  </View>
                  <View style={styles.setInputField}>
                    <TextInput
                      label="Reps"
                      value={set.reps}
                      onChangeText={(v) => updateSet(set.id, 'reps', v)}
                      keyboardType="numeric"
                      inputMode="numeric"
                    />
                  </View>
                  <View style={styles.setInputField}>
                    <TextInput
                      label="Peso (kg)"
                      value={set.weight}
                      onChangeText={(v) => updateSet(set.id, 'weight', v)}
                      keyboardType="numeric"
                      inputMode="decimal"
                    />
                  </View>
                  <TouchableOpacity
                    onPress={() => removeSet(set.id)}
                    style={styles.removeSetButton}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Trash2 size={16} color={theme.colors.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <View style={styles.addExerciseActions}>
              <PrimaryButton
                label={addingExercise ? 'Agregando...' : 'Guardar ejercicio'}
                onPress={handleAddExercise}
                loading={addingExercise}
                disabled={!selectedDayForExercise || !exerciseName.trim() || exerciseSets.length === 0}
                icon={<Plus size={18} color={theme.colors.background} />}
              />
              <SecondaryButton
                label="Del catalogo"
                onPress={() => navigation.navigate('ExerciseCatalog', { routineId })}
              />
            </View>
          </BaseCard>

          {exercisesByDay.length > 0 ? (
            exercisesByDay.map((dayGroup) => (
              <View key={dayGroup.dayOfWeek}>
                <TrainingV2SectionHeader title={dayGroup.dayLabel} />
                {dayGroup.exercises.length === 0 ? (
                  <BaseCard style={styles.emptyCard}>
                    <Text style={styles.emptyText}>Sin ejercicios en este dia</Text>
                  </BaseCard>
                ) : (
                  <View style={styles.exerciseList}>
                    {dayGroup.exercises.map((ex, idx) => (
                      <BaseCard key={ex.id} style={styles.exerciseCard}>
                        <GripVertical size={18} color={theme.colors.textMuted} />
                        <View style={styles.exerciseBody}>
                          <Text style={styles.exerciseTitle}>{ex.name}</Text>
                          <Text style={styles.exerciseMeta}>
                            {typeof ex.sets === 'number' ? ex.sets : ex.sets.length} series
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => handleRemoveExercise(ex.id)}
                          style={styles.deleteTouchable}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <Trash2 size={18} color={theme.colors.error} />
                        </TouchableOpacity>
                      </BaseCard>
                    ))}
                  </View>
                )}
              </View>
            ))
          ) : null}
        </>
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
  centerText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    textAlign: 'center',
  },
  formCard: {
    gap: theme.spacing.lg,
  },
  fieldGroup: {
    gap: theme.spacing.sm,
  },
  label: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    fontWeight: '700',
  },
  dayRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  dayChip: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: theme.colors.border,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    textAlignVertical: 'center',
    lineHeight: 38,
    fontWeight: '700',
    overflow: 'hidden',
  },
  dayChipSelected: {
    backgroundColor: theme.colors.primaryMuted,
    borderColor: theme.colors.primary,
    color: theme.colors.primary,
  },
  dayChipDisabled: {
    opacity: 0.5,
  },
  previewGrid: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    minHeight: 36,
  },
  addSetText: {
    color: theme.colors.primary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    fontWeight: '700',
  },
  exerciseInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: theme.spacing.sm,
  },
  setIndexCol: {
    width: 24,
    paddingBottom: 12,
    alignItems: 'center',
  },
  setIndexText: {
    color: theme.colors.primary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: '800',
  },
  setInputField: {
    flex: 1,
  },
  removeSetButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  addExerciseActions: {
    gap: theme.spacing.md,
  },
  exerciseList: {
    gap: theme.spacing.sm,
  },
  exerciseCard: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    alignItems: 'center',
  },
  exerciseBody: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  exerciseTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: theme.typography.bodyStrong.fontWeight,
  },
  exerciseMeta: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  deleteTouchable: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
});

import React from 'react';
import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ChevronRight, Dumbbell, Plus, Sparkles, Trash2 } from 'lucide-react-native';
import { BaseCard } from '@/components/ui/BaseCard';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { theme } from '@/theme';
import {
  TrainingV2FieldPreview,
  TrainingV2Screen,
  TrainingV2SectionHeader,
  TrainingV2Tag,
} from './TrainingV2Primitives';
import { useRoutineDetail } from '@/features/training/hooks/use-routines';
import { useTrainingStrategy } from '@/features/training/hooks/use-training-strategy';
import { useSyncRoutine } from '@/features/training/hooks/use-sync-routine';
import { exerciseSetsSchema } from '@/features/training/validations/routine';
import { DAY_OF_WEEK_LABELS, type DayOfWeek, type ExerciseConfig, type ExerciseSet } from '@/features/training/types/routine';
import type { TrainingStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<TrainingStackParamList, 'ExerciseDetail'>;

function getExerciseSets(exercise: ExerciseConfig): ExerciseSet[] {
  if (Array.isArray(exercise.sets)) return exercise.sets;
  return exercise.detailedSets ?? [];
}

const STRATEGY_LABELS: Record<string, string> = {
  straight: 'Estatica',
  ascending: 'Piramide Ascendente',
  descending: 'Piramide Descendente',
  drop_sets: 'Drop Sets',
  wave_loading: 'Wave Loading',
};

export default function ExerciseDetailV2Screen({ navigation, route }: Props) {
  const { routineId, exercise: initialExercise, selectedDay: initialDay } = route.params;
  const { data: routine } = useRoutineDetail(routineId);
  const syncRoutineMutation = useSyncRoutine();
  const strategyKey = routine?.trainingStrategyKey ?? null;
  const { strategy, calculateNextSet } = useTrainingStrategy(strategyKey);
  const isNewExercise = !!initialDay;

  const routineDays = routine?.days.map((d) => d.dayOfWeek) ?? [];
  const [selectedDays, setSelectedDays] = React.useState<DayOfWeek[]>(() =>
    initialDay && routineDays.includes(initialDay as DayOfWeek)
      ? [initialDay as DayOfWeek]
      : [],
  );
  const [dayPickerVisible, setDayPickerVisible] = React.useState(false);

  const [localSets, setLocalSets] = React.useState<ExerciseSet[]>(() => {
    const sets = getExerciseSets(initialExercise);
    return sets.length > 0 ? sets : [];
  });
  const [isSaving, setIsSaving] = React.useState(false);

  const initialWeight = localSets[0]?.weight ?? 0;
  const initialReps = localSets[0]?.reps ?? 10;

  const handleAddSet = () => {
    if (localSets.length >= 10) return;
    setLocalSets((prev) => {
      const nextNumber = prev.length + 1;
      if (strategy && strategy.rules && prev.length > 0) {
        const suggested = calculateNextSet(prev, initialWeight, initialReps);
        return [
          ...prev,
          {
            setNumber: nextNumber,
            reps: suggested.reps,
            weight: suggested.weight,
          },
        ];
      }
      return [
        ...prev,
        {
          setNumber: nextNumber,
          reps: prev[prev.length - 1]?.reps ?? 10,
          weight: prev[prev.length - 1]?.weight ?? 0,
        },
      ];
    });
  };

  const handleUpdateSet = (
    index: number,
    field: 'reps' | 'weight',
    value: string,
  ) => {
    const numericValue = value === '' ? 0 : Number(value);
    setLocalSets((prev) =>
      prev.map((set, i) => (i === index ? { ...set, [field]: numericValue } : set)),
    );
  };

  const handleRemoveSet = (indexToRemove: number) => {
    if (localSets.length <= 1) {
      Alert.alert('Ultima serie', 'Debes tener al menos 1 serie configurada.');
      return;
    }
    setLocalSets((prev) => {
      const filtered = prev.filter((_, i) => i !== indexToRemove);
      return filtered.map((set, i) => ({ ...set, setNumber: i + 1 }));
    });
  };

  const handleSave = () => {
    if (!routine) return;

    const validationResult = exerciseSetsSchema.safeParse(localSets);
    if (!validationResult.success) {
      const firstIssue = validationResult.error.issues[0];
      const field = firstIssue.path[firstIssue.path.length - 1];
      const setIndex =
        typeof firstIssue.path[0] === 'number' ? (firstIssue.path[0] as number) + 1 : null;

      let errorMessage = 'Revisa los datos ingresados.';
      if (field === 'reps') {
        errorMessage = setIndex
          ? `Las repeticiones en la Serie ${setIndex} deben ser entre 1 y 50.`
          : 'Las repeticiones deben ser entre 1 y 50.';
      } else if (field === 'weight') {
        errorMessage = setIndex
          ? `El peso en la Serie ${setIndex} no puede ser negativo.`
          : 'El peso no puede ser negativo.';
      } else if (firstIssue.code === 'too_small' && firstIssue.path.length === 0) {
        errorMessage = 'Debes tener al menos 1 serie configurada.';
      } else if (firstIssue.code === 'too_big' && firstIssue.path.length === 0) {
        errorMessage = 'No puedes tener mas de 10 series.';
      }

      Alert.alert('Revisa los datos', errorMessage);
      return;
    }

    setIsSaving(true);

    const mappedSets = localSets.map((s) => ({
      setNumber: s.setNumber,
      reps: s.reps,
      weight: s.weight,
      restSeconds: s.restSeconds ?? undefined,
    }));

    if (isNewExercise && selectedDays.length > 0) {
      const daysSet = new Set(selectedDays);
      const updatedDays = routine.days.map((day) => ({
        dayOfWeek: day.dayOfWeek,
        exercises: daysSet.has(day.dayOfWeek as DayOfWeek)
          ? [
              ...day.exercises.map((ex) => ({
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
              {
                id: initialExercise.id,
                name: initialExercise.name,
                order: day.exercises.length,
                sets: mappedSets,
              },
            ]
          : day.exercises.map((ex) => ({
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
      for (const dayOfWeek of selectedDays) {
        if (!updatedDays.find((d) => d.dayOfWeek === dayOfWeek)) {
          updatedDays.push({
            dayOfWeek,
            exercises: [
              {
                id: initialExercise.id,
                name: initialExercise.name,
                order: 0,
                sets: mappedSets,
              },
            ],
          });
        }
      }
      syncRoutineMutation.mutate(
        { routineId, days: updatedDays },
        {
          onSuccess: () => {
            setIsSaving(false);
            navigation.navigate('RoutineDetail', { id: routineId });
          },
          onError: () => {
            setIsSaving(false);
            Alert.alert('Error', 'No se pudieron guardar los cambios. Intenta de nuevo.');
          },
        },
      );
    } else {
      const updatedDays = routine.days.map((day) => ({
        dayOfWeek: day.dayOfWeek,
        exercises: day.exercises.map((ex) => {
          if (ex.id === initialExercise.id) {
            return {
              id: ex.id,
              name: ex.name,
              order: ex.order,
              sets: mappedSets,
            };
          }
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
            setIsSaving(false);
            navigation.goBack();
          },
          onError: () => {
            setIsSaving(false);
            Alert.alert('Error', 'No se pudieron guardar los cambios. Intenta de nuevo.');
          },
        },
      );
    }
  };

  const totalSets = localSets.length;
  const totalVolume = localSets.reduce((sum, s) => sum + s.reps * s.weight, 0);
  const strategyLabel = strategyKey ? STRATEGY_LABELS[strategyKey] ?? strategy?.name ?? strategyKey : null;

  return (
    <TrainingV2Screen
      title="Configurar ejercicio"
      titleColor={theme.colors.textPrimary}
      subtitle={initialExercise.name}
      showDragIndicator
      footer={
        <View style={styles.footerRow}>
          <SecondaryButton
            label="Volver"
            onPress={navigation.goBack}
            style={styles.footerBtn}
            disabled={isSaving}
          />
          <PrimaryButton
            label="Guardar cambios"
            onPress={handleSave}
            loading={isSaving}
            disabled={isSaving || localSets.length === 0}
            style={styles.footerBtn}
          />
        </View>
      }
    >
      <View style={styles.heroWrap}>
        <View style={styles.heroGradient}>
          <View style={styles.heroTop}>
            <View style={styles.heroIcon}>
              <Dumbbell size={28} color={theme.colors.primary} />
            </View>
            {strategyLabel ? (
              <TrainingV2Tag label={strategyLabel} tone="primary" />
            ) : null}
          </View>
          <Text style={styles.heroTitle}>{initialExercise.name}</Text>
          <Text style={styles.heroMeta}>
            {totalSets} serie{totalSets !== 1 ? 's' : ''} configurada{totalSets !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      {isNewExercise ? (
        <View style={styles.daySection}>
          <View style={styles.dayHeader}>
            <Text style={styles.dayLabel}>Se agregara a:</Text>
            <TouchableOpacity
              style={styles.addDayBtn}
              onPress={() => setDayPickerVisible(true)}
            >
              <Text style={styles.addDayBtnText}>+ Agregar dia</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.dayChips}>
            {selectedDays.map((day) => (
              <TouchableOpacity
                key={day}
                style={[styles.dayChip, styles.dayChipActive]}
                onPress={() =>
                  setSelectedDays((prev) => prev.filter((d) => d !== day))
                }
              >
                <Text style={styles.dayChipTextActive}>
                  {DAY_OF_WEEK_LABELS[day]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : null}

      <Modal
        visible={dayPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDayPickerVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setDayPickerVisible(false)}
        >
          <Pressable style={styles.modalCard}>
            <Text style={styles.modalTitle}>Agregar a otro dia</Text>
            <View style={styles.modalDayGrid}>
              {routineDays
                .filter((day) => !selectedDays.includes(day))
                .map((day) => (
                  <TouchableOpacity
                    key={day}
                    style={styles.modalDayChip}
                    onPress={() => {
                      setSelectedDays((prev) => [...prev, day]);
                      setDayPickerVisible(false);
                    }}
                  >
                    <Text style={styles.modalDayChipText}>
                      {DAY_OF_WEEK_LABELS[day]}
                    </Text>
                  </TouchableOpacity>
                ))}
            </View>
            {routineDays.filter((day) => !selectedDays.includes(day)).length ===
            0 ? (
              <Text style={styles.modalEmptyText}>
                Todos los dias ya estan seleccionados.
              </Text>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>

      <View style={styles.metaGrid}>
        <TrainingV2FieldPreview label="Series" value={`${totalSets}`} helper="Totales" />
        <TrainingV2FieldPreview
          label="Volumen"
          value={totalVolume > 0 ? `${totalVolume} kg` : '--'}
          helper="Reps x peso"
        />
      </View>

      <TrainingV2SectionHeader title="Series" />

      {localSets.length === 0 ? (
        <BaseCard style={styles.emptyCard}>
          <View style={styles.emptyContent}>
            <Sparkles size={32} color={theme.colors.textMuted} />
            <Text style={styles.emptyTitle}>Sin series configuradas</Text>
            <Text style={styles.emptyText}>
              Agrega tu primera serie para empezar a configurar el ejercicio.
            </Text>
          </View>
        </BaseCard>
      ) : (
        <View style={styles.setList}>
          {localSets.map((set, index) => (
            <BaseCard key={`set-${index}`} style={styles.setCard}>
              <View style={styles.setHeader}>
                <Text style={styles.setNumber}>SERIE {set.setNumber}</Text>
                {localSets.length > 1 ? (
                  <TouchableOpacity
                    onPress={() => handleRemoveSet(index)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Trash2 size={18} color={theme.colors.error} />
                  </TouchableOpacity>
                ) : null}
              </View>
              <View style={styles.setInputs}>
                <View style={styles.inputGroup}>
                  <TextInput
                    style={styles.input}
                    value={String(set.reps)}
                    onChangeText={(text) => handleUpdateSet(index, 'reps', text)}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={theme.colors.textDisabled}
                    selectionColor={theme.colors.primary}
                  />
                  <Text style={styles.inputLabel}>reps</Text>
                </View>
                <View style={styles.inputDivider}>
                  <Text style={styles.inputDividerText}>x</Text>
                </View>
                <View style={styles.inputGroup}>
                  <TextInput
                    style={styles.input}
                    value={set.weight === 0 ? '0' : String(set.weight)}
                    onChangeText={(text) => handleUpdateSet(index, 'weight', text)}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={theme.colors.textDisabled}
                    selectionColor={theme.colors.primary}
                  />
                  <Text style={styles.inputLabel}>kg</Text>
                </View>
              </View>
            </BaseCard>
          ))}
        </View>
      )}

      {localSets.length < 10 ? (
        <TouchableOpacity
          style={styles.addSetBtn}
          onPress={handleAddSet}
          activeOpacity={0.78}
        >
          <Plus size={20} color={theme.colors.primary} />
          <Text style={styles.addSetText}>Agregar serie</Text>
        </TouchableOpacity>
      ) : (
        <BaseCard style={styles.maxCard}>
          <Text style={styles.maxText}>Maximo 10 series por ejercicio</Text>
        </BaseCard>
      )}
    </TrainingV2Screen>
  );
}

const styles = StyleSheet.create({

  heroWrap: {
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  heroGradient: {
    width: '100%',
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.primaryMuted,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  heroTitle: {
    color: theme.colors.textPrimary,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
  },
  heroMeta: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
  },
  daySection: {
    gap: theme.spacing.sm,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dayLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
  },
  addDayBtn: {
    minHeight: 36,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addDayBtnText: {
    color: theme.colors.primary,
    fontSize: theme.typography.small.fontSize,
    fontWeight: '700',
  },
  dayChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  dayChip: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  dayChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  dayChipText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
  },
  dayChipTextActive: {
    color: theme.colors.background,
  },
  metaGrid: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  emptyCard: {
    padding: theme.spacing.xl,
  },
  emptyContent: {
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  emptyTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: '600',
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    textAlign: 'center',
  },
  setList: {
    gap: theme.spacing.sm,
  },
  setCard: {
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  setHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  setNumber: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    fontWeight: '700',
    letterSpacing: 1,
  },
  setInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  inputGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  input: {
    flex: 1,
    minHeight: 48,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceElevated,
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  inputLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: '600',
    minWidth: 28,
  },
  inputDivider: {
    paddingHorizontal: theme.spacing.xs,
  },
  inputDividerText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: '700',
  },
  addSetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    minHeight: 52,
    borderRadius: theme.radius.md,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
    backgroundColor: `${theme.colors.primary}08`,
  },
  addSetText: {
    color: theme.colors.primary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: '700',
  },
  maxCard: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  maxText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    textAlign: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  footerBtn: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.overlay,
    padding: theme.spacing.xl,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  modalTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading3.fontSize,
    lineHeight: theme.typography.heading3.lineHeight,
    fontWeight: theme.typography.heading3.fontWeight,
    textAlign: 'center',
  },
  modalDayGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    justifyContent: 'center',
  },
  modalDayChip: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minWidth: 80,
    alignItems: 'center',
  },
  modalDayChipText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    fontWeight: '700',
  },
  modalEmptyText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body.fontSize,
    textAlign: 'center',
  },
});

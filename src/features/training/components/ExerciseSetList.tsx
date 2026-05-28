import React, { useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Plus } from 'lucide-react-native';
import { TextInput } from '@/components/ui/TextInput';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { theme } from '@/theme';
import type { WorkoutSet, WorkoutExerciseTargetSet } from '../types/workout-session';
import { SwipeableSetRow } from './SwipeableSetRow';

interface ExerciseSetListProps {
  workoutSets: WorkoutSet[];
  targetSets: WorkoutExerciseTargetSet[];
  exerciseIndex: number;
  onRegisterSet: (args: {
    sessionId: string;
    exerciseIndex: number;
    setNumber: number;
    repsPerformed: number;
    weightUsed: number;
  }) => void;
  onCompleteSet: (args: {
    sessionId: string;
    exerciseIndex: number;
    setNumber: number;
  }) => Promise<void>;
  onAddSet: (args: {
    sessionId: string;
    exerciseIndex: number;
    reps: number;
    weight: number;
  }) => void;
  onRemoveSet: (args: {
    sessionId: string;
    exerciseIndex: number;
    setNumber: number;
  }) => void;
  sessionId: string;
  isPending: boolean;
  suggestedReps: number;
  suggestedWeight: number;
}

export function ExerciseSetList({
  workoutSets,
  targetSets,
  exerciseIndex,
  onRegisterSet,
  onCompleteSet,
  onAddSet,
  onRemoveSet,
  sessionId,
  isPending,
  suggestedReps,
  suggestedWeight,
}: ExerciseSetListProps) {
  const [localValues, setLocalValues] = React.useState<Record<number, { reps: string; weight: string }>>({});
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [addReps, setAddReps] = React.useState(String(suggestedReps));
  const [addWeight, setAddWeight] = React.useState(String(suggestedWeight));

  const pendingExpectedRef = useRef<Map<number, boolean>>(new Map());
  const [, forceRender] = React.useReducer((x: number) => x + 1, 0);

  const allSets = [...workoutSets].sort((a, b) => a.setNumber - b.setNumber);
  const completedCount = allSets.filter((s) => {
    const expected = pendingExpectedRef.current.get(s.setNumber);
    if (expected !== undefined) return expected;
    return s.completed;
  }).length;

  function getTarget(setNumber: number) {
    const target = targetSets.find((t) => t.setNumber === setNumber);
    if (target) return { reps: target.reps, weight: target.weight };
    const ws = workoutSets.find((s) => s.setNumber === setNumber);
    if (ws) return { reps: ws.targetReps ?? 10, weight: ws.targetWeight ?? 0 };
    return { reps: 10, weight: 0 };
  }

  React.useEffect(() => {
    const values: Record<number, { reps: string; weight: string }> = {};
    workoutSets.forEach((set) => {
      const target = getTarget(set.setNumber);
      values[set.setNumber] = {
        reps: String(set.repsPerformed !== null && set.repsPerformed !== undefined ? set.repsPerformed : (suggestedReps || target.reps || 10)),
        weight: String(set.weightUsed !== null && set.weightUsed !== undefined ? set.weightUsed : (suggestedWeight !== null && suggestedWeight !== undefined ? suggestedWeight : target.weight)),
      };
    });
    setLocalValues((prev) => {
      const merged = { ...values };
      Object.keys(prev).forEach((key) => {
        const numKey = Number(key);
        const isCompleted = workoutSets.find((s) => s.setNumber === numKey)?.completed;
        if (!isCompleted) {
          merged[numKey] = prev[numKey];
        }
      });
      return merged;
    });
  }, [workoutSets, suggestedReps, suggestedWeight]);

  function handleUpdateLocalValue(setNumber: number, field: 'reps' | 'weight', val: string) {
    setLocalValues((prev) => ({
      ...prev,
      [setNumber]: {
        ...prev[setNumber],
        [field]: val,
      },
    }));
  }

  async function handleQuickComplete(set: WorkoutSet) {
    if (pendingExpectedRef.current.has(set.setNumber)) return;
    pendingExpectedRef.current.set(set.setNumber, !set.completed);
    forceRender();
    try {
      await onCompleteSet({
        sessionId,
        exerciseIndex,
        setNumber: set.setNumber,
      });
    } catch {
      pendingExpectedRef.current.delete(set.setNumber);
      forceRender();
    }
  }

  function handleAddSet() {
    const reps = Number(addReps) || suggestedReps;
    const weight = Number(addWeight) || suggestedWeight;
    onAddSet({ sessionId, exerciseIndex, reps, weight });
    setShowAddForm(false);
    setAddReps(String(suggestedReps));
    setAddWeight(String(suggestedWeight));
  }

  return (
    <View style={styles.flatContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Series</Text>
        <Text style={styles.count}>{completedCount}/{allSets.length}</Text>
      </View>
      
      <View style={styles.setsListWrapper}>
        {allSets.map((set) => {
          const target = getTarget(set.setNumber);
          const expected = pendingExpectedRef.current.get(set.setNumber);
          let displaySet = set;
          if (expected !== undefined) {
            if (set.completed !== expected) {
              displaySet = { ...set, completed: expected };
            } else {
              pendingExpectedRef.current.delete(set.setNumber);
            }
          }

          return (
            <SwipeableSetRow
              key={set.setNumber}
              set={displaySet}
              target={target}
              localValues={localValues}
              handleUpdateLocalValue={handleUpdateLocalValue}
              handleQuickComplete={handleQuickComplete}
              onRemoveSet={onRemoveSet}
              sessionId={sessionId}
              exerciseIndex={exerciseIndex}
              isPending={isPending}
            />
          );
        })}

        {showAddForm && (
          <View style={styles.addForm}>
            <View style={styles.addInputs}>
              <TextInput
                label="Reps"
                value={addReps}
                onChangeText={setAddReps}
                keyboardType="numeric"
                inputMode="numeric"
                placeholder={String(suggestedReps)}
              />
              <TextInput
                label="Peso (kg)"
                value={addWeight}
                onChangeText={setAddWeight}
                keyboardType="numeric"
                inputMode="decimal"
                placeholder={String(suggestedWeight)}
              />
            </View>
            <View style={styles.editActions}>
              <SecondaryButton
                label="Cancelar"
                onPress={() => setShowAddForm(false)}
                style={styles.editBtn}
              />
              <SecondaryButton
                label="Agregar"
                onPress={handleAddSet}
                disabled={isPending}
                style={styles.editBtn}
              />
            </View>
          </View>
        )}

        <Pressable
          style={styles.addButton}
          onPress={() => {
            setAddReps(String(suggestedReps));
            setAddWeight(String(suggestedWeight));
            setShowAddForm(true);
          }}
        >
          <Plus size={16} color={theme.colors.primary} />
          <Text style={styles.addButtonText}>Agregar serie</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flatContainer: {
    marginHorizontal: -20,
    backgroundColor: '#000000',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  setsListWrapper: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.borderSoft,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.borderSoft,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderSoft,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: theme.typography.bodyStrong.fontWeight,
  },
  count: {
    color: theme.colors.primary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    fontWeight: '700',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.borderSoft,
  },
  setRowCompleted: {
    opacity: 0.65,
  },
  setInfoInline: {
    flexDirection: 'column',
    width: 84,
    gap: 2,
    marginLeft: theme.spacing.sm,
  },
  setTargetInline: {
    color: theme.colors.textMuted,
    fontSize: 11,
    lineHeight: 14,
  },
  inlineInputsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  completedValuesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 38,
  },
  inputsRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    alignItems: 'center',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.borderSoft,
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.xs,
    width: 72,
    height: 38,
  },
  inlineInput: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: theme.typography.small.fontSize,
    padding: 0,
    textAlign: 'center',
    fontWeight: '700',
  },
  inputSuffix: {
    color: theme.colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 2,
  },
  setLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  setInfo: {
    gap: 2,
  },
  setNumber: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: '700',
  },
  setNumberMuted: {
    color: theme.colors.textMuted,
  },
  setTarget: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
  },
  setRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  setValues: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  valueDone: {
    color: theme.colors.primary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: '700',
  },
  valueDot: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
  },
  valuePending: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    fontStyle: 'italic',
  },
  removeBtn: {
    padding: 4,
  },
  editForm: {
    paddingHorizontal: 20,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surfaceElevated,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.borderSoft,
    gap: theme.spacing.md,
  },
  editInputs: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  editActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  editBtn: {
    flex: 1,
  },
  addForm: {
    paddingHorizontal: 20,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surfaceElevated,
    gap: theme.spacing.md,
  },
  addInputs: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.borderSoft,
  },
  addButtonText: {
    color: theme.colors.primary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: '700',
  },
});

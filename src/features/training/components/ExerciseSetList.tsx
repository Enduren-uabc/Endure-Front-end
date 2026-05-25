import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Check, Circle, Plus, Trash2 } from 'lucide-react-native';
import { BaseCard } from '@/components/ui/BaseCard';
import { TextInput } from '@/components/ui/TextInput';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { theme } from '@/theme';
import type { WorkoutSet, WorkoutExerciseTargetSet } from '../types/workout-session';

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
  }) => void;
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
  const [editingSet, setEditingSet] = React.useState<number | null>(null);
  const [editReps, setEditReps] = React.useState('');
  const [editWeight, setEditWeight] = React.useState('');
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [addReps, setAddReps] = React.useState(String(suggestedReps));
  const [addWeight, setAddWeight] = React.useState(String(suggestedWeight));

  const allSets = [...workoutSets].sort((a, b) => a.setNumber - b.setNumber);
  const completedCount = allSets.filter((s) => s.completed).length;

  function getTarget(setNumber: number) {
    const target = targetSets.find((t) => t.setNumber === setNumber);
    if (target) return { reps: target.reps, weight: target.weight };
    const ws = workoutSets.find((s) => s.setNumber === setNumber);
    if (ws) return { reps: ws.targetReps ?? 10, weight: ws.targetWeight ?? 0 };
    return { reps: 10, weight: 0 };
  }

  function handleTapSet(set: WorkoutSet) {
    if (set.completed) return;
    setEditingSet(set.setNumber);
    setEditReps(String(set.repsPerformed ?? suggestedReps));
    setEditWeight(String(set.weightUsed ?? suggestedWeight));
  }

  function handleSaveEdit() {
    if (editingSet === null) return;
    const reps = Number(editReps);
    const weight = Number(editWeight);
    if (reps <= 0 || weight < 0) return;
    onRegisterSet({
      sessionId,
      exerciseIndex,
      setNumber: editingSet,
      repsPerformed: reps,
      weightUsed: weight,
    });
    setEditingSet(null);
  }

  function handleQuickComplete(set: WorkoutSet) {
    if (set.completed) return;
    const reps = set.repsPerformed ?? suggestedReps;
    const weight = set.weightUsed ?? suggestedWeight;
    onRegisterSet({
      sessionId,
      exerciseIndex,
      setNumber: set.setNumber,
      repsPerformed: reps,
      weightUsed: weight,
    });
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
    <BaseCard style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Series</Text>
        <Text style={styles.count}>{completedCount}/{allSets.length}</Text>
      </View>

      {allSets.map((set) => {
        const target = getTarget(set.setNumber);
        const isEditing = editingSet === set.setNumber;

        return (
          <View key={set.setNumber}>
            <Pressable
              style={[styles.setRow, set.completed && styles.setRowCompleted]}
              onPress={() => handleTapSet(set)}
              disabled={isPending}
            >
              <View style={styles.setLeft}>
                <View
                  style={[
                    styles.checkbox,
                    set.completed && styles.checkboxDone,
                  ]}
                >
                  {set.completed ? (
                    <Check size={14} color={theme.colors.background} />
                  ) : null}
                </View>
                <View style={styles.setInfo}>
                  <Text style={[styles.setNumber, set.completed && styles.setNumberMuted]}>
                    Serie {set.setNumber}
                  </Text>
                  <Text style={styles.setTarget}>
                    Objetivo: {target.reps} reps × {target.weight} kg
                  </Text>
                </View>
              </View>

              <View style={styles.setRight}>
                <View style={styles.setValues}>
                  {set.completed ? (
                    <>
                      <Text style={styles.valueDone}>
                        {set.repsPerformed ?? target.reps} reps
                      </Text>
                      <Text style={styles.valueDot}>·</Text>
                      <Text style={styles.valueDone}>
                        {set.weightUsed ?? target.weight} kg
                      </Text>
                    </>
                  ) : (
                    <Text style={styles.valuePending}>Pendiente</Text>
                  )}
                </View>

                {!set.completed && (
                  <Pressable
                    style={styles.removeBtn}
                    onPress={() =>
                      onRemoveSet({
                        sessionId,
                        exerciseIndex,
                        setNumber: set.setNumber,
                      })
                    }
                    hitSlop={8}
                  >
                    <Trash2 size={14} color={theme.colors.error} />
                  </Pressable>
                )}
              </View>
            </Pressable>

            {isEditing && (
              <View style={styles.editForm}>
                <View style={styles.editInputs}>
                  <TextInput
                    label="Reps"
                    value={editReps}
                    onChangeText={setEditReps}
                    keyboardType="numeric"
                    inputMode="numeric"
                    placeholder={String(suggestedReps || target.reps)}
                  />
                  <TextInput
                    label="Peso (kg)"
                    value={editWeight}
                    onChangeText={setEditWeight}
                    keyboardType="numeric"
                    inputMode="decimal"
                    placeholder={String(suggestedWeight || target.weight)}
                  />
                </View>
                <View style={styles.editActions}>
                  <SecondaryButton
                    label="Cancelar"
                    onPress={() => setEditingSet(null)}
                    style={styles.editBtn}
                  />
                  <SecondaryButton
                    label="Guardar"
                    onPress={handleSaveEdit}
                    disabled={
                      Number(editReps) <= 0 ||
                      Number(editWeight) < 0 ||
                      isPending
                    }
                    style={styles.editBtn}
                  />
                </View>
              </View>
            )}
          </View>
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
    </BaseCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
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
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.borderSoft,
  },
  setRowCompleted: {
    opacity: 0.65,
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
    paddingHorizontal: theme.spacing.md,
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
    paddingHorizontal: theme.spacing.md,
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

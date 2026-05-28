import React from 'react';
import { Animated, Pressable, StyleSheet, Text, TextInput as RNTextInput, TouchableOpacity, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { Check, Plus, Trash2 } from 'lucide-react-native';
import { BaseCard } from '@/components/ui/BaseCard';
import { TextInput } from '@/components/ui/TextInput';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { theme } from '@/theme';
import type { WorkoutSet, WorkoutExerciseTargetSet } from '../types/workout-session';

interface SwipeableSetRowProps {
  set: WorkoutSet;
  target: { reps: number; weight: number };
  localValues: Record<number, { reps: string; weight: string }>;
  handleUpdateLocalValue: (setNumber: number, field: 'reps' | 'weight', val: string) => void;
  handleQuickComplete: (set: WorkoutSet) => void;
  onRemoveSet: (args: { sessionId: string; exerciseIndex: number; setNumber: number }) => void;
  sessionId: string;
  exerciseIndex: number;
  isPending: boolean;
}

function SwipeableSetRow({
  set,
  target,
  localValues,
  handleUpdateLocalValue,
  handleQuickComplete,
  onRemoveSet,
  sessionId,
  exerciseIndex,
  isPending,
}: SwipeableSetRowProps) {
  const swipeableRef = React.useRef<Swipeable>(null);

  const renderRightActions = (
    _progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-62, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    return (
      <TouchableOpacity
        style={styles.deleteButton}
        activeOpacity={0.8}
        onPress={() => {
          swipeableRef.current?.close();
          onRemoveSet({
            sessionId,
            exerciseIndex,
            setNumber: set.setNumber,
          });
        }}
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <Trash2 size={16} color={theme.colors.background} />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const rowContent = (
    <View style={[styles.setRow, set.completed && styles.setRowCompleted]}>
      <Pressable
        style={[
          styles.checkbox,
          set.completed && styles.checkboxDone,
        ]}
        onPress={() => handleQuickComplete(set)}
        disabled={isPending || set.completed}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel={`Completar serie ${set.setNumber}`}
      >
        {set.completed ? (
          <Check size={14} color={theme.colors.background} />
        ) : null}
      </Pressable>

      <View style={styles.setInfoInline}>
        <Text style={[styles.setNumber, set.completed && styles.setNumberMuted]}>
          Serie {set.setNumber}
        </Text>
        <Text style={styles.setTargetInline}>
          Obj: {target.reps}×{target.weight}kg
        </Text>
      </View>

      <View style={styles.inlineInputsContainer}>
        {set.completed ? (
          <View style={styles.completedValuesContainer}>
            <Text style={styles.valueDone}>
              {set.repsPerformed ?? target.reps} reps
            </Text>
            <Text style={styles.valueDot}>·</Text>
            <Text style={styles.valueDone}>
              {set.weightUsed ?? target.weight} kg
            </Text>
          </View>
        ) : (
          <View style={styles.inputsRow}>
            <View style={styles.inputWrapper}>
              <RNTextInput
                style={styles.inlineInput}
                value={localValues[set.setNumber]?.weight ?? ''}
                onChangeText={(val) => handleUpdateLocalValue(set.setNumber, 'weight', val)}
                keyboardType="numeric"
                inputMode="decimal"
                placeholder={String(target.weight)}
                placeholderTextColor={theme.colors.textMuted}
                editable={!isPending}
              />
              <Text style={styles.inputSuffix}>kg</Text>
            </View>

            <View style={styles.inputWrapper}>
              <RNTextInput
                style={styles.inlineInput}
                value={localValues[set.setNumber]?.reps ?? ''}
                onChangeText={(val) => handleUpdateLocalValue(set.setNumber, 'reps', val)}
                keyboardType="numeric"
                inputMode="numeric"
                placeholder={String(target.reps)}
                placeholderTextColor={theme.colors.textMuted}
                editable={!isPending}
              />
              <Text style={styles.inputSuffix}>reps</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );

  if (set.completed) {
    return rowContent;
  }

  return (
    <Swipeable
      ref={swipeableRef}
      friction={2}
      rightThreshold={30}
      renderRightActions={renderRightActions}
      containerStyle={styles.swipeContainer}
    >
      {rowContent}
    </Swipeable>
  );
}

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
  const [localValues, setLocalValues] = React.useState<Record<number, { reps: string; weight: string }>>({});
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

  function handleQuickComplete(set: WorkoutSet) {
    if (set.completed) return;
    const target = getTarget(set.setNumber);
    const local = localValues[set.setNumber];
    
    const repsVal = local && local.reps !== '' 
      ? Number(local.reps) 
      : (set.repsPerformed !== null && set.repsPerformed !== undefined ? set.repsPerformed : (suggestedReps || target.reps || 10));
      
    const weightVal = local && local.weight !== '' 
      ? Number(local.weight) 
      : (set.weightUsed !== null && set.weightUsed !== undefined ? set.weightUsed : (suggestedWeight !== null && suggestedWeight !== undefined ? suggestedWeight : target.weight));

    onRegisterSet({
      sessionId,
      exerciseIndex,
      setNumber: set.setNumber,
      repsPerformed: repsVal,
      weightUsed: weightVal,
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

        return (
          <SwipeableSetRow
            key={set.setNumber}
            set={set}
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
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.borderSoft,
  },
  setRowCompleted: {
    opacity: 0.65,
  },
  swipeContainer: {
    backgroundColor: '#0E0E10',
    overflow: 'hidden',
  },
  deleteButton: {
    backgroundColor: theme.colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    width: 62,
    height: '100%',
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

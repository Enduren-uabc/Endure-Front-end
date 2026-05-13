import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Trash2, ChevronUp, ChevronDown, Plus } from 'lucide-react-native';
import { TextInput } from '@/components/ui/TextInput';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { theme } from '@/theme';
import type { ExerciseSet } from '@/features/training/types/routine';

interface ExerciseSetsTableProps {
  sets: ExerciseSet[];
  onChange: (sets: ExerciseSet[]) => void;
  readOnly?: boolean;
}

export function ExerciseSetsTable({ sets, onChange, readOnly }: ExerciseSetsTableProps) {
  const handleRepsChange = (index: number, value: string) => {
    const reps = value === '' ? 0 : parseInt(value, 10);
    const next = sets.map((s, i) =>
      i === index ? { ...s, reps: Number.isNaN(reps) ? 0 : reps } : s,
    );
    onChange(next);
  };

  const handleWeightChange = (index: number, value: string) => {
    const weight = value === '' ? 0 : parseFloat(value);
    const next = sets.map((s, i) =>
      i === index ? { ...s, weight: Number.isNaN(weight) ? 0 : weight } : s,
    );
    onChange(next);
  };

  const handleAddSet = () => {
    if (sets.length >= 10) return;
    const nextSetNumber = sets.length > 0 ? sets[sets.length - 1].setNumber + 1 : 1;
    onChange([...sets, { setNumber: nextSetNumber, reps: 10, weight: 0 }]);
  };

  const handleRemoveSet = (index: number) => {
    if (sets.length <= 1) return;
    const next = sets.filter((_, i) => i !== index).map((s, i) => ({
      ...s,
      setNumber: i + 1,
    }));
    onChange(next);
  };

  const handleReorder = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sets.length) return;
    const next = [...sets];
    [next[index], next[newIndex]] = [next[newIndex], next[index]];
    onChange(
      next.map((s, i) => ({
        ...s,
        setNumber: i + 1,
      })),
    );
  };

  const isRepsInvalid = (reps: number) => reps < 1;
  const isWeightInvalid = (weight: number) => weight < 0;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerCellSet}>Set</Text>
        <Text style={styles.headerCell}>Reps</Text>
        <Text style={styles.headerCell}>Peso (kg)</Text>
        {!readOnly && <View style={styles.headerCellActions} />}
      </View>

      {sets.map((set, index) => (
        <View
          key={set.setNumber}
          style={[
            styles.row,
            (isRepsInvalid(set.reps) || isWeightInvalid(set.weight)) && styles.rowError,
          ]}
        >
          <Text style={styles.cellSet}>{set.setNumber}</Text>

          <View style={styles.cellInput}>
            <TextInput
              label=""
              value={set.reps === 0 ? '' : String(set.reps)}
              onChangeText={(text) => handleRepsChange(index, text)}
              keyboardType="numeric"
              error={isRepsInvalid(set.reps) ? 'Reps >= 1' : undefined}
            />
          </View>

          <View style={styles.cellInput}>
            <TextInput
              label=""
              value={set.weight === 0 ? '' : String(set.weight)}
              onChangeText={(text) => handleWeightChange(index, text)}
              keyboardType="numeric"
              error={isWeightInvalid(set.weight) ? 'Peso >= 0' : undefined}
            />
          </View>

          {!readOnly && (
            <View style={styles.actions}>
              <View style={styles.reorderButtons}>
                <ReorderButton
                  icon={<ChevronUp size={16} color={theme.colors.textSecondary} />}
                  onPress={() => handleReorder(index, 'up')}
                  disabled={index === 0}
                />
                <ReorderButton
                  icon={<ChevronDown size={16} color={theme.colors.textSecondary} />}
                  onPress={() => handleReorder(index, 'down')}
                  disabled={index === sets.length - 1}
                />
              </View>
              <ActionButton
                icon={<Trash2 size={16} color={theme.colors.error} />}
                onPress={() => handleRemoveSet(index)}
                disabled={sets.length <= 1}
              />
            </View>
          )}
        </View>
      ))}

      {!readOnly && (
        <View style={styles.addButtonWrapper}>
          <PrimaryButton
            label="Agregar set"
            onPress={handleAddSet}
            disabled={sets.length >= 10}
          />
        </View>
      )}
    </View>
  );
}

function ReorderButton({
  icon,
  onPress,
  disabled,
}: {
  icon: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <View style={styles.iconBtn}>
      {/* We render the icon directly since TouchableOpacity is not needed for presentational only;
         but we still need pressability. Using a simple wrapper. */}
      <View
        style={[styles.iconBtnInner, disabled && styles.iconBtnDisabled]}
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        onTouchEnd={disabled ? undefined : onPress}
      >
        {icon}
      </View>
    </View>
  );
}

function ActionButton({
  icon,
  onPress,
  disabled,
}: {
  icon: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <View style={styles.iconBtn}>
      <View
        style={[styles.iconBtnInner, disabled && styles.iconBtnDisabled]}
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        onTouchEnd={disabled ? undefined : onPress}
      >
        {icon}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xs,
  },
  headerCellSet: {
    width: 40,
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    fontWeight: '600',
  },
  headerCell: {
    flex: 1,
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    fontWeight: '600',
  },
  headerCellActions: {
    width: 100,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  rowError: {
    borderColor: theme.colors.error,
  },
  cellSet: {
    width: 40,
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    fontWeight: '700',
  },
  cellInput: {
    flex: 1,
  },
  actions: {
    width: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  reorderButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    padding: theme.spacing.xs,
    minWidth: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnInner: {
    padding: theme.spacing.xs,
  },
  iconBtnDisabled: {
    opacity: 0.3,
  },
  addButtonWrapper: {
    marginTop: theme.spacing.sm,
  },
});

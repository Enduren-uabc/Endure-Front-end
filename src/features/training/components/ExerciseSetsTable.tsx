import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TextInput } from '@/components/ui/TextInput';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { theme } from '@/theme';
import type { ExerciseSet } from '../types/routine';
import { exerciseSetSchema } from '../validations/routine';

export interface ExerciseSetsTableProps {
  sets: ExerciseSet[];
  onChange: (sets: ExerciseSet[]) => void;
  onAddSet?: () => void;
  addSetLabel?: string;
  maxSets?: number;
  readOnly?: boolean;
}

export function ExerciseSetsTable({
  sets,
  onChange,
  onAddSet,
  addSetLabel = 'Agregar set',
  maxSets = 10,
  readOnly = false,
}: ExerciseSetsTableProps) {
  const handleRepsChange = (index: number, text: string) => {
    const parsed = text === '' ? 0 : parseInt(text, 10);
    const updated = sets.map((s, i) =>
      i === index ? { ...s, reps: Number.isNaN(parsed) ? 0 : parsed } : s
    );
    onChange(updated);
  };

  const handleWeightChange = (index: number, text: string) => {
    const parsed = text === '' ? 0 : parseFloat(text);
    const updated = sets.map((s, i) =>
      i === index ? { ...s, weight: Number.isNaN(parsed) ? 0 : parsed } : s
    );
    onChange(updated);
  };

  const handleAddSet = () => {
    if (sets.length >= maxSets) return;
    if (onAddSet) {
      onAddSet();
      return;
    }

    const newSet: ExerciseSet = {
      setNumber: sets.length + 1,
      reps: sets.length === 0 ? 15 : 0,
      weight: 0,
    };
    onChange([...sets, newSet]);
  };

  const handleRemoveSet = (index: number) => {
    if (sets.length <= 1) return;
    const updated = sets
      .filter((_, i) => i !== index)
      .map((s, i) => ({ ...s, setNumber: i + 1 }));
    onChange(updated);
  };

  const getRepsError = (reps: number) => {
    const result = exerciseSetSchema.shape.reps.safeParse(reps);
    if (!result.success) {
      const issue = result.error.issues[0];
      if (issue.code === "too_small") return "Mín. 1 rep";
      if (issue.code === "too_big") return "Máx. 50 reps";
      return "Inválido";
    }
    return undefined;
  };

  const getWeightError = (weight: number) => {
    const result = exerciseSetSchema.shape.weight.safeParse(weight);
    if (!result.success) {
      return "Inválido";
    }
    return undefined;
  };

  return (
    <View style={styles.container}>
      {sets.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Sin sets configurados</Text>
        </View>
      )}
      {sets.map((set, index) => (
        <View key={index} style={styles.row}>
          <Text style={styles.setLabel}>Set {set.setNumber}</Text>
          <View style={styles.inputsRow}>
            <View style={styles.inputWrapper}>
              <TextInput
                label="Reps"
                value={String(set.reps)}
                onChangeText={(text) => handleRepsChange(index, text)}
                keyboardType="numeric"
                error={getRepsError(set.reps)}
              />
            </View>
            <View style={styles.inputWrapper}>
              <TextInput
                label="Peso (kg)"
                value={String(set.weight)}
                onChangeText={(text) => handleWeightChange(index, text)}
                keyboardType="numeric"
                error={getWeightError(set.weight)}
              />
            </View>
            {!readOnly && sets.length > 1 && (
              <TouchableOpacity
                onPress={() => handleRemoveSet(index)}
                style={styles.removeButton}
                activeOpacity={0.7}
              >
                <Text style={styles.removeText}>Eliminar</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ))}
      {!readOnly && (
        <PrimaryButton
          label={addSetLabel}
          onPress={handleAddSet}
          disabled={sets.length >= maxSets}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: theme.spacing.md,
  },
  row: {
    width: '100%',
    gap: theme.spacing.sm,
  },
  emptyState: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  setLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    fontWeight: '600',
  },
  inputsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
  },
  inputWrapper: {
    flex: 1,
  },
  removeButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: theme.spacing.lg,
  },
  removeText: {
    color: theme.colors.error,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
  },
});

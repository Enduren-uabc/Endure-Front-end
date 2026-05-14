import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TextInput } from '@/components/ui/TextInput';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { theme } from '@/theme';
import type { ExerciseSet } from '@/features/training/types/routine';

export interface ExerciseSetsTableProps {
  sets: ExerciseSet[];
  onChange: (sets: ExerciseSet[]) => void;
  readOnly?: boolean;
}

export function ExerciseSetsTable({
  sets,
  onChange,
  readOnly = false,
}: ExerciseSetsTableProps) {
  const handleRepsChange = (index: number, text: string) => {
    const parsed = text === '' ? 0 : parseInt(text, 10);
    const updated = sets.map((set, i) =>
      i === index ? { ...set, reps: Number.isNaN(parsed) ? 0 : parsed } : set
    );
    onChange(updated);
  };

  const handleWeightChange = (index: number, text: string) => {
    const parsed = text === '' ? 0 : parseFloat(text);
    const updated = sets.map((set, i) =>
      i === index ? { ...set, weight: Number.isNaN(parsed) ? 0 : parsed } : set
    );
    onChange(updated);
  };

  const handleAddSet = () => {
    if (sets.length >= 10) return;
    const newSet: ExerciseSet = {
      setNumber: sets.length + 1,
      reps: 0,
      weight: 0,
    };
    const updated = [...sets, newSet].map((set, i) => ({ ...set, setNumber: i + 1 }));
    onChange(updated);
  };

  const handleRemoveSet = (index: number) => {
    if (sets.length <= 1) return;
    const updated = sets
      .filter((_, i) => i !== index)
      .map((set, i) => ({ ...set, setNumber: i + 1 }));
    onChange(updated);
  };

  const isRepsInvalid = (reps: number) => reps < 1;
  const isWeightInvalid = (weight: number) => weight < 0;

  return (
    <View style={styles.container}>
      {sets.map((set, index) => {
        const repsError = isRepsInvalid(set.reps) ? 'Valor inválido' : undefined;
        const weightError = isWeightInvalid(set.weight) ? 'Valor inválido' : undefined;

        return (
          <View key={`${set.setNumber}-${index}`} style={styles.row}>
            <Text style={styles.setLabel}>Set {set.setNumber}</Text>
            <View style={styles.inputsRow}>
              {readOnly ? (
                <>
                  <View style={styles.readOnlyValue}>
                    <Text style={styles.readOnlyLabel}>Reps</Text>
                    <Text style={styles.readOnlyText}>{set.reps}</Text>
                  </View>
                  <View style={styles.readOnlyValue}>
                    <Text style={styles.readOnlyLabel}>Peso (kg)</Text>
                    <Text style={styles.readOnlyText}>{set.weight}</Text>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      label="Reps"
                      value={String(set.reps)}
                      onChangeText={(text) => handleRepsChange(index, text)}
                      keyboardType="numeric"
                      error={repsError}
                    />
                  </View>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      label="Peso (kg)"
                      value={String(set.weight)}
                      onChangeText={(text) => handleWeightChange(index, text)}
                      keyboardType="numeric"
                      error={weightError}
                    />
                  </View>
                </>
              )}
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
        );
      })}

      {!readOnly && (
        <PrimaryButton
          label="+ Agregar set"
          onPress={handleAddSet}
          disabled={sets.length >= 10}
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
  readOnlyValue: {
    flex: 1,
    backgroundColor: theme.colors.surfaceElevated,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    minHeight: 48,
    justifyContent: 'center',
    opacity: 0.7,
  },
  readOnlyLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    fontWeight: theme.typography.small.fontWeight,
    marginBottom: theme.spacing.xs,
  },
  readOnlyText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
  },
});

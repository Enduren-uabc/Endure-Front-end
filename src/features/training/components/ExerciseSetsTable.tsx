import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TextInput } from '@/components/ui/TextInput';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { theme } from '@/theme';
import { ExerciseSet } from '@/features/training/types/routine';

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
    const updated = [...sets];
    const parsed = parseInt(text, 10);
    updated[index] = {
      ...updated[index],
      reps: isNaN(parsed) ? 0 : parsed,
    };
    onChange(updated);
  };

  const handleWeightChange = (index: number, text: string) => {
    const updated = [...sets];
    const parsed = parseFloat(text);
    updated[index] = {
      ...updated[index],
      weight: isNaN(parsed) ? 0 : parsed,
    };
    onChange(updated);
  };

  const handleAddSet = () => {
    if (sets.length >= 10) return;
    const newSet: ExerciseSet = {
      setNumber: sets.length + 1,
      reps: 0,
      weight: 0,
    };
    const updated = [...sets, newSet];
    // Re-number sets sequentially
    const renumbered = updated.map((s, i) => ({ ...s, setNumber: i + 1 }));
    onChange(renumbered);
  };

  const handleRemoveSet = (index: number) => {
    if (sets.length <= 1) return;
    const updated = sets.filter((_, i) => i !== index);
    const renumbered = updated.map((s, i) => ({ ...s, setNumber: i + 1 }));
    onChange(renumbered);
  };

  return (
    <View style={styles.container}>
      {sets.map((set, index) => {
        const repsError = set.reps < 1 ? 'Valor inválido' : undefined;
        const weightError = set.weight < 0 ? 'Valor inválido' : undefined;

        return (
          <View key={set.setNumber} style={styles.row}>
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
            </View>
            {!readOnly && sets.length > 1 && (
              <TouchableOpacity
                onPress={() => handleRemoveSet(index)}
                style={styles.removeButton}
                activeOpacity={0.8}
              >
                <Text style={styles.removeButtonText}>Eliminar</Text>
              </TouchableOpacity>
            )}
          </View>
        );
      })}

      {!readOnly && (
        <View style={styles.addButtonWrapper}>
          <PrimaryButton
            label="+ Agregar set"
            onPress={handleAddSet}
            disabled={sets.length >= 10}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  row: {
    marginBottom: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderSoft,
  },
  setLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    fontWeight: theme.typography.small.fontWeight,
    marginBottom: theme.spacing.sm,
  },
  inputsRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  inputWrapper: {
    flex: 1,
  },
  removeButton: {
    alignSelf: 'flex-start',
    paddingVertical: theme.spacing.xs,
  },
  removeButtonText: {
    color: theme.colors.error,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
  },
  addButtonWrapper: {
    marginTop: theme.spacing.md,
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

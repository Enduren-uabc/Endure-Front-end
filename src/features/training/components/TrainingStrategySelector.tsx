import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Chip } from '@/components/ui/Chip';
import { theme } from '@/theme';
import type { TrainingStrategy } from '../types/training-strategy';

interface TrainingStrategySelectorProps {
  strategies: TrainingStrategy[];
  selectedKey: string | null | undefined;
  onSelect: (key: string | null) => void;
  disabled?: boolean;
}

export function TrainingStrategySelector({
  strategies,
  selectedKey,
  onSelect,
  disabled,
}: TrainingStrategySelectorProps) {
  const selectedStrategy = strategies.find((s) => s.key === selectedKey);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Tipo de entrenamiento</Text>
      <View style={styles.chipsRow}>
        {strategies.map((strategy) => (
          <Chip
            key={strategy.key}
            label={strategy.name}
            selected={selectedKey === strategy.key}
            onPress={() =>
              onSelect(selectedKey === strategy.key ? null : strategy.key)
            }
            disabled={disabled}
          />
        ))}
      </View>
      {selectedStrategy && (
        <Text style={styles.description}>{selectedStrategy.description}</Text>
      )}
      {!selectedStrategy && (
        <Text style={styles.hint}>
          Selecciona una estrategia para auto-poblar sets al agregar ejercicios
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.sm,
  },
  label: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  description: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    marginTop: theme.spacing.xs,
  },
  hint: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    marginTop: theme.spacing.xs,
  },
});

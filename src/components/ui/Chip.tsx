import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { theme } from '@/theme';

interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
}

export function Chip({ label, selected, onPress, disabled }: ChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[styles.chip, selected && styles.selected, disabled && styles.disabled]}
    >
      <Text style={[styles.text, selected && styles.textSelected, disabled && styles.textDisabled]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: theme.colors.backgroundAlt,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selected: {
    backgroundColor: theme.colors.primaryMuted,
    borderColor: theme.colors.primary,
  },
  disabled: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.borderSoft,
  },
  text: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    fontWeight: theme.typography.small.fontWeight,
  },
  textSelected: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  textDisabled: {
    color: theme.colors.textDisabled,
  },
});

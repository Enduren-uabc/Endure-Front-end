import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { theme } from '@/theme';

interface SecondaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}

export function SecondaryButton({ label, onPress, disabled }: SecondaryButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[styles.button, disabled && styles.disabled]}
      activeOpacity={0.8}
    >
      <Text style={[styles.text, disabled && styles.textDisabled]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'transparent',
    minHeight: 48,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    width: '100%',
  },
  disabled: {
    borderColor: theme.colors.borderSoft,
  },
  text: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.button.fontSize,
    lineHeight: theme.typography.button.lineHeight,
    fontWeight: theme.typography.button.fontWeight,
  },
  textDisabled: {
    color: theme.colors.textDisabled,
  },
});

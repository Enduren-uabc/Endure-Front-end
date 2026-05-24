import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TextInput } from '@/components/ui/TextInput';
import { theme } from '@/theme';

const DEFAULT_MAX_LENGTH = 50;

interface NameInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  maxLength?: number;
  disabled?: boolean;
}

export function NameInput({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  maxLength = DEFAULT_MAX_LENGTH,
  disabled = false,
}: NameInputProps) {
  return (
    <View style={styles.container}>
      <TextInput
        label={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        autoCapitalize="words"
        allowEmoji={false}
        maxLength={maxLength}
        error={error}
        disabled={disabled}
      />
      <Text style={styles.counter}>
        {value.length}/{maxLength}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  counter: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    textAlign: 'right',
    marginTop: theme.spacing.xs,
  },
});

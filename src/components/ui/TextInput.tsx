import React from 'react';
import {
  View,
  TextInput as RNTextInput,
  Text,
  StyleSheet,
  type TextInputProps as RNTextInputProps,
} from 'react-native';
import { theme } from '@/theme';

interface TextInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  error?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  maxLength?: number;
  disabled?: boolean;
  textContentType?: RNTextInputProps['textContentType'];
  autoComplete?: RNTextInputProps['autoComplete'];
  rightElement?: React.ReactNode;
}

export function TextInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  error,
  autoCapitalize = 'none',
  keyboardType = 'default',
  maxLength,
  disabled = false,
  textContentType,
  autoComplete,
  rightElement,
}: TextInputProps) {
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputWrapper,
          isFocused ? styles.inputFocused : null,
          error ? styles.inputError : null,
          disabled ? styles.inputDisabled : null,
        ]}
      >
        <RNTextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textMuted}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          maxLength={maxLength}
          editable={!disabled}
          textContentType={textContentType}
          autoComplete={autoComplete}
          selectionColor={theme.colors.primary}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[styles.input, disabled ? styles.inputTextDisabled : null]}
        />
        {rightElement ? <View style={styles.rightElement}>{rightElement}</View> : null}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    fontWeight: theme.typography.small.fontWeight,
    marginBottom: theme.spacing.xs,
  },
  inputWrapper: {
    backgroundColor: theme.colors.surfaceElevated,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
  },
  input: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  inputFocused: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surface,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  inputDisabled: {
    opacity: 0.72,
  },
  inputTextDisabled: {
    color: theme.colors.textDisabled,
  },
  rightElement: {
    paddingRight: theme.spacing.md,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    marginTop: theme.spacing.xs,
  },
});

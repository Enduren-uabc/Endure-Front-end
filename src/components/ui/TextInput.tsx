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
  disabled?: boolean;
  rightElement?: React.ReactNode;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  textContentType?: RNTextInputProps['textContentType'];
  autoComplete?: RNTextInputProps['autoComplete'];
}

export function TextInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  error,
  disabled,
  rightElement,
  autoCapitalize = 'none',
  keyboardType = 'default',
  textContentType,
  autoComplete,
}: TextInputProps) {
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <View style={styles.container}>
      <Text style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text>
      <View
        style={[
          styles.inputShell,
          isFocused && styles.inputFocused,
          error ? styles.inputError : null,
          disabled && styles.inputDisabled,
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
          editable={!disabled}
          textContentType={textContentType}
          autoComplete={autoComplete}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[styles.input, rightElement ? styles.inputWithAction : null]}
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
  labelDisabled: {
    color: theme.colors.textDisabled,
  },
  inputShell: {
    backgroundColor: theme.colors.surfaceElevated,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
  },
  inputFocused: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surfacePressed,
  },
  input: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    minHeight: 46,
  },
  inputWithAction: {
    paddingRight: theme.spacing.sm,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  inputDisabled: {
    backgroundColor: theme.colors.borderSoft,
    borderColor: theme.colors.borderSoft,
    opacity: 0.75,
  },
  rightElement: {
    paddingRight: theme.spacing.sm,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    marginTop: theme.spacing.xs,
  },
});

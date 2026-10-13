import React from 'react';
import {
  View,
  TextInput as RNTextInput,
  Text,
  StyleSheet,
  Platform,
  type TextInputProps as RNTextInputProps,
  type StyleProp,
  type TextStyle,
} from 'react-native';
import { theme } from '@/theme';

const EMOJI_REGEX = /[\p{Emoji}\u200D\uFE0F]/gu;

function stripEmojis(text: string): string {
  return text.replace(EMOJI_REGEX, (char) => {
    if (/^[\x00-\x7F]$/.test(char)) return char;
    return '';
  });
}

interface TextInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  error?: string;
  helperText?: string;
  describedBy?: string;
  accessibilityHint?: string;
  errorTextStyle?: StyleProp<TextStyle>;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCorrect?: boolean;
  spellCheck?: boolean;
  inputMode?: RNTextInputProps['inputMode'];
  allowEmoji?: boolean;
  maxLength?: number;
  disabled?: boolean;
  textContentType?: RNTextInputProps['textContentType'];
  autoComplete?: RNTextInputProps['autoComplete'];
  rightElement?: React.ReactNode;
}

export const TextInput = React.forwardRef<RNTextInput, TextInputProps>(function TextInput({
  label,
  value,
  onChangeText,
  onBlur,
  placeholder,
  secureTextEntry,
  error,
  helperText,
  describedBy,
  accessibilityHint,
  errorTextStyle,
  autoCapitalize = 'none',
  keyboardType = 'default',
  autoCorrect,
  spellCheck,
  inputMode,
  allowEmoji = true,
  maxLength,
  disabled = false,
  textContentType,
  autoComplete,
  rightElement,
}: TextInputProps, ref) {
  const [isFocused, setIsFocused] = React.useState(false);
  const feedbackId = React.useId().replace(/[:]/g, '');
  const errorId = `${feedbackId}-error`;
  const helperId = `${feedbackId}-help`;

  // react-native-web acepta atributos ARIA que los tipos de React Native no
  // declaran; solo se envían en web para no alterar iOS ni Android.
  const webAriaProps =
    Platform.OS === 'web'
      ? ({
          'aria-describedby': [helperText ? helperId : undefined, describedBy, error ? errorId : undefined]
            .filter(Boolean).join(' ') || undefined,
          'aria-invalid': error ? true : undefined,
        } as unknown as RNTextInputProps)
      : undefined;

  const handleChangeText = React.useCallback(
    (text: string) => {
      onChangeText(allowEmoji ? text : stripEmojis(text));
    },
    [onChangeText, allowEmoji],
  );

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputWrapper,
          error ? styles.inputError : null,
          isFocused ? styles.inputFocused : null,
          disabled ? styles.inputDisabled : null,
        ]}
      >
        <RNTextInput
          {...webAriaProps}
          ref={ref}
          value={value}
          onChangeText={handleChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textSecondary}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          autoCorrect={autoCorrect}
          spellCheck={spellCheck}
          inputMode={inputMode}
          maxLength={maxLength}
          editable={!disabled}
          textContentType={textContentType}
          autoComplete={autoComplete}
          selectionColor={theme.colors.primary}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            onBlur?.();
          }}
          accessibilityLabel={label}
          accessibilityHint={[helperText, accessibilityHint, error].filter(Boolean).join('. ') || undefined}
          style={[
            styles.input,
            Platform.OS === 'web' ? styles.inputWeb : null,
            disabled ? styles.inputTextDisabled : null,
          ]}
        />
        {rightElement ? <View style={styles.rightElement}>{rightElement}</View> : null}
      </View>
      {helperText ? (
        <Text nativeID={helperId} style={styles.helperText}>
          {helperText}
        </Text>
      ) : null}
      {error ? (
        <Text
          nativeID={errorId}
          style={[styles.errorText, errorTextStyle]}
          accessibilityLiveRegion="polite"
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
});

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
    borderRadius: theme.radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  input: {
    flex: 1,
    minWidth: 0,
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  inputWeb: {
    // En web el navegador dibuja su propio anillo de foco (outline) sobre el
    // input, con color según su tema (claro en oscuro, azul en claro). Se
    // anula aquí; el indicador de foco visible lo aporta inputFocused en el
    // contenedor redondeado.
    outlineStyle: 'solid',
    outlineWidth: 0,
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
  helperText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    marginTop: theme.spacing.sm,
  },
});

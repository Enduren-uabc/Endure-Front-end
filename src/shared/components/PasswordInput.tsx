import React from 'react';
import { TouchableOpacity, StyleSheet, type TextInput as RNTextInput, type StyleProp, type TextStyle } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { TextInput } from '@/components/ui/TextInput';
import { theme } from '@/theme';

interface PasswordInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  error?: string;
  describedBy?: string;
  accessibilityHint?: string;
  errorTextStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
  textContentType?: 'password' | 'newPassword';
  autoComplete?: 'password' | 'new-password' | 'current-password';
}

export const PasswordInput = React.forwardRef<RNTextInput, PasswordInputProps>(function PasswordInput({
  label,
  value,
  onChangeText,
  onBlur,
  placeholder,
  error,
  describedBy,
  accessibilityHint,
  errorTextStyle,
  disabled,
  textContentType = 'password',
  autoComplete = 'password',
}: PasswordInputProps, ref) {
  const [isVisible, setIsVisible] = React.useState(false);
  const Icon = isVisible ? EyeOff : Eye;
  const passwordLabel = label === 'Confirmar contraseña' ? 'confirmación de contraseña' : label.toLowerCase();

  return (
    <TextInput
      ref={ref}
      label={label}
      value={value}
      onChangeText={onChangeText}
      onBlur={onBlur}
      placeholder={placeholder}
      secureTextEntry={!isVisible}
      error={error}
      describedBy={describedBy}
      accessibilityHint={accessibilityHint}
      errorTextStyle={errorTextStyle}
      disabled={disabled}
      textContentType={textContentType}
      autoComplete={autoComplete}
      rightElement={
        <TouchableOpacity
          onPress={() => setIsVisible((visible) => !visible)}
          disabled={disabled}
          style={styles.toggle}
          accessibilityRole="button"
          accessibilityLabel={`${isVisible ? 'Ocultar' : 'Mostrar'} ${passwordLabel}`}
          accessibilityState={{ disabled: Boolean(disabled) }}
        >
          <Icon color={disabled ? theme.colors.textDisabled : theme.colors.textSecondary} size={20} />
        </TouchableOpacity>
      }
    />
  );
});

const styles = StyleSheet.create({
  toggle: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.full,
  },
});

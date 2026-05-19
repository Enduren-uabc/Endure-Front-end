import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { TextInput } from '@/components/ui/TextInput';
import { theme } from '@/theme';

interface PasswordInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  textContentType?: 'password' | 'newPassword';
  autoComplete?: 'password' | 'new-password' | 'current-password';
}

export function PasswordInput({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  disabled,
  textContentType = 'password',
  autoComplete = 'password',
}: PasswordInputProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const Icon = isVisible ? EyeOff : Eye;

  return (
    <TextInput
      label={label}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      secureTextEntry={!isVisible}
      error={error}
      disabled={disabled}
      textContentType={textContentType}
      autoComplete={autoComplete}
      rightElement={
        <TouchableOpacity
          onPress={() => setIsVisible((visible) => !visible)}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={isVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Icon color={disabled ? theme.colors.textDisabled : theme.colors.textSecondary} size={20} />
        </TouchableOpacity>
      }
    />
  );
}

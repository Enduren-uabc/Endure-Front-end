import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { theme } from '@/theme';
import type { AuthStackParamList } from '@/navigation/types';
import { validateResetToken } from '@/features/auth/hooks/use-auth';

type Props = NativeStackScreenProps<AuthStackParamList, 'ResetPasswordCode'>;

const CODE_LENGTH = 6;
const RESEND_COOLDOWN = 60;

export default function ResetPasswordCodeScreen({ navigation, route }: Props) {
  const { email } = route.params;

  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [timer, setTimer] = useState(RESEND_COOLDOWN);
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleCodeChange = useCallback((index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    setError(null);

    if (value && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }, [code]);

  const handleKeyPress = useCallback((index: number, key: string) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      const newCode = [...code];
      newCode[index - 1] = '';
      setCode(newCode);
      inputRefs.current[index - 1]?.focus();
    }
  }, [code]);

  const fullCode = code.join('');
  const isComplete = fullCode.length === CODE_LENGTH;

  const handleContinue = useCallback(async () => {
    if (!isComplete || isValidating) return;
    setError(null);
    setIsValidating(true);
    try {
      const result = await validateResetToken(fullCode);
      setCode(Array(CODE_LENGTH).fill(''));
      if (!result.valid) {
        setError('Código incorrecto o expirado. Solicita uno nuevo.');
        inputRefs.current[0]?.focus();
        return;
      }
      navigation.replace('ResetPassword', { email, token: fullCode });
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message ?? 'Error al validar el código';
      if (message.toLowerCase().includes('expirado')) {
        setError('Código expirado. Solicita uno nuevo.');
      } else {
        setError('Código incorrecto. Intenta de nuevo.');
      }
      setCode(Array(CODE_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setIsValidating(false);
    }
  }, [fullCode, isComplete, isValidating, email, navigation]);

  const handleResend = useCallback(() => {
    if (timer > 0) return;
    navigation.replace('ForgotPassword');
  }, [timer, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <View style={styles.centerContent}>
          <Text style={styles.mailIcon}>✉️</Text>
          <Text style={styles.title}>Código de recuperación</Text>
          <Text style={styles.subtitle}>
            Enviamos un código a{'\n'}
            <Text style={styles.emailBold}>{maskEmail(email)}</Text>
          </Text>

          <View style={styles.codeRow}>
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={ref => { inputRefs.current[index] = ref; }}
                style={[styles.codeInput, digit ? styles.codeInputFilled : null]}
                value={digit}
                onChangeText={value => handleCodeChange(index, value)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
                keyboardType="number-pad"
                maxLength={1}
                autoFocus={index === 0}
                selectTextOnFocus
              />
            ))}
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}

          <PrimaryButton
            label={isValidating ? 'Validando...' : 'Continuar'}
            onPress={handleContinue}
            loading={isValidating}
            disabled={!isComplete || isValidating}
          />

          <TouchableOpacity
            onPress={handleResend}
            disabled={timer > 0}
            style={styles.resendButton}
          >
            {timer > 0 ? (
              <Text style={styles.resendTextDisabled}>
                Reenviar código en {timer}s
              </Text>
            ) : (
              <Text style={styles.resendText}>
                Reenviar código
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function maskEmail(email: string): string {
  const [name, domain] = email.split('@');
  if (!name || !domain) return email;
  const masked = name.length > 2
    ? name.slice(0, 2) + '***'
    : name.slice(0, 1) + '***';
  return `${masked}@${domain}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  flex: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  mailIcon: {
    fontSize: 48,
    marginBottom: theme.spacing.sm,
  },
  title: {
    color: theme.colors.primary,
    fontSize: theme.typography.heading2.fontSize,
    lineHeight: theme.typography.heading2.lineHeight,
    fontWeight: theme.typography.heading2.fontWeight,
    textAlign: 'center',
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  emailBold: {
    color: theme.colors.textPrimary,
    fontWeight: 'bold',
  },
  codeRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  codeInput: {
    width: 44,
    height: 52,
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  codeInputFilled: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.body.fontSize,
    textAlign: 'center',
  },
  resendButton: {
    marginTop: theme.spacing.sm,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendText: {
    color: theme.colors.primary,
    fontSize: theme.typography.body.fontSize,
    fontWeight: '500',
  },
  resendTextDisabled: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
  },
});

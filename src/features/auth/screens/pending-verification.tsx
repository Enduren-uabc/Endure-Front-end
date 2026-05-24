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
import { useVerifyEmail, useResendVerification } from '@/features/auth/hooks/use-email-verification';
import { useSessionStore } from '@/features/auth/stores/session-store';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { theme } from '@/theme';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';

const CODE_LENGTH = 6;
const RESEND_COOLDOWN = 60;

export default function PendingVerificationScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const email = useSessionStore(s => s.email) ?? '';
  const setEmailVerified = useSessionStore(s => s.setEmailVerified);
  const verifyMutation = useVerifyEmail();
  const resendMutation = useResendVerification();

  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [timer, setTimer] = useState(RESEND_COOLDOWN);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

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

  const handleVerify = useCallback(async () => {
    if (!isComplete || verifyMutation.isPending) return;
    setError(null);
    try {
      await verifyMutation.mutateAsync({ token: fullCode });
      setShowSuccess(true);
      setTimeout(() => {
        setEmailVerified(true);
      }, 1500);
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message ?? 'Código inválido';
      if (message.toLowerCase().includes('expirado')) {
        setError('Código expirado. Solicita uno nuevo.');
      } else if (message.toLowerCase().includes('ya fue utilizado') || message.toLowerCase().includes('ya está verificado')) {
        setError('Esta cuenta ya está verificada.');
      } else {
        setError('Código incorrecto. Intenta de nuevo.');
      }
      setCode(Array(CODE_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    }
  }, [fullCode, isComplete, verifyMutation, setEmailVerified]);

  const handleResend = useCallback(async () => {
    if (timer > 0 || resendMutation.isPending) return;
    try {
      await resendMutation.mutateAsync();
      setTimer(RESEND_COOLDOWN);
      setError(null);
      setCode(Array(CODE_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message ?? 'Error al reenviar';
      setError(message);
    }
  }, [timer, resendMutation, setError]);

  if (showSuccess) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <View style={styles.successCircle}>
            <Text style={styles.successIcon}>✓</Text>
          </View>
          <Text style={styles.successTitle}>¡Correo verificado!</Text>
          <Text style={styles.successSubtitle}>Redirigiendo a la aplicación...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <View style={styles.centerContent}>
          <Text style={styles.mailIcon}>✉️</Text>
          <Text style={styles.title}>Verifica tu correo electrónico</Text>
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
            label={verifyMutation.isPending ? 'Verificando...' : 'Verificar'}
            onPress={handleVerify}
            loading={verifyMutation.isPending}
            disabled={!isComplete || verifyMutation.isPending}
          />

          <TouchableOpacity
            onPress={handleResend}
            disabled={timer > 0 || resendMutation.isPending}
            style={styles.resendButton}
          >
            {resendMutation.isPending ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <Text style={[styles.resendText, timer > 0 && styles.resendTextDisabled]}>
                {timer > 0
                  ? `Reenviar código en ${timer}s`
                  : 'Reenviar código'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.reset({ index: 0, routes: [{ name: 'AuthStack' }] })}
            style={styles.exitButton}
          >
            <Text style={styles.exitText}>Salir</Text>
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
  },
  exitButton: {
    marginTop: theme.spacing.lg,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exitText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    textDecorationLine: 'underline',
  },
  successCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  successIcon: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: 'bold',
  },
  successTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading2.fontSize,
    fontWeight: theme.typography.heading2.fontWeight,
    textAlign: 'center',
  },
  successSubtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    textAlign: 'center',
  },
});

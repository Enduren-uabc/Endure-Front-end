import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema, ResetPasswordFormData } from '@/features/auth/validations/auth';
import { usePasswordReset } from '@/features/auth/hooks/use-auth';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { TextInput } from '@/components/ui/TextInput';
import { BaseCard } from '@/components/ui/BaseCard';
import { theme } from '@/theme';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token?: string }>();
  const resetMutation = usePasswordReset();

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  React.useEffect(() => {
    if (resetMutation.isError) {
      const message = resetMutation.error.message || 'Error al restablecer contraseña';
      setError('root', { message });
    }
  }, [resetMutation.isError, resetMutation.error, setError]);

  React.useEffect(() => {
    if (resetMutation.isSuccess) {
      setTimeout(() => {
        router.replace('/login');
      }, 2000);
    }
  }, [resetMutation.isSuccess, router]);

  const onSubmit = (data: ResetPasswordFormData) => {
    if (!token) {
      setError('root', { message: 'Token inválido o expirado' });
      return;
    }
    resetMutation.mutate({
      token,
      password: data.password,
    });
  };

  if (!token) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <BaseCard>
            <View style={styles.errorBox}>
              <Text style={styles.errorTitle}>Enlace inválido</Text>
              <Text style={styles.errorText}>
                El enlace de recuperación es inválido o ha expirado.
              </Text>
              <SecondaryButton
                label="Solicitar nuevo enlace"
                onPress={() => router.push('/forgot-password')}
              />
            </View>
          </BaseCard>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Nueva contraseña</Text>
          <Text style={styles.subtitle}>Crea una contraseña segura para tu cuenta</Text>

          {resetMutation.isSuccess ? (
            <BaseCard>
              <View style={styles.successBox}>
                <Text style={styles.successTitle}>¡Contraseña actualizada!</Text>
                <Text style={styles.successText}>
                  Tu contraseña se ha restablecido correctamente. Redirigiendo al inicio de sesión...
                </Text>
              </View>
            </BaseCard>
          ) : (
            <BaseCard>
              <View style={styles.form}>
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      label="Nueva contraseña"
                      value={value}
                      onChangeText={onChange}
                      placeholder="Mínimo 8 caracteres"
                      secureTextEntry
                      error={errors.password?.message}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="confirmPassword"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      label="Confirmar nueva contraseña"
                      value={value}
                      onChangeText={onChange}
                      placeholder="Repite la nueva contraseña"
                      secureTextEntry
                      error={errors.confirmPassword?.message}
                    />
                  )}
                />

                {errors.root && <Text style={styles.rootError}>{errors.root.message}</Text>}

                <PrimaryButton
                  label="Restablecer contraseña"
                  onPress={handleSubmit(onSubmit)}
                  loading={resetMutation.isPending}
                  disabled={resetMutation.isPending}
                />
              </View>
            </BaseCard>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    gap: theme.spacing.lg,
  },
  centerContent: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    justifyContent: 'center',
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading2.fontSize,
    lineHeight: theme.typography.heading2.lineHeight,
    fontWeight: theme.typography.heading2.fontWeight,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
  },
  form: {
    gap: theme.spacing.md,
  },
  successBox: {
    gap: theme.spacing.md,
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  successTitle: {
    color: theme.colors.success,
    fontSize: theme.typography.heading3.fontSize,
    lineHeight: theme.typography.heading3.lineHeight,
    fontWeight: theme.typography.heading3.fontWeight,
  },
  successText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    textAlign: 'center',
  },
  errorBox: {
    gap: theme.spacing.md,
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  errorTitle: {
    color: theme.colors.error,
    fontSize: theme.typography.heading3.fontSize,
    lineHeight: theme.typography.heading3.lineHeight,
    fontWeight: theme.typography.heading3.fontWeight,
  },
  errorText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    textAlign: 'center',
  },
  rootError: {
    color: theme.colors.error,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    textAlign: 'center',
  },
});

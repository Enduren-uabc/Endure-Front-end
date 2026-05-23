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
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { newPasswordSchema, NewPasswordFormData } from '@/features/auth/validations/auth';
import { usePasswordReset } from '@/features/auth/hooks/use-auth';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { BaseCard } from '@/components/ui/BaseCard';
import { PasswordInput } from '@/shared/components/PasswordInput';
import { theme } from '@/theme';
import type { AuthStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'ResetPassword'>;

export default function ResetPasswordScreen({ navigation, route }: Props) {
  const { token } = route.params;
  const resetMutation = usePasswordReset();

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
    watch,
  } = useForm<NewPasswordFormData>({
    resolver: zodResolver(newPasswordSchema),
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
        navigation.replace('Login');
      }, 2000);
    }
  }, [resetMutation.isSuccess, navigation]);

  const onSubmit = (data: NewPasswordFormData) => {
    resetMutation.mutate({
      token,
      password: data.password,
    });
  };

  const watchedPassword = watch('password');
  const watchedConfirmPassword = watch('confirmPassword');
  const formComplete = watchedPassword.length >= 8 && watchedConfirmPassword.length >= 1;

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
          <Text style={styles.subtitle}>
            Ingresa tu nueva contraseña
          </Text>

          <BaseCard>
            <View style={styles.form}>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, value } }) => (
                  <PasswordInput
                    label="Nueva contraseña"
                    value={value}
                    onChangeText={onChange}
                    placeholder="Mínimo 8 caracteres"
                    textContentType="newPassword"
                    autoComplete="new-password"
                    error={errors.password?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, value } }) => (
                  <PasswordInput
                    label="Confirmar nueva contraseña"
                    value={value}
                    onChangeText={onChange}
                    placeholder="Repite la nueva contraseña"
                    textContentType="newPassword"
                    autoComplete="new-password"
                    error={errors.confirmPassword?.message}
                  />
                )}
              />

              {errors.root && <Text style={styles.rootError}>{errors.root.message}</Text>}

              <PrimaryButton
                label="Restablecer contraseña"
                onPress={handleSubmit(onSubmit)}
                loading={resetMutation.isPending}
                disabled={!formComplete || resetMutation.isPending}
              />
            </View>
          </BaseCard>
        </ScrollView>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    gap: theme.spacing.lg,
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
  rootError: {
    color: theme.colors.error,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    textAlign: 'center',
  },
});

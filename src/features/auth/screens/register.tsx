import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterFormData } from '@/features/auth/validations/auth';
import { useRegister } from '@/features/auth/hooks/use-auth';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { TextInput } from '@/components/ui/TextInput';
import { BaseCard } from '@/components/ui/BaseCard';
import { PasswordInput } from '@/shared/components/PasswordInput';
import { theme } from '@/theme';
import type { AuthStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const registerMutation = useRegister();

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
      acceptPrivacy: false,
    },
  });

  React.useEffect(() => {
    if (registerMutation.isError) {
      const message = registerMutation.error.message || 'Error al registrarse';
      setError('root', { message });
    }
  }, [registerMutation.isError, registerMutation.error, setError]);

  React.useEffect(() => {
    if (registerMutation.isSuccess) {
      navigation.replace('Login');
    }
  }, [registerMutation.isSuccess, navigation]);

  const onSubmit = (data: RegisterFormData) => {
    registerMutation.mutate({
      email: data.email,
      username: data.username,
      password: data.password,
    });
  };

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
          <Text style={styles.title}>Crear cuenta</Text>
          <Text style={styles.subtitle}>Regístrate para comenzar tu entrenamiento</Text>

          <BaseCard>
            <View style={styles.form}>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    label="Correo electrónico"
                    value={value}
                    onChangeText={onChange}
                    placeholder="ejemplo@correo.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    textContentType="emailAddress"
                    autoComplete="email"
                    disabled={registerMutation.isPending}
                    error={errors.email?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="username"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    label="Nombre de usuario"
                    value={value}
                    onChangeText={onChange}
                    placeholder="usuario123"
                    autoCapitalize="none"
                    disabled={registerMutation.isPending}
                    error={errors.username?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, value } }) => (
                  <PasswordInput
                    label="Contraseña"
                    value={value}
                    onChangeText={onChange}
                    placeholder="Mínimo 8 caracteres"
                    disabled={registerMutation.isPending}
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
                    label="Confirmar contraseña"
                    value={value}
                    onChangeText={onChange}
                    placeholder="Repite tu contraseña"
                    disabled={registerMutation.isPending}
                    textContentType="newPassword"
                    autoComplete="new-password"
                    error={errors.confirmPassword?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="acceptPrivacy"
                render={({ field: { onChange, value } }) => (
                  <View>
                    <TouchableOpacity
                      style={styles.checkboxRow}
                      onPress={() => onChange(!value)}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.checkbox, value && styles.checkboxChecked]}>
                        {value && <Text style={styles.checkmark}>✓</Text>}
                      </View>
                      <Text style={styles.checkboxLabel}>
                        Acepto la política de privacidad y términos de uso
                      </Text>
                    </TouchableOpacity>
                    {errors.acceptPrivacy && (
                      <Text style={styles.checkboxError}>{errors.acceptPrivacy.message}</Text>
                    )}
                  </View>
                )}
              />

              {errors.root && <Text style={styles.rootError}>{errors.root.message}</Text>}

              <PrimaryButton
                label="Registrarse"
                onPress={handleSubmit(onSubmit)}
                loading={registerMutation.isPending}
                disabled={registerMutation.isPending}
              />
            </View>
          </BaseCard>

          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.footerLink}>
            <Text style={styles.footerText}>
              ¿Ya tienes cuenta? <Text style={styles.footerTextBold}>Inicia sesión</Text>
            </Text>
          </TouchableOpacity>
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
  },
  form: {
    gap: theme.spacing.lg,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  checkmark: {
    color: theme.colors.background,
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    flex: 1,
  },
  checkboxError: {
    color: theme.colors.error,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    marginTop: theme.spacing.xs,
  },
  rootError: {
    color: theme.colors.error,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    textAlign: 'center',
  },
  footerLink: {
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  footerText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
  },
  footerTextBold: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
});

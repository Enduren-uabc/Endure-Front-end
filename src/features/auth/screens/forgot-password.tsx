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
import { forgotPasswordSchema, ForgotPasswordFormData } from '@/features/auth/validations/auth';
import { usePasswordRecovery } from '@/features/auth/hooks/use-auth';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { TextInput } from '@/components/ui/TextInput';
import { BaseCard } from '@/components/ui/BaseCard';
import { theme } from '@/theme';
import type { AuthStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export default function ForgotPasswordScreen({ navigation }: Props) {
  const recoveryMutation = usePasswordRecovery();

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  React.useEffect(() => {
    if (recoveryMutation.isError) {
      const message = recoveryMutation.error.message || 'Error al enviar solicitud';
      setError('root', { message });
    }
  }, [recoveryMutation.isError, recoveryMutation.error, setError]);

  React.useEffect(() => {
    if (recoveryMutation.isSuccess) {
      const email = recoveryMutation.variables?.email;
      if (email) {
        navigation.replace('ResetPasswordCode', { email });
      }
    }
  }, [recoveryMutation.isSuccess, recoveryMutation.variables, navigation]);

  const onSubmit = (data: ForgotPasswordFormData) => {
    recoveryMutation.mutate(data);
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
          <Text style={styles.title}>Recuperar contraseña</Text>
          <Text style={styles.subtitle}>
            Ingresa tu correo y te enviaremos un código de recuperación
          </Text>

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
                    error={errors.email?.message}
                  />
                )}
              />

              {errors.root && <Text style={styles.rootError}>{errors.root.message}</Text>}

              <PrimaryButton
                label="Enviar código"
                onPress={handleSubmit(onSubmit)}
                loading={recoveryMutation.isPending}
                disabled={recoveryMutation.isPending}
              />
            </View>
          </BaseCard>
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

import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormData } from "@/features/auth/validations/auth";
import { useLogin, isAccountLockedError } from "@/features/auth/hooks/use-auth";
import { useGoogleAuth, useAppleAuth } from "@/features/auth/hooks/use-social-auth";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { TextInput } from "@/components/ui/TextInput";
import { PasswordInput } from "@/shared/components/PasswordInput";
import { BaseCard } from "@/components/ui/BaseCard";
import { theme } from "@/theme";
import type { AuthStackParamList } from "@/navigation/types";
import LockoutTimer from "@/features/auth/components/LockoutTimer";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

export default function LoginScreen({ navigation, route }: Props) {
  const loginMutation = useLogin();
  const { login: googleLogin, isPending: googlePending, error: googleError } = useGoogleAuth();
  const { login: appleLogin, isPending: applePending, error: appleError } = useAppleAuth();
  const { email: prefillEmail, password: prefillPassword } = route.params ?? {};

  const isLocked = isAccountLockedError(loginMutation.error);
  const remainingSeconds = loginMutation.error?.remainingLockSeconds ?? 0;

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
    reset: resetForm,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: prefillEmail ?? "",
      password: prefillPassword ?? "",
    },
  });

  React.useEffect(() => {
    if (loginMutation.isError && !isLocked) {
      const message = loginMutation.error.message || "Error al iniciar sesión";
      setError("root", { message });
    }
  }, [loginMutation.isError, loginMutation.error, setError, isLocked]);

  const handleCountdownEnd = useCallback(() => {
    loginMutation.reset();
  }, [loginMutation]);

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Iniciar sesión</Text>
          <Text style={styles.subtitle}>Bienvenido de vuelta</Text>

          <TouchableOpacity
            style={styles.googleButton}
            onPress={googleLogin}
            disabled={googlePending}
            activeOpacity={0.8}
          >
            {googlePending ? (
              <ActivityIndicator size="small" color={theme.colors.textPrimary} />
            ) : (
              <Text style={styles.googleButtonText}>Continuar con Google</Text>
            )}
          </TouchableOpacity>

          {Platform.OS === 'ios' && (
            <TouchableOpacity
              style={styles.appleButton}
              onPress={appleLogin}
              disabled={applePending}
              activeOpacity={0.8}
            >
              {applePending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.appleButtonText}>Continuar con Apple</Text>
              )}
            </TouchableOpacity>
          )}

          {googleError && (
            <Text style={styles.errorText}>{googleError}</Text>
          )}
          {appleError && (
            <Text style={styles.errorText}>{appleError}</Text>
          )}

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>o</Text>
            <View style={styles.dividerLine} />
          </View>

          {isLocked ? (
            <LockoutTimer
              remainingLockSeconds={remainingSeconds}
              onCountdownEnd={handleCountdownEnd}
            />
          ) : (
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

                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, value } }) => (
                    <PasswordInput
                      label="Contraseña"
                      value={value}
                      onChangeText={onChange}
                      placeholder="Tu contraseña"
                      error={errors.password?.message}
                    />
                  )}
                />

                <TouchableOpacity
                  onPress={() => navigation.navigate("ForgotPassword")}
                  style={styles.forgotLink}
                >
                  <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
                </TouchableOpacity>

                {errors.root && (
                  <Text style={styles.rootError}>{errors.root.message}</Text>
                )}

                <PrimaryButton
                  label="Iniciar sesión"
                  onPress={handleSubmit(onSubmit)}
                  loading={loginMutation.isPending}
                  disabled={loginMutation.isPending}
                />
              </View>
            </BaseCard>
          )}

          <TouchableOpacity
            onPress={() => navigation.navigate("Register")}
            style={styles.footerLink}
          >
            <Text style={styles.footerText}>
              ¿No tienes cuenta?{" "}
              <Text style={styles.footerTextBold}>Regístrate</Text>
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
  forgotLink: {
    alignSelf: "flex-end",
  },
  forgotText: {
    color: theme.colors.primary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingVertical: 14,
    minHeight: 48,
  },
  googleButtonText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body.fontSize,
    fontWeight: '500',
  },
  appleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    borderRadius: 8,
    paddingVertical: 14,
    minHeight: 48,
  },
  appleButtonText: {
    color: '#FFFFFF',
    fontSize: theme.typography.body.fontSize,
    fontWeight: '500',
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.body.fontSize,
    textAlign: 'center',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
  },
  rootError: {
    color: theme.colors.error,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    textAlign: "center",
  },
  footerLink: {
    alignItems: "center",
    marginTop: theme.spacing.sm,
  },
  footerText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
  },
  footerTextBold: {
    color: theme.colors.primary,
    fontWeight: "bold",
  },
});

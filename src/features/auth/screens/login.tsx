import React from "react";
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
import { useGoogleAuth } from "@/features/auth/hooks/use-social-auth";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { TextInput } from "@/components/ui/TextInput";
import { PasswordInput } from "@/shared/components/PasswordInput";
import { BaseCard } from "@/components/ui/BaseCard";
import { theme } from "@/theme";
import type { AuthStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

export default function LoginScreen({ navigation, route }: Props) {
  const loginMutation = useLogin();
  const { login: googleLogin, isPending: googlePending, error: googleError, clearError } = useGoogleAuth();
  const { email: prefillEmail, password: prefillPassword } = route.params ?? {};
  const [blockedUntil, setBlockedUntil] = React.useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = React.useState(0);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: prefillEmail ?? "",
      password: prefillPassword ?? "",
    },
  });

  React.useEffect(() => {
    if (loginMutation.isError) {
      const message = loginMutation.error.message || "Error al iniciar sesión";
      setError("root", { message });

      if (
        isAccountLockedError(loginMutation.error) &&
        typeof loginMutation.error.remainingLockSeconds === "number" &&
        loginMutation.error.remainingLockSeconds > 0
      ) {
        setBlockedUntil(Date.now() + loginMutation.error.remainingLockSeconds * 1000);
      }
    }
  }, [loginMutation.isError, loginMutation.error, setError]);

  React.useEffect(() => {
    if (!blockedUntil) return;

    const tick = () => {
      const seconds = Math.max(0, Math.ceil((blockedUntil - Date.now()) / 1000));
      setRemainingSeconds(seconds);
      if (seconds === 0) {
        setBlockedUntil(null);
        loginMutation.reset();
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [blockedUntil]);

  React.useEffect(() => {
    if (!googleError) return;

    navigation.navigate("OAuthError", {
      provider: "google",
      reason: googleError.includes("Cancelaste") ? "cancelled" : "failed",
      message: googleError,
    });
    clearError();
  }, [clearError, googleError, navigation]);

  const onSubmit = (data: LoginFormData) => {
    if (blockedUntil) return;
    loginMutation.mutate(data);
  };

  const isBlocked = blockedUntil !== null;

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

          {googleError && (
            <Text style={styles.errorText}>{googleError}</Text>
          )}

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>o</Text>
            <View style={styles.dividerLine} />
          </View>

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

              {isBlocked && (
                <View style={styles.blockedBanner}>
                  <Text style={styles.blockedTitle}>Inicio bloqueado temporalmente</Text>
                  <Text style={styles.blockedText}>
                    Hubo varios intentos fallidos. Intenta de nuevo en {remainingSeconds}s o recupera tu contraseña.
                  </Text>
                </View>
              )}

              <PrimaryButton
                label={isBlocked ? `Espera ${remainingSeconds}s` : "Iniciar sesión"}
                onPress={handleSubmit(onSubmit)}
                loading={loginMutation.isPending}
                disabled={loginMutation.isPending || isBlocked}
              />
            </View>
          </BaseCard>

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
  blockedBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: theme.colors.error,
    borderWidth: 1,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  blockedTitle: {
    color: theme.colors.error,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: theme.typography.bodyStrong.fontWeight,
  },
  blockedText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
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

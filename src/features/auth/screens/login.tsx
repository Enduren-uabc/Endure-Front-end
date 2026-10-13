import React from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData } from "@/features/auth/validations/auth";
import { useLogin } from "@/features/auth/hooks/use-auth";
import { useAppleAuth, useGoogleAuth } from "@/features/auth/hooks/use-social-auth";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { TextInput } from "@/components/ui/TextInput";
import { PasswordInput } from "@/shared/components/PasswordInput";
import { BaseCard } from "@/components/ui/BaseCard";
import { theme } from "@/theme";
import type { AuthStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;
type AuthMethod = "email" | "google" | "apple";

export default function LoginScreen({ navigation, route }: Props) {
  const { width } = useWindowDimensions();
  const isWideWeb = Platform.OS === "web" && width >= 900;
  const loginMutation = useLogin();
  const {
    login: googleLogin,
    isPending: googlePending,
    error: googleError,
    clearError: clearGoogleError,
  } = useGoogleAuth();
  const {
    login: appleLogin,
    isPending: applePending,
    error: appleError,
    clearError: clearAppleError,
  } = useAppleAuth();
  const { email: prefillEmail, password: prefillPassword } = route.params ?? {};
  const authAttemptRef = React.useRef(false);
  const [activeMethod, setActiveMethod] = React.useState<AuthMethod | null>(null);

  const {
    control,
    handleSubmit,
    clearErrors,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    shouldFocusError: true,
    defaultValues: {
      email: prefillEmail ?? "",
      password: prefillPassword ?? "",
    },
  });

  const authPending =
    activeMethod !== null ||
    loginMutation.isPending ||
    googlePending ||
    applePending;
  const emailIsPending = activeMethod === "email" || loginMutation.isPending;
  const googleIsPending = activeMethod === "google" || googlePending;
  const appleIsPending = activeMethod === "apple" || applePending;

  const runAuthAttempt = React.useCallback(
    async (method: AuthMethod, attempt: () => Promise<unknown>) => {
      // A ref closes the short gap before React renders the disabled controls.
      if (authAttemptRef.current) return;

      authAttemptRef.current = true;
      setActiveMethod(method);
      clearErrors("root");
      clearGoogleError();
      clearAppleError();

      try {
        await attempt();
      } catch (error: unknown) {
        const message =
          error instanceof Error && error.message
            ? error.message
            : "No se pudo iniciar sesión. Intenta de nuevo.";
        setError("root", { type: "server", message });
      } finally {
        authAttemptRef.current = false;
        setActiveMethod(null);
      }
    },
    [clearAppleError, clearErrors, clearGoogleError, setError],
  );

  const onSubmit = (data: LoginFormData) =>
    runAuthAttempt("email", () => loginMutation.mutateAsync(data));

  const handleFieldChange = (onChange: (value: string) => void) => (value: string) => {
    clearErrors("root");
    onChange(value);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            isWideWeb ? styles.scrollContentWide : null,
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
        >
          <View style={styles.content}>
            <View style={styles.heading}>
              <Text accessibilityRole="header" style={styles.title}>
                Iniciar sesión
              </Text>
              <Text style={styles.subtitle}>Bienvenido de vuelta</Text>
            </View>

            <BaseCard
              style={[
                styles.methodsCard,
                isWideWeb ? styles.methodsCardWide : null,
              ]}
            >
              <View
                style={[
                  styles.socialSection,
                  isWideWeb ? styles.socialSectionWide : null,
                ]}
              >
                <Text style={styles.sectionTitle}>
                  Usa una cuenta
                </Text>

                <TouchableOpacity
                  style={styles.googleButton}
                  onPress={() => void runAuthAttempt("google", googleLogin)}
                  disabled={authPending}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel={
                    googleIsPending ? "Conectando con Google" : "Continuar con Google"
                  }
                  accessibilityState={{ disabled: authPending, busy: googleIsPending }}
                  aria-busy={googleIsPending}
                >
                  {googleIsPending ? (
                    <>
                      <ActivityIndicator size="small" color={theme.colors.textPrimary} />
                      <Text style={styles.googleButtonText} accessibilityLiveRegion="polite">
                        Conectando con Google…
                      </Text>
                    </>
                  ) : (
                    <Text style={styles.googleButtonText}>Continuar con Google</Text>
                  )}
                </TouchableOpacity>

                {Platform.OS === "ios" ? (
                  <TouchableOpacity
                    style={styles.appleButton}
                    onPress={() => void runAuthAttempt("apple", appleLogin)}
                    disabled={authPending}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel={
                      appleIsPending ? "Conectando con Apple" : "Continuar con Apple"
                    }
                    accessibilityState={{ disabled: authPending, busy: appleIsPending }}
                    aria-busy={appleIsPending}
                  >
                    {appleIsPending ? (
                      <>
                        <ActivityIndicator size="small" color="#FFFFFF" />
                        <Text style={styles.appleButtonText} accessibilityLiveRegion="polite">
                          Conectando con Apple…
                        </Text>
                      </>
                    ) : (
                      <Text style={styles.appleButtonText}>Continuar con Apple</Text>
                    )}
                  </TouchableOpacity>
                ) : null}

                {googleError ? (
                  <Text
                    accessibilityRole="alert"
                    accessibilityLiveRegion="polite"
                    style={styles.socialError}
                  >
                    {googleError}
                  </Text>
                ) : null}
                {appleError ? (
                  <Text
                    accessibilityRole="alert"
                    accessibilityLiveRegion="polite"
                    style={styles.socialError}
                  >
                    {appleError}
                  </Text>
                ) : null}
              </View>

              {isWideWeb ? (
                <View style={styles.verticalDivider} accessibilityElementsHidden />
              ) : (
                <View style={styles.horizontalDivider} accessibilityElementsHidden>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>o</Text>
                  <View style={styles.dividerLine} />
                </View>
              )}

              <View
                style={[
                  styles.formSection,
                  isWideWeb ? styles.formSectionWide : null,
                ]}
              >
                <Text style={styles.sectionTitle}>
                  Con tu correo
                </Text>

                <View style={styles.form}>
                  <Controller
                    control={control}
                    name="email"
                    render={({ field: { onChange, onBlur, value, ref } }) => (
                      <TextInput
                        ref={ref}
                        label="Correo electrónico"
                        value={value}
                        onChangeText={handleFieldChange(onChange)}
                        onBlur={onBlur}
                        placeholder="ejemplo@correo.com"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        spellCheck={false}
                        textContentType="emailAddress"
                        autoComplete="email"
                        accessibilityHint="Escribe el correo electrónico de tu cuenta."
                        error={errors.email?.message}
                        disabled={authPending}
                      />
                    )}
                  />

                  <View style={styles.passwordBlock}>
                    <Controller
                      control={control}
                      name="password"
                      render={({ field: { onChange, onBlur, value, ref } }) => (
                        <PasswordInput
                          ref={ref}
                          label="Contraseña"
                          value={value}
                          onChangeText={handleFieldChange(onChange)}
                          onBlur={onBlur}
                          placeholder="Tu contraseña"
                          autoComplete="current-password"
                          textContentType="password"
                          accessibilityHint="Escribe la contraseña de tu cuenta."
                          error={errors.password?.message}
                          disabled={authPending}
                        />
                      )}
                    />

                    <TouchableOpacity
                      onPress={() => navigation.navigate("ForgotPassword")}
                      style={styles.forgotLink}
                      disabled={authPending}
                      accessibilityRole="link"
                      accessibilityState={{ disabled: authPending }}
                    >
                      <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
                    </TouchableOpacity>
                  </View>

                  {errors.root?.message ? (
                    <Text
                      accessibilityRole="alert"
                      accessibilityLiveRegion="assertive"
                      style={styles.rootError}
                    >
                      {errors.root.message}
                    </Text>
                  ) : null}

                  <PrimaryButton
                    label="Iniciar sesión"
                    loadingLabel="Iniciando sesión…"
                    onPress={handleSubmit(onSubmit)}
                    loading={emailIsPending}
                    disabled={authPending}
                  />
                </View>
              </View>
            </BaseCard>

            <TouchableOpacity
              onPress={() => navigation.navigate("Register")}
              style={styles.footerLink}
              disabled={authPending}
              accessibilityRole="link"
              accessibilityState={{ disabled: authPending }}
            >
              <Text style={styles.footerText}>
                ¿No tienes cuenta? <Text style={styles.footerTextBold}>Regístrate</Text>
              </Text>
            </TouchableOpacity>
          </View>
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
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
  },
  scrollContentWide: {
    paddingHorizontal: theme.spacing.xl,
  },
  content: {
    alignSelf: "center",
    width: "100%",
    maxWidth: 960,
    gap: theme.spacing.xl,
  },
  heading: {
    gap: theme.spacing.xs,
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
  methodsCard: {
    padding: theme.spacing.xl,
    gap: theme.spacing.xl,
  },
  methodsCardWide: {
    flexDirection: "row",
    alignItems: "stretch",
    columnGap: theme.spacing.xl,
  },
  socialSection: {
    gap: theme.spacing.md,
  },
  socialSectionWide: {
    flex: 0.9,
    justifyContent: "flex-start",
  },
  formSection: {
    gap: theme.spacing.lg,
  },
  formSectionWide: {
    flex: 1.1,
  },
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    fontWeight: "600",
  },
  form: {
    gap: theme.spacing.xl,
  },
  passwordBlock: {
    gap: theme.spacing.sm,
  },
  forgotLink: {
    alignSelf: "flex-end",
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: theme.spacing.xs,
  },
  forgotText: {
    color: theme.colors.primary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.lg,
    minHeight: 48,
  },
  googleButtonText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body.fontSize,
    fontWeight: "500",
  },
  appleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
    backgroundColor: "#000000",
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.lg,
    minHeight: 48,
  },
  appleButtonText: {
    color: "#FFFFFF",
    fontSize: theme.typography.body.fontSize,
    fontWeight: "500",
  },
  socialError: {
    color: theme.colors.error,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
  },
  horizontalDivider: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  verticalDivider: {
    width: 1,
    backgroundColor: theme.colors.border,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  rootError: {
    color: theme.colors.error,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
  },
  footerLink: {
    alignSelf: "center",
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: theme.spacing.sm,
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

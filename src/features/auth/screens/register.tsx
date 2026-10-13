import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
  type TouchableOpacityProps,
  type TextProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterFormData } from '@/features/auth/validations/auth';
import {
  getConfirmPasswordFeedback,
  getPasswordRequirementStatus,
  getVisibleFieldError,
  passwordsMatch,
} from '@/features/auth/validations/form-feedback';
import { useRegister } from '@/features/auth/hooks/use-auth';
import { tokenStore } from '@/lib/secure-token-store';
import { useSessionStore } from '@/features/auth/stores/session-store';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { TextInput } from '@/components/ui/TextInput';
import { BaseCard } from '@/components/ui/BaseCard';
import { PasswordInput } from '@/shared/components/PasswordInput';
import { theme } from '@/theme';
import type { AuthStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

// A local feedback color keeps small registration errors readable on Endure's dark surface.
const REGISTER_ERROR_COLOR = '#FF8B8B';

function PasswordRequirementChecklist({ password, nativeID }: { password: string; nativeID: string }) {
  const requirements = getPasswordRequirementStatus(password);
  const metCount = requirements.filter(requirement => requirement.met).length;

  return (
    <View style={styles.requirementsBox} nativeID={nativeID}>
      <View style={styles.requirementsSummary}>
        <Text style={styles.requirementsTitle}>Requisitos de contraseña</Text>
        <Text style={styles.requirementsTitle}>{metCount} de 3 cumplidos</Text>
      </View>
      {requirements.map(requirement => (
        <View key={requirement.id} style={styles.requirementRow}>
          <Text
            style={[styles.requirementIcon, requirement.met ? styles.requirementMet : null]}
            aria-hidden
          >
            {requirement.met ? '✓' : '○'}
          </Text>
          <Text style={styles.requirementText}>
            {requirement.label}
          </Text>
          <Text style={requirement.met ? styles.requirementStatusMet : styles.requirementStatusPending}>
            {requirement.met ? 'Cumplido' : 'Pendiente'}
          </Text>
        </View>
      ))}
    </View>
  );
}

export default function RegisterScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const isWide = width >= 900;
  const feedbackId = React.useId().replace(/[:]/g, '');
  const passwordGuideId = `${feedbackId}-password-guide`;
  const matchId = `${feedbackId}-password-match`;
  const privacyErrorId = `${feedbackId}-privacy-error`;
  const titleAriaProps = Platform.OS === 'web'
    ? ({ 'aria-level': 1 } as TextProps) : undefined;
  const sectionAriaProps = Platform.OS === 'web'
    ? ({ 'aria-level': 2 } as TextProps) : undefined;
  const registerMutation = useRegister();
  const setSession = useSessionStore(s => s.setSession);

  const {
    control,
    handleSubmit,
    trigger,
    formState: { errors, touchedFields, submitCount },
    setError,
    clearErrors,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: {
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
      acceptPrivacy: false,
    },
  });

  const passwordValue = useWatch({ control, name: 'password' }) ?? '';
  const confirmPasswordValue = useWatch({ control, name: 'confirmPassword' }) ?? '';

  const emailInteracted = Boolean(touchedFields.email) || submitCount > 0;
  const usernameInteracted = Boolean(touchedFields.username) || submitCount > 0;
  const passwordInteracted = Boolean(touchedFields.password) || submitCount > 0;
  const confirmPasswordInteracted = Boolean(touchedFields.confirmPassword) || submitCount > 0;

  const confirmPasswordFeedback = getConfirmPasswordFeedback(
    passwordValue,
    confirmPasswordValue,
    confirmPasswordInteracted,
  );
  const showPasswordMatch = passwordsMatch(passwordValue, confirmPasswordValue);
  const privacyError = getVisibleFieldError(errors.acceptPrivacy?.message, submitCount > 0);

  const previousPasswordRef = React.useRef(passwordValue);

  React.useEffect(() => {
    const passwordChanged = previousPasswordRef.current !== passwordValue;
    previousPasswordRef.current = passwordValue;

    // RHF no revalida por sí solo una dependencia cruzada cuando cambia el
    // campo fuente: se revalida únicamente el objetivo afectado, sin bucles.
    if (passwordChanged && (confirmPasswordInteracted || confirmPasswordValue.length > 0)) {
      void trigger('confirmPassword', { shouldFocus: false });
    }
  }, [passwordValue, confirmPasswordValue, confirmPasswordInteracted, trigger]);

  const submitLockRef = React.useRef(false);

  React.useEffect(() => {
    if (registerMutation.isError) {
      const message = registerMutation.error.message || 'Error al registrarse';
      setError('root', { message });
    }
  }, [registerMutation.isError, registerMutation.error, setError]);

  React.useEffect(() => {
    if (registerMutation.isSuccess) {
      const data = registerMutation.data;
      if (Platform.OS !== 'web' && data.accessToken && data.refreshToken) {
        tokenStore.setAccessToken(data.accessToken);
        tokenStore.setRefreshToken(data.refreshToken);
      }
      setSession(data.id, data.role, data.username, data.email, data.onboardingCompleted ?? null, data.emailVerified);
    }
  }, [registerMutation.isSuccess, registerMutation.data, setSession]);

  const onSubmit = (data: RegisterFormData) => {
    if (submitLockRef.current || registerMutation.isPending) return;
    submitLockRef.current = true;
    clearErrors('root');

    registerMutation.mutate(
      {
        email: data.email,
        username: data.username,
        password: data.password,
      },
      {
        onSettled: () => {
          submitLockRef.current = false;
        },
      },
    );
  };

  const privacyAriaProps = Platform.OS === 'web'
    ? ({
        'aria-describedby': privacyError ? privacyErrorId : undefined,
        'aria-invalid': privacyError ? true : undefined,
      } as unknown as TouchableOpacityProps)
    : undefined;

  const loginLink = (
    <TouchableOpacity
      onPress={() => navigation.navigate('Login')}
      style={styles.footerLink}
      accessibilityRole="link"
      accessibilityLabel="¿Ya tienes cuenta? Inicia sesión"
    >
      <Text style={styles.footerText}>
        ¿Ya tienes cuenta? <Text style={styles.footerTextBold}>Inicia sesión</Text>
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, isWide ? styles.scrollContentWide : null]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.layout, isWide ? styles.layoutWide : null]}>
            <View style={[styles.intro, isWide ? styles.introWide : null]}>
              <Text style={styles.brand}>ENDURE</Text>
              <Text {...titleAriaProps} accessibilityRole="header" style={[styles.title, isWide ? styles.titleWide : null]}>
                Crear cuenta
              </Text>
              <Text style={styles.subtitle}>Crea tus datos de acceso para comenzar tu entrenamiento.</Text>
              {isWide ? (
                <>
                  <View style={styles.nextStep}>
                    <Text style={styles.nextStepTitle}>Después del registro</Text>
                    <Text style={styles.nextStepText}>
                      Continúa con la verificación de tu correo y la configuración de tu perfil, según corresponda.
                    </Text>
                  </View>
                  {loginLink}
                </>
              ) : null}
            </View>
            <View style={[styles.formColumn, isWide ? styles.formColumnWide : null]}>
              <BaseCard style={[styles.formCard, !isWide ? styles.formCardCompact : null]}>
                <View style={styles.form}>
                  <View style={styles.section}>
                    <Text {...sectionAriaProps} accessibilityRole="header" style={styles.sectionTitle}>Datos de acceso</Text>
                    <View style={styles.fields}>
                      <Controller
                        control={control}
                        name="email"
                        render={({ field: { onChange, onBlur, value, ref } }) => (
                          <TextInput
                            ref={ref}
                            label="Correo electrónico"
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            placeholder="ejemplo@correo.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            spellCheck={false}
                            inputMode="email"
                            allowEmoji={false}
                            textContentType="emailAddress"
                            autoComplete="email"
                            helperText="Usa un correo al que tengas acceso."
                            errorTextStyle={styles.fieldError}
                            disabled={registerMutation.isPending}
                            error={getVisibleFieldError(errors.email?.message, emailInteracted)}
                          />
                        )}
                      />

                      <Controller
                        control={control}
                        name="username"
                        render={({ field: { onChange, onBlur, value, ref } }) => (
                          <TextInput
                            ref={ref}
                            label="Nombre de usuario"
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            placeholder="Elige tu nombre de usuario"
                            autoCapitalize="none"
                            autoCorrect={false}
                            spellCheck={false}
                            allowEmoji={false}
                            textContentType="username"
                            autoComplete="username"
                            helperText="3–30 caracteres: letras, números y guion bajo."
                            errorTextStyle={styles.fieldError}
                            disabled={registerMutation.isPending}
                            error={getVisibleFieldError(errors.username?.message, usernameInteracted)}
                          />
                        )}
                      />
                    </View>
                  </View>
                  <View style={styles.section}>
                    <Text {...sectionAriaProps} accessibilityRole="header" style={styles.sectionTitle}>Seguridad</Text>
                    <View style={styles.fields}>
                      <View style={styles.fieldGroup}>
                        <Controller
                          control={control}
                          name="password"
                          render={({ field: { onChange, onBlur, value, ref } }) => (
                            <PasswordInput
                              ref={ref}
                              label="Contraseña"
                              value={value}
                              onChangeText={onChange}
                              onBlur={onBlur}
                              placeholder="Crea una contraseña"
                              disabled={registerMutation.isPending}
                              textContentType="newPassword"
                              autoComplete="new-password"
                              describedBy={passwordGuideId}
                              accessibilityHint="Debe tener al menos 8 caracteres, una mayúscula y un número."
                              errorTextStyle={styles.fieldError}
                              error={getVisibleFieldError(errors.password?.message, passwordInteracted)}
                            />
                          )}
                        />
                        <PasswordRequirementChecklist password={passwordValue} nativeID={passwordGuideId} />
                      </View>

                      <View style={styles.fieldGroup}>
                        <Controller
                          control={control}
                          name="confirmPassword"
                          render={({ field: { onChange, onBlur, value, ref } }) => (
                            <PasswordInput
                              ref={ref}
                              label="Confirmar contraseña"
                              value={value}
                              onChangeText={onChange}
                              onBlur={onBlur}
                              placeholder="Repite tu contraseña"
                              disabled={registerMutation.isPending}
                              textContentType="newPassword"
                              autoComplete="new-password"
                              describedBy={showPasswordMatch ? matchId : undefined}
                              accessibilityHint={showPasswordMatch ? 'Las contraseñas coinciden' : undefined}
                              errorTextStyle={styles.fieldError}
                              error={confirmPasswordFeedback.message ?? undefined}
                            />
                          )}
                        />
                        {showPasswordMatch ? (
                          <Text nativeID={matchId} style={styles.matchText} accessibilityLiveRegion="polite">
                            ✓ Las contraseñas coinciden
                          </Text>
                        ) : null}
                      </View>
                    </View>
                  </View>
                  <View style={styles.actions}>
                    <Controller
                      control={control}
                      name="acceptPrivacy"
                      render={({ field: { onChange, value, ref } }) => (
                        <View>
                          <TouchableOpacity
                            {...privacyAriaProps}
                            {...(Platform.OS === 'web' ? ({
                              // RN Web's press responder handles Space only for button roles.
                              onKeyDownCapture: (event: React.KeyboardEvent) => {
                                if (event.key !== ' ' && event.key !== 'Spacebar') return;
                                event.preventDefault();
                                if (!event.repeat && !registerMutation.isPending) onChange(!value);
                              },
                            } as unknown as TouchableOpacityProps) : undefined)}
                            ref={ref}
                            style={styles.checkboxRow}
                            onPress={() => onChange(!value)}
                            activeOpacity={0.8}
                            disabled={registerMutation.isPending}
                            accessibilityRole="checkbox"
                            aria-checked={Boolean(value)}
                            accessibilityState={{
                              checked: Boolean(value),
                              disabled: registerMutation.isPending,
                            }}
                            accessibilityLabel="Acepto la política de privacidad y términos de uso"
                            accessibilityHint={privacyError}
                          >
                            <View style={[styles.checkbox, value && styles.checkboxChecked]}>
                              {value ? (
                                <Text style={styles.checkmark} aria-hidden>
                                  ✓
                                </Text>
                              ) : null}
                            </View>
                            <Text style={styles.checkboxLabel}>
                              Acepto la política de privacidad y términos de uso
                            </Text>
                          </TouchableOpacity>
                          {privacyError ? (
                            <Text nativeID={privacyErrorId} style={styles.checkboxError} accessibilityLiveRegion="polite">
                              {privacyError}
                            </Text>
                          ) : null}
                        </View>
                      )}
                    />

                    {errors.root ? (
                      <Text style={styles.rootError} role="alert" aria-live="assertive">
                        {errors.root.message}
                      </Text>
                    ) : null}

                    <PrimaryButton
                      label="Crear cuenta"
                      loadingLabel="Creando cuenta…"
                      onPress={handleSubmit(onSubmit)}
                      loading={registerMutation.isPending}
                      disabled={registerMutation.isPending}
                    />
                  </View>
                </View>
              </BaseCard>
              {!isWide ? loginLink : null}
            </View>
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
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xxl,
    paddingBottom: theme.spacing.xxxl,
  },
  scrollContentWide: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xxxl,
  },
  layout: {
    width: '100%',
    maxWidth: 560,
    gap: theme.spacing.xxl,
  },
  layoutWide: {
    maxWidth: 960,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: theme.spacing.xxxl,
  },
  intro: {
    width: '100%',
  },
  introWide: {
    width: 280,
    paddingTop: theme.spacing.xl,
  },
  brand: {
    color: theme.colors.primary,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: theme.spacing.lg,
  },
  title: {
    color: theme.colors.textPrimary,
    ...theme.typography.heading1,
    marginBottom: theme.spacing.md,
  },
  titleWide: {
    ...theme.typography.display,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    ...theme.typography.body,
  },
  nextStep: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    marginTop: theme.spacing.xxl,
    paddingTop: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  nextStepTitle: {
    color: theme.colors.textPrimary,
    ...theme.typography.small,
    fontWeight: '600',
  },
  nextStepText: {
    color: theme.colors.textSecondary,
    ...theme.typography.small,
  },
  formColumn: {
    width: '100%',
  },
  formColumnWide: {
    width: 520,
  },
  formCard: {
    padding: theme.spacing.xl,
  },
  formCardCompact: {
    padding: 20,
  },
  form: {
    gap: theme.spacing.xxl,
  },
  section: {
    gap: theme.spacing.lg,
  },
  sectionTitle: {
    color: theme.colors.textPrimary,
    ...theme.typography.bodyStrong,
  },
  fields: {
    gap: theme.spacing.xl,
  },
  fieldGroup: {
    gap: theme.spacing.sm,
  },
  fieldError: {
    color: REGISTER_ERROR_COLOR,
    ...theme.typography.small,
  },
  requirementsBox: {
    gap: theme.spacing.sm,
  },
  requirementsSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  requirementsTitle: {
    color: theme.colors.textSecondary,
    ...theme.typography.small,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
  },
  requirementIcon: {
    width: 16,
    textAlign: 'center',
    color: theme.colors.textSecondary,
    ...theme.typography.small,
  },
  requirementMet: {
    color: theme.colors.success,
  },
  requirementText: {
    flex: 1,
    color: theme.colors.textSecondary,
    ...theme.typography.small,
  },
  requirementStatusMet: {
    color: theme.colors.success,
    ...theme.typography.small,
    fontWeight: '600',
  },
  requirementStatusPending: {
    color: theme.colors.textSecondary,
    ...theme.typography.small,
  },
  matchText: {
    color: theme.colors.success,
    ...theme.typography.small,
  },
  actions: {
    gap: theme.spacing.xl,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    minHeight: 48,
    minWidth: 44,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.colors.textSecondary,
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
    ...theme.typography.small,
    flex: 1,
  },
  checkboxError: {
    color: REGISTER_ERROR_COLOR,
    ...theme.typography.small,
    marginTop: theme.spacing.sm,
  },
  rootError: {
    color: REGISTER_ERROR_COLOR,
    ...theme.typography.small,
  },
  footerLink: {
    minHeight: 44,
    justifyContent: 'center',
    marginTop: theme.spacing.xl,
  },
  footerText: {
    color: theme.colors.textSecondary,
    ...theme.typography.small,
  },
  footerTextBold: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
});

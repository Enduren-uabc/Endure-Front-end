import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AlertCircle, Mail, RotateCcw } from 'lucide-react-native';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { useGoogleAuth } from '@/features/auth/hooks/use-social-auth';
import { theme } from '@/theme';
import type { AuthStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'OAuthError'>;

export default function OAuthErrorScreen({ navigation, route }: Props) {
  const { login: retryGoogle, isPending } = useGoogleAuth();
  const { provider, reason, message } = route.params;
  const providerLabel = provider === 'apple' ? 'Apple' : 'Google';
  const isCancelled = reason === 'cancelled';

  const title = isCancelled ? 'Inicio cancelado' : 'No pudimos iniciar sesión';
  const body =
    message ??
    (isCancelled
      ? `Cancelaste el inicio con ${providerLabel}. Puedes intentarlo de nuevo o usar tu correo.`
      : `No se pudo completar el inicio con ${providerLabel}. Intenta de nuevo o usa tu correo.`);

  const handleRetry = React.useCallback(() => {
    if (provider === 'google') {
      retryGoogle();
      return;
    }

    navigation.replace('Welcome');
  }, [navigation, provider, retryGoogle]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <View style={styles.iconFrame}>
          <AlertCircle size={42} color={theme.colors.warning} />
        </View>

        <View style={styles.copy}>
          <Text style={styles.eyebrow}>{providerLabel}</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{body}</Text>
        </View>

        <View style={styles.helpCard}>
          <Text style={styles.helpTitle}>Aún puedes entrar a Endure</Text>
          <Text style={styles.helpText}>
            Tu cuenta no se modificó. Elige otro método o vuelve a intentar el proveedor social.
          </Text>
        </View>

        <View style={styles.footer}>
          <PrimaryButton
            label={isPending ? 'Intentando' : 'Intentar de nuevo'}
            loading={isPending}
            onPress={handleRetry}
            icon={!isPending ? <RotateCcw size={18} color={theme.colors.background} /> : null}
          />
          <SecondaryButton
            label="Usar correo electrónico"
            onPress={() => navigation.replace('Login')}
          />
          <SecondaryButton
            label="Volver al inicio"
            onPress={() => navigation.replace('Welcome')}
            style={styles.tertiaryButton}
          />
        </View>

        <View style={styles.mailRow}>
          <Mail size={16} color={theme.colors.textMuted} />
          <Text style={styles.mailText}>El inicio con correo sigue disponible.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xxl,
    justifyContent: 'center',
    gap: theme.spacing.xl,
  },
  iconFrame: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderWidth: 1,
    borderColor: theme.colors.warning,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  copy: {
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  eyebrow: {
    color: theme.colors.warning,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading1.fontSize,
    lineHeight: theme.typography.heading1.lineHeight,
    fontWeight: theme.typography.heading1.fontWeight,
    textAlign: 'center',
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    textAlign: 'center',
  },
  helpCard: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.xs,
  },
  helpTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: theme.typography.bodyStrong.fontWeight,
  },
  helpText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  footer: {
    gap: theme.spacing.md,
  },
  tertiaryButton: {
    borderColor: theme.colors.border,
  },
  mailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  mailText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
});

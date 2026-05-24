import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Clock3, Home, LogIn } from 'lucide-react-native';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { useSessionStore } from '@/features/auth/stores/session-store';
import { theme } from '@/theme';
import type { AuthStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'SessionExpired'>;

export default function SessionExpiredScreen({ navigation }: Props) {
  const dismissSessionExpiredNotice = useSessionStore((s) => s.dismissSessionExpiredNotice);
  const [isRedirecting, setIsRedirecting] = React.useState(false);

  const goToLogin = React.useCallback(() => {
    setIsRedirecting(true);
    dismissSessionExpiredNotice();
    navigation.replace('Login');
  }, [dismissSessionExpiredNotice, navigation]);

  const goToWelcome = React.useCallback(() => {
    dismissSessionExpiredNotice();
    navigation.replace('Welcome');
  }, [dismissSessionExpiredNotice, navigation]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <View style={styles.iconFrame}>
          <Clock3 size={42} color={theme.colors.primary} />
        </View>

        <View style={styles.copy}>
          <Text style={styles.eyebrow}>Acceso protegido</Text>
          <Text style={styles.title}>Tu sesión expiró</Text>
          <Text style={styles.subtitle}>
            Inicia sesión nuevamente para continuar usando Endure.
          </Text>
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Por seguridad cerramos tu sesión.</Text>
          <Text style={styles.statusText}>
            No se perdió tu progreso guardado. Vuelve a entrar para seguir entrenando.
          </Text>
        </View>

        <View style={styles.footer}>
          <PrimaryButton
            label={isRedirecting ? 'Redirigiendo' : 'Iniciar sesión'}
            onPress={goToLogin}
            loading={isRedirecting}
            icon={!isRedirecting ? <LogIn size={18} color={theme.colors.background} /> : null}
          />
          <SecondaryButton label="Volver al inicio" onPress={goToWelcome} />
          {isRedirecting ? (
            <View style={styles.redirectRow}>
              <ActivityIndicator color={theme.colors.primary} />
              <Text style={styles.redirectText}>Preparando inicio de sesión...</Text>
            </View>
          ) : null}
        </View>

        <TouchableOpacity style={styles.smallAction} onPress={goToWelcome} activeOpacity={0.8}>
          <Home size={16} color={theme.colors.textSecondary} />
          <Text style={styles.smallActionText}>Ir a la pantalla principal</Text>
        </TouchableOpacity>
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
    backgroundColor: theme.colors.primaryMuted,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  copy: {
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  eyebrow: {
    color: theme.colors.primary,
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
  statusCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.xs,
  },
  statusTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: theme.typography.bodyStrong.fontWeight,
  },
  statusText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  footer: {
    gap: theme.spacing.md,
  },
  redirectRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  redirectText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  smallAction: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  smallActionText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
});

import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AlertCircle, X } from 'lucide-react-native';
import { BaseCard } from '@/components/ui/BaseCard';
import { theme } from '@/theme';

type SocialAuthProvider = 'Google' | 'Apple';

interface SocialAuthNoticeProps {
  provider: SocialAuthProvider;
  message: string;
  retryLoading?: boolean;
  onRetry?: () => void;
  onUseEmail?: () => void;
  onDismiss?: () => void;
}

export function SocialAuthNotice({
  provider,
  message,
  retryLoading = false,
  onRetry,
  onUseEmail,
  onDismiss,
}: SocialAuthNoticeProps) {
  return (
    <BaseCard style={styles.card} accessibilityRole="alert">
      <View style={styles.header}>
        <View style={styles.iconFrame}>
          <AlertCircle size={20} color={theme.colors.error} strokeWidth={1.8} />
        </View>
        <View style={styles.copy}>
          <Text style={styles.title}>{provider} no pudo continuar</Text>
          <Text style={styles.message}>{message}</Text>
        </View>
        {onDismiss && (
          <TouchableOpacity
            onPress={onDismiss}
            style={styles.dismissButton}
            accessibilityRole="button"
            accessibilityLabel="Cerrar mensaje"
            activeOpacity={0.75}
          >
            <X size={18} color={theme.colors.textSecondary} strokeWidth={1.8} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.actions}>
        {onRetry && (
          <TouchableOpacity
            onPress={onRetry}
            disabled={retryLoading}
            style={[styles.actionButton, retryLoading && styles.actionButtonDisabled]}
            accessibilityRole="button"
            activeOpacity={0.75}
          >
            {retryLoading ? (
              <ActivityIndicator size="small" color={theme.colors.background} />
            ) : (
              <Text style={styles.actionButtonText}>Reintentar</Text>
            )}
          </TouchableOpacity>
        )}

        {onUseEmail && (
          <TouchableOpacity
            onPress={onUseEmail}
            style={styles.emailButton}
            accessibilityRole="button"
            activeOpacity={0.75}
          >
            <Text style={styles.emailButtonText}>Usar correo</Text>
          </TouchableOpacity>
        )}
      </View>
    </BaseCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: theme.spacing.md,
    borderColor: theme.colors.error,
  },
  header: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    alignItems: 'flex-start',
  },
  iconFrame: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.35)',
  },
  copy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: theme.typography.bodyStrong.fontWeight,
  },
  message: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  dismissButton: {
    width: 44,
    height: 44,
    marginTop: -theme.spacing.sm,
    marginRight: -theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.full,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionButton: {
    minHeight: 44,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary,
  },
  actionButtonDisabled: {
    backgroundColor: theme.colors.primaryMuted,
  },
  actionButtonText: {
    color: theme.colors.background,
    fontSize: theme.typography.button.fontSize,
    lineHeight: theme.typography.button.lineHeight,
    fontWeight: theme.typography.button.fontWeight,
  },
  emailButton: {
    minHeight: 44,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  emailButtonText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.button.fontSize,
    lineHeight: theme.typography.button.lineHeight,
    fontWeight: theme.typography.button.fontWeight,
  },
});

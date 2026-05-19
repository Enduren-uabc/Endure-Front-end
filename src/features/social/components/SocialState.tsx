import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { BaseCard } from '@/components/ui/BaseCard';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { theme } from '@/theme';

interface SocialStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function SocialLoadingState() {
  return (
    <View style={styles.centerState}>
      <ActivityIndicator color={theme.colors.primary} size="large" />
      <Text style={styles.stateText}>Cargando comunidad...</Text>
    </View>
  );
}

export function SocialEmptyState({ title, message }: SocialStateProps) {
  return (
    <BaseCard style={styles.cardState}>
      <Text style={styles.stateTitle}>{title}</Text>
      <Text style={styles.stateText}>{message}</Text>
    </BaseCard>
  );
}

export function SocialErrorState({ title, message, actionLabel, onAction }: SocialStateProps) {
  return (
    <BaseCard style={styles.cardState}>
      <Text style={styles.stateTitle}>{title}</Text>
      <Text style={styles.stateText}>{message}</Text>
      {actionLabel && onAction ? (
        <View style={styles.action}>
          <PrimaryButton label={actionLabel} onPress={onAction} />
        </View>
      ) : null}
    </BaseCard>
  );
}

const styles = StyleSheet.create({
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.xl,
  },
  cardState: {
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  stateTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading3.fontSize,
    lineHeight: theme.typography.heading3.lineHeight,
    fontWeight: theme.typography.heading3.fontWeight,
  },
  stateText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
  },
  action: {
    marginTop: theme.spacing.md,
  },
});

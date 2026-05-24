import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AlertCircle, Dumbbell, Inbox } from 'lucide-react-native';
import { BaseCard } from '@/components/ui/BaseCard';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { theme } from '@/theme';

interface StateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function TrainingV2EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: StateProps) {
  return (
    <BaseCard style={styles.stateCard}>
      <View style={styles.iconWrap}>
        <Inbox size={32} color={theme.colors.border} />
      </View>
      <Text style={styles.stateTitle}>{title}</Text>
      <Text style={styles.stateDescription}>{description}</Text>
      {actionLabel && onAction ? (
        <PrimaryButton label={actionLabel} onPress={onAction} style={styles.action} />
      ) : null}
    </BaseCard>
  );
}

export function TrainingV2ErrorState({
  title,
  description,
  actionLabel = 'Reintentar',
  onAction,
}: StateProps) {
  return (
    <BaseCard style={styles.stateCard}>
      <View style={[styles.iconWrap, styles.errorIconWrap]}>
        <AlertCircle size={32} color={theme.colors.error} />
      </View>
      <Text style={styles.stateTitle}>{title}</Text>
      <Text style={styles.stateDescription}>{description}</Text>
      {onAction ? (
        <SecondaryButton label={actionLabel} onPress={onAction} style={styles.action} />
      ) : null}
    </BaseCard>
  );
}

export function TrainingV2SkeletonList({ rows = 3 }: { rows?: number }) {
  return (
    <View style={styles.skeletonList}>
      {Array.from({ length: rows }, (_, index) => (
        <BaseCard key={`training-v2-skeleton-${index}`} style={styles.skeletonCard}>
          <View style={styles.skeletonImage} />
          <View style={styles.skeletonLineLarge} />
          <View style={styles.skeletonLine} />
          <View style={styles.skeletonMetaRow}>
            <View style={styles.skeletonPill} />
            <View style={styles.skeletonPill} />
          </View>
        </BaseCard>
      ))}
    </View>
  );
}

export function TrainingV2InlineLoading({ label }: { label: string }) {
  return (
    <View style={styles.inlineLoading}>
      <Dumbbell size={18} color={theme.colors.primary} />
      <Text style={styles.inlineLoadingText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stateCard: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.xs,
  },
  errorIconWrap: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.34)',
  },
  stateTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading3.fontSize,
    lineHeight: theme.typography.heading3.lineHeight,
    fontWeight: theme.typography.heading3.fontWeight,
    textAlign: 'center',
  },
  stateDescription: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    textAlign: 'center',
  },
  action: {
    marginTop: theme.spacing.md,
  },
  skeletonList: {
    gap: theme.spacing.md,
  },
  skeletonCard: {
    gap: theme.spacing.md,
  },
  skeletonImage: {
    height: 140,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceElevated,
  },
  skeletonLineLarge: {
    width: '72%',
    height: 18,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfaceElevated,
  },
  skeletonLine: {
    width: '54%',
    height: 12,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfacePressed,
  },
  skeletonMetaRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  skeletonPill: {
    width: 88,
    height: 28,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfaceElevated,
  },
  inlineLoading: {
    minHeight: 44,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  inlineLoadingText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
});

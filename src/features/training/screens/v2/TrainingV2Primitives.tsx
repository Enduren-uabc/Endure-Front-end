import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput as RNTextInput,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ChevronRight, Search } from 'lucide-react-native';
import { BaseCard } from '@/components/ui/BaseCard';
import { Chip } from '@/components/ui/Chip';
import { DragIndicator } from '@/components/ui/DragIndicator';
import { theme } from '@/theme';
import type { MetricV2, RoutineV2 } from './training-v2.types';

interface ScreenProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  backgroundColor?: string;
  titleColor?: string;
  contentStyle?: StyleProp<ViewStyle>;
  onBack?: () => void;
  showDragIndicator?: boolean;
}

export function TrainingV2Screen({
  title,
  subtitle,
  children,
  footer,
  backgroundColor = theme.colors.background,
  titleColor = theme.colors.primary,
  contentStyle,
  onBack,
  showDragIndicator = false,
}: ScreenProps) {
  return (
    <SafeAreaView style={[styles.screen, { backgroundColor }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, contentStyle]}
      >
        {showDragIndicator ? <DragIndicator position="above" /> : null}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            {onBack ? (
              <TouchableOpacity
                activeOpacity={0.78}
                onPress={onBack}
                style={styles.backButton}
                accessibilityRole="button"
                accessibilityLabel="Volver"
              >
                <ArrowLeft size={22} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            ) : null}
            <View style={styles.headerText}>
              <Text style={[styles.title, { color: titleColor }]}>{title}</Text>
              {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>
          </View>
        </View>
        {children}
      </ScrollView>
      {footer ? <View style={[styles.footer, { backgroundColor }]}>{footer}</View> : null}
    </SafeAreaView>
  );
}

export function TrainingV2SectionHeader({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {actionLabel && onAction ? (
        <TouchableOpacity onPress={onAction} activeOpacity={0.78} style={styles.textAction}>
          <Text style={styles.textActionLabel}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export function TrainingV2SearchField({
  value,
  onChangeText,
  placeholder,
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
}) {
  return (
    <View style={styles.searchField}>
      <Search size={20} color={theme.colors.textMuted} />
      <RNTextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
        selectionColor={theme.colors.primary}
        style={styles.searchInput}
      />
    </View>
  );
}

export function TrainingV2ChipRow({
  options,
  selected,
  onSelect,
}: {
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipRow}
    >
      {options.map((option) => (
        <Chip
          key={option}
          label={option}
          selected={selected === option}
          onPress={() => onSelect(option)}
        />
      ))}
    </ScrollView>
  );
}

export function TrainingV2MetricCard({
  metric,
  onPress,
}: {
  metric: MetricV2;
  onPress?: () => void;
}) {
  const content = (
    <BaseCard style={styles.metricCard}>
      <Text style={styles.metricLabel}>{metric.label}</Text>
      <Text style={styles.metricValue}>{metric.value}</Text>
      <View style={styles.metricFooter}>
        <Text style={styles.metricHelper}>{metric.helper}</Text>
        {metric.trend ? <Text style={styles.metricTrend}>{metric.trend}</Text> : null}
      </View>
    </BaseCard>
  );

  if (!onPress) return content;

  return (
    <TouchableOpacity
      activeOpacity={0.84}
      onPress={onPress}
      style={styles.metricTouchable}
      accessibilityRole="button"
      accessibilityLabel={`Abrir ${metric.label}`}
    >
      {content}
    </TouchableOpacity>
  );
}

export function TrainingV2Tag({ label, tone = 'default' }: { label: string; tone?: 'default' | 'primary' | 'success' }) {
  return (
    <View
      style={[
        styles.tag,
        tone === 'primary' ? styles.primaryTag : null,
        tone === 'success' ? styles.successTag : null,
      ]}
    >
      <Text
        style={[
          styles.tagText,
          tone === 'primary' ? styles.primaryTagText : null,
          tone === 'success' ? styles.successTagText : null,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const DAY_ABBR = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'] as const;

function isDayActive(routineDays: string[], abbr: string): boolean {
  return routineDays.some((d) => d.slice(0, 3).toLowerCase() === abbr.slice(0, 3).toLowerCase());
}

export function TrainingV2RoutineCard({
  routine,
  compact = false,
  onPress,
}: {
  routine: RoutineV2;
  compact?: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity activeOpacity={0.84} onPress={onPress} style={compact ? styles.compactRoutineTouchable : undefined}>
      <BaseCard style={[styles.routineCard, compact ? styles.compactRoutineCard : null]}>
        <View style={styles.dayRow}>
          {DAY_ABBR.map((day) => {
            const active = isDayActive(routine.days, day);
            return (
              <View key={day} style={[styles.dayDot, active && styles.dayDotActive]} />
            );
          })}
        </View>
        <View style={styles.routineBodyCompact}>
          <View style={styles.routineTitleRow}>
            <Text style={styles.routineTitle} numberOfLines={1}>{routine.name}</Text>
            <ChevronRight size={16} color={theme.colors.textMuted} />
          </View>
          {!compact && routine.description ? (
            <Text style={styles.routineDescription} numberOfLines={1}>{routine.description}</Text>
          ) : null}
          <View style={styles.tagRow}>
            <TrainingV2Tag label={`${routine.durationMinutes} min`} />
            <TrainingV2Tag label={routine.level} />
            {!compact ? <TrainingV2Tag label={`${routine.exerciseCount} ej`} /> : null}
            {routine.isMine ? <TrainingV2Tag label="Mia" tone="primary" /> : null}
          </View>
        </View>
      </BaseCard>
    </TouchableOpacity>
  );
}

export function TrainingV2FieldPreview({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <View style={styles.fieldPreview}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
      {helper ? <Text style={styles.fieldHelper}>{helper}</Text> : null}
    </View>
  );
}

export function TrainingV2ProgressBar({
  progress,
  label,
}: {
  progress: number;
  label?: string;
}) {
  const safeProgress = Math.max(0, Math.min(1, progress));
  return (
    <View style={styles.progressWrap}>
      {label ? <Text style={styles.progressLabel}>{label}</Text> : null}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${safeProgress * 100}%` }]} />
      </View>
    </View>
  );
}

export function TrainingV2SheetPreview({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <View style={styles.sheetPreview}>
      <DragIndicator position="inside" />
      <Text style={styles.sheetTitle}>{title}</Text>
      {description ? <Text style={styles.sheetDescription}>{description}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: theme.spacing.lg,
    paddingBottom: 120,
    gap: theme.spacing.lg,
  },
  header: {
    gap: theme.spacing.xs,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  title: {
    fontSize: theme.typography.heading1.fontSize,
    lineHeight: theme.typography.heading1.lineHeight,
    fontWeight: theme.typography.heading1.fontWeight,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading2.fontSize,
    lineHeight: theme.typography.heading2.lineHeight,
    fontWeight: theme.typography.heading2.fontWeight,
  },
  textAction: {
    minHeight: 44,
    paddingHorizontal: theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textActionLabel: {
    color: theme.colors.primary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    fontWeight: '700',
  },
  searchField: {
    minHeight: 52,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceElevated,
    paddingHorizontal: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    paddingVertical: theme.spacing.sm,
  },
  chipRow: {
    gap: theme.spacing.sm,
    paddingRight: theme.spacing.lg,
  },
  metricCard: {
    flex: 1,
    minWidth: 0,
    padding: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  metricTouchable: {
    flex: 1,
  },
  metricLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
  },
  metricValue: {
    color: theme.colors.textPrimary,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800',
  },
  metricFooter: {
    minHeight: 18,
    flexDirection: 'row',
    gap: theme.spacing.xs,
    alignItems: 'center',
  },
  metricHelper: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
  },
  metricTrend: {
    color: theme.colors.success,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    fontWeight: '700',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  tag: {
    minHeight: 28,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryTag: {
    backgroundColor: theme.colors.primaryMuted,
    borderColor: theme.colors.primary,
  },
  successTag: {
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    borderColor: 'rgba(34, 197, 94, 0.34)',
  },
  tagText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    fontWeight: '700',
  },
  primaryTagText: {
    color: theme.colors.primary,
  },
  successTagText: {
    color: theme.colors.success,
  },
  compactRoutineTouchable: {
    width: 200,
  },
  routineCard: {
    padding: 0,
    overflow: 'hidden',
  },
  compactRoutineCard: {
    minHeight: 120,
  },
  dayRow: {
    flexDirection: 'row',
    gap: 6,
    paddingTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  dayDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.surfacePressed,
  },
  dayDotActive: {
    backgroundColor: theme.colors.primary,
  },
  routineBodyCompact: {
    padding: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  routineTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  routineTitle: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: theme.typography.bodyStrong.fontWeight,
  },
  routineDescription: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
  },
  fieldPreview: {
    flex: 1,
    minHeight: 72,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    gap: 2,
  },
  fieldLabel: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
  },
  fieldValue: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: theme.typography.bodyStrong.fontWeight,
  },
  fieldHelper: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
  },
  progressWrap: {
    gap: theme.spacing.xs,
  },
  progressLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  progressTrack: {
    height: 8,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfacePressed,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primary,
  },
  sheetPreview: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },

  sheetTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading3.fontSize,
    lineHeight: theme.typography.heading3.lineHeight,
    fontWeight: theme.typography.heading3.fontWeight,
  },
  sheetDescription: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
  },
});

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronDown, ChevronUp, CheckCircle2, Dumbbell } from 'lucide-react-native';
import { BaseCard } from '@/components/ui/BaseCard';
import { theme } from '@/theme';
import type { ExerciseSummary } from '../types/social.types';

interface ExerciseSummaryCardProps {
  summary: ExerciseSummary;
  expanded?: boolean;
  onToggle?: () => void;
}

function formatVolume(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)}k kg`;
  return `${Math.round(kg)} kg`;
}

function formatDuration(min: number | null): string {
  if (!min) return '—';
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}h ${m}m`;
}

function ExerciseRow({
  name,
  completedSets,
  totalSets,
  volume,
}: {
  name: string;
  completedSets: number;
  totalSets: number;
  volume: number;
}) {
  const allCompleted = completedSets === totalSets && totalSets > 0;
  return (
    <View style={styles.exerciseRow}>
      <View style={styles.exerciseLeft}>
        {allCompleted ? (
          <CheckCircle2 size={16} color={theme.colors.success} />
        ) : (
          <View style={styles.exerciseBullet} />
        )}
        <Text style={styles.exerciseName}>{name}</Text>
      </View>
      <Text style={styles.exerciseStats}>
        {completedSets}/{totalSets} sets · {formatVolume(volume)}
      </Text>
    </View>
  );
}

export function ExerciseSummaryCard({
  summary,
  expanded = false,
  onToggle,
}: ExerciseSummaryCardProps) {
  return (
    <BaseCard style={styles.card}>
      <Pressable
        onPress={onToggle}
        style={styles.header}
        accessibilityRole="button"
        accessibilityLabel={
          expanded ? 'Colapsar resumen' : 'Expandir resumen del entrenamiento'
        }
      >
        <View style={styles.headerLeft}>
          <Dumbbell size={18} color={theme.colors.primary} />
          <View>
            <Text style={styles.headerTitle}>Entrenamiento</Text>
            <Text style={styles.headerRoutine}>{summary.routineName}</Text>
          </View>
        </View>
        {onToggle ? (
          expanded ? (
            <ChevronUp size={20} color={theme.colors.textSecondary} />
          ) : (
            <ChevronDown size={20} color={theme.colors.textSecondary} />
          )
        ) : null}
      </Pressable>

      {expanded ? (
        <View style={styles.expanded}>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Ejercicios</Text>
              <Text style={styles.metricValue}>{summary.totalExercises}</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Sets</Text>
              <Text style={styles.metricValue}>
                {summary.totalCompletedSets}/{summary.totalSets}
              </Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Volumen</Text>
              <Text style={styles.metricValue}>
                {formatVolume(summary.totalVolume)}
              </Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Duración</Text>
              <Text style={styles.metricValue}>
                {formatDuration(summary.durationMinutes)}
              </Text>
            </View>
          </View>

          <View style={styles.exercisesSection}>
            <Text style={styles.exercisesSectionTitle}>Ejercicios</Text>
            {summary.exercises.map((ex) => (
              <ExerciseRow
                key={ex.exerciseId}
                name={ex.exerciseName}
                completedSets={ex.completedSets}
                totalSets={ex.totalSets}
                volume={ex.volume}
              />
            ))}
          </View>
        </View>
      ) : (
        <View style={styles.collapsed}>
          <Text style={styles.collapsedStats}>
            {summary.totalExercises} ejercicios · {summary.totalCompletedSets}/
            {summary.totalSets} sets · {formatVolume(summary.totalVolume)} ·{' '}
            {formatDuration(summary.durationMinutes)}
          </Text>
        </View>
      )}
    </BaseCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 0,
    padding: 0,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  headerTitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerRoutine: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: theme.typography.bodyStrong.fontWeight,
  },
  collapsed: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderSoft,
    paddingTop: theme.spacing.md,
  },
  collapsedStats: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  expanded: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderSoft,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
  },
  metricCard: {
    flex: 1,
    minWidth: '40%',
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    gap: 2,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  metricLabel: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
  },
  metricValue: {
    color: theme.colors.textPrimary,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
  },
  exercisesSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  exercisesSectionTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: theme.typography.bodyStrong.fontWeight,
    marginBottom: theme.spacing.xs,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  exerciseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    flex: 1,
  },
  exerciseBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.border,
  },
  exerciseName: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    flex: 1,
  },
  exerciseStats: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    textAlign: 'right',
  },
});

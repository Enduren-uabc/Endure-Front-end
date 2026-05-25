import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BarChart3, TrendingUp } from 'lucide-react-native';
import { BaseCard } from '@/components/ui/BaseCard';
import { theme } from '@/theme';
import {
  TrainingV2FieldPreview,
  TrainingV2ProgressBar,
  TrainingV2Screen,
  TrainingV2SectionHeader,
} from './TrainingV2Primitives';
import {
  TrainingV2EmptyState,
  TrainingV2ErrorState,
  TrainingV2SkeletonList,
} from './TrainingV2States';
import { useExerciseProgress } from '@/features/training/hooks/use-exercise-progress';
import type { WorkoutStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<WorkoutStackParamList, 'ExerciseProgress'>;

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
    });
  } catch {
    return dateStr;
  }
}

function computeVolume(weight: number, reps: number): number {
  return weight * reps;
}

export default function ExerciseProgressV2Screen({ navigation, route }: Props) {
  const exerciseId = route.params?.exerciseId;
  const returnTo = route.params?.returnTo;
  const { data, isLoading, isError, refetch } = useExerciseProgress(exerciseId);

  function renderContent() {
    if (isLoading) {
      return <TrainingV2SkeletonList rows={3} />;
    }

    if (isError) {
      return (
        <TrainingV2ErrorState
          title="No pudimos cargar tu progreso"
          description="Intenta de nuevo para revisar la evolucion por ejercicio."
          onAction={() => refetch()}
        />
      );
    }

    if (!data || !data.sufficientData || data.records.length < 2) {
      return (
        <TrainingV2EmptyState
          title="Progreso insuficiente"
          description="Completa al menos dos sesiones con este ejercicio para ver tendencias claras."
          actionLabel="Ver historial"
          onAction={() =>
            navigation.navigate('WorkoutHistory', returnTo ? { returnTo } : undefined)
          }
        />
      );
    }

    const records = data.records;
    const bestRecord = records.reduce((best, r) =>
      r.weightUsed > best.weightUsed ? r : best,
    );
    const totalVolume = records.reduce(
      (sum, r) => sum + computeVolume(r.weightUsed, r.repsPerformed),
      0,
    );
    const firstVolume = computeVolume(records[0].weightUsed, records[0].repsPerformed);
    const lastVolume = computeVolume(
      records[records.length - 1].weightUsed,
      records[records.length - 1].repsPerformed,
    );
    const volumeChange =
      firstVolume > 0
        ? `${((lastVolume - firstVolume) / firstVolume) * 100 > 0 ? '+' : ''}${Math.round(((lastVolume - firstVolume) / firstVolume) * 100)}%`
        : '--';
    const maxWeight = bestRecord.weightUsed;
    const maxVolume = records.reduce(
      (max, r) => Math.max(max, computeVolume(r.weightUsed, r.repsPerformed)),
      0,
    );

    return (
      <>
        <BaseCard style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View style={styles.heroIcon}>
              <BarChart3 size={22} color={theme.colors.primary} />
            </View>
            <View style={styles.heroCopy}>
              <Text style={styles.heroTitle}>{data.exerciseName}</Text>
              <Text style={styles.heroText}>
                {records.length} sesiones con datos utiles
              </Text>
            </View>
          </View>
          <TrainingV2ProgressBar
            progress={volumeChange !== '--' ? 0.86 : 0}
            label={
              volumeChange !== '--'
                ? `Tendencia ${volumeChange} en volumen`
                : 'Datos insuficientes para tendencia'
            }
          />
        </BaseCard>

        <View style={styles.metricGrid}>
          <TrainingV2FieldPreview
            label="Mejor set"
            value={`${bestRecord.weightUsed} kg`}
            helper="Peso maximo registrado"
          />
          <TrainingV2FieldPreview
            label="Volumen"
            value={volumeChange}
            helper="Comparado con inicio"
          />
          <TrainingV2FieldPreview
            label="Sesiones"
            value={`${records.length}`}
            helper="Con datos utiles"
          />
        </View>

        <TrainingV2SectionHeader title="Evolucion" />
        <BaseCard style={styles.seriesCard}>
          {records.map((record) => {
            const volume = computeVolume(record.weightUsed, record.repsPerformed);
            const progress = maxVolume > 0 ? volume / maxVolume : 0;

            return (
              <View key={record.sessionId} style={styles.seriesRow}>
                <View style={styles.seriesDate}>
                  <TrendingUp size={16} color={theme.colors.primary} />
                  <Text style={styles.seriesDateText}>
                    {formatDate(record.date)}
                  </Text>
                </View>
                <View style={styles.seriesCopy}>
                  <Text style={styles.seriesTitle}>
                    {record.weightUsed} kg x {record.repsPerformed} reps
                  </Text>
                  <Text style={styles.seriesMeta}>
                    Volumen: {volume.toLocaleString()} kg - {record.setsCompleted}/
                    {record.totalSets} series
                  </Text>
                  <TrainingV2ProgressBar progress={progress} />
                </View>
              </View>
            );
          })}
        </BaseCard>
      </>
    );
  }

  return (
    <TrainingV2Screen
      title="Progreso"
      titleColor={theme.colors.textPrimary}
      subtitle="Evolucion por ejercicio y tendencias."
      onBack={navigation.goBack}
    >
      {renderContent()}
    </TrainingV2Screen>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    gap: theme.spacing.md,
    backgroundColor: theme.colors.surfaceElevated,
  },
  heroHeader: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  heroIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: theme.colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCopy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  heroTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading2.fontSize,
    lineHeight: theme.typography.heading2.lineHeight,
    fontWeight: theme.typography.heading2.fontWeight,
  },
  heroText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
  },
  metricGrid: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  seriesCard: {
    padding: 0,
    overflow: 'hidden',
  },
  seriesRow: {
    minHeight: 92,
    flexDirection: 'row',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  seriesDate: {
    width: 70,
    gap: theme.spacing.xs,
    alignItems: 'flex-start',
  },
  seriesDateText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    fontWeight: '700',
  },
  seriesCopy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  seriesTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: theme.typography.bodyStrong.fontWeight,
  },
  seriesMeta: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
  },
});

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Award, CheckCircle2, Flame, Trophy } from 'lucide-react-native';
import { BaseCard } from '@/components/ui/BaseCard';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { theme } from '@/theme';
import {
  TrainingV2FieldPreview,
  TrainingV2MetricCard,
  TrainingV2ProgressBar,
  TrainingV2Screen,
  TrainingV2SectionHeader,
  TrainingV2Tag,
} from './TrainingV2Primitives';
import { currentRoutineV2, weeklyMetricsV2, workoutHistoryV2 } from './training-v2.mock';
import type { WorkoutStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<WorkoutStackParamList, 'WorkoutFinishSummary'>;

export default function WorkoutFinishSummaryV2Screen({ navigation }: Props) {
  const summary = workoutHistoryV2[0];

  return (
    <TrainingV2Screen
      title="Resumen"
      titleColor={theme.colors.textPrimary}
      subtitle="Buen trabajo. Aqui esta el cierre de tu sesion."
      footer={
        <View style={styles.footerActions}>
          <SecondaryButton
            label="Ver historial"
            onPress={() => navigation.navigate('WorkoutHistory')}
            style={styles.footerButton}
          />
          <PrimaryButton
            label="Listo"
            onPress={() => navigation.navigate('WorkoutStart')}
            style={styles.footerButton}
          />
        </View>
      }
    >
      <BaseCard style={styles.heroCard}>
        <View style={styles.heroIcon}>
          <CheckCircle2 size={34} color={theme.colors.success} />
        </View>
        <Text style={styles.heroTitle}>Entrenamiento completado</Text>
        <Text style={styles.heroText}>{currentRoutineV2.name} quedo registrada con progreso completo.</Text>
        <View style={styles.tagRow}>
          <TrainingV2Tag label={summary.durationLabel} tone="primary" />
          <TrainingV2Tag label={summary.volumeLabel} />
          <TrainingV2Tag label={`${summary.completedSets}/${summary.totalSets} series`} />
        </View>
      </BaseCard>

      <View style={styles.metricsRow}>
        {weeklyMetricsV2.map((metric) => (
          <TrainingV2MetricCard key={metric.id} metric={metric} />
        ))}
      </View>

      <BaseCard style={styles.prCard}>
        <View style={styles.prHeader}>
          <View style={styles.prIcon}>
            <Trophy size={22} color="#F97316" />
          </View>
          <View style={styles.prBody}>
            <Text style={styles.prTitle}>Nuevo PR</Text>
            <Text style={styles.prText}>Sentadilla trasera subio a 62.5 kg con buena tecnica.</Text>
          </View>
        </View>
        <TrainingV2ProgressBar progress={0.86} label="Meta semanal casi completa" />
      </BaseCard>

      <TrainingV2SectionHeader title="Detalle rapido" />
      <View style={styles.detailGrid}>
        <TrainingV2FieldPreview label="Duracion" value={summary.durationLabel} helper="Tiempo activo" />
        <TrainingV2FieldPreview label="Volumen" value={summary.volumeLabel} helper="Carga total" />
      </View>

      <BaseCard style={styles.achievementCard}>
        <Award size={20} color={theme.colors.primary} />
        <Text style={styles.achievementText}>Mantienes una racha de 7 dias con al menos una accion de entrenamiento.</Text>
        <Flame size={20} color="#F97316" />
      </BaseCard>
    </TrainingV2Screen>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.xl,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.34)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading2.fontSize,
    lineHeight: theme.typography.heading2.lineHeight,
    fontWeight: theme.typography.heading2.fontWeight,
    textAlign: 'center',
  },
  heroText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    textAlign: 'center',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.xs,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  prCard: {
    gap: theme.spacing.md,
    borderColor: 'rgba(249, 115, 22, 0.42)',
  },
  prHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  prIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(249, 115, 22, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  prBody: {
    flex: 1,
    gap: 2,
  },
  prTitle: {
    color: '#F97316',
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: theme.typography.bodyStrong.fontWeight,
  },
  prText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  detailGrid: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  achievementText: {
    flex: 1,
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  footerActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  footerButton: {
    flex: 1,
  },
});

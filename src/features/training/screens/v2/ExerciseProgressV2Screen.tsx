import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BarChart3, TrendingUp } from 'lucide-react-native';
import { BaseCard } from '@/components/ui/BaseCard';
import { Chip } from '@/components/ui/Chip';
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
import { exercisesV2 } from './training-v2.mock';
import type { TrainingV2State } from './training-v2.types';
import type { WorkoutStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<WorkoutStackParamList, 'ExerciseProgress'>;

const PERIODS = ['4 semanas', '8 semanas', '12 semanas'];

const progressSeries = [
  { date: '1 may', volume: '2.8k kg', bestSet: '60 kg x 8', progress: 0.62 },
  { date: '8 may', volume: '3.1k kg', bestSet: '62.5 kg x 8', progress: 0.7 },
  { date: '15 may', volume: '3.4k kg', bestSet: '65 kg x 6', progress: 0.78 },
  { date: '22 may', volume: '3.8k kg', bestSet: '67.5 kg x 5', progress: 0.86 },
];

export default function ExerciseProgressV2Screen({ navigation, route }: Props) {
  const visualState: TrainingV2State = 'success';
  const initialExerciseId = route.params?.exerciseId ?? exercisesV2[0]?.id;
  const [selectedExerciseId, setSelectedExerciseId] = React.useState(initialExerciseId);
  const [period, setPeriod] = React.useState(PERIODS[0]);
  const selectedExercise = exercisesV2.find((exercise) => exercise.id === selectedExerciseId);
  const hasEnoughProgress = selectedExerciseId !== 'ex-plank';
  const returnTo = route.params?.returnTo;

  function renderContent() {
    if (visualState === 'loading') return <TrainingV2SkeletonList rows={3} />;

    if (visualState === 'error') {
      return (
        <TrainingV2ErrorState
          title="No pudimos cargar tu progreso"
          description="Intenta de nuevo para revisar la evolucion por ejercicio."
          onAction={() => undefined}
        />
      );
    }

    if (!selectedExercise || !hasEnoughProgress) {
      return (
        <TrainingV2EmptyState
          title="Progreso insuficiente"
          description="Completa al menos dos sesiones con este ejercicio para ver tendencias claras."
          actionLabel="Ver historial"
          onAction={() => navigation.navigate('WorkoutHistory', returnTo ? { returnTo } : undefined)}
        />
      );
    }

    return (
      <>
        <BaseCard style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View style={styles.heroIcon}>
              <BarChart3 size={22} color={theme.colors.primary} />
            </View>
            <View style={styles.heroCopy}>
              <Text style={styles.heroTitle}>{selectedExercise.name}</Text>
              <Text style={styles.heroText}>
                {selectedExercise.primaryMuscle} - {selectedExercise.equipment}
              </Text>
            </View>
          </View>
          <TrainingV2ProgressBar progress={0.86} label="Tendencia positiva en volumen" />
        </BaseCard>

        <View style={styles.metricGrid}>
          <TrainingV2FieldPreview label="Mejor set" value="67.5 kg x 5" helper="Ultimas 4 semanas" />
          <TrainingV2FieldPreview label="Volumen" value="+18%" helper="Comparado con inicio" />
          <TrainingV2FieldPreview label="Sesiones" value="4" helper="Con datos utiles" />
        </View>

        <TrainingV2SectionHeader title="Evolucion" />
        <BaseCard style={styles.seriesCard}>
          {progressSeries.map((point) => (
            <View key={point.date} style={styles.seriesRow}>
              <View style={styles.seriesDate}>
                <TrendingUp size={16} color={theme.colors.primary} />
                <Text style={styles.seriesDateText}>{point.date}</Text>
              </View>
              <View style={styles.seriesCopy}>
                <Text style={styles.seriesTitle}>{point.bestSet}</Text>
                <Text style={styles.seriesMeta}>{point.volume}</Text>
                <TrainingV2ProgressBar progress={point.progress} />
              </View>
            </View>
          ))}
        </BaseCard>
      </>
    );
  }

  return (
    <TrainingV2Screen
      title="Progreso"
      titleColor={theme.colors.textPrimary}
      subtitle="Evolucion por ejercicio y periodo."
      onBack={navigation.goBack}
    >
      <View style={styles.chipRow}>
        {exercisesV2.map((exercise) => (
          <Chip
            key={exercise.id}
            label={exercise.name}
            selected={selectedExerciseId === exercise.id}
            onPress={() => setSelectedExerciseId(exercise.id)}
          />
        ))}
      </View>
      <View style={styles.chipRow}>
        {PERIODS.map((item) => (
          <Chip
            key={item}
            label={item}
            selected={period === item}
            onPress={() => setPeriod(item)}
          />
        ))}
      </View>
      {renderContent()}
    </TrainingV2Screen>
  );
}

const styles = StyleSheet.create({
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
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

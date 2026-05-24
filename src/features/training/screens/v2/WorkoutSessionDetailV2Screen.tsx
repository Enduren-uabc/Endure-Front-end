import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CalendarDays, Dumbbell, Timer, Trophy } from 'lucide-react-native';
import { BaseCard } from '@/components/ui/BaseCard';
import { theme } from '@/theme';
import {
  TrainingV2FieldPreview,
  TrainingV2ProgressBar,
  TrainingV2Screen,
  TrainingV2SectionHeader,
  TrainingV2Tag,
} from './TrainingV2Primitives';
import {
  TrainingV2EmptyState,
  TrainingV2ErrorState,
  TrainingV2SkeletonList,
} from './TrainingV2States';
import { exercisesV2, workoutHistoryV2 } from './training-v2.mock';
import type { TrainingV2State } from './training-v2.types';
import type { WorkoutStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<WorkoutStackParamList, 'WorkoutSessionDetail'>;

export default function WorkoutSessionDetailV2Screen({ navigation, route }: Props) {
  const visualState: TrainingV2State = 'success';
  const session = workoutHistoryV2.find((item) => item.id === route.params.sessionId);
  const returnTo = route.params.returnTo;

  function renderContent() {
    if (visualState === 'loading') return <TrainingV2SkeletonList rows={3} />;

    if (visualState === 'error') {
      return (
        <TrainingV2ErrorState
          title="No pudimos cargar la sesion"
          description="Intenta de nuevo para revisar el detalle de este entrenamiento."
          onAction={() => undefined}
        />
      );
    }

    if (!session) {
      return (
        <TrainingV2EmptyState
          title="Sesion no disponible"
          description="No encontramos detalle para este entrenamiento historico."
          actionLabel="Volver al historial"
          onAction={() => navigation.navigate('WorkoutHistory', returnTo ? { returnTo } : undefined)}
        />
      );
    }

    return (
      <>
        <BaseCard style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View style={styles.heroIcon}>
              <CalendarDays size={22} color={theme.colors.primary} />
            </View>
            <View style={styles.heroCopy}>
              <Text style={styles.heroTitle}>{session.routineName}</Text>
              <Text style={styles.heroText}>{session.dateLabel} - {session.durationLabel}</Text>
            </View>
          </View>
          <View style={styles.tagRow}>
            <TrainingV2Tag label={session.volumeLabel} tone="primary" />
            <TrainingV2Tag label={`${session.completedSets}/${session.totalSets} series`} />
            <TrainingV2Tag label="Historico" />
          </View>
          <TrainingV2ProgressBar
            progress={session.completedSets / session.totalSets}
            label={session.highlight}
          />
        </BaseCard>

        <View style={styles.metricGrid}>
          <TrainingV2FieldPreview label="Duracion" value={session.durationLabel} helper="Total" />
          <TrainingV2FieldPreview label="Volumen" value={session.volumeLabel} helper="Registrado" />
          <TrainingV2FieldPreview
            label="Series"
            value={`${session.completedSets}/${session.totalSets}`}
            helper="Completadas"
          />
        </View>

        <TrainingV2SectionHeader title="Ejercicios registrados" />
        <BaseCard style={styles.exerciseList}>
          {exercisesV2.slice(0, 3).map((exercise, index) => (
            <View key={exercise.id} style={styles.exerciseRow}>
              <View style={styles.exerciseIcon}>
                <Dumbbell size={18} color={theme.colors.primary} />
              </View>
              <View style={styles.exerciseCopy}>
                <Text style={styles.exerciseTitle}>{exercise.name}</Text>
                <Text style={styles.exerciseMeta}>
                  {exercise.sets.length} series - mejor set {exercise.sets[0]?.targetWeightKg ?? 0} kg x{' '}
                  {exercise.sets[0]?.targetReps ?? 0}
                </Text>
              </View>
              <Text style={styles.exerciseOrder}>{index + 1}</Text>
            </View>
          ))}
        </BaseCard>

        <TrainingV2SectionHeader title="Momentos clave" />
        <View style={styles.highlightGrid}>
          <BaseCard style={styles.highlightCard}>
            <Trophy size={20} color="#F97316" />
            <Text style={styles.highlightTitle}>PR detectado</Text>
            <Text style={styles.highlightText}>Mejor volumen semanal en sentadilla.</Text>
          </BaseCard>
          <BaseCard style={styles.highlightCard}>
            <Timer size={20} color={theme.colors.primary} />
            <Text style={styles.highlightTitle}>Descansos estables</Text>
            <Text style={styles.highlightText}>Promedio de 91 segundos por serie.</Text>
          </BaseCard>
        </View>
      </>
    );
  }

  return (
    <TrainingV2Screen
      title="Detalle de sesion"
      titleColor={theme.colors.textPrimary}
      subtitle="Revision completa del entrenamiento registrado."
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
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  metricGrid: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  exerciseList: {
    padding: 0,
    overflow: 'hidden',
  },
  exerciseRow: {
    minHeight: 82,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  exerciseIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseCopy: {
    flex: 1,
    gap: 2,
  },
  exerciseTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: theme.typography.bodyStrong.fontWeight,
  },
  exerciseMeta: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  exerciseOrder: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    fontWeight: '800',
  },
  highlightGrid: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  highlightCard: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  highlightTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    fontWeight: '700',
  },
  highlightText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
  },
});

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CalendarDays, Clock, History, Play, RotateCcw } from 'lucide-react-native';
import { BaseCard } from '@/components/ui/BaseCard';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { theme } from '@/theme';
import {
  TrainingV2ChipRow,
  TrainingV2FieldPreview,
  TrainingV2MetricCard,
  TrainingV2Screen,
  TrainingV2SectionHeader,
  TrainingV2Tag,
} from './TrainingV2Primitives';
import { TrainingV2EmptyState } from './TrainingV2States';
import { currentRoutineV2, weeklyMetricsV2, workoutSessionV2 } from './training-v2.mock';
import type { WorkoutStackParamList } from '@/navigation/types';

const dayOptions = ['Hoy', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
type Props = NativeStackScreenProps<WorkoutStackParamList, 'WorkoutStart'>;

export default function WorkoutStartV2Screen({ navigation }: Props) {
  const [selectedDay, setSelectedDay] = React.useState('Hoy');
  const routine = currentRoutineV2;
  const startSession = () =>
    navigation.navigate('WorkoutSession', { sessionId: workoutSessionV2.id });

  return (
    <TrainingV2Screen
      title="Entrenar"
      titleColor={theme.colors.textPrimary}
      subtitle="Elige la rutina del dia y prepara la sesion."
      footer={
        <PrimaryButton
          label="Empezar entrenamiento"
          onPress={startSession}
          icon={<Play size={18} color={theme.colors.background} />}
        />
      }
    >
      <TrainingV2ChipRow options={dayOptions} selected={selectedDay} onSelect={setSelectedDay} />

      {routine ? (
        <BaseCard style={styles.todayCard}>
          <View style={styles.todayHeader}>
            <View style={styles.todayIcon}>
              <CalendarDays size={22} color={theme.colors.primary} />
            </View>
            <View style={styles.todayTitleWrap}>
              <Text style={styles.eyebrow}>Rutina sugerida</Text>
              <Text style={styles.todayTitle}>{routine.name}</Text>
              <Text style={styles.todayDescription}>{routine.description}</Text>
            </View>
          </View>

          <View style={styles.tagRow}>
            <TrainingV2Tag label={`${routine.durationMinutes} min`} tone="primary" />
            <TrainingV2Tag label={`${routine.exerciseCount} ejercicios`} />
            <TrainingV2Tag label={routine.level} />
          </View>

          <View style={styles.metaGrid}>
            <TrainingV2FieldPreview label="Series planeadas" value="12" helper="En esta sesion" />
            <TrainingV2FieldPreview label="Descanso" value={`${workoutSessionV2.restSeconds}s`} helper="Entre series" />
          </View>
        </BaseCard>
      ) : (
        <TrainingV2EmptyState
          title="Hoy no tienes rutina"
          description="Puedes crear una rutina nueva o entrenar de todos modos."
          actionLabel="Crear rutina"
          onAction={startSession}
        />
      )}

      <TrainingV2SectionHeader
        title="Esta semana"
        actionLabel="Historial"
        onAction={() => navigation.navigate('WorkoutHistory')}
      />
      <View style={styles.metricsRow}>
        {weeklyMetricsV2.map((metric) => (
          <TrainingV2MetricCard key={metric.id} metric={metric} />
        ))}
      </View>

      <BaseCard style={styles.resumeCard}>
        <View style={styles.resumeIcon}>
          <RotateCcw size={20} color={theme.colors.primary} />
        </View>
        <View style={styles.resumeBody}>
          <Text style={styles.resumeTitle}>Sesion anterior</Text>
          <Text style={styles.resumeText}>Terminaste fuerza full body en 46 min con volumen estable.</Text>
        </View>
        <History size={20} color={theme.colors.textMuted} />
      </BaseCard>

      <BaseCard style={styles.restCard}>
        <Clock size={20} color={theme.colors.textSecondary} />
        <Text style={styles.restText}>Si hoy es descanso, conserva movilidad suave y vuelve al plan manana.</Text>
      </BaseCard>

      <SecondaryButton label="Entrenar de todos modos" onPress={startSession} />
    </TrainingV2Screen>
  );
}

const styles = StyleSheet.create({
  todayCard: {
    gap: theme.spacing.lg,
  },
  todayHeader: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  todayIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayTitleWrap: {
    flex: 1,
    gap: 2,
  },
  eyebrow: {
    color: theme.colors.primary,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    fontWeight: '800',
  },
  todayTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading2.fontSize,
    lineHeight: theme.typography.heading2.lineHeight,
    fontWeight: theme.typography.heading2.fontWeight,
  },
  todayDescription: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  metaGrid: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  resumeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  resumeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resumeBody: {
    flex: 1,
    gap: 2,
  },
  resumeTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: theme.typography.bodyStrong.fontWeight,
  },
  resumeText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  restCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  restText: {
    flex: 1,
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
});

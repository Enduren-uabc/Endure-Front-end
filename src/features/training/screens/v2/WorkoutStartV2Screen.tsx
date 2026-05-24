import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AlertCircle, CalendarDays, Clock, Play, RefreshCcw } from 'lucide-react-native';
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
import { useRoutines } from '@/features/training/hooks/use-routines';
import { useWeeklyStats } from '@/features/home/hooks/use-home-data';
import { useWorkoutSessionInProgress, useStartWorkoutSession } from '@/features/training/hooks/use-workout-session';
import type { WorkoutStackParamList } from '@/navigation/types';

const dayOptions = ['Hoy', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
type Props = NativeStackScreenProps<WorkoutStackParamList, 'WorkoutStart'>;

export default function WorkoutStartV2Screen({ navigation }: Props) {
  const [selectedDay, setSelectedDay] = React.useState('Hoy');
  const { data: routines, isLoading: routinesLoading, isError: routinesError, refetch: refetchRoutines } = useRoutines();
  const { data: weeklyStats, isLoading: statsLoading } = useWeeklyStats();
  const { data: inProgressSession } = useWorkoutSessionInProgress();
  const startSessionMutation = useStartWorkoutSession();

  const activeRoutine = routines?.find((r) => r.isActive) ?? null;
  const exerciseCount = activeRoutine
    ? activeRoutine.days.reduce((sum, d) => sum + d.exercises.length, 0)
    : 0;

  const startSession = React.useCallback(() => {
    if (inProgressSession) {
      navigation.navigate('WorkoutSession', { sessionId: inProgressSession.id });
      return;
    }
    if (activeRoutine) {
      startSessionMutation.mutate(
        { routineId: activeRoutine.id, dayOfWeek: activeRoutine.dayOfWeeks[0] },
        {
          onSuccess: (session) => {
            navigation.navigate('WorkoutSession', { sessionId: session.id });
          },
        },
      );
    }
  }, [activeRoutine, inProgressSession, startSessionMutation, navigation]);

  const isLoading = routinesLoading || statsLoading;

  const weeklyMetrics = [
    {
      id: 'workouts',
      label: 'Entrenamientos',
      value: weeklyStats ? `${weeklyStats.completedWorkouts}` : '--',
      helper: weeklyStats ? 'Esta semana' : 'Sin datos',
    },
    {
      id: 'volume',
      label: 'Volumen',
      value: weeklyStats ? `${(weeklyStats.totalVolumeKg / 1000).toFixed(1)}k` : '--',
      helper: weeklyStats ? 'kg acumulados' : 'Sin datos',
      trend: weeklyStats ? '+0%' : undefined,
    },
    {
      id: 'time',
      label: 'Tiempo activo',
      value: weeklyStats
        ? `${Math.floor(weeklyStats.activeMinutes / 60)}h ${weeklyStats.activeMinutes % 60}m`
        : '--',
      helper: weeklyStats ? 'Esta semana' : 'Sin datos',
    },
  ];

  if (isLoading) {
    return (
      <TrainingV2Screen title="Entrenar" titleColor={theme.colors.textPrimary} subtitle="Preparando tu sesion...">
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.primary} size="large" />
          <Text style={styles.centerText}>Cargando tus datos de entrenamiento...</Text>
        </View>
      </TrainingV2Screen>
    );
  }

  if (routinesError) {
    return (
      <TrainingV2Screen title="Entrenar" titleColor={theme.colors.textPrimary} subtitle="No pudimos cargar los datos">
        <View style={styles.center}>
          <AlertCircle size={44} color={theme.colors.error} />
          <Text style={styles.centerText}>Revisa tu conexion e intenta de nuevo.</Text>
          <SecondaryButton label="Reintentar" onPress={() => refetchRoutines()} />
        </View>
      </TrainingV2Screen>
    );
  }

  return (
    <TrainingV2Screen
      title="Entrenar"
      titleColor={theme.colors.textPrimary}
      subtitle={inProgressSession ? 'Tienes una sesion en progreso' : 'Elige la rutina del dia y prepara la sesion.'}
      footer={
        <PrimaryButton
          label={startSessionMutation.isPending ? 'Iniciando...' : inProgressSession ? 'Continuar sesion' : 'Empezar entrenamiento'}
          onPress={startSession}
          loading={startSessionMutation.isPending}
          disabled={!activeRoutine && !inProgressSession}
          icon={<Play size={18} color={theme.colors.background} />}
        />
      }
    >
      <TrainingV2ChipRow options={dayOptions} selected={selectedDay} onSelect={setSelectedDay} />

      {activeRoutine ? (
        <BaseCard style={styles.todayCard}>
          <View style={styles.todayHeader}>
            <View style={styles.todayIcon}>
              <CalendarDays size={22} color={theme.colors.primary} />
            </View>
            <View style={styles.todayTitleWrap}>
              <Text style={styles.eyebrow}>Rutina activa</Text>
              <Text style={styles.todayTitle}>{activeRoutine.name}</Text>
              {activeRoutine.description ? (
                <Text style={styles.todayDescription}>{activeRoutine.description}</Text>
              ) : null}
            </View>
          </View>

          <View style={styles.tagRow}>
            <TrainingV2Tag label={`${exerciseCount} ejercicios`} tone="primary" />
            <TrainingV2Tag label={`${activeRoutine.dayOfWeeks.length} dias`} />
          </View>

          <View style={styles.metaGrid}>
            <TrainingV2FieldPreview label="Dias" value={`${activeRoutine.dayOfWeeks.length}`} helper="Por semana" />
            <TrainingV2FieldPreview label="Ejercicios" value={`${exerciseCount}`} helper="Totales" />
          </View>
        </BaseCard>
      ) : (
        <TrainingV2EmptyState
          title="Hoy no tienes rutina activa"
          description="Activa una rutina desde la lista para empezar a entrenar."
          actionLabel="Ver rutinas"
          onAction={() => navigation.navigate('WorkoutHistory')}
        />
      )}

      <TrainingV2SectionHeader
        title="Esta semana"
        actionLabel="Historial"
        onAction={() => navigation.navigate('WorkoutHistory')}
      />
      <View style={styles.metricsRow}>
        {weeklyMetrics.map((metric) => (
          <TrainingV2MetricCard key={metric.id} metric={metric} />
        ))}
      </View>

      <BaseCard style={styles.restCard}>
        <Clock size={20} color={theme.colors.textSecondary} />
        <Text style={styles.restText}>
          {inProgressSession
            ? 'Tienes una sesion sin terminar. Continuarla conservara tu progreso.'
            : 'Si hoy es descanso, conserva movilidad suave y vuelve al plan manana.'}
        </Text>
      </BaseCard>
    </TrainingV2Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.xl,
  },
  centerText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    textAlign: 'center',
  },
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

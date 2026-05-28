import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AlertCircle, CalendarDays, Check, Circle, Dumbbell, Play, Rows3 } from 'lucide-react-native';
import { BaseCard } from '@/components/ui/BaseCard';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { theme } from '@/theme';
import {
  TrainingV2ChipRow,
  TrainingV2Screen,
  TrainingV2SectionHeader,
} from './TrainingV2Primitives';
import { TrainingV2EmptyState } from './TrainingV2States';
import { useRoutines } from '@/features/training/hooks/use-routines';
import { useWorkoutSessionInProgress, useStartWorkoutSession, useWorkoutHistory, useWorkoutSessionDetail } from '@/features/training/hooks/use-workout-session';
import { useWorkoutStats } from '@/features/training/hooks/use-workout-stats';
import { useWeeklyVolume } from '@/features/training/hooks/use-weekly-volume';
import { DAY_OF_WEEK_ORDER, DAY_OF_WEEK_LABELS } from '@/features/training/types/routine';
import type { DayOfWeek } from '@/features/training/types/routine';
import type { WorkoutStackParamList } from '@/navigation/types';

const JS_TO_DAY_OF_WEEK: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const todayDayOfWeek = JS_TO_DAY_OF_WEEK[new Date().getDay()];
const todayLabel = DAY_OF_WEEK_LABELS[todayDayOfWeek];
const dayOptions = DAY_OF_WEEK_ORDER.map((d) => DAY_OF_WEEK_LABELS[d]);
const LABEL_TO_DAY_OF_WEEK: Record<string, DayOfWeek> = {};
for (const d of DAY_OF_WEEK_ORDER) {
  LABEL_TO_DAY_OF_WEEK[DAY_OF_WEEK_LABELS[d]] = d;
}

type Props = NativeStackScreenProps<WorkoutStackParamList, 'WorkoutStart'>;

export default function WorkoutStartV2Screen({ navigation }: Props) {
  const [selectedDay, setSelectedDay] = React.useState(todayLabel);
  const [selectedHistoryDateStr, setSelectedHistoryDateStr] = React.useState<string | null>(null);
  const { data: routines, isLoading: routinesLoading, isError: routinesError, refetch: refetchRoutines } = useRoutines();
  const { data: history, isLoading: historyLoading } = useWorkoutHistory();
  const { data: workoutStats } = useWorkoutStats();
  const { data: weeklyVolume } = useWeeklyVolume();
  const { data: inProgressSession } = useWorkoutSessionInProgress();
  const startSessionMutation = useStartWorkoutSession();

  const activeRoutine =
    routines?.find((r) => (r.targetAudience ?? 'self') === 'self' && r.isActive) ?? null;
  const selectedDayOfWeek = LABEL_TO_DAY_OF_WEEK[selectedDay];
  const selectedRoutineDay = activeRoutine?.days.find((d) => d.dayOfWeek === selectedDayOfWeek) ?? null;
  const dayExercises = selectedRoutineDay?.exercises ?? [];
  const dayExerciseCount = dayExercises.length;
  const dayTotalSets = dayExercises.reduce((sum, ex) => {
    return sum + (Array.isArray(ex.sets) ? ex.sets.length : ex.sets);
  }, 0);

  const now = new Date();
  const currentDay = now.getDay();
  const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);

  const finishedSessions = history?.sessions ?? [];
  const sessionsByDate: Record<string, typeof finishedSessions> = {};
  for (const session of finishedSessions) {
    const dateKey = new Date(session.startedAt).toDateString();
    if (!sessionsByDate[dateKey]) sessionsByDate[dateKey] = [];
    sessionsByDate[dateKey].push(session);
  }

  const hasRoutineDay: Record<string, boolean> = {};
  if (activeRoutine) {
    for (const d of activeRoutine.days) {
      hasRoutineDay[d.dayOfWeek] = true;
    }
  }

  const weekDayInfo = DAY_OF_WEEK_ORDER.map((dow, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    const dateStr = date.toDateString();
    const daySessions = sessionsByDate[dateStr] ?? [];
    const completed = daySessions.length > 0;
    const isToday = date.toDateString() === now.toDateString();
    const isScheduled = hasRoutineDay[dow] ?? false;
    return {
      label: DAY_OF_WEEK_LABELS[dow],
      dayOfWeek: dow,
      dateStr,
      completed,
      isToday,
      isScheduled,
      sessionCount: daySessions.length,
      setsCompleted: daySessions.reduce((sum, s) => sum + (s.exerciseCount ?? 0), 0),
    };
  });

  const selectedHistorySessions = selectedHistoryDateStr ? (sessionsByDate[selectedHistoryDateStr] ?? []) : [];
  const selectedHistorySession = selectedHistorySessions[0] ?? null;
  const selectedHistorySessionId = selectedHistorySession?.id ?? null;
  const { data: historySessionDetail, isLoading: historyDetailLoading } = useWorkoutSessionDetail(selectedHistorySessionId);

  const completedDays = weekDayInfo.filter((d) => d.completed).length;
  const totalDays = weekDayInfo.filter((d) => d.isScheduled).length || 7;
  const currentStreak = workoutStats?.currentStreak ?? 0;

  const startSession = React.useCallback(() => {
    if (inProgressSession) {
      navigation.navigate('WorkoutSession', { sessionId: inProgressSession.id });
      return;
    }
    if (activeRoutine && selectedDayOfWeek) {
      startSessionMutation.mutate(
        { routineId: activeRoutine.id, dayOfWeek: selectedDayOfWeek },
        {
          onSuccess: (session) => {
            navigation.navigate('WorkoutSession', { sessionId: session.id });
          },
        },
      );
    }
  }, [activeRoutine, selectedDayOfWeek, inProgressSession, startSessionMutation, navigation]);

  const isLoading = routinesLoading || historyLoading;

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
              <Text style={styles.eyebrow}>{selectedDay} — {activeRoutine.name}</Text>
              <Text style={styles.todayTitle}>
                {dayExercises.length > 0
                  ? `${dayExerciseCount} ejercicios · ${dayTotalSets} series`
                  : 'Descanso'}
              </Text>
              {dayExercises.length > 0 ? (
                <Text style={styles.todayDescription}>
                  {dayExercises.map((ex) => {
                    const sets = Array.isArray(ex.sets) ? ex.sets.length : ex.sets;
                    return `${ex.name} (${sets} series)`;
                  }).join(', ')}
                </Text>
              ) : (
                <Text style={styles.todayDescription}>No hay ejercicios programados para este dia.</Text>
              )}
            </View>
          </View>

          {dayExercises.length > 0 ? (
            <View style={styles.exerciseList}>
              {dayExercises.map((ex) => {
                const sets = Array.isArray(ex.sets) ? ex.sets.length : ex.sets;
                return (
                  <View key={ex.id} style={styles.exerciseRow}>
                    <View style={styles.exerciseIcon}>
                      <Dumbbell size={18} color={theme.colors.primary} />
                    </View>
                    <Text style={styles.exerciseName}>{ex.order + 1}. {ex.name}</Text>
                    <View style={styles.exerciseSetBadge}>
                      <Rows3 size={14} color={theme.colors.textMuted} />
                      <Text style={styles.exerciseSetText}>{sets}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : null}
        </BaseCard>
      ) : (
        <TrainingV2EmptyState
          title="Hoy no tienes rutina activa"
          description="Activa una rutina desde la lista para empezar a entrenar."
          actionLabel="Ver rutinas"
          onAction={() => navigation.navigate('WorkoutHistory')}
        />
      )}

      {weeklyVolume?.entries && weeklyVolume.entries.length > 0 ? (
        <BaseCard style={styles.weekCard}>
          <View style={styles.volumeRow}>
            <View style={styles.volumeMetric}>
              <Text style={styles.volumeValue}>
                {(weeklyVolume.entries[0]?.totalVolume ?? 0).toLocaleString()}
              </Text>
              <Text style={styles.volumeLabel}>kg esta semana</Text>
            </View>
            <View style={styles.volumeMetric}>
              <Text style={styles.volumeValue}>
                {weeklyVolume.entries[0]?.workoutCount ?? 0}
              </Text>
              <Text style={styles.volumeLabel}>entrenos</Text>
            </View>
            <View style={styles.volumeMetric}>
              <Text style={styles.volumeValue}>
                {weeklyVolume.entries.length > 1
                  ? `+${Math.round(((weeklyVolume.entries[0]?.totalVolume ?? 0) / (weeklyVolume.entries[1]?.totalVolume || 1) - 1) * 100)}%`
                  : '--'}
              </Text>
              <Text style={styles.volumeLabel}>vs semana ant.</Text>
            </View>
          </View>
        </BaseCard>
      ) : null}

      <TrainingV2SectionHeader
        title="Esta semana"
        actionLabel="Historial"
        onAction={() => navigation.navigate('WorkoutHistory')}
      />
      <BaseCard style={styles.weekCard}>
        <View style={styles.weekGrid}>
          {weekDayInfo.map((day) => {
            const isHistSelected = day.dateStr === selectedHistoryDateStr;
            return (
              <TouchableOpacity
                key={day.dayOfWeek}
                activeOpacity={0.7}
                onPress={() => setSelectedHistoryDateStr(
                  selectedHistoryDateStr === day.dateStr ? null : day.dateStr,
                )}
                style={[
                  styles.weekDayCell,
                  day.isToday && styles.weekDayCellToday,
                  isHistSelected && styles.weekDayCellSelected,
                ]}
              >
                <Text style={[
                  styles.weekDayLabel,
                  day.isToday && styles.weekDayLabelToday,
                  isHistSelected && styles.weekDayLabelSelected,
                ]}>
                  {day.label}
                </Text>
                <View style={[
                  styles.weekDayDot,
                  day.completed
                    ? styles.weekDayDotDone
                    : day.isScheduled
                      ? styles.weekDayDotPending
                      : styles.weekDayDotEmpty,
                  day.isToday && styles.weekDayDotToday,
                  isHistSelected && styles.weekDayDotSelected,
                ]}>
                  {day.completed ? (
                    <Check size={12} color={theme.colors.background} />
                  ) : day.isScheduled ? (
                    <View style={styles.weekDayDotInner} />
                  ) : null}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={styles.weekSummary}>
          <Text style={styles.weekSummaryText}>
            {completedDays} de {totalDays} días completados
          </Text>
          {currentStreak > 0 ? (
            <View style={styles.weekStreak}>
              <Circle size={8} color={theme.colors.primary} fill={theme.colors.primary} />
              <Text style={styles.weekStreakText}>Racha actual: {currentStreak} días</Text>
            </View>
          ) : null}
        </View>

        {selectedHistorySession && historySessionDetail ? (
          <View style={styles.historyCard}>
            <View style={styles.historyHeader}>
              <Dumbbell size={18} color={theme.colors.primary} />
              <View style={styles.historyHeaderText}>
                <Text style={styles.historyRoutineName}>{historySessionDetail.routineName}</Text>
                <Text style={styles.historyMeta}>
                  {historySessionDetail.exercises.length} ejercicios
                  {historySessionDetail.durationMinutes
                    ? ` · ${historySessionDetail.durationMinutes} min`
                    : ''}
                </Text>
              </View>
            </View>
            <View style={styles.exerciseList}>
              {historySessionDetail.exercises.map((ex) => {
                const completedSets = ex.workoutSets.filter((s) => s.completed).length;
                return (
                  <View key={ex.exerciseId} style={styles.exerciseRow}>
                    <View style={styles.exerciseIcon}>
                      <Dumbbell size={16} color={theme.colors.primary} />
                    </View>
                    <Text style={styles.exerciseName}>{ex.order + 1}. {ex.exerciseName}</Text>
                    <View style={styles.exerciseSetBadge}>
                      <Text style={styles.historySetText}>{completedSets}/{ex.workoutSets.length}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        ) : selectedHistorySession && historyDetailLoading ? (
          <View style={styles.historyLoading}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={styles.historyLoadingText}>Cargando detalle...</Text>
          </View>
        ) : selectedHistoryDateStr && !selectedHistorySession ? (
          <View style={styles.historyEmpty}>
            <Text style={styles.historyEmptyText}>Sin entrenamiento registrado este dia.</Text>
          </View>
        ) : null}
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
  weekCard: {
    gap: theme.spacing.md,
  },
  weekGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekDayCell: {
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
    borderRadius: theme.radius.md,
    minWidth: 40,
  },
  weekDayCellToday: {
    backgroundColor: theme.colors.primaryMuted,
  },
  weekDayCellSelected: {
    backgroundColor: theme.colors.primaryMuted,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  weekDayLabel: {
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  weekDayLabelToday: {
    color: theme.colors.primary,
  },
  weekDayLabelSelected: {
    color: theme.colors.primary,
  },
  weekDayDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekDayDotDone: {
    backgroundColor: theme.colors.success,
  },
  weekDayDotPending: {
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  weekDayDotEmpty: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: theme.colors.surfaceElevated,
  },
  weekDayDotToday: {
    borderColor: theme.colors.primary,
  },
  weekDayDotSelected: {
    borderColor: theme.colors.primary,
  },
  weekDayDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.textMuted,
  },
  weekSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.md,
  },
  weekSummaryText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  weekStreak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  weekStreakText: {
    color: theme.colors.primary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    fontWeight: '700',
  },
  historyCard: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.md,
    gap: theme.spacing.md,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  historyHeaderText: {
    flex: 1,
    gap: 2,
  },
  historyRoutineName: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: theme.typography.bodyStrong.fontWeight,
  },
  historyMeta: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  historySetText: {
    color: theme.colors.success,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    fontWeight: '700',
  },
  historyLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.lg,
  },
  historyLoadingText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  historyEmpty: {
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
  },
  historyEmptyText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  exerciseList: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  exerciseIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseName: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
  },
  exerciseSetBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 36,
    justifyContent: 'flex-end',
  },
  exerciseSetText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    fontWeight: '700',
  },
  volumeRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: theme.spacing.sm,
  },
  volumeMetric: {
    alignItems: 'center',
    gap: 2,
  },
  volumeValue: {
    color: theme.colors.primary,
    fontSize: theme.typography.heading2.fontSize,
    lineHeight: theme.typography.heading2.lineHeight,
    fontWeight: theme.typography.heading2.fontWeight,
  },
  volumeLabel: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
  },
});

import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation, type NavigationProp, type NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AlertCircle, Bell, CalendarDays, Clock, Flame, Link2, Play, RefreshCcw, Sparkles } from 'lucide-react-native';
import { BaseCard } from '@/components/ui/BaseCard';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { useSessionStore } from '@/features/auth/stores/session-store';
import { theme } from '@/theme';
import type { TrainingStackParamList, WorkoutStackParamList, RootStackParamList } from '@/navigation/types';
import type { UserDrawerParamList } from '@/features/user/types/user-navigation.types';
import type { TrainingV2Level } from '@/features/training/screens/v2/training-v2.types';
import {
  TrainingV2MetricCard,
  TrainingV2RoutineCard,
  TrainingV2Screen,
  TrainingV2SectionHeader,
} from '@/features/training/screens/v2/TrainingV2Primitives';
import { useRoutines } from '@/features/training/hooks/use-routines';
import { useWorkoutHistory, useWorkoutSessionInProgress } from '@/features/training/hooks/use-workout-session';
import { useHomeGreeting, useHomeStats, useHomeUnreadNotifications, useWeeklyStats } from '@/features/home/hooks/use-home-data';
import { useMyTrainer } from '@/features/trainer-link/hooks/use-trainer-link';
import { DAY_OF_WEEK_LABELS } from '@/features/training/types/routine';
import type { Routine } from '@/features/training/types/routine';
import type { RoutineV2 } from '@/features/training/screens/v2/training-v2.types';
import {
  SkeletonGreeting,
  SkeletonTodayCard,
  SkeletonInProgressCard,
  SkeletonMetricCards,
  SkeletonStreakCard,
  SkeletonTrainerCard,
  SkeletonRoutineCards,
} from '@/features/home/components/HomeSkeletons';

type HomeTrainingTabsParamList = {
  Workout: NavigatorScreenParams<WorkoutStackParamList> | undefined;
  Routines: NavigatorScreenParams<TrainingStackParamList> | undefined;
};

function mapRoutineToV2(routine: Routine, experienceLevel?: string | null): RoutineV2 {
  const exerciseCount = routine.days.reduce((sum, d) => sum + d.exercises.length, 0);
  const levelMap: Record<string, TrainingV2Level> = {
    Principiante: 'Principiante',
    Intermedio: 'Intermedio',
    Avanzado: 'Avanzado',
  };

  return {
    id: routine.id,
    name: routine.name,
    type: 'Mias',
    level: levelMap[experienceLevel ?? ''] ?? 'Intermedio',
    durationMinutes: exerciseCount * 4,
    exerciseCount,
    description: routine.description ?? `${routine.dayOfWeeks.length} dias de entrenamiento`,
    goal: routine.isActive ? 'Rutina activa' : 'Rutina',
    days: routine.dayOfWeeks.map((d) => DAY_OF_WEEK_LABELS[d]),
    imageUri: '',
    isMine: true,
    exercises: [],
  };
}

export default function HomeTrainingV2Screen() {
  const navigation = useNavigation<NavigationProp<HomeTrainingTabsParamList>>();
  const drawerNavigation = navigation.getParent<NavigationProp<UserDrawerParamList>>();
  const rootNavigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const role = useSessionStore((state) => state.role);

  const { data: routines, isLoading: routinesLoading, isError: routinesError, refetch: refetchRoutines } = useRoutines();
  const { data: historyData, isLoading: historyLoading, isError: historyError, refetch: refetchHistory } = useWorkoutHistory();
  const { data: weeklyStats, isLoading: statsLoading, isError: statsError } = useWeeklyStats();
  const { data: homeStats, isLoading: homeStatsLoading, isError: homeStatsError } = useHomeStats();
  const { data: unreadNotifications, isLoading: unreadLoading } = useHomeUnreadNotifications();
  const { data: myTrainerData, isLoading: trainerLoading, isError: trainerError } = useMyTrainer();
  const { data: inProgressSession, isLoading: inProgressLoading } = useWorkoutSessionInProgress();
  const greeting = useHomeGreeting();

  const activeRoutine = routines?.find((r) => r.isActive) ?? null;
  const historySessions = historyData?.sessions ?? [];
  const totalExerciseCount = activeRoutine
    ? activeRoutine.days.reduce((sum, d) => sum + d.exercises.length, 0)
    : 0;

  const startWorkout = () => drawerNavigation?.navigate('WorkoutStack', { screen: 'WorkoutStart' });
  const continueWorkout = () => {
    if (inProgressSession) {
      drawerNavigation?.navigate('WorkoutStack', { screen: 'WorkoutSession', params: { sessionId: inProgressSession.id } });
    }
  };
  const openHistory = () => drawerNavigation?.navigate('WorkoutStack', { screen: 'WorkoutHistory' });
  const createRoutine = () =>
    navigation.navigate('Routines', {
      screen: 'RoutineBuilder',
      params: { id: 'new' },
    });
  const openRoutine = (routineId: string) =>
    navigation.navigate('Routines', {
      screen: 'RoutineDetail',
      params: { id: routineId },
    });
  const openMyTrainer = () =>
    drawerNavigation?.navigate('TrainerLinkStack', { screen: 'MyTrainer' });
  const openSearchTrainer = () =>
    drawerNavigation?.navigate('TrainerLinkStack', { screen: 'SearchTrainer' });
  const openNotifications = () =>
    rootNavigation.navigate('RemindersStack', { screen: 'NotificationList' });

  const isClient = role !== 'trainer';
  const unreadCount = unreadNotifications?.count ?? 0;
  const hasTrainer = myTrainerData?.hasTrainer ?? false;
  const trainer = myTrainerData?.trainer;

  const isLoading = routinesLoading || historyLoading || statsLoading || homeStatsLoading || unreadLoading || trainerLoading || inProgressLoading;
  const hasAnyError = routinesError || historyError || statsError || homeStatsError || trainerError;

  const weeklyMetrics = [
    {
      id: 'workouts',
      label: 'Entrenamientos',
      value: homeStats ? `${homeStats.totalWorkouts}` : (weeklyStats ? `${weeklyStats.completedWorkouts}` : '--'),
      helper: 'Total completados',
    },
    {
      id: 'volume',
      label: 'Volumen',
      value: weeklyStats ? `${(weeklyStats.totalVolumeKg / 1000).toFixed(1)}k` : '--',
      helper: weeklyStats ? 'kg acumulados' : 'Sin datos',
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

  return (
    <TrainingV2Screen
      title="Inicio"
      subtitle={greeting.dateLabel}
    >
      {greeting.name ? (
        <View style={styles.greeting}>
          <Text style={styles.greetingText}>
            Hola, {greeting.name.split(' ')[0]}
          </Text>
          <Text style={styles.greetingSubtext}>Tu rutina y tu progreso, sin complicarlo.</Text>
        </View>
      ) : (
        <SkeletonGreeting />
      )}

      {unreadCount > 0 ? (
        <TouchableOpacity activeOpacity={0.84} onPress={openNotifications} style={styles.notificationBanner}>
          <Bell size={18} color={theme.colors.primary} />
          <Text style={styles.notificationText}>
            Tienes {unreadCount} notificacion{unreadCount !== 1 ? 'es' : ''} sin leer
          </Text>
        </TouchableOpacity>
      ) : null}

      {inProgressLoading ? (
        <SkeletonInProgressCard />
      ) : inProgressSession ? (
        <BaseCard style={styles.inProgressCard}>
          <View style={styles.todayHeader}>
            <View style={styles.todayIcon}>
              <Clock size={22} color={theme.colors.primary} />
            </View>
            <View style={styles.todayBody}>
              <Text style={styles.todayLabel}>Entrenamiento en progreso</Text>
              <Text style={styles.todayTitle}>Sesion activa</Text>
              <Text style={styles.todayDescription}>
                {inProgressSession.exercises.length} ejercicios · Dia {inProgressSession.dayOfWeek}
              </Text>
            </View>
          </View>
          <PrimaryButton
            label="Continuar entrenamiento"
            onPress={continueWorkout}
            icon={<Play size={18} color={theme.colors.background} />}
          />
        </BaseCard>
      ) : null}

      {routinesLoading ? (
        <SkeletonTodayCard />
      ) : activeRoutine ? (
        <BaseCard style={styles.todayCard}>
          <View style={styles.todayHeader}>
            <View style={styles.todayIcon}>
              <CalendarDays size={22} color={theme.colors.primary} />
            </View>
            <View style={styles.todayBody}>
              <Text style={styles.todayLabel}>Hoy</Text>
              <Text style={styles.todayTitle}>{activeRoutine.name}</Text>
              <Text style={styles.todayDescription}>
                {totalExerciseCount} ejercicios · {activeRoutine.dayOfWeeks.length} dias
              </Text>
            </View>
          </View>
          <PrimaryButton
            label="Empezar entrenamiento"
            onPress={startWorkout}
            icon={<Play size={18} color={theme.colors.background} />}
          />
        </BaseCard>
      ) : (
        <BaseCard style={styles.todayCard}>
          <View style={styles.todayHeader}>
            <View style={styles.todayIcon}>
              <CalendarDays size={22} color={theme.colors.primary} />
            </View>
            <View style={styles.todayBody}>
              <Text style={styles.todayLabel}>Hoy</Text>
              <Text style={styles.todayTitle}>Sin rutina activa</Text>
              <Text style={styles.todayDescription}>Crea tu primera rutina para empezar.</Text>
            </View>
          </View>
          <SecondaryButton label="Crear rutina" onPress={createRoutine} />
        </BaseCard>
      )}

      <TrainingV2SectionHeader title="Esta semana" actionLabel="Ver historial" onAction={openHistory} />
      {statsLoading || homeStatsLoading ? (
        <SkeletonMetricCards />
      ) : (
        <View style={styles.metricsRow}>
          {weeklyMetrics.map((metric) => (
            <TrainingV2MetricCard key={metric.id} metric={metric} />
          ))}
        </View>
      )}

      {homeStatsLoading ? (
        <SkeletonStreakCard />
      ) : (
        <BaseCard style={styles.streakCard}>
          <View style={styles.streakIcon}>
            <Flame size={22} color="#F97316" />
          </View>
          <View style={styles.streakBody}>
            <Text style={styles.streakTitle}>
              {homeStats && homeStats.currentStreak > 0
                ? `${homeStats.currentStreak} dia${homeStats.currentStreak !== 1 ? 's' : ''} de racha`
                : (historySessions.length > 0
                    ? `${historySessions.length} entrenamiento${historySessions.length !== 1 ? 's' : ''} completados`
                    : 'Aun sin entrenamientos')}
            </Text>
            <Text style={styles.streakText}>
              {homeStats && homeStats.currentStreak > 0
                ? `Llevas ${homeStats.currentStreak} dia${homeStats.currentStreak !== 1 ? 's' : ''} consecutivos entrenando. ¡Sigue asi!`
                : (historySessions.length > 0
                    ? `${historySessions.length} sesion${historySessions.length !== 1 ? 'es' : ''} registrada${historySessions.length !== 1 ? 's' : ''} en tu historial.`
                    : 'Completa tu primer entrenamiento para ver tu progreso aqui.')}
            </Text>
          </View>
          <View style={styles.streakDots}>
            {Array.from({ length: 7 }, (_, index) => {
              const currentStreak = homeStats?.currentStreak ?? 0;
              return (
                <View
                  key={`home-v2-dot-${index}`}
                  style={[styles.streakDot, index < currentStreak ? styles.streakDotActive : null]}
                />
              );
            })}
          </View>
        </BaseCard>
      )}

      {isClient ? (
        trainerLoading ? (
          <SkeletonTrainerCard />
        ) : hasTrainer && trainer ? (
          <BaseCard style={styles.trainerCard}>
            <View style={styles.trainerHeader}>
              <View style={styles.trainerIcon}>
                <Link2 size={22} color={theme.colors.primary} />
              </View>
              <View style={styles.trainerCopy}>
                <Text style={styles.trainerTitle}>Mi entrenador</Text>
                <Text style={styles.trainerText}>
                  {trainer.displayName} {trainer.specialties.length > 0 ? `· ${trainer.specialties.join(', ')}` : ''}
                </Text>
              </View>
            </View>
            <PrimaryButton
              label="Ver mi entrenador"
              onPress={openMyTrainer}
              icon={<Link2 size={18} color={theme.colors.background} />}
            />
          </BaseCard>
        ) : (
          <BaseCard style={styles.trainerCard}>
            <View style={styles.trainerHeader}>
              <View style={styles.trainerIcon}>
                <Link2 size={22} color={theme.colors.primary} />
              </View>
              <View style={styles.trainerCopy}>
                <Text style={styles.trainerTitle}>Mi entrenador</Text>
                <Text style={styles.trainerText}>
                  Revisa tu entrenador vinculado o envia una solicitud si aun no tienes uno.
                </Text>
              </View>
            </View>
            <View style={styles.trainerActions}>
              <PrimaryButton
                label="Ver mi entrenador"
                onPress={openMyTrainer}
                icon={<Link2 size={18} color={theme.colors.background} />}
              />
              <SecondaryButton
                label="Buscar entrenador"
                onPress={openSearchTrainer}
              />
            </View>
          </BaseCard>
        )
      ) : null}

      <TrainingV2SectionHeader title="Para ti" actionLabel="Explorar" onAction={() => navigation.navigate('Routines', { screen: 'RoutinesList' })} />
      {routinesLoading ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestions}>
          <SkeletonRoutineCards />
        </ScrollView>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.suggestions}
        >
          {(routines ?? []).length > 0 ? (
            (routines ?? []).map((routine) => (
              <TrainingV2RoutineCard
                key={routine.id}
                routine={mapRoutineToV2(routine, greeting.experienceLevel)}
                compact
                onPress={() => openRoutine(routine.id)}
              />
            ))
          ) : (
            <BaseCard style={styles.discoveryCard}>
              <Sparkles size={20} color={theme.colors.primary} />
              <Text style={styles.discoveryText}>Aun no tienes rutinas. Crea la primera para empezar.</Text>
              <SecondaryButton label="Crear rutina" onPress={createRoutine} style={styles.discoveryButton} />
            </BaseCard>
          )}
        </ScrollView>
      )}
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
  greeting: {
    gap: 2,
  },
  greetingText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading2.fontSize,
    lineHeight: theme.typography.heading2.lineHeight,
    fontWeight: theme.typography.heading2.fontWeight,
  },
  greetingSubtext: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
  },
  notificationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primaryMuted,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  notificationText: {
    color: theme.colors.primary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: theme.typography.bodyStrong.fontWeight,
  },
  todayCard: {
    gap: theme.spacing.md,
    backgroundColor: theme.colors.surfaceElevated,
  },
  inProgressCard: {
    gap: theme.spacing.md,
    backgroundColor: theme.colors.surfaceElevated,
    borderColor: theme.colors.primary,
    borderWidth: 1,
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
  todayBody: {
    flex: 1,
    gap: 2,
  },
  todayLabel: {
    color: theme.colors.primary,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    fontWeight: '800',
  },
  todayTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading3.fontSize,
    lineHeight: theme.typography.heading3.lineHeight,
    fontWeight: theme.typography.heading3.fontWeight,
  },
  todayDescription: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  streakIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(249, 115, 22, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakBody: {
    flex: 1,
    gap: 2,
  },
  streakTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: theme.typography.bodyStrong.fontWeight,
  },
  streakText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  streakDots: {
    flexDirection: 'row',
    gap: 4,
  },
  streakDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.border,
  },
  streakDotActive: {
    backgroundColor: '#F97316',
  },
  trainerCard: {
    gap: theme.spacing.md,
  },
  trainerHeader: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    alignItems: 'flex-start',
  },
  trainerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trainerCopy: {
    flex: 1,
    gap: 4,
  },
  trainerTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: theme.typography.bodyStrong.fontWeight,
  },
  trainerText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  trainerActions: {
    gap: theme.spacing.sm,
  },
  suggestions: {
    gap: theme.spacing.md,
    paddingRight: theme.spacing.xl,
  },
  discoveryCard: {
    gap: theme.spacing.md,
  },
  discoveryText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  discoveryButton: {
    width: '100%',
  },
});

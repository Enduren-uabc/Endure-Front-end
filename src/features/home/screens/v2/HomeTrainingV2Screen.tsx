import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, type NavigationProp, type NavigatorScreenParams } from '@react-navigation/native';
import { AlertCircle, CalendarDays, Flame, Play, RefreshCcw, Sparkles } from 'lucide-react-native';
import { BaseCard } from '@/components/ui/BaseCard';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { theme } from '@/theme';
import type { TrainingStackParamList, WorkoutStackParamList } from '@/navigation/types';
import {
  TrainingV2MetricCard,
  TrainingV2RoutineCard,
  TrainingV2Screen,
  TrainingV2SectionHeader,
  TrainingV2Tag,
} from '@/features/training/screens/v2/TrainingV2Primitives';
import { useRoutines } from '@/features/training/hooks/use-routines';
import { useWorkoutHistory } from '@/features/training/hooks/use-workout-session';
import { useHomeGreeting, useWeeklyStats } from '@/features/home/hooks/use-home-data';

type HomeTrainingTabsParamList = {
  Workout: NavigatorScreenParams<WorkoutStackParamList> | undefined;
  Routines: NavigatorScreenParams<TrainingStackParamList> | undefined;
};

export default function HomeTrainingV2Screen() {
  const navigation = useNavigation<NavigationProp<HomeTrainingTabsParamList>>();
  const { data: routines, isLoading: routinesLoading, isError: routinesError, refetch: refetchRoutines } = useRoutines();
  const { data: historyData, isLoading: historyLoading, isError: historyError, refetch: refetchHistory } = useWorkoutHistory();
  const greeting = useHomeGreeting();
  const { data: weeklyStats, isLoading: statsLoading, isError: statsError } = useWeeklyStats();

  const activeRoutine = routines?.find((r) => r.isActive) ?? null;
  const historySessions = historyData ?? [];
  const totalExerciseCount = activeRoutine
    ? activeRoutine.days.reduce((sum, d) => sum + d.exercises.length, 0)
    : 0;

  const startWorkout = () => navigation.navigate('Workout', { screen: 'WorkoutStart' });
  const openHistory = () => navigation.navigate('Workout', { screen: 'WorkoutHistory' });
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

  const isLoading = routinesLoading || historyLoading || statsLoading;

  const weeklyMetrics = [
    {
      id: 'workouts',
      label: 'Entrenamientos',
      value: weeklyStats ? `${weeklyStats.completedWorkouts} / 4` : '--',
      helper: weeklyStats ? 'Meta semanal' : 'Sin datos',
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
      <TrainingV2Screen title="Inicio" subtitle="Cargando...">
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.primary} size="large" />
          <Text style={styles.centerText}>Cargando tu progreso...</Text>
        </View>
      </TrainingV2Screen>
    );
  }

  if (routinesError || historyError || statsError) {
    return (
      <TrainingV2Screen title="Inicio" subtitle="No pudimos cargar los datos">
        <View style={styles.center}>
          <AlertCircle size={44} color={theme.colors.error} />
          <Text style={styles.centerText}>Revisa tu conexion e intenta de nuevo.</Text>
          <PrimaryButton
            label="Reintentar"
            onPress={() => { refetchRoutines(); refetchHistory(); }}
            icon={<RefreshCcw size={18} color={theme.colors.background} />}
          />
        </View>
      </TrainingV2Screen>
    );
  }

  return (
    <TrainingV2Screen
      title="Inicio"
      subtitle={greeting.dateLabel}
    >
      <View style={styles.greeting}>
        <Text style={styles.greetingText}>
          {greeting.name ? `Hola, ${greeting.name.split(' ')[0]}` : '¡Bienvenido!'}
        </Text>
        <Text style={styles.greetingSubtext}>Tu rutina y tu progreso, sin complicarlo.</Text>
      </View>

      {activeRoutine ? (
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
      <View style={styles.metricsRow}>
        {weeklyMetrics.map((metric) => (
          <TrainingV2MetricCard key={metric.id} metric={metric} />
        ))}
      </View>

      <BaseCard style={styles.streakCard}>
        <View style={styles.streakIcon}>
          <Flame size={22} color="#F97316" />
        </View>
        <View style={styles.streakBody}>
          <Text style={styles.streakTitle}>
            {historySessions.length > 0
              ? `${historySessions.length} entrenamiento${historySessions.length !== 1 ? 's' : ''} completados`
              : 'Aun sin entrenamientos'}
          </Text>
          <Text style={styles.streakText}>
            {historySessions.length > 0
              ? `${historySessions.length} sesion${historySessions.length !== 1 ? 'es' : ''} registrada${historySessions.length !== 1 ? 's' : ''} en tu historial.`
              : 'Completa tu primer entrenamiento para ver tu progreso aqui.'}
          </Text>
        </View>
        <View style={styles.streakDots}>
          {Array.from({ length: 7 }, (_, index) => (
            <View
              key={`home-v2-dot-${index}`}
              style={[styles.streakDot, index < historySessions.length ? styles.streakDotActive : null]}
            />
          ))}
        </View>
      </BaseCard>

      <TrainingV2SectionHeader
        title="Tus rutinas"
        actionLabel="Explorar"
        onAction={() => navigation.navigate('Routines', { screen: 'RoutinesList' })}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.suggestions}
      >
        {(routines ?? []).length > 0 ? (
          (routines ?? []).map((routine) => (
            <TrainingV2RoutineCard
              key={routine.id}
              routine={{
                id: routine.id,
                name: routine.name,
                type: 'Todas' as const,
                level: 'Intermedio' as const,
                durationMinutes: 45,
                exerciseCount: routine.days.reduce((sum, d) => sum + d.exercises.length, 0),
                description: routine.description ?? `${routine.dayOfWeeks.length} dias de entrenamiento`,
                goal: routine.isActive ? 'Rutina activa' : 'Rutina',
                days: routine.dayOfWeeks.map((d) => d.charAt(0).toUpperCase() + d.slice(1, 3)),
                imageUri: '',
                isMine: true,
                exercises: [],
              }}
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
  todayCard: {
    gap: theme.spacing.md,
    backgroundColor: theme.colors.surfaceElevated,
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
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
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

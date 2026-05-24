import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { CalendarDays, Flame, Link2, Play, Sparkles } from 'lucide-react-native';
import { BaseCard } from '@/components/ui/BaseCard';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { useSessionStore } from '@/features/auth/stores/session-store';
import { theme } from '@/theme';
import type { UserTabsParamList, UserDrawerParamList } from '@/features/user/types/user-navigation.types';
import {
  TrainingV2MetricCard,
  TrainingV2RoutineCard,
  TrainingV2Screen,
  TrainingV2SectionHeader,
  TrainingV2Tag,
} from '@/features/training/screens/v2/TrainingV2Primitives';
import { routinesV2, weeklyMetricsV2 } from '@/features/training/screens/v2/training-v2.mock';

export default function HomeTrainingV2Screen() {
  const navigation = useNavigation<NavigationProp<UserTabsParamList>>();
  const drawerNavigation = navigation.getParent<NavigationProp<UserDrawerParamList>>();
  const role = useSessionStore((state) => state.role);
  const todayRoutine = routinesV2[0];
  const startWorkout = () => drawerNavigation?.navigate('WorkoutStack', { screen: 'WorkoutStart' });
  const openHistory = () => drawerNavigation?.navigate('WorkoutStack', { screen: 'WorkoutHistory' });
  const openExerciseProgress = () =>
    drawerNavigation?.navigate('WorkoutStack', {
      screen: 'ExerciseProgress',
      params: { exerciseId: 'ex-squat' },
    });
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
  const isClient = role !== 'trainer';

  return (
    <TrainingV2Screen
      title="Inicio"
      subtitle="Domingo, 24 de mayo"
    >
      <View style={styles.greeting}>
        <Text style={styles.greetingText}>Hola, Gerardo</Text>
        <Text style={styles.greetingSubtext}>Tu rutina y tu progreso, sin complicarlo.</Text>
      </View>

      <BaseCard style={styles.todayCard}>
        <View style={styles.todayHeader}>
          <View style={styles.todayIcon}>
            <CalendarDays size={22} color={theme.colors.primary} />
          </View>
          <View style={styles.todayBody}>
            <Text style={styles.todayLabel}>Hoy</Text>
            <Text style={styles.todayTitle}>{todayRoutine.name}</Text>
            <Text style={styles.todayDescription}>{todayRoutine.durationMinutes} min - {todayRoutine.exerciseCount} ejercicios</Text>
          </View>
        </View>
        <View style={styles.tagRow}>
          <TrainingV2Tag label={todayRoutine.level} />
          <TrainingV2Tag label={todayRoutine.goal} tone="primary" />
        </View>
        <PrimaryButton
          label="Empezar entrenamiento"
          onPress={startWorkout}
          icon={<Play size={18} color={theme.colors.background} />}
        />
      </BaseCard>

      <TrainingV2SectionHeader title="Esta semana" actionLabel="Ver historial" onAction={openHistory} />
      <View style={styles.metricsRow}>
        {weeklyMetricsV2.map((metric) => (
          <TrainingV2MetricCard
            key={metric.id}
            metric={metric}
            onPress={metric.id === 'volume' ? openExerciseProgress : openHistory}
          />
        ))}
      </View>

      <BaseCard style={styles.streakCard}>
        <View style={styles.streakIcon}>
          <Flame size={22} color="#F97316" />
        </View>
        <View style={styles.streakBody}>
          <Text style={styles.streakTitle}>Racha de 7 dias</Text>
          <Text style={styles.streakText}>Cinco entrenamientos y dos dias de movilidad activa.</Text>
        </View>
        <View style={styles.streakDots}>
          {Array.from({ length: 7 }, (_, index) => (
            <View
              key={`home-v2-dot-${index}`}
              style={[styles.streakDot, index < 5 ? styles.streakDotActive : null]}
            />
          ))}
        </View>
      </BaseCard>

      {isClient ? (
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
      ) : null}

      <TrainingV2SectionHeader title="Para ti" actionLabel="Explorar" onAction={() => navigation.navigate('Routines', { screen: 'RoutinesList' })} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.suggestions}
      >
        {routinesV2.map((routine) => (
          <TrainingV2RoutineCard
            key={routine.id}
            routine={routine}
            compact
            onPress={() => openRoutine(routine.id)}
          />
        ))}
      </ScrollView>

      <BaseCard style={styles.discoveryCard}>
        <Sparkles size={20} color={theme.colors.primary} />
        <Text style={styles.discoveryText}>Las recomendaciones usan datos mock en esta pantalla aislada.</Text>
        <SecondaryButton label="Crear rutina" onPress={createRoutine} style={styles.discoveryButton} />
      </BaseCard>
    </TrainingV2Screen>
  );
}

const styles = StyleSheet.create({
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

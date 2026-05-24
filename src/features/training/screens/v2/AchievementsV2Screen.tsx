import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NavigationProp } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Medal, Sparkles, Trophy } from 'lucide-react-native';
import { BaseCard } from '@/components/ui/BaseCard';
import { theme } from '@/theme';
import {
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
import type { TrainingV2State } from './training-v2.types';
import type { WorkoutStackParamList } from '@/navigation/types';
import type { UserDrawerParamList } from '@/features/user/types/user-navigation.types';

type Props = NativeStackScreenProps<WorkoutStackParamList, 'Achievements'>;

const achievements = [
  {
    id: 'squat-pr',
    title: 'PR en sentadilla',
    value: '67.5 kg x 5',
    date: '22 may',
    helper: 'Mejor set registrado',
  },
  {
    id: 'volume-week',
    title: 'Semana mas fuerte',
    value: '12.4k kg',
    date: 'Esta semana',
    helper: 'Volumen total',
  },
  {
    id: 'streak',
    title: 'Racha constante',
    value: '14 dias',
    date: 'Record personal',
    helper: 'Entrenamiento y movilidad',
  },
];

export default function AchievementsV2Screen({ navigation, route }: Props) {
  const visualState: TrainingV2State = 'success';
  const returnTo = route.params?.returnTo;

  const handleBack = React.useCallback(() => {
    const drawerNavigation = navigation.getParent<NavigationProp<UserDrawerParamList>>();

    if (returnTo === 'Profile' && drawerNavigation) {
      drawerNavigation.navigate('MainTabs', { screen: 'Profile' });
      return;
    }

    navigation.goBack();
  }, [navigation, returnTo]);

  function renderContent() {
    if (visualState === 'loading') return <TrainingV2SkeletonList rows={3} />;

    if (visualState === 'error') {
      return (
        <TrainingV2ErrorState
          title="No pudimos cargar tus logros"
          description="Intenta de nuevo para revisar tus records personales."
          onAction={() => undefined}
        />
      );
    }

    if (achievements.length === 0) {
      return (
        <TrainingV2EmptyState
          title="Aun no hay logros"
          description="Completa entrenamientos para desbloquear records y metas."
          actionLabel="Empezar rutina"
          onAction={() => navigation.navigate('WorkoutStart')}
        />
      );
    }

    return (
      <>
        <BaseCard style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Trophy size={28} color="#F97316" />
          </View>
          <Text style={styles.heroTitle}>3 logros activos</Text>
          <Text style={styles.heroText}>
            Tus mejores marcas se actualizan visualmente con datos locales hasta conectar el
            contrato real de progreso.
          </Text>
          <TrainingV2ProgressBar progress={0.72} label="Meta de consistencia semanal" />
        </BaseCard>

        <TrainingV2SectionHeader title="Records personales" />
        <View style={styles.list}>
          {achievements.map((achievement) => (
            <BaseCard key={achievement.id} style={styles.achievementCard}>
              <View style={styles.achievementIcon}>
                <Medal size={22} color="#F97316" />
              </View>
              <View style={styles.achievementCopy}>
                <Text style={styles.achievementTitle}>{achievement.title}</Text>
                <Text style={styles.achievementValue}>{achievement.value}</Text>
                <Text style={styles.achievementHelper}>{achievement.helper}</Text>
              </View>
              <TrainingV2Tag label={achievement.date} tone="primary" />
            </BaseCard>
          ))}
        </View>

        <BaseCard style={styles.noteCard}>
          <Sparkles size={18} color={theme.colors.primary} />
          <Text style={styles.noteText}>
            El naranja se reserva para PRs y logros, siguiendo `screens/design.md`.
          </Text>
        </BaseCard>
      </>
    );
  }

  return (
    <TrainingV2Screen
      title="Logros y PRs"
      titleColor={theme.colors.textPrimary}
      subtitle="Records personales, rachas y metas alcanzadas."
      onBack={handleBack}
    >
      {renderContent()}
    </TrainingV2Screen>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surfaceElevated,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(249, 115, 22, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.34)',
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
  list: {
    gap: theme.spacing.md,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(249, 115, 22, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementCopy: {
    flex: 1,
    gap: 2,
  },
  achievementTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: theme.typography.bodyStrong.fontWeight,
  },
  achievementValue: {
    color: '#F97316',
    fontSize: theme.typography.heading3.fontSize,
    lineHeight: theme.typography.heading3.lineHeight,
    fontWeight: theme.typography.heading3.fontWeight,
  },
  achievementHelper: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
  },
  noteCard: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  noteText: {
    flex: 1,
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
});

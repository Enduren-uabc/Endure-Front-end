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
import { usePersonalRecords } from '@/features/training/hooks/use-personal-records';
import { useWorkoutStats } from '@/features/training/hooks/use-workout-stats';
import type { WorkoutStackParamList } from '@/navigation/types';
import type { UserDrawerParamList } from '@/features/user/types/user-navigation.types';

type Props = NativeStackScreenProps<WorkoutStackParamList, 'Achievements'>;

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
    });
  } catch {
    return dateStr;
  }
}

export default function AchievementsV2Screen({ navigation, route }: Props) {
  const returnTo = route.params?.returnTo;
  const { data: prData, isLoading: prLoading, isError: prError, refetch: refetchPrs } = usePersonalRecords();
  const { data: stats, isLoading: statsLoading, isError: statsError } = useWorkoutStats();

  const handleBack = React.useCallback(() => {
    const drawerNavigation = navigation.getParent<NavigationProp<UserDrawerParamList>>();

    if (returnTo === 'Profile' && drawerNavigation) {
      drawerNavigation.navigate('MainTabs', { screen: 'Profile' });
      return;
    }

    navigation.goBack();
  }, [navigation, returnTo]);

  const isLoading = prLoading || statsLoading;
  const isError = prError || statsError;

  function renderContent() {
    if (isLoading) {
      return <TrainingV2SkeletonList rows={3} />;
    }

    if (isError) {
      return (
        <TrainingV2ErrorState
          title="No pudimos cargar tus logros"
          description="Intenta de nuevo para revisar tus records personales."
          onAction={() => {
            refetchPrs();
          }}
        />
      );
    }

    const records = prData?.records ?? [];
    const currentStreak = stats?.currentStreak ?? 0;
    const longestStreak = stats?.longestStreak ?? 0;

    if (records.length === 0 && currentStreak === 0) {
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
          <Text style={styles.heroTitle}>
            {records.length > 0
              ? `${records.length} records personales`
              : 'Sin records aun'}
          </Text>
          <Text style={styles.heroText}>
            {currentStreak > 0
              ? `Racha actual de ${currentStreak} dias · Mejor racha: ${longestStreak}d`
              : 'Completa sesiones para establecer nuevas marcas.'}
          </Text>
          <TrainingV2ProgressBar
            progress={longestStreak > 0 ? Math.min(longestStreak / 30, 1) : 0}
            label={`Mejor racha: ${longestStreak} dias`}
          />
        </BaseCard>

        {records.length > 0 ? (
          <>
            <TrainingV2SectionHeader title="Records personales" />
            <View style={styles.list}>
              {records.slice(0, 10).map((record) => (
                <BaseCard key={record.exerciseId} style={styles.achievementCard}>
                  <View style={styles.achievementIcon}>
                    <Medal size={22} color="#F97316" />
                  </View>
                  <View style={styles.achievementCopy}>
                    <Text style={styles.achievementTitle}>{record.exerciseName}</Text>
                    <Text style={styles.achievementValue}>
                      {record.weight} kg x {record.reps} reps
                    </Text>
                    <Text style={styles.achievementHelper}>Mejor set registrado</Text>
                  </View>
                  <TrainingV2Tag label={formatDate(record.date)} tone="primary" />
                </BaseCard>
              ))}
            </View>
          </>
        ) : null}

        <BaseCard style={styles.noteCard}>
          <Sparkles size={18} color={theme.colors.primary} />
          <Text style={styles.noteText}>
            Tus mejores marcas se calculan automaticamente de tus sesiones finalizadas.
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

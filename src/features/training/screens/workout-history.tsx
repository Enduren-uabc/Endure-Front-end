import React from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AlertTriangle, ArrowLeft, ChevronRight, History } from 'lucide-react-native';
import { BaseCard } from '@/components/ui/BaseCard';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useWorkoutHistory } from '@/features/training/hooks/use-workout-session';
import { DAY_OF_WEEK_LABELS } from '@/features/training/types/routine';
import type { WorkoutSessionSummary } from '@/features/training/types/workout-session';
import type { WorkoutStackParamList } from '@/navigation/types';
import { theme } from '@/theme';

type Props = NativeStackScreenProps<WorkoutStackParamList, 'WorkoutHistory'>;

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function formatDuration(durationMinutes: number | null): string {
  if (durationMinutes === null) {
    return 'Sin duración';
  }
  return `${durationMinutes} min`;
}

function WorkoutHistoryItem({
  item,
  onPress,
}: {
  item: WorkoutSessionSummary;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
      <BaseCard style={styles.historyCard}>
        <View style={styles.historyRow}>
          <View style={styles.historyInfo}>
            <Text style={styles.routineName}>{item.routineName}</Text>
            <Text style={styles.historyMeta}>
              {DAY_OF_WEEK_LABELS[item.dayOfWeek]} · {formatDate(item.startedAt)}
            </Text>
            <Text style={styles.historyMeta}>
              {item.exerciseCount} ejercicios · {formatDuration(item.durationMinutes)}
            </Text>
          </View>
          <ChevronRight size={20} color={theme.colors.textMuted} />
        </View>
      </BaseCard>
    </TouchableOpacity>
  );
}

export default function WorkoutHistoryScreen({ navigation }: Props) {
  const historyQuery = useWorkoutHistory();
  const response = historyQuery.data;
  const sessions = response?.sessions ?? [];
  const hasIncompleteData = response?.hasIncompleteData ?? false;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.navigate('WorkoutStart')}
        >
          <ArrowLeft size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Historial</Text>
        <View style={styles.iconButton} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={historyQuery.isRefetching}
            onRefresh={historyQuery.refetch}
            tintColor={theme.colors.primary}
          />
        }
      >
        {historyQuery.isLoading && (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        )}

        {historyQuery.isError && (
          <BaseCard style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Error al cargar historial</Text>
            <PrimaryButton label="Reintentar" onPress={() => historyQuery.refetch()} />
          </BaseCard>
        )}

        {!historyQuery.isLoading && !historyQuery.isError && sessions.length === 0 && (
          <BaseCard style={styles.emptyCard}>
            <History size={42} color={theme.colors.textMuted} />
            <Text style={styles.emptyTitle}>Sin sesiones guardadas</Text>
            <Text style={styles.emptyText}>
              Cuando termines un entrenamiento aparecerá aquí.
            </Text>
          </BaseCard>
        )}

        {hasIncompleteData && (
          <View style={styles.incompleteBanner}>
            <AlertTriangle size={16} color={theme.colors.warning} />
            <Text style={styles.incompleteBannerText}>
              Algunos registros del historial contienen información incompleta y no se muestran.
            </Text>
          </View>
        )}

        {!historyQuery.isLoading &&
          !historyQuery.isError &&
          sessions.map((item) => (
            <WorkoutHistoryItem
              key={item.id}
              item={item}
              onPress={() =>
                navigation.navigate('WorkoutFinishSummary', {
                  sessionId: item.id,
                })
              }
            />
          ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading3.fontSize,
    lineHeight: theme.typography.heading3.lineHeight,
    fontWeight: theme.typography.heading3.fontWeight,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxxl,
    gap: theme.spacing.md,
  },
  center: {
    paddingVertical: theme.spacing.xxxl,
    alignItems: 'center',
  },
  emptyCard: {
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  emptyTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading3.fontSize,
    lineHeight: theme.typography.heading3.lineHeight,
    fontWeight: theme.typography.heading3.fontWeight,
    textAlign: 'center',
  },
  emptyText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    textAlign: 'center',
  },
  incompleteBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.warning + '15',
    borderWidth: 1,
    borderColor: theme.colors.warning + '40',
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
  },
  incompleteBannerText: {
    color: theme.colors.warning,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    flex: 1,
  },
  historyCard: {
    padding: theme.spacing.md,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  historyInfo: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  routineName: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    fontWeight: '700',
  },
  historyMeta: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
});

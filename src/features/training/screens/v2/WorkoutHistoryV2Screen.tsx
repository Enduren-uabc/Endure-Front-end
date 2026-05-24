import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ChevronRight, History } from 'lucide-react-native';
import { BaseCard } from '@/components/ui/BaseCard';
import { theme } from '@/theme';
import {
  TrainingV2ChipRow,
  TrainingV2ProgressBar,
  TrainingV2Screen,
  TrainingV2SearchField,
  TrainingV2SectionHeader,
  TrainingV2Tag,
} from './TrainingV2Primitives';
import {
  TrainingV2EmptyState,
  TrainingV2ErrorState,
  TrainingV2SkeletonList,
} from './TrainingV2States';
import { useWorkoutHistory } from '@/features/training/hooks/use-workout-session';
import type { WorkoutStackParamList } from '@/navigation/types';

const filters = ['Todos', 'Semana', 'Mes'];
type Props = NativeStackScreenProps<WorkoutStackParamList, 'WorkoutHistory'>;

function formatDate(dateStr: string): string {
  try {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} dias`;
    return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
  } catch {
    return dateStr;
  }
}

export default function WorkoutHistoryV2Screen({ navigation }: Props) {
  const [query, setQuery] = React.useState('');
  const [selectedFilter, setSelectedFilter] = React.useState('Todos');
  const { data: history, isLoading, isError, refetch } = useWorkoutHistory();

  const sessions = history ?? [];

  const filteredSessions = sessions.filter((item) => {
    const matchesQuery = item.routineName.toLowerCase().includes(query.trim().toLowerCase());
    if (selectedFilter === 'Todos') return matchesQuery;
    if (selectedFilter === 'Semana') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return matchesQuery && new Date(item.startedAt) >= weekAgo;
    }
    if (selectedFilter === 'Mes') {
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      return matchesQuery && new Date(item.startedAt) >= monthAgo;
    }
    return matchesQuery;
  });

  function renderContent() {
    if (isLoading) {
      return <TrainingV2SkeletonList rows={3} />;
    }

    if (isError) {
      return (
        <TrainingV2ErrorState
          title="No pudimos cargar tu historial"
          description="Intenta nuevamente para consultar tus entrenamientos."
          onAction={() => refetch()}
        />
      );
    }

    if (filteredSessions.length === 0) {
      return (
        <TrainingV2EmptyState
          title="Aun no hay entrenamientos"
          description="Cuando termines una sesion, aparecera en este historial."
          actionLabel="Empezar rutina"
          onAction={() => navigation.navigate('WorkoutStart')}
        />
      );
    }

    return (
      <View style={styles.historyList}>
        {filteredSessions.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.84}
            onPress={() =>
              navigation.navigate('WorkoutFinishSummary', { sessionId: item.id })
            }
          >
            <BaseCard style={styles.historyCard}>
              <View style={styles.historyHeader}>
                <View style={styles.historyIcon}>
                  <History size={20} color={theme.colors.primary} />
                </View>
                <View style={styles.historyTitleWrap}>
                  <Text style={styles.historyTitle}>{item.routineName}</Text>
                  <Text style={styles.historyMeta}>
                    {formatDate(item.startedAt)} - {item.durationMinutes} min
                  </Text>
                </View>
                <ChevronRight size={20} color={theme.colors.textMuted} />
              </View>
              <View style={styles.historyTags}>
                <TrainingV2Tag label={`${item.durationMinutes} min`} tone="primary" />
                <TrainingV2Tag label={`${item.exerciseCount} ejercicios`} />
              </View>
              <TrainingV2ProgressBar
                progress={item.exerciseCount > 0 ? 0.7 : 0}
                label={item.status === 'finished' ? 'Completado' : 'En progreso'}
              />
            </BaseCard>
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  return (
    <TrainingV2Screen
      title="Historial"
      titleColor={theme.colors.textPrimary}
      subtitle="Consulta sesiones recientes, volumen y logros."
      onBack={navigation.goBack}
    >
      <TrainingV2SearchField
        value={query}
        onChangeText={setQuery}
        placeholder="Buscar por rutina"
      />
      <TrainingV2ChipRow options={filters} selected={selectedFilter} onSelect={setSelectedFilter} />
      <TrainingV2SectionHeader title="Entrenamientos" />
      {renderContent()}
    </TrainingV2Screen>
  );
}

const styles = StyleSheet.create({
  historyList: {
    gap: theme.spacing.md,
  },
  historyCard: {
    gap: theme.spacing.md,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  historyIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyTitleWrap: {
    flex: 1,
    gap: 2,
  },
  historyTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: theme.typography.bodyStrong.fontWeight,
  },
  historyMeta: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  historyTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
});

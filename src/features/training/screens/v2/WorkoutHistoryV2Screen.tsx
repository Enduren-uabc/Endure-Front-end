import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { NavigationProp } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ChevronRight, History, Search } from 'lucide-react-native';
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
import { workoutHistoryV2 } from './training-v2.mock';
import type { TrainingV2State } from './training-v2.types';
import type { WorkoutStackParamList } from '@/navigation/types';
import type { UserDrawerParamList } from '@/features/user/types/user-navigation.types';

const noop = () => undefined;
const filters = ['Todos', 'Semana', 'Mes', 'PRs'];
type Props = NativeStackScreenProps<WorkoutStackParamList, 'WorkoutHistory'>;

export default function WorkoutHistoryV2Screen({ navigation, route }: Props) {
  const [query, setQuery] = React.useState('');
  const [selectedFilter, setSelectedFilter] = React.useState('Todos');
  const visualState: TrainingV2State = 'success';
  const returnTo = route.params?.returnTo;
  const returnParams = returnTo ? { returnTo } : {};

  const handleBack = React.useCallback(() => {
    const drawerNavigation = navigation.getParent<NavigationProp<UserDrawerParamList>>();

    if (returnTo === 'Profile' && drawerNavigation) {
      drawerNavigation.navigate('MainTabs', { screen: 'Profile' });
      return;
    }

    navigation.goBack();
  }, [navigation, returnTo]);

  const filteredHistory = workoutHistoryV2.filter((item) =>
    item.routineName.toLowerCase().includes(query.trim().toLowerCase()),
  );

  function renderContent() {
    if (visualState === 'loading') {
      return <TrainingV2SkeletonList rows={3} />;
    }

    if (visualState === 'error') {
      return (
        <TrainingV2ErrorState
          title="No pudimos cargar tu historial"
          description="Intenta nuevamente para consultar tus entrenamientos."
          onAction={noop}
        />
      );
    }

    if (filteredHistory.length === 0) {
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
        {filteredHistory.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.84}
            onPress={() =>
              navigation.navigate('WorkoutSessionDetail', { sessionId: item.id, ...returnParams })
            }
          >
            <BaseCard style={styles.historyCard}>
              <View style={styles.historyHeader}>
                <View style={styles.historyIcon}>
                  <History size={20} color={theme.colors.primary} />
                </View>
                <View style={styles.historyTitleWrap}>
                  <Text style={styles.historyTitle}>{item.routineName}</Text>
                  <Text style={styles.historyMeta}>{item.dateLabel} - {item.durationLabel}</Text>
                </View>
                <ChevronRight size={20} color={theme.colors.textMuted} />
              </View>
              <View style={styles.historyTags}>
                <TrainingV2Tag label={item.volumeLabel} tone="primary" />
                <TrainingV2Tag label={`${item.completedSets}/${item.totalSets} series`} />
              </View>
              <TrainingV2ProgressBar
                progress={item.completedSets / item.totalSets}
                label={item.highlight}
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
      onBack={handleBack}
    >
      <TrainingV2SearchField
        value={query}
        onChangeText={setQuery}
        placeholder="Buscar por rutina"
      />
      <TrainingV2ChipRow options={filters} selected={selectedFilter} onSelect={setSelectedFilter} />
      <TrainingV2SectionHeader title="Entrenamientos" actionLabel="Exportar" onAction={noop} />
      {renderContent()}
      <BaseCard style={styles.searchHint}>
        <Search size={20} color={theme.colors.textSecondary} />
        <Text style={styles.searchHintText}>
          Toca una sesion para abrir el detalle o revisa progreso por ejercicio desde aqui.
        </Text>
      </BaseCard>
      <TouchableOpacity
        activeOpacity={0.84}
        onPress={() => navigation.navigate('ExerciseProgress', { exerciseId: 'ex-squat', ...returnParams })}
      >
        <BaseCard style={styles.progressCard}>
          <Text style={styles.progressTitle}>Progreso por ejercicio</Text>
          <Text style={styles.progressText}>
            Compara volumen, mejor set y tendencia de tus ejercicios principales.
          </Text>
        </BaseCard>
      </TouchableOpacity>
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
  searchHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  searchHintText: {
    flex: 1,
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  progressCard: {
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.surfaceElevated,
  },
  progressTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: theme.typography.bodyStrong.fontWeight,
  },
  progressText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
});

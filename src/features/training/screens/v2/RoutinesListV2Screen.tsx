import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Plus } from 'lucide-react-native';
import {
  TrainingV2ChipRow,
  TrainingV2RoutineCard,
  TrainingV2Screen,
  TrainingV2SearchField,
  TrainingV2SectionHeader,
} from './TrainingV2Primitives';
import {
  TrainingV2EmptyState,
  TrainingV2ErrorState,
  TrainingV2SkeletonList,
} from './TrainingV2States';
import { useRoutines } from '@/features/training/hooks/use-routines';
import { DAY_OF_WEEK_LABELS } from '@/features/training/types/routine';
import type { Routine } from '@/features/training/types/routine';
import type { RoutineV2, RoutineV2Filter, TrainingV2State } from './training-v2.types';
import type { TrainingStackParamList } from '@/navigation/types';
import { theme } from '@/theme';

const noop = () => undefined;
type Props = NativeStackScreenProps<TrainingStackParamList, 'RoutinesList'>;

function toRoutineV2(routine: Routine): RoutineV2 {
  const exerciseCount = routine.days.reduce((sum, d) => sum + d.exercises.length, 0);
  return {
    id: routine.id,
    name: routine.name,
    type: 'Todas' as RoutineV2Filter,
    level: 'Intermedio' as const,
    durationMinutes: exerciseCount * 8,
    exerciseCount,
    description: routine.description ?? `${routine.dayOfWeeks.length} dias de entrenamiento`,
    goal: routine.isActive ? 'Activa' : 'Rutina',
    days: routine.dayOfWeeks.map((d) => DAY_OF_WEEK_LABELS[d] ?? d.slice(0, 3)),
    imageUri: '',
    isMine: true,
    exercises: [],
  };
}

export default function RoutinesListV2Screen({ navigation }: Props) {
  const { data: routines, isLoading, isError, refetch } = useRoutines();
  const [selectedFilter, setSelectedFilter] = React.useState<RoutineV2Filter>('Todas');
  const [query, setQuery] = React.useState('');
  const createRoutine = () => navigation.navigate('RoutineBuilder', { id: 'new' });

  const visualState: TrainingV2State = isLoading ? 'loading' : isError ? 'error' : 'success';
  const routineList = (routines ?? []).map(toRoutineV2);

  const filteredRoutines = routineList.filter((routine) => {
    const matchesFilter =
      selectedFilter === 'Todas' || (selectedFilter === 'Mias' ? routine.isMine : false);
    const matchesQuery = routine.name.toLowerCase().includes(query.trim().toLowerCase());
    return matchesFilter && matchesQuery;
  });

  function renderContent() {
    if (visualState === 'loading') {
      return <TrainingV2SkeletonList rows={3} />;
    }

    if (visualState === 'error') {
      return (
        <TrainingV2ErrorState
          title="No pudimos cargar tus rutinas"
          description="Revisa tu conexion e intenta nuevamente."
          onAction={refetch}
        />
      );
    }

    if (filteredRoutines.length === 0) {
      return (
        <TrainingV2EmptyState
          title="Aun no hay rutinas aqui"
          description="Crea una rutina o cambia los filtros para encontrar otra opcion."
          actionLabel="Crear rutina"
          onAction={createRoutine}
        />
      );
    }

    return (
      <View style={styles.list}>
        {filteredRoutines.map((routine) => (
          <TrainingV2RoutineCard
            key={routine.id}
            routine={routine}
            onPress={() => navigation.navigate('RoutineDetail', { id: routine.id })}
          />
        ))}
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <TrainingV2Screen
        title="Rutinas"
        subtitle="Explora tus planes, filtra por objetivo y empieza cuando estes listo."
      >
        <TrainingV2SearchField
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar rutina"
        />
        <TrainingV2ChipRow
          options={['Todas', 'Mias']}
          selected={selectedFilter}
          onSelect={(value) => setSelectedFilter(value as RoutineV2Filter)}
        />
        <TrainingV2SectionHeader title="Tus rutinas" />
        {renderContent()}
      </TrainingV2Screen>

      <TouchableOpacity
        activeOpacity={0.84}
        onPress={createRoutine}
        style={styles.fab}
        accessibilityRole="button"
        accessibilityLabel="Crear rutina"
      >
        <Plus size={26} color={theme.colors.background} />
      </TouchableOpacity>
      <Text style={styles.fabLabel}>Crear</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  list: {
    gap: theme.spacing.md,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 32,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.primaryPressed,
  },
  fabLabel: {
    position: 'absolute',
    right: 26,
    bottom: 12,
    color: theme.colors.primary,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    fontWeight: '700',
  },
});

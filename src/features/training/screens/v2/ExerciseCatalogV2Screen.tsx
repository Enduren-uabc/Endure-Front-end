import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Dumbbell, Plus } from 'lucide-react-native';
import { BaseCard } from '@/components/ui/BaseCard';
import { theme } from '@/theme';
import {
  TrainingV2ChipRow,
  TrainingV2Screen,
  TrainingV2SearchField,
  TrainingV2SectionHeader,
  TrainingV2Tag,
} from './TrainingV2Primitives';
import { TrainingV2EmptyState, TrainingV2ErrorState, TrainingV2SkeletonList } from './TrainingV2States';
import { useExerciseCatalog } from '@/features/training/hooks/use-exercise-catalog';
import {
  EXERCISE_CATEGORIES,
  EXERCISE_CATEGORY_LABELS,
  type ExerciseCategory,
} from '@/features/training/types/exercise-catalog';
import type { TrainingStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<TrainingStackParamList, 'ExerciseCatalog'>;

const GROUP_OPTIONS = ['Todos', ...EXERCISE_CATEGORIES.map((c) => EXERCISE_CATEGORY_LABELS[c])];

function categoryFromLabel(label: string): ExerciseCategory | undefined {
  const entry = Object.entries(EXERCISE_CATEGORY_LABELS).find(([, v]) => v === label);
  return entry?.[0] as ExerciseCategory;
}

export default function ExerciseCatalogV2Screen({ navigation, route }: Props) {
  const [query, setQuery] = React.useState('');
  const [selectedLabel, setSelectedLabel] = React.useState('Todos');
  const routineId = route.params?.routineId ?? '';
  const selectedDay = route.params?.selectedDay;

  const selectedCategory = selectedLabel === 'Todos' ? undefined : categoryFromLabel(selectedLabel);

  const { data: exercises, isLoading, isError, refetch } = useExerciseCatalog({
    search: query || undefined,
    category: selectedCategory,
  });

  return (
    <TrainingV2Screen
      title="Catalogo de ejercicios"
      titleColor={theme.colors.textPrimary}
      subtitle="Busca ejercicios y agregalos a una rutina."
      showDragIndicator
    >
      <TrainingV2SearchField
        value={query}
        onChangeText={setQuery}
        placeholder="Buscar ejercicio"
      />
      <TrainingV2ChipRow
        options={GROUP_OPTIONS}
        selected={selectedLabel}
        onSelect={setSelectedLabel}
      />

      <TrainingV2SectionHeader title="Resultados" />

      {isLoading ? <TrainingV2SkeletonList rows={3} /> : null}

      {isError ? (
        <TrainingV2ErrorState
          title="No pudimos cargar el catalogo"
          description="Revisa tu conexion e intenta nuevamente."
          onAction={() => refetch()}
        />
      ) : null}

      {!isLoading && !isError && (exercises ?? []).length === 0 ? (
        <TrainingV2EmptyState
          title="No encontramos ejercicios"
          description="Prueba con otro nombre o cambia el grupo muscular."
          actionLabel="Limpiar busqueda"
          onAction={() => {
            setQuery('');
            setSelectedLabel('Todos');
          }}
        />
      ) : null}

      {!isLoading && !isError && (exercises ?? []).length > 0 ? (
        <View style={styles.exerciseList}>
          {(exercises ?? []).map((exercise) => (
            <TouchableOpacity
              key={exercise.id}
              activeOpacity={0.84}
              onPress={() =>
                navigation.navigate('ExerciseDetail', {
                  routineId,
                  selectedDay,
                  exercise: {
                    id: exercise.id,
                    name: exercise.name,
                    order: 0,
                    sets: 3,
                  },
                })
              }
            >
              <BaseCard style={styles.exerciseCard}>
                <View style={styles.imageWrap}>
                  <View style={styles.noImageContainer}>
                    <Dumbbell size={28} color={theme.colors.border} />
                  </View>
                </View>
                <View style={styles.exerciseBody}>
                  <View style={styles.titleRow}>
                    <Text style={styles.exerciseTitle}>{exercise.name}</Text>
                    <View style={styles.addButton}>
                      <Plus size={18} color={theme.colors.background} />
                    </View>
                  </View>
                  <Text style={styles.exerciseMeta}>
                    {EXERCISE_CATEGORY_LABELS[exercise.category]} - {exercise.equipment}
                  </Text>
                  <View style={styles.tagRow}>
                    <TrainingV2Tag label={EXERCISE_CATEGORY_LABELS[exercise.category]} />
                  </View>
                </View>
              </BaseCard>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}
    </TrainingV2Screen>
  );
}

const styles = StyleSheet.create({

  exerciseList: {
    gap: theme.spacing.md,
  },
  exerciseCard: {
    padding: 0,
    overflow: 'hidden',
  },
  imageWrap: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: theme.colors.surfaceElevated,
  },
  noImageContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceElevated,
  },
  exerciseBody: {
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  exerciseTitle: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading3.fontSize,
    lineHeight: theme.typography.heading3.lineHeight,
    fontWeight: theme.typography.heading3.fontWeight,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
  },
  exerciseMeta: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  tagRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
});

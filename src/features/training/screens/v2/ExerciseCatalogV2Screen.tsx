import React from 'react';
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
import { TrainingV2EmptyState, TrainingV2SkeletonList } from './TrainingV2States';
import { exercisesV2, toExerciseConfigV2 } from './training-v2.mock';
import type { ExerciseV2Group, TrainingV2State } from './training-v2.types';
import type { TrainingStackParamList } from '@/navigation/types';

const noop = () => undefined;
const groupOptions = ['Todos', 'Pierna', 'Pecho', 'Espalda', 'Hombro', 'Core', 'Cardio'];
type Props = NativeStackScreenProps<TrainingStackParamList, 'ExerciseCatalog'>;

export default function ExerciseCatalogV2Screen({ navigation, route }: Props) {
  const [query, setQuery] = React.useState('');
  const [selectedGroup, setSelectedGroup] = React.useState('Todos');
  const [visualState] = React.useState<TrainingV2State>('success');
  const routineId = route.params?.routineId ?? 'routine-strength';

  const filteredExercises = exercisesV2.filter((exercise) => {
    const matchesGroup = selectedGroup === 'Todos' || exercise.group === selectedGroup;
    const matchesQuery = exercise.name.toLowerCase().includes(query.trim().toLowerCase());

    return matchesGroup && matchesQuery;
  });

  return (
    <TrainingV2Screen
      title="Catalogo de ejercicios"
      titleColor={theme.colors.textPrimary}
      subtitle="Busca ejercicios y agregalos a una rutina."
      onBack={navigation.goBack}
    >
      <TrainingV2SearchField
        value={query}
        onChangeText={setQuery}
        placeholder="Buscar ejercicio"
      />
      <TrainingV2ChipRow
        options={groupOptions}
        selected={selectedGroup}
        onSelect={(value) => setSelectedGroup(value as ExerciseV2Group | 'Todos')}
      />

      <TrainingV2SectionHeader title="Resultados" actionLabel="Filtros" onAction={noop} />

      {visualState === 'loading' ? <TrainingV2SkeletonList rows={3} /> : null}

      {visualState === 'success' && filteredExercises.length === 0 ? (
        <TrainingV2EmptyState
          title="No encontramos ejercicios"
          description="Prueba con otro nombre o cambia el grupo muscular."
          actionLabel="Limpiar busqueda"
          onAction={() => {
            setQuery('');
            setSelectedGroup('Todos');
          }}
        />
      ) : null}

      {visualState === 'success' && filteredExercises.length > 0 ? (
        <View style={styles.exerciseList}>
          {filteredExercises.map((exercise, index) => (
            <TouchableOpacity
              key={exercise.id}
              activeOpacity={0.84}
              onPress={() =>
                navigation.navigate('ExerciseDetail', {
                  routineId,
                  exercise: toExerciseConfigV2(exercise, index),
                })
              }
            >
              <BaseCard style={styles.exerciseCard}>
                <View style={styles.imageWrap}>
                  <ImageBackground source={{ uri: exercise.imageUri }} style={styles.image} imageStyle={styles.image} />
                </View>
                <View style={styles.exerciseBody}>
                  <View style={styles.titleRow}>
                    <Text style={styles.exerciseTitle}>{exercise.name}</Text>
                    <View style={styles.addButton}>
                      <Plus size={18} color={theme.colors.background} />
                    </View>
                  </View>
                  <Text style={styles.exerciseMeta}>
                    {exercise.primaryMuscle} - {exercise.equipment}
                  </Text>
                  <View style={styles.tagRow}>
                    <TrainingV2Tag label={exercise.group} />
                    <TrainingV2Tag label={exercise.level} />
                  </View>
                </View>
              </BaseCard>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}

      <BaseCard style={styles.tipCard}>
        <Dumbbell size={20} color={theme.colors.primary} />
        <Text style={styles.tipText}>El selector se mantiene visual y no modifica rutinas reales en esta version aislada.</Text>
      </BaseCard>
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
  image: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
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
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  tipText: {
    flex: 1,
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
});

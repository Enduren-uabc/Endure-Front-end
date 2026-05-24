import React from 'react';
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Clock3, Dumbbell, Pencil, Play, Rows3, Star } from 'lucide-react-native';
import { BaseCard } from '@/components/ui/BaseCard';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { theme } from '@/theme';
import {
  TrainingV2FieldPreview,
  TrainingV2ProgressBar,
  TrainingV2Screen,
  TrainingV2SectionHeader,
  TrainingV2Tag,
} from './TrainingV2Primitives';
import { TrainingV2EmptyState } from './TrainingV2States';
import {
  currentRoutineV2,
  routinesV2,
  toExerciseConfigV2,
  workoutSessionV2,
} from './training-v2.mock';
import type { AppTabsParamList, TrainingStackParamList } from '@/navigation/types';

const noop = () => undefined;
type Props = NativeStackScreenProps<TrainingStackParamList, 'RoutineDetail'>;
type AppTabsNavigation = BottomTabNavigationProp<AppTabsParamList>;

export default function RoutineDetailV2Screen({ navigation, route }: Props) {
  const routine = routinesV2.find((item) => item.id === route.params.id) ?? currentRoutineV2;
  const openWorkoutSession = () => {
    navigation.getParent<AppTabsNavigation>()?.navigate('Workout', {
      screen: 'WorkoutSession',
      params: { sessionId: workoutSessionV2.id },
    });
  };

  return (
    <TrainingV2Screen
      title="Detalle de rutina"
      titleColor={theme.colors.textPrimary}
      subtitle="Revisa el plan antes de iniciar."
      onBack={navigation.goBack}
      footer={
        <View style={styles.footerActions}>
          <SecondaryButton
            label="Editar"
            onPress={() => navigation.navigate('RoutineBuilder', { id: routine.id })}
            style={styles.footerButton}
          />
          <PrimaryButton
            label="Empezar"
            onPress={openWorkoutSession}
            icon={<Play size={18} color={theme.colors.background} />}
            style={styles.footerButton}
          />
        </View>
      }
    >
      <View style={styles.heroWrap}>
        <ImageBackground source={{ uri: routine.imageUri }} style={styles.heroImage} imageStyle={styles.heroImage}>
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <TrainingV2Tag label={routine.goal} tone="primary" />
            <Text style={styles.heroTitle}>{routine.name}</Text>
            <Text style={styles.heroDescription}>{routine.description}</Text>
          </View>
        </ImageBackground>
      </View>

      <View style={styles.metaGrid}>
        <TrainingV2FieldPreview label="Duracion" value={`${routine.durationMinutes} min`} helper="Estimado" />
        <TrainingV2FieldPreview label="Nivel" value={routine.level} helper="Intensidad" />
        <TrainingV2FieldPreview label="Ejercicios" value={`${routine.exerciseCount}`} helper={routine.days.join(' / ')} />
      </View>

      <BaseCard style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <View style={styles.summaryIcon}>
            <Star size={20} color={theme.colors.primary} />
          </View>
          <View style={styles.summaryTextWrap}>
            <Text style={styles.summaryTitle}>Progreso sugerido</Text>
            <Text style={styles.summaryText}>Completa al menos 10 de 12 series para cerrar la sesion.</Text>
          </View>
        </View>
        <TrainingV2ProgressBar progress={0.72} label="Preparacion semanal" />
      </BaseCard>

      <TrainingV2SectionHeader
        title="Ejercicios"
        actionLabel="Agregar"
        onAction={() => navigation.navigate('ExerciseCatalog', { routineId: routine.id })}
      />

      {routine.exercises.length === 0 ? (
        <TrainingV2EmptyState
          title="Esta rutina no tiene ejercicios"
          description="Agrega al menos un ejercicio antes de iniciar el entrenamiento."
          actionLabel="Agregar ejercicio"
          onAction={noop}
        />
      ) : (
        <View style={styles.exerciseList}>
          {routine.exercises.map((exercise, index) => (
            <TouchableOpacity
              key={exercise.id}
              activeOpacity={0.84}
              onPress={() =>
                navigation.navigate('ExerciseDetail', {
                  routineId: routine.id,
                  exercise: toExerciseConfigV2(exercise, index),
                })
              }
            >
              <BaseCard style={styles.exerciseCard}>
                <View style={styles.exerciseIcon}>
                  <Dumbbell size={20} color={theme.colors.primary} />
                </View>
                <View style={styles.exerciseBody}>
                  <Text style={styles.exerciseName}>{index + 1}. {exercise.name}</Text>
                  <Text style={styles.exerciseMeta}>
                    {exercise.sets.length} series - {exercise.primaryMuscle} - {exercise.equipment}
                  </Text>
                </View>
                <View style={styles.exerciseStats}>
                  <Rows3 size={16} color={theme.colors.textMuted} />
                  <Text style={styles.exerciseStatsText}>{exercise.sets[0]?.targetReps ?? 0}</Text>
                </View>
              </BaseCard>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <BaseCard style={styles.noteCard}>
        <Clock3 size={20} color={theme.colors.textSecondary} />
        <Text style={styles.noteText}>Descansa 90 segundos entre series principales y 60 segundos en accesorios.</Text>
        <Pencil size={18} color={theme.colors.textMuted} />
      </BaseCard>
    </TrainingV2Screen>
  );
}

const styles = StyleSheet.create({
  heroWrap: {
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  heroImage: {
    width: '100%',
    minHeight: 250,
    justifyContent: 'flex-end',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.48)',
  },
  heroContent: {
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  heroTitle: {
    color: theme.colors.textPrimary,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
  },
  heroDescription: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
  },
  metaGrid: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  summaryCard: {
    gap: theme.spacing.md,
  },
  summaryHeader: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryTextWrap: {
    flex: 1,
    gap: 2,
  },
  summaryTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: theme.typography.bodyStrong.fontWeight,
  },
  summaryText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  exerciseList: {
    gap: theme.spacing.sm,
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
  },
  exerciseIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseBody: {
    flex: 1,
    gap: 2,
  },
  exerciseName: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: theme.typography.bodyStrong.fontWeight,
  },
  exerciseMeta: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  exerciseStats: {
    minWidth: 44,
    minHeight: 44,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  exerciseStatsText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
  },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  noteText: {
    flex: 1,
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  footerActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  footerButton: {
    flex: 1,
  },
});

import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import { AlertCircle, Clock3, Dumbbell, Pencil, Play, Rows3, Star } from 'lucide-react-native';
import { BaseCard } from '@/components/ui/BaseCard';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { theme } from '@/theme';
import {
  TrainingV2FieldPreview,
  TrainingV2Screen,
  TrainingV2SectionHeader,
  TrainingV2Tag,
} from './TrainingV2Primitives';
import { TrainingV2EmptyState } from './TrainingV2States';
import { useRoutineDetail } from '@/features/training/hooks/use-routines';
import { DAY_OF_WEEK_LABELS } from '@/features/training/types/routine';
import type { ExerciseConfig } from '@/features/training/types/routine';
import type { TrainingStackParamList } from '@/navigation/types';
import type { UserDrawerParamList } from '@/features/user/types/user-navigation.types';

type Props = NativeStackScreenProps<TrainingStackParamList, 'RoutineDetail'>;

const DAY_LABELS: Record<string, string> = {
  monday: 'Lun', tuesday: 'Mar', wednesday: 'Mie',
  thursday: 'Jue', friday: 'Vie', saturday: 'Sab', sunday: 'Dom',
};

function setsCount(exercise: ExerciseConfig): number {
  return Array.isArray(exercise.sets) ? exercise.sets.length : exercise.sets;
}

function totalSetsCount(exercises: ExerciseConfig[]): number {
  return exercises.reduce((sum, ex) => sum + setsCount(ex), 0);
}

export default function RoutineDetailV2Screen({ navigation, route }: Props) {
  const { data: routine, isLoading, isError, refetch } = useRoutineDetail(route.params.id);

  const openWorkoutStart = () => {
    const drawer = navigation.getParent()?.getParent<DrawerNavigationProp<UserDrawerParamList>>();
    drawer?.navigate('WorkoutStack', { screen: 'WorkoutStart' });
  };

  if (isLoading) {
    return (
      <TrainingV2Screen title="Detalle de rutina" titleColor={theme.colors.textPrimary} onBack={navigation.goBack}>
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.primary} size="large" />
          <Text style={styles.centerText}>Cargando rutina...</Text>
        </View>
      </TrainingV2Screen>
    );
  }

  if (isError || !routine) {
    return (
      <TrainingV2Screen title="Detalle de rutina" titleColor={theme.colors.textPrimary} onBack={navigation.goBack}>
        <View style={styles.center}>
          <AlertCircle size={44} color={theme.colors.error} />
          <Text style={styles.centerTitle}>No pudimos cargar la rutina</Text>
          <Text style={styles.centerText}>Revisa tu conexion e intenta nuevamente.</Text>
          <SecondaryButton label="Reintentar" onPress={() => refetch()} />
        </View>
      </TrainingV2Screen>
    );
  }

  const exercises = routine.days.flatMap((d) => d.exercises);
  const exerciseCount = exercises.length;
  const totalSets = totalSetsCount(exercises);

  return (
    <TrainingV2Screen
      title="Detalle de rutina"
      titleColor={theme.colors.textPrimary}
      subtitle={`${routine.dayOfWeeks.length} dias - ${routine.name}`}
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
            onPress={openWorkoutStart}
            icon={<Play size={18} color={theme.colors.background} />}
            style={styles.footerButton}
          />
        </View>
      }
    >
      <View style={styles.heroWrap}>
        <View style={styles.heroGradient}>
          <View style={styles.heroContent}>
            <TrainingV2Tag label={routine.isActive ? 'Activa' : 'Inactiva'} tone={routine.isActive ? 'success' : 'default'} />
            <Text style={styles.heroTitle}>{routine.name}</Text>
            {routine.description ? (
              <Text style={styles.heroDescription}>{routine.description}</Text>
            ) : null}
          </View>
        </View>
      </View>

      <View style={styles.metaGrid}>
        <TrainingV2FieldPreview label="Dias" value={`${routine.dayOfWeeks.length}`} helper={routine.dayOfWeeks.map((d) => DAY_LABELS[d] ?? d.slice(0, 3)).join(' / ')} />
        <TrainingV2FieldPreview label="Ejercicios" value={`${exerciseCount}`} helper="Totales" />
        <TrainingV2FieldPreview label="Series" value={`${totalSets}`} helper="Configurables" />
      </View>

      <BaseCard style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <View style={styles.summaryIcon}>
            <Star size={20} color={theme.colors.primary} />
          </View>
          <View style={styles.summaryTextWrap}>
            <Text style={styles.summaryTitle}>Rutina {routine.isActive ? 'activa' : 'inactiva'}</Text>
            <Text style={styles.summaryText}>
              {routine.isActive
                ? 'Esta es tu rutina activa. Puedes empezar un entrenamiento cuando quieras.'
                : 'Activa esta rutina desde la lista para poder entrenar con ella.'}
            </Text>
          </View>
        </View>
      </BaseCard>

      <TrainingV2SectionHeader
        title="Ejercicios"
        actionLabel="Agregar"
        onAction={() => navigation.navigate('ExerciseCatalog', { routineId: routine.id })}
      />

      {exercises.length === 0 ? (
        <TrainingV2EmptyState
          title="Esta rutina no tiene ejercicios"
          description="Agrega al menos un ejercicio antes de iniciar el entrenamiento."
          actionLabel="Agregar ejercicio"
          onAction={() => navigation.navigate('ExerciseCatalog', { routineId: routine.id })}
        />
      ) : (
        <View style={styles.exerciseList}>
          {exercises.map((exercise) => (
            <TouchableOpacity
              key={exercise.id}
              activeOpacity={0.84}
              onPress={() =>
                navigation.navigate('ExerciseDetail', {
                  routineId: routine.id,
                  exercise,
                })
              }
            >
              <BaseCard style={styles.exerciseCard}>
                <View style={styles.exerciseIcon}>
                  <Dumbbell size={20} color={theme.colors.primary} />
                </View>
                <View style={styles.exerciseBody}>
                  <Text style={styles.exerciseName}>{exercise.order + 1}. {exercise.name}</Text>
                  <Text style={styles.exerciseMeta}>
                    {setsCount(exercise)} series
                  </Text>
                </View>
                <View style={styles.exerciseStats}>
                  <Rows3 size={16} color={theme.colors.textMuted} />
                  <Text style={styles.exerciseStatsText}>{setsCount(exercise)}</Text>
                </View>
              </BaseCard>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <BaseCard style={styles.noteCard}>
        <Clock3 size={20} color={theme.colors.textSecondary} />
        <Text style={styles.noteText}>Cada ejercicio tiene {totalSets} series en total. Descansa 90 segundos entre cada una.</Text>
        <Pencil size={18} color={theme.colors.textMuted} />
      </BaseCard>
    </TrainingV2Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.xl,
  },
  centerTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading2.fontSize,
    lineHeight: theme.typography.heading2.lineHeight,
    fontWeight: theme.typography.heading2.fontWeight,
    textAlign: 'center',
  },
  centerText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    textAlign: 'center',
  },
  heroWrap: {
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  heroGradient: {
    width: '100%',
    minHeight: 180,
    justifyContent: 'flex-end',
    backgroundColor: theme.colors.primaryMuted,
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

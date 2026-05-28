import React from 'react';
import { useMyTrainer } from './use-trainer-link';
import { useMyAssignedRoutines } from './use-assigned-routines';
import type { AssignedRoutineDetail } from '../types/assigned-routine';
import { DAY_OF_WEEK_LABELS, type DayOfWeek } from '@/features/training/types/routine';

interface AssignedRoutineQuery {
  data: AssignedRoutineDetail | null;
  hasTrainer: boolean;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useAssignedRoutine(): AssignedRoutineQuery {
  const trainerQuery = useMyTrainer();
  const assignedRoutinesQuery = useMyAssignedRoutines();
  const trainer = trainerQuery.data?.trainer ?? null;

  const assignedRoutine = React.useMemo(() => {
    if (!trainerQuery.data?.hasTrainer || !trainer) {
      return null;
    }

    const item = assignedRoutinesQuery.data?.[0];
    if (!item) {
      return null;
    }

    const today = getTodayDayOfWeek();
    const daysSource =
      item.days.length > 0
        ? item.days
        : [
            {
              dayOfWeek: today,
              exercises: item.exercises,
            },
          ];
    const durationMinutes = item.estimatedDuration || Math.max(30, item.exercises.length * 8);

    return {
      id: item.id,
      name: item.routineName,
      goal: item.originLabel,
      level: mapDifficulty(item.difficulty),
      durationMinutes,
      assignedAt: item.assignedAt,
      startsAt: item.assignedAt,
      status: item.status === 'active' ? 'active' : 'pending',
      adherenceTarget: 0,
      note: item.notes?.trim() || 'Tu entrenador no dejo notas para esta rutina.',
      trainer: {
        id: trainer.trainerId,
        name: trainer.displayName,
        code: trainer.trainerCode,
      },
      days: daysSource.map((day, index) => ({
        id: `${item.id}-${day.dayOfWeek}`,
        dayOfWeek: day.dayOfWeek,
        label: DAY_OF_WEEK_LABELS[day.dayOfWeek as DayOfWeek] ?? `Dia ${index + 1}`,
        dateHint: day.dayOfWeek === today ? 'Hoy' : 'Programado',
        status: day.dayOfWeek === today ? 'today' : 'pending',
        exercises: day.exercises.map((exercise) => ({
          id: exercise.exerciseId,
          name: exercise.name,
          target: `${exercise.sets}x${exercise.reps}`,
          restLabel: `${exercise.restSeconds}s descanso`,
          muscleGroup: 'Rutina asignada',
        })),
      })),
      source: 'api',
    } satisfies AssignedRoutineDetail;
  }, [
    assignedRoutinesQuery.data,
    trainer,
    trainerQuery.data?.hasTrainer,
  ]);

  return {
    data: assignedRoutine,
    hasTrainer: trainerQuery.data?.hasTrainer ?? false,
    isLoading: trainerQuery.isLoading || assignedRoutinesQuery.isLoading,
    isError: trainerQuery.isError || assignedRoutinesQuery.isError,
    error: trainerQuery.error ?? assignedRoutinesQuery.error ?? null,
    refetch: () => {
      void trainerQuery.refetch();
      void assignedRoutinesQuery.refetch();
    },
  };
}

function getTodayDayOfWeek(): DayOfWeek {
  const days: DayOfWeek[] = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];
  return days[new Date().getDay()];
}

function mapDifficulty(difficulty: string): string {
  if (difficulty === 'beginner') return 'Principiante';
  if (difficulty === 'advanced') return 'Avanzado';
  return 'Intermedio';
}

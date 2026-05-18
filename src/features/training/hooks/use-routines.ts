import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';
import {
  trainingQueryKeys,
  trainingService,
  useCreateRoutine,
  useRegisterSet,
  useStartWorkout,
  useWorkoutSession,
} from '@/shared/api/services/trainingService';
import type { RoutineResponseDto } from '@/shared/api/types/training';
import type { Routine } from '@/features/training/types/routine';

export {
  useCreateRoutine,
  useRegisterSet,
  useStartWorkout,
  useWorkoutSession,
};

function toLegacyRoutine(routine: RoutineResponseDto): Routine {
  return {
    ...routine,
    dayOfWeeks: routine.days.map((day) => day.dayOfWeek),
    days: routine.days.map((day) => ({
      ...day,
      exercises: day.exercises.map((exercise) => ({
        ...exercise,
        sets: exercise.sets ?? 0,
        repsPerSet: exercise.repsPerSet ?? 0,
        weight: exercise.weight ?? 0,
      })),
    })),
  };
}

export function useRoutines() {
  return useQuery({
    queryKey: trainingQueryKeys.routines,
    queryFn: trainingService.listRoutines,
    select: (routines) => routines.map(toLegacyRoutine),
    retry: 1,
  });
}

export function useRoutineDetail(routineId: string) {
  return useQuery({
    queryKey: trainingQueryKeys.routine(routineId),
    queryFn: () => trainingService.getRoutineDetail(routineId),
    select: toLegacyRoutine,
    enabled: routineId.length > 0,
    retry: 1,
  });
}

export function useActivateRoutine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.patch<RoutineResponseDto>(API_ENDPOINTS.routines.activate(id)),
    onSuccess: (routine) => {
      queryClient.invalidateQueries({ queryKey: trainingQueryKeys.routines });
      queryClient.setQueryData(trainingQueryKeys.routine(routine.id), routine);
    },
  });
}

export function useDeactivateRoutine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.patch<RoutineResponseDto>(API_ENDPOINTS.routines.deactivate(id)),
    onSuccess: (routine) => {
      queryClient.invalidateQueries({ queryKey: trainingQueryKeys.routines });
      queryClient.setQueryData(trainingQueryKeys.routine(routine.id), routine);
    },
  });
}

export function useDeleteRoutine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.del<void>(API_ENDPOINTS.routines.delete(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trainingQueryKeys.routines });
    },
  });
}

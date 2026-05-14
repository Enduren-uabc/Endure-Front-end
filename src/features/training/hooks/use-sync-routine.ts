import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';
import type { DayOfWeek } from '../types/routine';

interface SyncExerciseSetPayload {
  setNumber: number;
  reps: number;
  weight: number;
  restSeconds?: number;
}

interface SyncExercisePayload {
  id: string;
  name: string;
  order: number;
  sets?: SyncExerciseSetPayload[];
}

interface SyncDayPayload {
  dayOfWeek: DayOfWeek;
  exercises: SyncExercisePayload[];
}

interface SyncRoutinePayload {
  routineId: string;
  days: SyncDayPayload[];
}

export function useSyncRoutine() {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, SyncRoutinePayload>({
    mutationFn: (payload) =>
      apiClient.patch<unknown>(API_ENDPOINTS.routines.sync(payload.routineId), {
        days: payload.days.map((day) => ({
          dayOfWeek: day.dayOfWeek,
          exercises: day.exercises.map((exercise) => ({
            id: exercise.id,
            name: exercise.name,
            order: exercise.order,
            sets: exercise.sets?.map((set) => ({
              setNumber: set.setNumber,
              reps: set.reps,
              weight: set.weight,
              ...(set.restSeconds != null ? { restSeconds: set.restSeconds } : {}),
            })),
          })),
        })),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['routines'] });
      queryClient.invalidateQueries({ queryKey: ['routine', variables.routineId] });
    },
  });
}

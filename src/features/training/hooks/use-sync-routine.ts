import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';
import type { DayOfWeek } from '../types/routine';

interface SyncExercisePayload {
  id: string;
  name: string;
  order: number;
  sets?: number;
  repsPerSet?: number;
  weight?: number;
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
      apiClient.post<unknown>(API_ENDPOINTS.routines.sync(payload.routineId), payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines'] });
    },
  });
}

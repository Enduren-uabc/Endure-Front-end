import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';
import type { Routine } from '../types/routine';

interface SetRoutineStrategyPayload {
  routineId: string;
  strategyKey: string | null;
}

export function useSetRoutineStrategy() {
  const queryClient = useQueryClient();

  return useMutation<Routine, Error, SetRoutineStrategyPayload>({
    mutationFn: (payload) =>
      apiClient.patch<Routine>(
        API_ENDPOINTS.routines.trainingStrategy(payload.routineId),
        { strategyKey: payload.strategyKey },
      ),
    onSuccess: (data, payload) => {
      queryClient.setQueryData(['routine', payload.routineId], data);
      queryClient.invalidateQueries({ queryKey: ['routines'] });
    },
  });
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';
import type { Routine } from '../types/routine';

interface ListRoutinesResponse {
  routines?: Routine[];
}

export function useRoutines() {
  return useQuery<Routine[]>({
    queryKey: ['routines'],
    queryFn: async () => {
      const data = await apiClient.get<Routine[] | ListRoutinesResponse>(
        API_ENDPOINTS.routines.list,
      );
      // Backend may return { routines: [...] } or [...] directly
      if (Array.isArray(data)) {
        return data;
      }
      return data.routines ?? [];
    },
  });
}

export function useRoutineDetail(routineId: string) {
  return useQuery<Routine>({
    queryKey: ['routine', routineId],
    queryFn: () => apiClient.get<Routine>(API_ENDPOINTS.routines.detail(routineId)),
    enabled: !!routineId,
  });
}

export function useActivateRoutine() {
  const queryClient = useQueryClient();

  return useMutation<Routine, Error, string>({
    mutationFn: (id) => apiClient.patch<Routine>(API_ENDPOINTS.routines.activate(id)),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['routines'] });
      queryClient.invalidateQueries({ queryKey: ['routine', id] });
    },
  });
}

export function useDeactivateRoutine() {
  const queryClient = useQueryClient();

  return useMutation<Routine, Error, string>({
    mutationFn: (id) => apiClient.patch<Routine>(API_ENDPOINTS.routines.deactivate(id)),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['routines'] });
      queryClient.invalidateQueries({ queryKey: ['routine', id] });
    },
  });
}

export function useDeleteRoutine() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => apiClient.del<void>(API_ENDPOINTS.routines.delete(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines'] });
    },
  });
}

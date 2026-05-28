import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";
import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import type { Routine, DayOfWeek, RoutineTargetAudience } from "../types/routine";

interface ListRoutinesResponse {
  routines?: Routine[];
}

export function useRoutines() {
  return useQuery<Routine[]>({
    queryKey: ["routines"],
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
    queryKey: ["routine", routineId],
    queryFn: () => {
      if (!routineId) return Promise.reject(new Error("ID de rutina inválido"));
      return apiClient.get<Routine>(API_ENDPOINTS.routines.detail(routineId));
    },
    enabled: !!routineId,
  });
}

export function useActivateRoutine() {
  const queryClient = useQueryClient();

  return useMutation<Routine, Error, string>({
    mutationFn: (id) =>
      apiClient.patch<Routine>(API_ENDPOINTS.routines.activate(id)),
    onSuccess: (data, id) => {
      queryClient.setQueryData(['routine', id], data);
      queryClient.invalidateQueries({ queryKey: ["routines"] });
    },
  });
}

export function useDeactivateRoutine() {
  const queryClient = useQueryClient();

  return useMutation<Routine, Error, string>({
    mutationFn: (id) =>
      apiClient.patch<Routine>(API_ENDPOINTS.routines.deactivate(id)),
    onSuccess: (data, id) => {
      queryClient.setQueryData(['routine', id], data);
      queryClient.invalidateQueries({ queryKey: ["routines"] });
    },
  });
}

export function useDeleteRoutine() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => apiClient.del<void>(API_ENDPOINTS.routines.delete(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routines"] });
    },
  });
}

export function useUpdateRoutineName() {
  const queryClient = useQueryClient();

  return useMutation<Routine, Error, { id: string; name: string }>({
    mutationFn: ({ id, name }) =>
      apiClient.patch<Routine>(API_ENDPOINTS.routines.name(id), { name }),
    onSuccess: (data, { id }) => {
      queryClient.setQueryData(['routine', id], data);
      queryClient.invalidateQueries({ queryKey: ["routines"] });
    },
  });
}

export function useCreateRoutine() {
  const queryClient = useQueryClient();
  return useMutation<
    Routine,
    Error,
    {
      name: string;
      dayOfWeeks: DayOfWeek[];
      targetAudience?: RoutineTargetAudience;
    }
  >(
    {
      mutationFn: (body) =>
        apiClient.post<Routine>(API_ENDPOINTS.routines.create, body),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["routines"] });
      },
    },
  );
}

export function useRemoveRoutineDay(routineId: string) {
  const queryClient = useQueryClient();

  return useMutation<Routine, Error, { dayOfWeek: string }>({
    mutationFn: ({ dayOfWeek }) =>
      apiClient.del<Routine>(
        API_ENDPOINTS.routines.removeDay(routineId, dayOfWeek),
      ),
    onSuccess: (data) => {
      queryClient.setQueryData(['routine', routineId], data);
      queryClient.invalidateQueries({ queryKey: ["routines"] });
    },
    onError: (error) => {
      Alert.alert('Error', error.message || 'No se pudo eliminar el día.');
    },
  });
}

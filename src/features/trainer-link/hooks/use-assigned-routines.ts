import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';
import type {
  AssignedRoutineListItem,
  AssignedRoutineDetail,
  MyAssignedRoutineItem,
  AssignRoutineInput,
  ReplaceRoutineInput,
  UpdateNotesInput,
  AssignableRoutineItem,
} from '@/features/trainer-link/types/trainer-link';
import type { DayOfWeek } from '@/features/training/types/routine';
import type { WorkoutSession } from '@/features/training/types/workout-session';

export function useAssignableRoutines(clientId: string) {
  return useQuery<AssignableRoutineItem[]>({
    queryKey: ['trainer-panel', 'assignable-routines', clientId],
    queryFn: async () => {
      const res = await apiClient.get<{ items: AssignableRoutineItem[] }>(
        API_ENDPOINTS.trainerLink.assignableRoutines(clientId),
      );
      return res.items;
    },
    enabled: !!clientId,
  });
}

export function useClientAssignedRoutines(clientId: string) {
  return useQuery<AssignedRoutineListItem[]>({
    queryKey: ['trainer-panel', 'client-routines', clientId],
    queryFn: async () => {
      const res = await apiClient.get<{ items: AssignedRoutineListItem[] }>(
        API_ENDPOINTS.trainerLink.clientAssignedRoutines(clientId),
      );
      return res.items;
    },
    enabled: !!clientId,
  });
}

export function useAssignedRoutineDetail(clientId: string, assignedId: string) {
  return useQuery<AssignedRoutineDetail>({
    queryKey: ['trainer-panel', 'routine-detail', clientId, assignedId],
    queryFn: async () => {
      const res = await apiClient.get<AssignedRoutineDetail>(
        API_ENDPOINTS.trainerLink.assignedRoutineDetail(clientId, assignedId),
      );
      return res;
    },
    enabled: !!clientId && !!assignedId,
  });
}

export function useMyAssignedRoutines() {
  return useQuery<MyAssignedRoutineItem[]>({
    queryKey: ['trainer-panel', 'my-assigned-routines'],
    queryFn: async () => {
      const res = await apiClient.get<{ items: MyAssignedRoutineItem[] }>(
        API_ENDPOINTS.trainerLink.myAssignedRoutines,
      );
      return res.items;
    },
  });
}

export function useStartAssignedRoutine() {
  const queryClient = useQueryClient();

  return useMutation<
    WorkoutSession,
    Error,
    { assignedId: string; dayOfWeek?: DayOfWeek }
  >({
    mutationFn: ({ assignedId, dayOfWeek }) =>
      apiClient.post<WorkoutSession>(
        API_ENDPOINTS.trainerLink.startAssignedRoutine(assignedId),
        dayOfWeek ? { dayOfWeek } : undefined,
      ),
    onSuccess: (session) => {
      queryClient.setQueryData(['workout-session', session.id], session);
      queryClient.setQueryData(['workout-session', 'in-progress'], session);
    },
  });
}

export function useAssignRoutine(clientId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AssignRoutineInput) =>
      apiClient.post(
        API_ENDPOINTS.trainerLink.assignRoutine(clientId),
        data,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['trainer-panel', 'client-routines', clientId],
      });
      queryClient.invalidateQueries({
        queryKey: ['trainer-panel', 'assignable-routines', clientId],
      });
    },
  });
}

export function useReplaceRoutine(clientId: string, assignedId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ReplaceRoutineInput) =>
      apiClient.put(
        API_ENDPOINTS.trainerLink.replaceRoutine(clientId, assignedId),
        data,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['trainer-panel', 'client-routines', clientId],
      });
      queryClient.invalidateQueries({
        queryKey: ['trainer-panel', 'assignable-routines', clientId],
      });
    },
  });
}

export function useEditAssignedRoutineContent(clientId: string, assignedId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name?: string; days?: Array<{ dayOfWeek: string; exercises: Array<{ exerciseId: string; name: string; sets: number; reps: number; restSeconds: number; order: number }> }> }) =>
      apiClient.patch(
        API_ENDPOINTS.trainerLink.editRoutineContent(clientId, assignedId),
        data,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['trainer-panel', 'client-routines', clientId],
      });
    },
  });
}

export function useUpdateRoutineNotes(clientId: string, assignedId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateNotesInput) =>
      apiClient.patch(
        API_ENDPOINTS.trainerLink.updateRoutineNotes(clientId, assignedId),
        data,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['trainer-panel', 'client-routines', clientId],
      });
    },
  });
}

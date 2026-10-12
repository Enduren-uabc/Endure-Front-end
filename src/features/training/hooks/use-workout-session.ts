import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';
import type { DayOfWeek } from '@/features/training/types/routine';
import type {
  WorkoutSession,
  WorkoutSessionDetail,
  WorkoutSessionSummary,
} from '@/features/training/types/workout-session';

const workoutSessionKeys = {
  inProgress: ['workout-session', 'in-progress'] as const,
  detail: (id: string) => ['workout-session', id] as const,
  history: ['workout-session', 'history'] as const,
};

function cacheSession(
  queryClient: ReturnType<typeof useQueryClient>,
  session: WorkoutSession,
) {
  queryClient.setQueryData(workoutSessionKeys.detail(session.id), session);

  if (session.status === 'in_progress') {
    queryClient.setQueryData(workoutSessionKeys.inProgress, session);
  } else {
    queryClient.removeQueries({ queryKey: workoutSessionKeys.inProgress });
    queryClient.invalidateQueries({ queryKey: workoutSessionKeys.history });
  }
}

export function useWorkoutSessionInProgress() {
  return useQuery<WorkoutSession>({
    queryKey: workoutSessionKeys.inProgress,
    queryFn: () =>
      apiClient.get<WorkoutSession>(API_ENDPOINTS.workoutSessions.inProgress),
    retry: false,
  });
}

export function useWorkoutSessionDetail(sessionId?: string) {
  return useQuery<WorkoutSessionDetail>({
    queryKey: workoutSessionKeys.detail(sessionId ?? ''),
    queryFn: () =>
      apiClient.get<WorkoutSessionDetail>(
        API_ENDPOINTS.workoutSessions.detail(sessionId ?? ''),
      ),
    enabled: !!sessionId,
  });
}

export function useWorkoutHistory() {
  return useQuery<WorkoutSessionSummary[]>({
    queryKey: workoutSessionKeys.history,
    queryFn: async () => {
      const response = await apiClient.get<{
        sessions: WorkoutSessionSummary[];
        hasIncompleteData: boolean;
      }>(
        API_ENDPOINTS.workoutSessions.history,
      );
      if (!response || !Array.isArray(response.sessions)) {
        throw new Error('Historial no disponible');
      }
      return response.sessions;
    },
  });
}

export function useStartWorkoutSession() {
  const queryClient = useQueryClient();

  return useMutation<
    WorkoutSession,
    Error,
    { routineId: string; dayOfWeek: DayOfWeek }
  >({
    mutationFn: (body) =>
      apiClient.post<WorkoutSession>(API_ENDPOINTS.workoutSessions.create, body),
    onSuccess: (session) => {
      cacheSession(queryClient, session);
    },
  });
}

export function useCompleteWorkoutSet() {
  const queryClient = useQueryClient();

  return useMutation<
    WorkoutSession,
    Error,
    { sessionId: string; exerciseIndex: number; setNumber: number }
  >({
    mutationFn: ({ sessionId, exerciseIndex, setNumber }) =>
      apiClient.patch<WorkoutSession>(
        API_ENDPOINTS.workoutSessions.completeSet(
          sessionId,
          exerciseIndex,
          setNumber,
        ),
      ),
    onSuccess: (session) => {
      cacheSession(queryClient, session);
    },
  });
}

export function useRegisterWorkoutSet() {
  const queryClient = useQueryClient();

  return useMutation<
    WorkoutSession,
    Error,
    {
      sessionId: string;
      exerciseIndex: number;
      setNumber: number;
      repsPerformed: number;
      weightUsed: number;
    }
  >({
    mutationFn: ({
      sessionId,
      exerciseIndex,
      setNumber,
      repsPerformed,
      weightUsed,
    }) =>
      apiClient.patch<WorkoutSession>(
        API_ENDPOINTS.workoutSessions.registerSet(
          sessionId,
          exerciseIndex,
          setNumber,
        ),
        { repsPerformed, weightUsed },
      ),
    onSuccess: (session) => {
      cacheSession(queryClient, session);
    },
  });
}

export function useAdvanceWorkoutExercise() {
  const queryClient = useQueryClient();

  return useMutation<
    WorkoutSession,
    Error,
    { sessionId: string; allowIncomplete?: boolean }
  >({
    mutationFn: ({ sessionId, allowIncomplete }) =>
      apiClient.post<WorkoutSession>(
        API_ENDPOINTS.workoutSessions.advanceExercise(sessionId),
        { allowIncomplete: allowIncomplete === true },
      ),
    onSuccess: (session) => {
      cacheSession(queryClient, session);
    },
  });
}

export function useFinishWorkoutSession() {
  const queryClient = useQueryClient();

  return useMutation<WorkoutSession, Error, { sessionId: string }>({
    mutationFn: ({ sessionId }) =>
      apiClient.patch<WorkoutSession>(
        API_ENDPOINTS.workoutSessions.finish(sessionId),
      ),
    onSuccess: (session) => {
      cacheSession(queryClient, session);
    },
  });
}

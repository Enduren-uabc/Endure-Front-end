import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';
import type {
  CreateRoutineRequestDto,
  ListRoutinesResponseDto,
  RegisterSetInput,
  RoutineResponseDto,
  StartWorkoutSessionRequestDto,
  WorkoutSessionDetailResponseDto,
  WorkoutSessionResponseDto,
} from '@/shared/api/types/training';

export const trainingQueryKeys = {
  routines: ['training', 'routines'] as const,
  routine: (routineId: string) => ['training', 'routine', routineId] as const,
  workoutSession: (sessionId: string) => ['training', 'workout-session', sessionId] as const,
};

export const trainingService = {
  async listRoutines(): Promise<RoutineResponseDto[]> {
    const response = await apiClient.get<ListRoutinesResponseDto>(API_ENDPOINTS.routines.list);
    return response.routines;
  },

  getRoutineDetail(routineId: string): Promise<RoutineResponseDto> {
    return apiClient.get<RoutineResponseDto>(API_ENDPOINTS.routines.detail(routineId));
  },

  createRoutine(input: CreateRoutineRequestDto): Promise<RoutineResponseDto> {
    return apiClient.post<RoutineResponseDto>(API_ENDPOINTS.routines.create, input);
  },

  startWorkout(input: StartWorkoutSessionRequestDto): Promise<WorkoutSessionResponseDto> {
    return apiClient.post<WorkoutSessionResponseDto>(API_ENDPOINTS.workoutSessions.create, input);
  },

  getWorkoutSession(sessionId: string): Promise<WorkoutSessionDetailResponseDto> {
    return apiClient.get<WorkoutSessionDetailResponseDto>(
      API_ENDPOINTS.workoutSessions.detail(sessionId),
    );
  },

  async registerSet(input: RegisterSetInput): Promise<WorkoutSessionResponseDto> {
    await apiClient.patch<WorkoutSessionResponseDto>(
      API_ENDPOINTS.workoutSessions.registerSet(
        input.sessionId,
        input.exerciseIndex,
        input.setNumber,
      ),
      {
        repsPerformed: input.repsPerformed,
        weightUsed: input.weightUsed,
      },
    );

    return apiClient.patch<WorkoutSessionResponseDto>(
      API_ENDPOINTS.workoutSessions.completeSet(
        input.sessionId,
        input.exerciseIndex,
        input.setNumber,
      ),
    );
  },

  advanceExercise(sessionId: string): Promise<WorkoutSessionResponseDto> {
    return apiClient.post<WorkoutSessionResponseDto>(
      API_ENDPOINTS.workoutSessions.advanceExercise(sessionId),
    );
  },

  finishWorkout(sessionId: string): Promise<WorkoutSessionResponseDto> {
    return apiClient.patch<WorkoutSessionResponseDto>(
      API_ENDPOINTS.workoutSessions.finish(sessionId),
    );
  },
};

export function useRoutines() {
  return useQuery({
    queryKey: trainingQueryKeys.routines,
    queryFn: trainingService.listRoutines,
    retry: 1,
  });
}

export function useRoutineDetail(routineId: string) {
  return useQuery({
    queryKey: trainingQueryKeys.routine(routineId),
    queryFn: () => trainingService.getRoutineDetail(routineId),
    enabled: routineId.length > 0,
    retry: 1,
  });
}

export function useCreateRoutine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: trainingService.createRoutine,
    onSuccess: (routine) => {
      queryClient.invalidateQueries({ queryKey: trainingQueryKeys.routines });
      queryClient.setQueryData(trainingQueryKeys.routine(routine.id), routine);
    },
  });
}

export function useStartWorkout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: trainingService.startWorkout,
    onSuccess: (session) => {
      queryClient.invalidateQueries({ queryKey: trainingQueryKeys.routines });
      queryClient.invalidateQueries({ queryKey: trainingQueryKeys.workoutSession(session.id) });
    },
  });
}

export function useWorkoutSession(sessionId: string) {
  return useQuery({
    queryKey: trainingQueryKeys.workoutSession(sessionId),
    queryFn: () => trainingService.getWorkoutSession(sessionId),
    enabled: sessionId.length > 0,
    retry: 1,
  });
}

export function useRegisterSet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: trainingService.registerSet,
    onSuccess: (_session, input) => {
      queryClient.invalidateQueries({
        queryKey: trainingQueryKeys.workoutSession(input.sessionId),
      });
    },
  });
}

export function useAdvanceExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: trainingService.advanceExercise,
    onSuccess: (session) => {
      queryClient.invalidateQueries({ queryKey: trainingQueryKeys.workoutSession(session.id) });
    },
  });
}

export function useFinishWorkout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: trainingService.finishWorkout,
    onSuccess: (session) => {
      queryClient.invalidateQueries({ queryKey: trainingQueryKeys.workoutSession(session.id) });
    },
  });
}

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

import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';
import type { ForkResponseApi } from '@/features/social/types/social-api.types';
import type { ForkExerciseOverride } from '@/features/social/types/social.types';

export const forkService = {
  async forkWorkoutToRoutine(
    routineId: string,
    dayOfWeek: string,
    sourceWorkoutSessionId: string,
    exercises?: ForkExerciseOverride[],
  ) {
    return apiClient.post<ForkResponseApi>(
      API_ENDPOINTS.routines.forkWorkout(routineId, dayOfWeek),
      {
        sourceWorkoutSessionId,
        exercises,
      },
    );
  },
};

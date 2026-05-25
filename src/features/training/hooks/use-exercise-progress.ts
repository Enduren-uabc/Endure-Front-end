import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';
import type { ExerciseProgressResponse } from '@/features/training/types/workout-session';

const keys = {
  exerciseProgress: (exerciseId: string) =>
    ['workout-session', 'exercise-progress', exerciseId] as const,
};

export function useExerciseProgress(exerciseId: string | undefined) {
  return useQuery<ExerciseProgressResponse>({
    queryKey: keys.exerciseProgress(exerciseId ?? ''),
    queryFn: () =>
      apiClient.get<ExerciseProgressResponse>(
        API_ENDPOINTS.workoutSessions.exerciseProgress(exerciseId ?? ''),
      ),
    enabled: !!exerciseId,
    staleTime: 30_000,
  });
}

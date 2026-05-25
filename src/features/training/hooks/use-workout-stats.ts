import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';

export interface WorkoutStats {
  totalWorkouts: number;
  currentStreak: number;
  longestStreak: number;
}

const keys = {
  stats: ['workout-session', 'stats'] as const,
};

export function useWorkoutStats() {
  return useQuery<WorkoutStats>({
    queryKey: keys.stats,
    queryFn: () =>
      apiClient.get<WorkoutStats>(API_ENDPOINTS.workoutSessions.stats),
    staleTime: 30_000,
  });
}

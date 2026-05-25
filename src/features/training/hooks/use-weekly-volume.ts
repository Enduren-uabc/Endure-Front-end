import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';

export interface WeeklyVolumeEntry {
  weekStart: string;
  weekLabel: string;
  totalVolume: number;
  workoutCount: number;
}

export interface WeeklyVolumeResponse {
  entries: WeeklyVolumeEntry[];
}

const keys = {
  weeklyVolume: ['workout-session', 'weekly-volume'] as const,
};

export function useWeeklyVolume() {
  return useQuery<WeeklyVolumeResponse>({
    queryKey: keys.weeklyVolume,
    queryFn: () =>
      apiClient.get<WeeklyVolumeResponse>(API_ENDPOINTS.workoutSessions.weeklyVolume),
    staleTime: 30_000,
  });
}

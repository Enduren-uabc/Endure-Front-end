import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';
import type { PersonalRecordsResponse } from '@/features/training/types/workout-session';

const keys = {
  personalRecords: ['workout-session', 'personal-records'] as const,
};

export function usePersonalRecords() {
  return useQuery<PersonalRecordsResponse>({
    queryKey: keys.personalRecords,
    queryFn: () =>
      apiClient.get<PersonalRecordsResponse>(API_ENDPOINTS.workoutSessions.personalRecords),
    staleTime: 30_000,
  });
}

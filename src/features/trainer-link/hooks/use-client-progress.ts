import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';
import type {
  ClientGeneralInfo,
  RecentSession,
  BasicIndicators,
  ClientProgress,
  ExerciseProgressResponse,
} from '../types/trainer-link';

export function useClientGeneralInfo(clientId: string) {
  return useQuery<ClientGeneralInfo>({
    queryKey: ['trainer-link', 'client-general-info', clientId],
    queryFn: () => apiClient.get<ClientGeneralInfo>(
      API_ENDPOINTS.trainerLink.clientGeneralInfo(clientId),
    ),
    enabled: !!clientId,
  });
}

export function useRecentSessions(clientId: string) {
  return useQuery<RecentSession[]>({
    queryKey: ['trainer-link', 'recent-sessions', clientId],
    queryFn: () => apiClient.get<RecentSession[]>(
      API_ENDPOINTS.trainerLink.clientRecentSessions(clientId),
    ),
    enabled: !!clientId,
  });
}

export function useBasicIndicators(clientId: string) {
  return useQuery<BasicIndicators>({
    queryKey: ['trainer-link', 'basic-indicators', clientId],
    queryFn: () => apiClient.get<BasicIndicators>(
      API_ENDPOINTS.trainerLink.clientIndicators(clientId),
    ),
    enabled: !!clientId,
  });
}

export function useClientProgress(clientId: string) {
  return useQuery<ClientProgress>({
    queryKey: ['trainer-link', 'client-progress', clientId],
    queryFn: () => apiClient.get<ClientProgress>(
      API_ENDPOINTS.trainerLink.clientProgress(clientId),
    ),
    enabled: !!clientId,
  });
}

export function useClientExerciseProgress(clientId: string, exerciseId: string) {
  return useQuery<ExerciseProgressResponse>({
    queryKey: ['trainer-link', 'exercise-progress', clientId, exerciseId],
    queryFn: () => apiClient.get<ExerciseProgressResponse>(
      API_ENDPOINTS.trainerLink.clientExerciseProgress(clientId, exerciseId),
    ),
    enabled: !!clientId && !!exerciseId,
  });
}

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';
import type { TrainingStrategy } from '../types/training-strategy';

interface ListTrainingStrategiesResponse {
  strategies: TrainingStrategy[];
}

export function useTrainingStrategies() {
  return useQuery<TrainingStrategy[]>({
    queryKey: ['training-strategies'],
    queryFn: async () => {
      const data = await apiClient.get<ListTrainingStrategiesResponse>(
        API_ENDPOINTS.trainingStrategies.list,
      );
      return data.strategies ?? [];
    },
  });
}

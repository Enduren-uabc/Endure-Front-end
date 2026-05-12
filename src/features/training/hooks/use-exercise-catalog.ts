import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';
import type {
  ExerciseCatalogItem,
  ExerciseCatalogFilters,
} from '../types/exercise-catalog';

interface ExerciseCatalogResponse {
  exercises: ExerciseCatalogItem[];
}

export function useExerciseCatalog(filters: ExerciseCatalogFilters = {}) {
  return useQuery<ExerciseCatalogItem[]>({
    queryKey: ['exerciseCatalog', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.search) params.set('search', filters.search);
      if (filters.category) params.set('category', filters.category);
      if (filters.muscleGroup) params.set('muscleGroup', filters.muscleGroup);
      if (filters.equipment) params.set('equipment', filters.equipment);

      const endpoint = params.toString()
        ? `${API_ENDPOINTS.exercises.catalog}?${params.toString()}`
        : API_ENDPOINTS.exercises.catalog;

      const data = await apiClient.get<ExerciseCatalogItem[] | ExerciseCatalogResponse>(endpoint);

      if (Array.isArray(data)) {
        return data;
      }
      return data.exercises ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
}
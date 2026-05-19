import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';
import type {
  ExerciseCatalogItem,
  ExerciseCatalogFilters,
} from '../types/exercise-catalog';

interface ExerciseCatalogApiResponse {
  data: Array<{
    id: string;
    name: string;
    category: string;
    primaryMuscleGroup: string;
    equipment: string;
    videoUrl: string | null;
    imageUrl: string | null;
  }>;
  total: number;
  page: number;
  limit: number;
}

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

      const data = await apiClient.get<ExerciseCatalogApiResponse | ExerciseCatalogItem[] | ExerciseCatalogResponse>(endpoint);

      if (Array.isArray(data)) {
        return data;
      }

      if ('data' in data && Array.isArray(data.data)) {
        return data.data.map((item) => ({
          id: item.id,
          name: item.name,
          category: item.category as ExerciseCatalogItem['category'],
          muscleGroups: [item.primaryMuscleGroup],
          equipment: item.equipment,
          videoUrl: item.videoUrl,
          imageUrl: item.imageUrl,
        }));
      }

      return (data as ExerciseCatalogResponse).exercises ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
}
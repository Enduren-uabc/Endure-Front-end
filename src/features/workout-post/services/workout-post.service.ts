import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';
import type { CreateWorkoutPublicationRequestApi, PublicationApi } from '@/features/social/types/social-api.types';
import { mapPublicationFromApi } from '@/features/social/mappers/social.mapper';

export const workoutPostService = {
  async createFromWorkout(
    sessionId: string,
    payload: CreateWorkoutPublicationRequestApi,
  ) {
    const data = await apiClient.post<PublicationApi>(
      API_ENDPOINTS.publications.fromWorkout(sessionId),
      payload,
    );
    return mapPublicationFromApi(data);
  },
};

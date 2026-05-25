import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateWorkoutPublicationRequestApi } from '@/features/social/types/social-api.types';
import { workoutPostService } from '../services/workout-post.service';

export function useCreateWorkoutPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      ...payload
    }: CreateWorkoutPublicationRequestApi & { sessionId: string }) =>
      workoutPostService.createFromWorkout(sessionId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['social-feed'] });
    },
  });
}

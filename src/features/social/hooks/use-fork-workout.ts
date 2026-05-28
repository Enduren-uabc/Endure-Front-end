import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ForkExerciseOverride } from '@/features/social/types/social.types';
import { forkService } from '../services/fork.service';

export function useForkWorkout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      routineId,
      dayOfWeek,
      sourceWorkoutSessionId,
      exercises,
    }: {
      routineId: string;
      dayOfWeek: string;
      sourceWorkoutSessionId: string;
      exercises?: ForkExerciseOverride[];
    }) =>
      forkService.forkWorkoutToRoutine(
        routineId,
        dayOfWeek,
        sourceWorkoutSessionId,
        exercises,
      ),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['routines'] });
      await queryClient.invalidateQueries({ queryKey: ['routine', variables.routineId] });
    },
  });
}

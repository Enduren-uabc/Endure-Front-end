import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';
import type { ExerciseSet } from '../types/routine';

interface GenerateExerciseSetsPayload {
  routineId: string;
  strategyKey: string | null;
  numberOfSets: number;
  initialWeight: number;
  initialReps: number;
}

interface GenerateExerciseSetsResponse {
  sets: Array<{ setNumber: number; reps: number; weight: number }>;
}

export function useGenerateExerciseSets() {
  return useMutation<ExerciseSet[], Error, GenerateExerciseSetsPayload>({
    mutationFn: async (payload) => {
      const data = await apiClient.post<GenerateExerciseSetsResponse>(
        API_ENDPOINTS.routines.generateSets(payload.routineId),
        {
          strategyKey: payload.strategyKey,
          numberOfSets: payload.numberOfSets,
          initialWeight: payload.initialWeight,
          initialReps: payload.initialReps,
        },
      );
      return (data.sets ?? []).map((s) => ({
        setNumber: s.setNumber,
        reps: s.reps,
        weight: s.weight,
      }));
    },
  });
}

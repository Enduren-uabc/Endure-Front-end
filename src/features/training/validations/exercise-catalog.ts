import { z } from 'zod';
import { EXERCISE_CATEGORIES, type ExerciseCategory } from '../types/exercise-catalog';

export const exerciseCatalogFiltersSchema = z.object({
  search: z.string().optional(),
  category: z.enum(EXERCISE_CATEGORIES as [ExerciseCategory, ...ExerciseCategory[]]).optional(),
  muscleGroup: z.string().optional(),
  equipment: z.string().optional(),
});

export type ExerciseCatalogFiltersFormData = z.infer<typeof exerciseCatalogFiltersSchema>;
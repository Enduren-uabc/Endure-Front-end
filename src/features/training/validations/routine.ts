import { z } from 'zod';

export const exerciseSetSchema = z.object({
  setNumber: z.number().min(1),
  reps: z.coerce.number().min(1).max(50),
  weight: z.coerce.number().min(0),
  restSeconds: z.coerce.number().min(0).optional(),
});

export const exerciseSetsSchema = z.array(exerciseSetSchema).min(1).max(10);

import { z } from 'zod';

const EMOJI_PATTERN = /[\p{Emoji_Presentation}\p{Extended_Pictographic}\p{Emoji}]/u;

export const ROUTINE_NAME_MAX_LENGTH = 50;

export const routineNameSchema = z
  .string()
  .trim()
  .min(1, 'Ingresa un nombre para la rutina')
  .max(
    ROUTINE_NAME_MAX_LENGTH,
    `El nombre no puede exceder ${ROUTINE_NAME_MAX_LENGTH} caracteres`,
  )
  .refine((val) => !EMOJI_PATTERN.test(val), {
    message: 'El nombre no puede contener emojis',
  });

export const exerciseSetSchema = z.object({
  setNumber: z.number().min(1),
  reps: z.coerce.number().min(1).max(50),
  weight: z.coerce.number().min(0),
  restSeconds: z.coerce.number().min(0).optional(),
});

export const exerciseSetsSchema = z.array(exerciseSetSchema).min(1).max(10);

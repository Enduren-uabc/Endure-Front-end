import { z } from 'zod';

const EMOJI_PATTERN = /[\p{Emoji_Presentation}\p{Extended_Pictographic}\p{Emoji}]/u;

export const ROUTINE_NAME_MAX_LENGTH = 30;
export const EXERCISE_NAME_MAX_LENGTH = 50;

export const routineNameSchema = z
  .string()
  .trim()
  .min(1, 'Ingresa un nombre para la rutina')
  .max(
    ROUTINE_NAME_MAX_LENGTH,
    `El nombre no puede exceder ${ROUTINE_NAME_MAX_LENGTH} caracteres`,
  )
  .refine((val) => /[a-zA-Z]/.test(val), {
    message: 'El nombre debe contener al menos una letra',
  })
  .refine((val) => !EMOJI_PATTERN.test(val), {
    message: 'El nombre no puede contener emojis',
  });

export const exerciseNameSchema = z
  .string()
  .trim()
  .min(2, 'El nombre debe tener al menos 2 caracteres')
  .max(
    EXERCISE_NAME_MAX_LENGTH,
    `El nombre no puede exceder ${EXERCISE_NAME_MAX_LENGTH} caracteres`,
  )
  .refine((val) => /[a-zA-Z]/.test(val), {
    message: 'El nombre debe contener al menos una letra',
  })
  .refine((val) => !/\d{5,}/.test(val), {
    message: 'No puede haber más de 4 números seguidos',
  })
  .refine((val) => !EMOJI_PATTERN.test(val), {
    message: 'El nombre no puede contener emojis',
  })
  .refine((val) => !/\s{2,}/.test(val), {
    message: 'El nombre no puede tener espacios consecutivos',
  });

export const exerciseSetSchema = z.object({
  setNumber: z.number().min(1),
  reps: z.coerce.number().min(1).max(50),
  weight: z.coerce.number().min(0),
  restSeconds: z.coerce.number().min(0).optional(),
});

export const exerciseSetsSchema = z.array(exerciseSetSchema).min(1).max(10);

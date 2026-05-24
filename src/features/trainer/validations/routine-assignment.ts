import { z } from 'zod';

export const assignRoutineSchema = z.object({
  routineId: z.string().uuid('Selecciona una rutina válida'),
  notes: z
    .string()
    .max(500, 'Las notas no pueden exceder 500 caracteres')
    .optional(),
});

export type AssignRoutineFormData = z.infer<typeof assignRoutineSchema>;

export const replaceRoutineSchema = z.object({
  newRoutineId: z.string().uuid('Selecciona una rutina válida'),
  notes: z
    .string()
    .max(500, 'Las notas no pueden exceder 500 caracteres')
    .optional(),
});

export type ReplaceRoutineFormData = z.infer<typeof replaceRoutineSchema>;

const exerciseSchema = z.object({
  exerciseId: z.string().uuid(),
  name: z.string().min(1, 'El nombre del ejercicio es obligatorio'),
  sets: z.number().int().min(1, 'Debe tener al menos 1 serie'),
  reps: z.number().int().min(1, 'Debe tener al menos 1 repetición'),
  restSeconds: z.number().int().min(0),
  order: z.number().int().min(1),
});

const daySchema = z.object({
  dayOfWeek: z.string().min(1, 'El día es obligatorio'),
  exercises: z
    .array(exerciseSchema)
    .min(1, 'Cada día debe tener al menos un ejercicio'),
});

export const editRoutineContentSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre no puede estar vacío')
    .max(100)
    .optional(),
  days: z.array(daySchema).min(1, 'Debe haber al menos un día').optional(),
});

export type EditRoutineContentFormData = z.infer<
  typeof editRoutineContentSchema
>;

export const updateNotesSchema = z.object({
  notes: z
    .string()
    .max(500, 'Las notas no pueden exceder 500 caracteres'),
});

export type UpdateNotesFormData = z.infer<typeof updateNotesSchema>;

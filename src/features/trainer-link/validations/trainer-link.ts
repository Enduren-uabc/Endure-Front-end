import { z } from 'zod';

export const sendLinkRequestSchema = z.object({
  trainerId: z.string().uuid('ID de entrenador inválido'),
  message: z.string().max(500, 'El mensaje no puede exceder 500 caracteres').optional(),
});

export type SendLinkRequestFormData = z.infer<typeof sendLinkRequestSchema>;

export const searchTrainerSchema = z.object({
  q: z.string().min(2, 'Ingresa al menos 2 caracteres'),
});

export const rejectRequestSchema = z.object({
  reason: z.string().max(500, 'El motivo no puede exceder 500 caracteres').optional(),
});

export const deactivateLinkSchema = z.object({
  reason: z.string().max(200, 'El motivo no puede exceder 200 caracteres').optional(),
});

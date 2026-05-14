import { z } from 'zod';

export const onboardingGoalSchema = z.object({
  mainGoal: z.enum(
    [
      'lose_weight',
      'gain_muscle',
      'maintain',
      'improve_endurance',
      'general_fitness',
    ],
    { message: 'Selecciona un objetivo' },
  ),
});

export const onboardingBasicDataSchema = z.object({
  fullName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Usa el formato YYYY-MM-DD'),
  gender: z.enum(['male', 'female', 'other'], { message: 'Selecciona un genero' }),
  weight: z.string().regex(/^\d+(\.\d+)?$/, 'Peso invalido'),
  height: z.string().regex(/^\d+(\.\d+)?$/, 'Estatura invalida'),
});

export const onboardingLevelSchema = z.object({
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced'], {
    message: 'Selecciona un nivel',
  }),
});

export type OnboardingGoalFormData = z.infer<typeof onboardingGoalSchema>;
export type OnboardingBasicDataFormData = z.infer<typeof onboardingBasicDataSchema>;
export type OnboardingLevelFormData = z.infer<typeof onboardingLevelSchema>;

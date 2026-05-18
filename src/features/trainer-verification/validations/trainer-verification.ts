import { z } from 'zod';

export const certificateInputSchema = z.object({
  name: z.string().min(1, 'El nombre del certificado es requerido'),
  issuingOrganization: z.string().min(1, 'La organización emisora es requerida'),
});

export const coachFormSchema = z.object({
  specialtyKeys: z
    .array(z.string())
    .min(1, 'Selecciona al menos 1 especialidad')
    .max(5, 'Máximo 5 especialidades'),
  yearsOfExperience: z
    .number()
    .int()
    .min(0, 'La experiencia no puede ser negativa')
    .max(50, 'Máximo 50 años de experiencia'),
  shortBio: z
    .string()
    .min(1, 'La bio es requerida')
    .max(500, 'Máximo 500 caracteres'),
  idDocumentNumber: z
    .string()
    .min(1, 'El número de identificación es requerido')
    .max(100, 'Máximo 100 caracteres'),
  idDocuments: z
    .array(z.any())
    .min(1, 'Sube al menos 1 documento de identidad')
    .max(3, 'Máximo 3 documentos'),
  certificates: z
    .array(
      z.object({
        name: z.string().min(1),
        issuingOrganization: z.string().min(1),
        file: z.any(),
      }),
    )
    .min(1, 'Sube al menos 1 certificado')
    .max(5, 'Máximo 5 certificados'),
});

export type CoachFormSchemaType = z.infer<typeof coachFormSchema>;

import type { DayOfWeek } from '@/features/training/types/routine';

export type ReminderStatus = 'activo' | 'eliminado' | 'inactivo';

export interface TrainingReminder {
  id: string;
  routineId: string;
  routineName: string;
  dayOfWeek: DayOfWeek;
  time: string;
  status: ReminderStatus;
  nextActivationAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReminderPayload {
  routineId: string;
  dayOfWeek: DayOfWeek;
  time: string;
  timezone?: string;
}

export interface EditReminderPayload {
  dayOfWeek?: DayOfWeek;
  time?: string;
}

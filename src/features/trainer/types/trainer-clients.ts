import type { Routine } from '@/features/training/types/routine';

export type TrainerClientFilter = 'all' | 'active' | 'inactive' | 'pending';
export type TrainerClientStatus = 'active' | 'inactive';
export type TrainerClientExperience = 'Principiante' | 'Intermedio' | 'Avanzado';
export type ClientProgressPeriod = '7d' | '30d' | '90d';

export interface TrainerClientRouteParams {
  clientId: string;
  clientName: string;
  linkId: string;
  activatedAt: string;
}

export interface TrainerClientViewModel extends TrainerClientRouteParams {
  initials: string;
  goal: string;
  ageLabel: string;
  experience: TrainerClientExperience;
  status: TrainerClientStatus;
  lastWorkoutLabel: string;
  streakDays: number;
  adherence: number;
  weeklySessions: number;
  volumeLabel: string;
  activeTimeLabel: string;
  inactiveReason?: string;
}

export interface TrainerClientMetric {
  id: string;
  label: string;
  value: string;
  helper: string;
  tone: 'primary' | 'success' | 'warning';
}

export interface TrainerClientSession {
  id: string;
  routineName: string;
  dateLabel: string;
  detail: string;
  volumeLabel: string;
  completionLabel: string;
}

export interface TrainerClientMeasurement {
  id: string;
  label: string;
  value: string;
  helper: string;
}

export interface TrainerClientAssignedRoutine {
  linkId: string;
  routineId: string;
  routineName: string;
  assignedAt: string;
  days: string[];
  note?: string;
}

export interface TrainerRoutineOption {
  routine: Routine;
  exerciseCount: number;
  dayLabels: string[];
}

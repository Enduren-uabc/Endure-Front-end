export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export const DAY_OF_WEEK_LABELS: Record<DayOfWeek, string> = {
  monday: 'Lun',
  tuesday: 'Mar',
  wednesday: 'Mié',
  thursday: 'Jue',
  friday: 'Vie',
  saturday: 'Sáb',
  sunday: 'Dom',
};

export const DAY_OF_WEEK_ORDER: DayOfWeek[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

export type RoutineTargetAudience = 'self' | 'client';

export interface ExerciseSet {
  id?: string;
  setNumber: number;
  reps: number;
  weight: number;
  restSeconds?: number | null;
}

export interface ExerciseConfig {
  id: string;
  name: string;
  order: number;
  sets: number | ExerciseSet[];
  repsPerSet?: number;
  weight?: number;
  detailedSets?: ExerciseSet[];
}

export interface RoutineDay {
  dayOfWeek: DayOfWeek;
  exercises: ExerciseConfig[];
}

export interface Routine {
  id: string;
  name: string;
  description?: string;
  isActive?: boolean;
  trainingStrategyKey?: string | null;
  targetAudience?: RoutineTargetAudience;
  dayOfWeeks: DayOfWeek[];
  days: RoutineDay[];
  createdAt?: string;
  updatedAt?: string;
}

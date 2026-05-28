export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export const DAY_OF_WEEK_ORDER: DayOfWeek[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

export const DAY_OF_WEEK_LABELS: Record<DayOfWeek, string> = {
  monday: 'Lun',
  tuesday: 'Mar',
  wednesday: 'Mie',
  thursday: 'Jue',
  friday: 'Vie',
  saturday: 'Sab',
  sunday: 'Dom',
};

export type RoutineTargetAudience = 'self' | 'client';
export type WorkoutSessionSourceType = 'personal' | 'trainer_assigned';

export interface ExerciseResponseDto {
  id: string;
  name: string;
  order: number;
  catalogId?: string | null;
  sets: number | null;
  repsPerSet: number | null;
  weight: number | null;
}

export interface CreateDefaultRoutineRequestDto {
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  trainingSplitKey?: 'ppl' | 'arnold';
  trainingStrategyKey: string;
}

export interface RoutineDayResponseDto {
  dayOfWeek: DayOfWeek;
  exercises: ExerciseResponseDto[];
}

export interface RoutineResponseDto {
  id: string;
  name: string;
  userId: string;
  isActive: boolean;
  targetAudience: RoutineTargetAudience;
  days: RoutineDayResponseDto[];
  createdAt: string;
  updatedAt: string;
}

export interface ListRoutinesResponseDto {
  routines: RoutineResponseDto[];
}

export interface CreateRoutineRequestDto {
  name: string;
  dayOfWeeks: DayOfWeek[];
  targetAudience?: RoutineTargetAudience;
}

export interface StartWorkoutSessionRequestDto {
  routineId: string;
  dayOfWeek?: DayOfWeek;
}

export interface RegisterSetRepsAndWeightRequestDto {
  repsPerformed: number;
  weightUsed: number;
}

export interface WorkoutSetResponseDto {
  setNumber: number;
  repsPerformed: number | null;
  weightUsed: number | null;
  targetReps: number | null;
  targetWeight: number | null;
  completed: boolean;
}

export interface WorkoutExerciseResponseDto {
  exerciseId: string;
  exerciseName: string;
  order: number;
  sets: number;
  repsPerSet: number;
  weight: number;
  workoutSets: WorkoutSetResponseDto[];
}

export interface WorkoutSessionResponseDto {
  id: string;
  userId: string;
  routineId: string;
  sourceType: WorkoutSessionSourceType;
  assignedRoutineId: string | null;
  status: string;
  currentExerciseIndex: number;
  exercises: WorkoutExerciseResponseDto[];
  startedAt: string;
  finishedAt: string | null;
}

export interface WorkoutSessionDetailResponseDto extends WorkoutSessionResponseDto {
  routineName: string;
  durationMinutes: number | null;
}

export interface RegisterSetInput extends RegisterSetRepsAndWeightRequestDto {
  sessionId: string;
  exerciseIndex: number;
  setNumber: number;
}

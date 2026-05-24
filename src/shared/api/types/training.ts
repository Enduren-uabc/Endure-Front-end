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

export interface ExerciseResponseDto {
  id: string;
  name: string;
  order: number;
  sets: number | null;
  repsPerSet: number | null;
  weight: number | null;
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
}

export interface StartWorkoutSessionRequestDto {
  routineId: string;
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

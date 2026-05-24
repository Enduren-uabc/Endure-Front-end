import type { DayOfWeek } from './routine';

export type WorkoutSessionStatus = 'in_progress' | 'finished';

export interface WorkoutSet {
  setNumber: number;
  repsPerformed: number | null;
  weightUsed: number | null;
  targetReps: number | null;
  targetWeight: number | null;
  completed: boolean;
}

export interface WorkoutExerciseTargetSet {
  setNumber: number;
  reps: number;
  weight: number;
}

export interface WorkoutExercise {
  exerciseId: string;
  exerciseName: string;
  order: number;
  targetSets: WorkoutExerciseTargetSet[];
  workoutSets: WorkoutSet[];
}

export interface WorkoutSession {
  id: string;
  userId: string;
  routineId: string;
  dayOfWeek: DayOfWeek;
  status: WorkoutSessionStatus;
  currentExerciseIndex: number;
  exercises: WorkoutExercise[];
  startedAt: string;
  finishedAt: string | null;
}

export interface WorkoutSessionDetail extends WorkoutSession {
  routineName: string;
  durationMinutes: number | null;
}

export interface WorkoutSessionSummary {
  id: string;
  routineId: string;
  dayOfWeek: DayOfWeek;
  routineName: string;
  startedAt: string;
  finishedAt: string | null;
  durationMinutes: number | null;
  exerciseCount: number;
  status: WorkoutSessionStatus;
}

export interface WorkoutSessionHistoryResponse {
  sessions: WorkoutSessionSummary[];
  hasIncompleteData: boolean;
}

export interface WorkoutSessionStats {
  totalExercises: number;
  completedSets: number;
  pendingSets: number;
  totalSets: number;
}

import type { Routine } from '@/features/training/types/routine';
import type { WorkoutSession, WorkoutSessionSummary } from '@/features/training/types/workout-session';

export interface HomeProfileData {
  fullName: string;
}

export interface HomeWorkoutHistory {
  sessions: WorkoutSessionSummary[];
  hasIncompleteData: boolean;
}

export interface WeeklyStats {
  completedWorkouts: number;
  activeMinutes: number;
  activeDays: boolean[];
  hasIncompleteData: boolean;
  hasIncompleteMinutes: boolean;
}

export interface HomeQueryState<T> {
  data: T | undefined;
  isPending: boolean;
  isError: boolean;
}

export type HomeWorkoutAction =
  | { kind: 'loading' | 'error' | 'incomplete' | 'no-routine' }
  | { kind: 'resume'; session: WorkoutSession }
  | { kind: 'ready' | 'no-exercises'; routine: Routine; exerciseCount: number };

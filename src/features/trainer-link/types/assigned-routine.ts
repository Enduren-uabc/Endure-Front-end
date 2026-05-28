export type AssignedRoutineSource = 'mock' | 'api';
export type AssignedRoutineStatus = 'active' | 'pending' | 'completed';
export type AssignedRoutineDayStatus = 'pending' | 'today' | 'completed';

export interface AssignedRoutineExercise {
  id: string;
  name: string;
  target: string;
  restLabel: string;
  muscleGroup: string;
}

export interface AssignedRoutineDay {
  id: string;
  dayOfWeek: string;
  label: string;
  dateHint: string;
  status: AssignedRoutineDayStatus;
  exercises: AssignedRoutineExercise[];
}

export interface AssignedRoutineDetail {
  id: string;
  name: string;
  goal: string;
  level: string;
  durationMinutes: number;
  assignedAt: string;
  startsAt: string;
  status: AssignedRoutineStatus;
  adherenceTarget: number;
  note: string;
  trainer: {
    id: string;
    name: string;
    code: string | null;
  };
  days: AssignedRoutineDay[];
  source: AssignedRoutineSource;
}

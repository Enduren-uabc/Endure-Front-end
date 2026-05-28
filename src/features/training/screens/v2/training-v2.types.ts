export type TrainingV2State = 'loading' | 'empty' | 'error' | 'success';

export type RoutineV2Filter =
  | 'Todas'
  | 'Fuerza'
  | 'Cardio'
  | 'Movilidad'
  | 'Mias';

export type ExerciseV2Group =
  | 'Pierna'
  | 'Pecho'
  | 'Espalda'
  | 'Hombro'
  | 'Core'
  | 'Cardio';

export type TrainingV2Level = 'Principiante' | 'Intermedio' | 'Avanzado';

export interface MetricV2 {
  id: string;
  label: string;
  value: string;
  helper: string;
  trend?: string;
}

export interface ExerciseSetV2 {
  id: string;
  label: string;
  targetReps: number;
  targetWeightKg: number;
  actualReps?: number;
  actualWeightKg?: number;
  completed?: boolean;
}

export interface ExerciseV2 {
  id: string;
  name: string;
  group: ExerciseV2Group;
  equipment: string;
  primaryMuscle: string;
  level: TrainingV2Level;
  imageUri: string;
  instructions: string[];
  sets: ExerciseSetV2[];
}

export interface RoutineV2 {
  id: string;
  name: string;
  type: RoutineV2Filter;
  level: TrainingV2Level;
  durationMinutes: number;
  exerciseCount: number;
  description: string;
  goal: string;
  days: string[];
  imageUri: string;
  isMine: boolean;
  exercises: ExerciseV2[];
}

export interface WorkoutHistoryV2 {
  id: string;
  routineName: string;
  dateLabel: string;
  durationLabel: string;
  volumeLabel: string;
  completedSets: number;
  totalSets: number;
  highlight: string;
}

export interface WorkoutSessionV2 {
  id: string;
  routine: RoutineV2;
  currentExercise: ExerciseV2;
  currentSet: ExerciseSetV2;
  elapsedLabel: string;
  restSeconds: number;
}

export interface RoutineTemplate {
  id: string;
  experienceLevel: string;
  splitKey: string | null;
  name: string;
  dayCount: number;
  exerciseCount: number;
  totalSets: number;
  description: string;
}

export interface RoutineTemplateDay {
  dayOfWeek: string;
  name: string;
  displayOrder: number;
  exercises: Array<{
    catalogId: string;
    name: string;
    setsCount: number;
    initialReps: number;
    initialWeight: number;
    order: number;
  }>;
}

export interface RoutineTemplateDetail {
  id: string;
  experienceLevel: string;
  splitKey: string | null;
  name: string;
  description: string;
  days: RoutineTemplateDay[];
}

export interface RoutineTemplateListResponse {
  templates: RoutineTemplate[];
  total: number;
  page: number;
  limit: number;
}

export type TemplateFilter = 'Todos' | 'Principiante' | 'Intermedio' | 'Avanzado';

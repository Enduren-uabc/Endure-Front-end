export type ExerciseCategory =
  | 'chest'
  | 'back'
  | 'legs'
  | 'shoulders'
  | 'arms'
  | 'core'
  | 'cardio';

export const EXERCISE_CATEGORY_LABELS: Record<ExerciseCategory, string> = {
  chest: 'Pecho',
  back: 'Espalda',
  legs: 'Piernas',
  shoulders: 'Hombros',
  arms: 'Brazos',
  core: 'Core',
  cardio: 'Cardio',
};

export const EXERCISE_CATEGORIES: ExerciseCategory[] = [
  'chest',
  'back',
  'legs',
  'shoulders',
  'arms',
  'core',
  'cardio',
];

export type MuscleGroup = string;

export type Equipment = string;

export interface ExerciseCatalogItem {
  id: string;
  name: string;
  category: ExerciseCategory;
  muscleGroups: MuscleGroup[];
  equipment: Equipment;
}

export interface ExerciseCatalogFilters {
  search?: string;
  category?: ExerciseCategory;
  muscleGroup?: string;
  equipment?: string;
}
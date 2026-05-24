import type {
  ExerciseConfig,
} from '@/features/training/types/routine';
import type {
  ExerciseV2,
  MetricV2,
  RoutineV2,
  RoutineV2Filter,
  WorkoutHistoryV2,
  WorkoutSessionV2,
} from './training-v2.types';

export const routineFiltersV2: RoutineV2Filter[] = [
  'Todas',
  'Fuerza',
  'Cardio',
  'Movilidad',
  'Mias',
];

export const weeklyMetricsV2: MetricV2[] = [
  { id: 'workouts', label: 'Entrenamientos', value: '3 / 4', helper: 'Meta semanal' },
  { id: 'volume', label: 'Volumen', value: '12.4k', helper: 'kg acumulados', trend: '+8%' },
  { id: 'time', label: 'Tiempo activo', value: '4h 20m', helper: 'Esta semana' },
];

export const exercisesV2: ExerciseV2[] = [
  {
    id: 'ex-squat',
    name: 'Sentadilla trasera',
    group: 'Pierna',
    equipment: 'Barra olimpica',
    primaryMuscle: 'Cuadriceps',
    level: 'Intermedio',
    imageUri:
      'https://images.unsplash.com/photo-1534368959876-93c4ef0a56d6?auto=format&fit=crop&w=900&q=80',
    instructions: [
      'Mantiene el torso firme antes de bajar.',
      'Baja hasta una profundidad comoda y estable.',
      'Empuja el suelo para subir sin perder control.',
    ],
    sets: [
      { id: 'sq-1', label: 'Serie 1', targetReps: 8, targetWeightKg: 60, completed: true },
      { id: 'sq-2', label: 'Serie 2', targetReps: 8, targetWeightKg: 62.5 },
      { id: 'sq-3', label: 'Serie 3', targetReps: 8, targetWeightKg: 62.5 },
    ],
  },
  {
    id: 'ex-bench',
    name: 'Press de banca',
    group: 'Pecho',
    equipment: 'Barra olimpica',
    primaryMuscle: 'Pectoral',
    level: 'Intermedio',
    imageUri:
      'https://images.unsplash.com/photo-1584466977773-e625c37cdd50?auto=format&fit=crop&w=900&q=80',
    instructions: [
      'Fija escapulas y pies antes de iniciar.',
      'Baja la barra con control al pecho.',
      'Empuja en linea estable sin despegar la espalda.',
    ],
    sets: [
      { id: 'bp-1', label: 'Serie 1', targetReps: 8, targetWeightKg: 50 },
      { id: 'bp-2', label: 'Serie 2', targetReps: 8, targetWeightKg: 52.5 },
      { id: 'bp-3', label: 'Serie 3', targetReps: 8, targetWeightKg: 52.5 },
    ],
  },
  {
    id: 'ex-row',
    name: 'Remo con mancuerna',
    group: 'Espalda',
    equipment: 'Mancuernas',
    primaryMuscle: 'Dorsal',
    level: 'Principiante',
    imageUri:
      'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=900&q=80',
    instructions: [
      'Apoya una mano y estabiliza la cadera.',
      'Tira el codo hacia atras sin girar el tronco.',
      'Baja la mancuerna con control completo.',
    ],
    sets: [
      { id: 'rw-1', label: 'Serie 1', targetReps: 10, targetWeightKg: 24 },
      { id: 'rw-2', label: 'Serie 2', targetReps: 10, targetWeightKg: 24 },
      { id: 'rw-3', label: 'Serie 3', targetReps: 10, targetWeightKg: 26 },
    ],
  },
  {
    id: 'ex-plank',
    name: 'Plancha frontal',
    group: 'Core',
    equipment: 'Peso corporal',
    primaryMuscle: 'Abdomen',
    level: 'Principiante',
    imageUri:
      'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?auto=format&fit=crop&w=900&q=80',
    instructions: [
      'Alinea hombros, cadera y tobillos.',
      'Aprieta abdomen y gluteos.',
      'Respira sin perder la postura.',
    ],
    sets: [
      { id: 'pl-1', label: 'Serie 1', targetReps: 45, targetWeightKg: 0 },
      { id: 'pl-2', label: 'Serie 2', targetReps: 45, targetWeightKg: 0 },
      { id: 'pl-3', label: 'Serie 3', targetReps: 45, targetWeightKg: 0 },
    ],
  },
];

export const routinesV2: RoutineV2[] = [
  {
    id: 'routine-strength',
    name: 'Fuerza full body',
    type: 'Fuerza',
    level: 'Intermedio',
    durationMinutes: 45,
    exerciseCount: 4,
    description:
      'Rutina equilibrada para trabajar fuerza general con basicos y accesorios controlados.',
    goal: 'Ganar fuerza',
    days: ['Lun', 'Mie', 'Vie'],
    imageUri:
      'https://images.unsplash.com/photo-1581009137042-c552e485697a?auto=format&fit=crop&w=900&q=80',
    isMine: true,
    exercises: exercisesV2,
  },
  {
    id: 'routine-hypertrophy',
    name: 'Hipertrofia tren superior',
    type: 'Fuerza',
    level: 'Intermedio',
    durationMinutes: 55,
    exerciseCount: 6,
    description:
      'Enfoque en empuje y tiron con volumen moderado para estimular progreso semanal.',
    goal: 'Ganar musculo',
    days: ['Mar', 'Jue'],
    imageUri:
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=900&q=80',
    isMine: true,
    exercises: exercisesV2.slice(1),
  },
  {
    id: 'routine-cardio',
    name: 'Cardio controlado',
    type: 'Cardio',
    level: 'Principiante',
    durationMinutes: 30,
    exerciseCount: 5,
    description:
      'Bloques de bajo impacto para mejorar resistencia sin saturar la recuperacion.',
    goal: 'Mejorar resistencia',
    days: ['Sab'],
    imageUri:
      'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&w=900&q=80',
    isMine: false,
    exercises: exercisesV2.slice(2),
  },
];

export const workoutSessionV2: WorkoutSessionV2 = {
  id: 'session-today',
  routine: routinesV2[0],
  currentExercise: exercisesV2[0],
  currentSet: exercisesV2[0].sets[1],
  elapsedLabel: '18:42',
  restSeconds: 90,
};

export const workoutHistoryV2: WorkoutHistoryV2[] = [
  {
    id: 'history-1',
    routineName: 'Fuerza full body',
    dateLabel: 'Hoy',
    durationLabel: '46 min',
    volumeLabel: '4,280 kg',
    completedSets: 12,
    totalSets: 12,
    highlight: 'Nuevo PR en sentadilla',
  },
  {
    id: 'history-2',
    routineName: 'Hipertrofia tren superior',
    dateLabel: 'Ayer',
    durationLabel: '52 min',
    volumeLabel: '3,740 kg',
    completedSets: 16,
    totalSets: 18,
    highlight: 'Buen ritmo de descanso',
  },
  {
    id: 'history-3',
    routineName: 'Cardio controlado',
    dateLabel: 'Hace 3 dias',
    durationLabel: '31 min',
    volumeLabel: 'Zona 2',
    completedSets: 5,
    totalSets: 5,
    highlight: 'Meta semanal en progreso',
  },
];

export const currentRoutineV2 = routinesV2[0];

export function toExerciseConfigV2(exercise: ExerciseV2, order = 0): ExerciseConfig {
  return {
    id: exercise.id,
    name: exercise.name,
    order,
    sets: exercise.sets.map((set, index) => ({
      id: set.id,
      setNumber: index + 1,
      reps: set.targetReps,
      weight: set.targetWeightKg,
      restSeconds: 90,
    })),
  };
}

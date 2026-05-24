import type { ActiveClient } from '@/features/trainer-link/types/trainer-link';
import { DAY_OF_WEEK_LABELS, DAY_OF_WEEK_ORDER, type Routine } from '@/features/training/types/routine';
import type {
  ClientProgressPeriod,
  TrainerClientMeasurement,
  TrainerClientMetric,
  TrainerClientRouteParams,
  TrainerClientSession,
  TrainerClientViewModel,
  TrainerRoutineOption,
} from '../types/trainer-clients';

const GOALS = [
  'Ganar fuerza',
  'Hipertrofia',
  'Mejorar resistencia',
  'Mantener constancia',
  'Movilidad y control',
] as const;

const EXPERIENCES = ['Principiante', 'Intermedio', 'Avanzado'] as const;

function textSeed(value: string): number {
  return value.split('').reduce((total, char) => total + char.charCodeAt(0), 0);
}

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

export function buildTrainerClientViewModel(
  client: ActiveClient | TrainerClientRouteParams,
): TrainerClientViewModel {
  const seed = textSeed(`${client.clientName}-${client.linkId}`);
  const inactive = seed % 5 === 0;
  const daysSinceLastWorkout = inactive ? 8 + (seed % 6) : 1 + (seed % 4);
  const weeklySessions = inactive ? Math.max(1, seed % 3) : 3 + (seed % 3);
  const adherence = inactive ? 46 + (seed % 18) : 72 + (seed % 24);

  return {
    clientId: client.clientId,
    clientName: client.clientName,
    linkId: client.linkId,
    activatedAt: client.activatedAt,
    initials: initials(client.clientName),
    goal: GOALS[seed % GOALS.length],
    ageLabel: `${22 + (seed % 17)} anos`,
    experience: EXPERIENCES[seed % EXPERIENCES.length],
    status: inactive ? 'inactive' : 'active',
    lastWorkoutLabel: `Hace ${daysSinceLastWorkout} dia${daysSinceLastWorkout === 1 ? '' : 's'}`,
    streakDays: inactive ? 0 : 2 + (seed % 9),
    adherence,
    weeklySessions,
    volumeLabel: `${Math.round((18 + seed % 42) / 10)}.${seed % 10}k kg`,
    activeTimeLabel: `${2 + (seed % 4)}h ${10 + (seed % 45)}m`,
    inactiveReason: inactive ? 'Sin entrenamiento reciente' : undefined,
  };
}

export function buildClientMetrics(client: TrainerClientViewModel): TrainerClientMetric[] {
  return [
    {
      id: 'adherence',
      label: 'Adherencia',
      value: `${client.adherence}%`,
      helper: 'Rutinas completadas',
      tone: client.adherence >= 70 ? 'success' : 'warning',
    },
    {
      id: 'sessions',
      label: 'Sesiones',
      value: String(client.weeklySessions),
      helper: 'Esta semana',
      tone: 'primary',
    },
    {
      id: 'streak',
      label: 'Racha',
      value: client.streakDays > 0 ? `${client.streakDays}d` : '0d',
      helper: client.streakDays > 0 ? 'Activa' : 'Pausada',
      tone: client.streakDays > 0 ? 'success' : 'warning',
    },
  ];
}

export function buildClientSessions(
  client: TrainerClientViewModel,
  period: ClientProgressPeriod,
): TrainerClientSession[] {
  const seed = textSeed(client.linkId);
  const baseCount = period === '7d' ? 3 : period === '30d' ? 5 : 7;
  const names = [
    'Fuerza full body',
    'Pierna completa',
    'Empuje superior',
    'Tiron superior',
    'Acondicionamiento',
    'Movilidad activa',
    'Core y estabilidad',
  ];

  return names.slice(0, client.status === 'inactive' ? 2 : baseCount).map((name, index) => {
    const daysAgo = index === 0 ? 1 + (seed % 4) : 3 + index * 4;
    const sets = 8 + ((seed + index) % 9);
    const totalSets = sets + (index % 3);

    return {
      id: `${client.linkId}-${period}-${index}`,
      routineName: name,
      dateLabel: index === 0 ? client.lastWorkoutLabel : `Hace ${daysAgo} dias`,
      detail: `${sets}/${totalSets} series registradas`,
      volumeLabel: `${2 + ((seed + index) % 4)}.${(seed + index) % 10}k kg`,
      completionLabel: `${Math.round((sets / totalSets) * 100)}% completado`,
    };
  });
}

export function buildClientMeasurements(client: TrainerClientViewModel): TrainerClientMeasurement[] {
  const seed = textSeed(client.clientId);

  return [
    {
      id: 'weight',
      label: 'Peso',
      value: `${64 + (seed % 22)}.${seed % 10} kg`,
      helper: 'Ultimo registro',
    },
    {
      id: 'body-fat',
      label: 'Grasa',
      value: `${14 + (seed % 12)}%`,
      helper: 'Estimado local',
    },
    {
      id: 'resting',
      label: 'Reposo',
      value: `${56 + (seed % 18)} bpm`,
      helper: 'Promedio semanal',
    },
  ];
}

export function buildRoutineOption(routine: Routine): TrainerRoutineOption {
  const exerciseCount = routine.days.reduce((total, day) => total + day.exercises.length, 0);
  const dayLabels = DAY_OF_WEEK_ORDER.filter((day) => routine.dayOfWeeks.includes(day)).map(
    (day) => DAY_OF_WEEK_LABELS[day],
  );

  return {
    routine,
    exerciseCount,
    dayLabels,
  };
}

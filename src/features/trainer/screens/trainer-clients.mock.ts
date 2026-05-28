import type { ActiveClient } from '@/features/trainer-link/types/trainer-link';
import { DAY_OF_WEEK_LABELS, DAY_OF_WEEK_ORDER, type Routine } from '@/features/training/types/routine';
import type {
  ClientProgressPeriod,
  TrainerClientAssignedRoutine,
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

const DEMO_ASSIGNED_ROUTINES = [
  {
    routineId: 'demo-assigned-strength',
    routineName: 'Fuerza semanal A',
    dayOfWeeks: ['monday', 'wednesday', 'friday'] as const,
    note: 'Mantener tecnica limpia y progresar sin llegar al fallo.',
  },
  {
    routineId: 'demo-assigned-upper',
    routineName: 'Tren superior controlado',
    dayOfWeeks: ['tuesday', 'thursday', 'saturday'] as const,
    note: 'Priorizar rango completo y descanso constante.',
  },
  {
    routineId: 'demo-assigned-hypertrophy',
    routineName: 'Hipertrofia base',
    dayOfWeeks: ['monday', 'tuesday', 'thursday', 'friday'] as const,
    note: 'Subir volumen solo si completa todas las series.',
  },
] as const;

const DEMO_REPLACEMENT_ROUTINES = [
  {
    id: 'demo-replacement-hypertrophy',
    name: 'Hipertrofia semanal B',
    description: 'Rutina demo para revisar reemplazo sin persistencia backend.',
    dayOfWeeks: ['monday', 'wednesday', 'friday'] as const,
  },
  {
    id: 'demo-replacement-lower',
    name: 'Pierna y core',
    description: 'Bloque demo con enfasis en tecnica, fuerza y estabilidad.',
    dayOfWeeks: ['tuesday', 'thursday', 'saturday'] as const,
  },
  {
    id: 'demo-replacement-conditioning',
    name: 'Acondicionamiento guiado',
    description: 'Opcion demo para clientes que necesitan adherencia progresiva.',
    dayOfWeeks: ['monday', 'thursday'] as const,
  },
] as const;

function textSeed(value: string | null | undefined): number {
  const safe = String(value ?? '');
  return safe.split('').reduce((total, char) => total + char.charCodeAt(0), 0);
}

function initials(name: string | null | undefined): string {
  return String(name ?? '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

export function buildTrainerClientViewModel(
  client: Partial<ActiveClient> & Partial<TrainerClientRouteParams>,
): TrainerClientViewModel {
  const clientId = client.clientId ?? 'unknown';
  const clientName = client.clientName ?? 'Cliente';
  const linkId = client.linkId ?? clientId;
  const activatedAt = client.activatedAt ?? new Date().toISOString();

  const seed = textSeed(`${clientName}-${linkId}`);
  const inactive = seed % 5 === 0;
  const daysSinceLastWorkout = inactive ? 8 + (seed % 6) : 1 + (seed % 4);
  const weeklySessions = inactive ? Math.max(1, seed % 3) : 3 + (seed % 3);
  const adherence = inactive ? 46 + (seed % 18) : 72 + (seed % 24);

  return {
    clientId,
    clientName,
    linkId,
    activatedAt,
    initials: initials(clientName),
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

export function buildDemoAssignedRoutine(
  client: Partial<TrainerClientRouteParams>,
): TrainerClientAssignedRoutine {
  const clientId = client.clientId ?? 'unknown';
  const linkId = client.linkId ?? clientId;
  const seed = textSeed(`${linkId}-${clientId}`);
  const template = DEMO_ASSIGNED_ROUTINES[seed % DEMO_ASSIGNED_ROUTINES.length];
  const assignedDay = 17 + (seed % 7);

  return {
    linkId,
    routineId: template.routineId,
    routineName: template.routineName,
    assignedAt: new Date(Date.UTC(2026, 4, assignedDay, 12, 0, 0)).toISOString(),
    days: template.dayOfWeeks.map((day) => DAY_OF_WEEK_LABELS[day]),
    note: template.note,
  };
}

export function buildDemoRoutineOptions(linkId: string | null | undefined): TrainerRoutineOption[] {
  const safeLinkId = String(linkId ?? 'default');
  const seed = textSeed(safeLinkId);

  return DEMO_REPLACEMENT_ROUTINES.map((template, index) =>
    buildRoutineOption({
      id: `${template.id}-${seed % 97}`,
      name: template.name,
      description: template.description,
      dayOfWeeks: [...template.dayOfWeeks],
      days: template.dayOfWeeks.map((dayOfWeek, dayIndex) => ({
        dayOfWeek,
        exercises: [
          {
            id: `${template.id}-exercise-${dayIndex}-main`,
            name: ['Sentadilla', 'Press banca', 'Peso muerto', 'Remo'][dayIndex % 4],
            order: 1,
            sets: 4,
            repsPerSet: 8 + ((seed + index + dayIndex) % 4),
            weight: 40 + ((seed + index + dayIndex) % 8) * 2.5,
          },
          {
            id: `${template.id}-exercise-${dayIndex}-accessory`,
            name: ['Plancha', 'Zancadas', 'Jalon al pecho', 'Press militar'][
              (seed + dayIndex) % 4
            ],
            order: 2,
            sets: 3,
            repsPerSet: 10,
            weight: 0,
          },
        ],
      })),
    }),
  );
}

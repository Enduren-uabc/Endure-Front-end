import type { ActiveTrainerResponse } from '../types/trainer-link';
import type { AssignedRoutineDetail } from '../types/assigned-routine';

type ActiveTrainer = NonNullable<ActiveTrainerResponse['trainer']>;

export function buildMockAssignedRoutine(trainer: ActiveTrainer): AssignedRoutineDetail {
  return {
    id: `assigned-${trainer.linkId}`,
    name: 'Fuerza base 3 dias',
    goal: 'Ganar fuerza',
    level: 'Intermedio',
    durationMinutes: 48,
    assignedAt: '2026-05-20',
    startsAt: '2026-05-25',
    status: 'active',
    adherenceTarget: 0.82,
    note:
      'Prioriza tecnica limpia, rango completo y descanso completo entre series principales. Si el peso sube demasiado, manten el RPE en 7.',
    trainer: {
      id: trainer.trainerId,
      name: trainer.displayName,
      code: trainer.trainerCode,
    },
    source: 'mock',
    days: [
      {
        id: 'monday',
        label: 'Lunes',
        dateHint: 'Siguiente sesion',
        status: 'today',
        exercises: [
          {
            id: 'squat',
            name: 'Sentadilla trasera',
            target: '4 x 6 a 60 kg',
            restLabel: 'Descanso 120s',
            muscleGroup: 'Pierna',
          },
          {
            id: 'bench',
            name: 'Press de banca',
            target: '4 x 6 a 50 kg',
            restLabel: 'Descanso 120s',
            muscleGroup: 'Pecho',
          },
          {
            id: 'row',
            name: 'Remo con barra',
            target: '3 x 8 a 42.5 kg',
            restLabel: 'Descanso 90s',
            muscleGroup: 'Espalda',
          },
        ],
      },
      {
        id: 'wednesday',
        label: 'Miercoles',
        dateHint: 'Bloque tecnico',
        status: 'pending',
        exercises: [
          {
            id: 'deadlift',
            name: 'Peso muerto',
            target: '3 x 5 a 75 kg',
            restLabel: 'Descanso 150s',
            muscleGroup: 'Posterior',
          },
          {
            id: 'press',
            name: 'Press militar',
            target: '4 x 6 a 32.5 kg',
            restLabel: 'Descanso 120s',
            muscleGroup: 'Hombro',
          },
          {
            id: 'pullup',
            name: 'Dominadas asistidas',
            target: '3 x 8',
            restLabel: 'Descanso 90s',
            muscleGroup: 'Espalda',
          },
        ],
      },
      {
        id: 'friday',
        label: 'Viernes',
        dateHint: 'Cierre semanal',
        status: 'pending',
        exercises: [
          {
            id: 'lunge',
            name: 'Zancadas caminando',
            target: '3 x 10 por pierna',
            restLabel: 'Descanso 75s',
            muscleGroup: 'Pierna',
          },
          {
            id: 'dips',
            name: 'Fondos asistidos',
            target: '3 x 8',
            restLabel: 'Descanso 90s',
            muscleGroup: 'Triceps',
          },
          {
            id: 'plank',
            name: 'Plancha frontal',
            target: '3 x 45s',
            restLabel: 'Descanso 60s',
            muscleGroup: 'Core',
          },
        ],
      },
    ],
  };
}

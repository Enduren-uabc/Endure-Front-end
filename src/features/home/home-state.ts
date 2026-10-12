// Created by: Codex (AI-assisted), 2026-10-10
import type { Routine, DayOfWeek } from '@/features/training/types/routine';
import type { WorkoutSession } from '@/features/training/types/workout-session';
import type { HomeQueryState, HomeWorkoutAction, HomeWorkoutHistory, WeeklyStats } from './types/home';

const LOCAL_DAYS: DayOfWeek[] = [
  'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday',
];

export function localDateKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

export function getLocalWeek(now: Date): { start: Date; end: Date; label: string } {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  const end = new Date(start);
  // Calendar arithmetic preserves Monday midnight across daylight-saving changes.
  end.setDate(end.getDate() + 7);
  const lastDay = new Date(end);
  lastDay.setDate(lastDay.getDate() - 1);
  const format = (date: Date) => date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
  return { start, end, label: `${format(start)} – ${format(lastDay)}` };
}

export function calculateWeeklyStats(history: HomeWorkoutHistory, now: Date): WeeklyStats {
  if (!history || !Array.isArray(history.sessions) || typeof history.hasIncompleteData !== 'boolean') {
    throw new Error('Historial no disponible');
  }
  const { start, end } = getLocalWeek(now);
  const stats: WeeklyStats = {
    completedWorkouts: 0,
    activeMinutes: 0,
    activeDays: Array(7).fill(false),
    hasIncompleteData: history.hasIncompleteData,
    hasIncompleteMinutes: false,
  };
  for (const session of history.sessions) {
    if (session.status !== 'finished') continue;
    const finished = session.finishedAt ? new Date(session.finishedAt) : null;
    if (!finished || !Number.isFinite(finished.getTime())) {
      stats.hasIncompleteData = true;
      continue;
    }
    if (finished < start || finished >= end) continue;
    stats.completedWorkouts += 1;
    stats.activeDays[(finished.getDay() + 6) % 7] = true;
    if (typeof session.durationMinutes === 'number'
      && Number.isFinite(session.durationMinutes) && session.durationMinutes >= 0) {
      stats.activeMinutes += session.durationMinutes;
    } else {
      stats.hasIncompleteMinutes = true;
    }
  }
  stats.activeMinutes = Math.round(stats.activeMinutes * 10) / 10;
  return stats;
}

export function getWorkoutAction(
  sessionQuery: HomeQueryState<WorkoutSession | null>,
  routinesQuery: HomeQueryState<Routine[]>,
  now: Date,
): HomeWorkoutAction {
  const session = sessionQuery.data;
  if (session?.status === 'in_progress') return { kind: 'resume', session };
  if (sessionQuery.isError && session === undefined) return { kind: 'error' };
  if (sessionQuery.isPending || session === undefined) return { kind: 'loading' };
  if (routinesQuery.isError && routinesQuery.data === undefined) return { kind: 'error' };
  if (routinesQuery.isPending || routinesQuery.data === undefined) return { kind: 'loading' };
  const routine = routinesQuery.data.find((candidate) => candidate.isActive);
  if (!routine) return { kind: 'no-routine' };
  if (!Array.isArray(routine.days)) return { kind: 'incomplete' };
  const today = routine.days.find((day) => day.dayOfWeek === LOCAL_DAYS[now.getDay()]);
  if (today && !Array.isArray(today.exercises)) return { kind: 'incomplete' };
  const exerciseCount = today?.exercises.length ?? 0;
  return { kind: exerciseCount ? 'ready' : 'no-exercises', routine, exerciseCount };
}

export function getPendingRequestTotal(response: { total: number }): number {
  if (!response || !Number.isSafeInteger(response.total) || response.total < 0) {
    throw new Error('Total de solicitudes no disponible');
  }
  return response.total;
}

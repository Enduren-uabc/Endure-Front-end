import { useCallback, useEffect, useState } from 'react';
import { AppState, Platform } from 'react-native';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';
import { useSessionStore } from '@/features/auth/stores/session-store';
import type { Routine } from '@/features/training/types/routine';
import type { WorkoutSession } from '@/features/training/types/workout-session';
import type { LinkRequest, PaginatedResponse } from '@/features/trainer-link/types/trainer-link';
import type { HomeProfileData, HomeWorkoutHistory } from '../types/home';
import { calculateWeeklyStats, getLocalWeek, getPendingRequestTotal, localDateKey } from '../home-state';

export function useHomeData() {
  const userId = useSessionStore((s) => s.userId);
  const role = useSessionStore((s) => s.role);
  const username = useSessionStore((s) => s.username);
  const isFocused = useIsFocused();
  const queryClient = useQueryClient();
  const [now, setNow] = useState(() => new Date());
  const enabled = !!userId && isFocused;
  const isTrainer = role === 'trainer';
  const week = getLocalWeek(now);
  const scope = ['home', userId, role] as const;

  const refresh = useCallback(() => {
    setNow(new Date());
    if (userId) void queryClient.invalidateQueries({ queryKey: ['home', userId, role] });
  }, [queryClient, userId, role]);

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));
  useEffect(() => {
    if (!isFocused) return;
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });
    const dayTimer = setInterval(() => {
      setNow((previous) => {
        const current = new Date();
        return localDateKey(previous) === localDateKey(current) ? previous : current;
      });
    }, 60_000);
    if (Platform.OS === 'web') window.addEventListener('focus', refresh);
    return () => {
      subscription.remove();
      clearInterval(dayTimer);
      if (Platform.OS === 'web') window.removeEventListener('focus', refresh);
    };
  }, [isFocused, refresh]);

  const dayKey = localDateKey(now);
  useEffect(() => {
    if (enabled) void queryClient.invalidateQueries({ queryKey: ['home', userId, role] });
  }, [dayKey, enabled, queryClient, userId, role]);

  const profile = useQuery({
    queryKey: [...scope, 'profile'],
    queryFn: () => apiClient.get<HomeProfileData>(API_ENDPOINTS.profile.get),
    enabled,
    retry: 1,
  });
  const session = useQuery({
    queryKey: [...scope, 'session'],
    queryFn: async () => {
      const response = await apiClient.get<WorkoutSession | null | ''>(API_ENDPOINTS.workoutSessions.inProgress);
      // Nest may serialize its confirmed null response as an empty HTTP body.
      if (response === null || response === '') return null;
      if (!response?.id || response.status !== 'in_progress') {
        throw new Error('Sesión en curso no disponible');
      }
      return response;
    },
    enabled,
    retry: 1,
  });
  const routines = useQuery({
    queryKey: [...scope, 'routines'],
    queryFn: async () => {
      const response = await apiClient.get<Routine[] | { routines: Routine[] }>(API_ENDPOINTS.routines.list);
      const routines = Array.isArray(response) ? response : response?.routines;
      if (!Array.isArray(routines)) throw new Error('Rutinas no disponibles');
      return routines;
    },
    enabled,
    retry: 1,
  });
  const weeklyStats = useQuery({
    queryKey: [...scope, 'week', localDateKey(week.start)],
    queryFn: async () => calculateWeeklyStats(
      await apiClient.get<HomeWorkoutHistory>(API_ENDPOINTS.workoutSessions.history), now,
    ),
    enabled,
    retry: 1,
  });
  const requests = useQuery({
    queryKey: [...scope, 'pending-requests'],
    queryFn: async () => getPendingRequestTotal(
      await apiClient.get<PaginatedResponse<LinkRequest>>(
        API_ENDPOINTS.trainerLink.receivedRequests({ status: 'pendiente', page: 1, limit: 1 }),
      ),
    ),
    enabled: enabled && isTrainer,
    retry: 1,
  });
  const dateLabel = now.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });
  return {
    now, week, isTrainer, name: profile.data?.fullName || username,
    dateLabel: dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1),
    session, routines, weeklyStats, requests,
  };
}

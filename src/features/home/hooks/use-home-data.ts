import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';
import { useSessionStore } from '@/features/auth/stores/session-store';
import type { HomeProfileData, WeeklyStats, WorkoutSessionStatsResponse, UnreadNotificationsResponse } from '@/features/home/types/home';

export function useHomeProfile() {
  return useQuery<HomeProfileData | null>({
    queryKey: ['home-profile'],
    queryFn: async () => {
      try {
        return await apiClient.get<HomeProfileData>(API_ENDPOINTS.profile.get);
      } catch {
        return null;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useWeeklyStats() {
  return useQuery<WeeklyStats | null>({
    queryKey: ['weekly-stats'],
    queryFn: async () => {
      try {
        const data = await apiClient.get<{
          items?: Array<{ totalVolume?: number; durationMinutes?: number }>;
        }>(API_ENDPOINTS.workoutSessions.history);
        const items = data?.items ?? [];
        if (!Array.isArray(items) || items.length === 0) return null;
        const totalVolume = items.reduce((sum, s) => sum + (s.totalVolume ?? 0), 0);
        const activeMinutes = items.reduce((sum, s) => sum + (s.durationMinutes ?? 0), 0);
        return {
          completedWorkouts: items.length,
          totalVolumeKg: totalVolume,
          activeMinutes,
        };
      } catch {
        return null;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useHomeStats() {
  return useQuery<WorkoutSessionStatsResponse | null>({
    queryKey: ['workout-session', 'stats'],
    queryFn: async () => {
      try {
        return await apiClient.get<WorkoutSessionStatsResponse>(API_ENDPOINTS.workoutSessions.stats);
      } catch {
        return null;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useHomeUnreadNotifications() {
  return useQuery<UnreadNotificationsResponse | null>({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      try {
        return await apiClient.get<UnreadNotificationsResponse>(API_ENDPOINTS.notifications.unreadCount);
      } catch {
        return null;
      }
    },
    staleTime: 60 * 1000,
    retry: 1,
  });
}

export function useHomeGreeting(): { name: string | null; dateLabel: string; experienceLevel: string | null } {
  const username = useSessionStore((s) => s.username);
  const { data: profile } = useHomeProfile();

  const displayName = profile?.fullName || username || null;

  const dateLabel = new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const capitalized = dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1);

  return { name: displayName, dateLabel: capitalized, experienceLevel: profile?.experienceLevel ?? null };
}

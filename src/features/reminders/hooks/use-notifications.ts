import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';
import type { InAppNotification } from '@/features/reminders/types/notification';

const notificationKeys = {
  all: ['notifications'] as const,
  unreadCount: ['notifications', 'unread-count'] as const,
};

export function useNotifications() {
  return useQuery<InAppNotification[]>({
    queryKey: notificationKeys.all,
    queryFn: () => apiClient.get<InAppNotification[]>(API_ENDPOINTS.notifications.list),
  });
}

export function useUnreadCount() {
  return useQuery<{ count: number }>({
    queryKey: notificationKeys.unreadCount,
    queryFn: () => apiClient.get<{ count: number }>(API_ENDPOINTS.notifications.unreadCount),
    refetchInterval: 30000,
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => apiClient.patch(API_ENDPOINTS.notifications.markRead(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount });
    },
  });
}

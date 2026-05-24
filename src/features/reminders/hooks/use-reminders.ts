import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';
import type { TrainingReminder, CreateReminderPayload, EditReminderPayload } from '@/features/reminders/types/reminder';

const reminderKeys = {
  all: ['training-reminders'] as const,
};

export function useReminders() {
  return useQuery<TrainingReminder[]>({
    queryKey: reminderKeys.all,
    queryFn: () => apiClient.get<TrainingReminder[]>(API_ENDPOINTS.reminders.list),
  });
}

export function useCreateReminder() {
  const queryClient = useQueryClient();

  return useMutation<TrainingReminder, Error, CreateReminderPayload>({
    mutationFn: (payload) =>
      apiClient.post<TrainingReminder>(API_ENDPOINTS.reminders.create, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reminderKeys.all });
    },
  });
}

export function useEditReminder() {
  const queryClient = useQueryClient();

  return useMutation<TrainingReminder, Error, { id: string; data: EditReminderPayload }>({
    mutationFn: ({ id, data }) =>
      apiClient.patch<TrainingReminder>(API_ENDPOINTS.reminders.edit(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reminderKeys.all });
    },
  });
}

export function useDeleteReminder() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => apiClient.del(API_ENDPOINTS.reminders.delete(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reminderKeys.all });
    },
  });
}

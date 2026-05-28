import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';
import type { RoutineTemplate, RoutineTemplateDetail, RoutineTemplateListResponse } from '../screens/v2/training-v2.types';

export interface TemplatesQueryParams {
  level?: string;
  page?: number;
  limit?: number;
}

export function useRoutineTemplates(params?: TemplatesQueryParams) {
  const queryParams = new URLSearchParams();
  if (params?.level) queryParams.set('level', params.level);
  if (params?.page) queryParams.set('page', String(params.page));
  if (params?.limit) queryParams.set('limit', String(params.limit));
  const queryStr = queryParams.toString();

  return useQuery<RoutineTemplateListResponse>({
    queryKey: ['routine-templates', params?.level ?? 'all', params?.page ?? 1],
    queryFn: async () => {
      const url = queryStr
        ? `${API_ENDPOINTS.routines.templates}?${queryStr}`
        : API_ENDPOINTS.routines.templates;
      return apiClient.get<RoutineTemplateListResponse>(url);
    },
  });
}

export function useRoutineTemplateDetail(templateId: string) {
  return useQuery<RoutineTemplateDetail>({
    queryKey: ['routine-template', templateId],
    queryFn: () => apiClient.get<RoutineTemplateDetail>(
      API_ENDPOINTS.routines.templateDetail(templateId),
    ),
    enabled: !!templateId,
  });
}

export function usePrefetchTemplateDetails() {
  const queryClient = useQueryClient();

  return (templates: RoutineTemplate[]) => {
    const visible = templates.slice(0, 3);
    visible.forEach((t) => {
      queryClient.prefetchQuery({
        queryKey: ['routine-template', t.id],
        queryFn: () => apiClient.get<RoutineTemplateDetail>(
          API_ENDPOINTS.routines.templateDetail(t.id),
        ),
        staleTime: 5 * 60 * 1000,
      });
    });
  };
}
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiError, apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';
import type {
  TrainerSearchResult,
  LinkRequest,
  ActiveTrainerResponse,
  SendLinkRequestInput,
  AcceptLinkResponse,
  PaginatedResponse,
  ActiveClient,
  LinkRequestStatus,
} from '../types/trainer-link';

const EMPTY_ACTIVE_TRAINER_RESPONSE: ActiveTrainerResponse = {
  hasTrainer: false,
  trainer: null,
};

export function useSearchTrainers(query: string, page = 1, limit = 20) {
  return useQuery<PaginatedResponse<TrainerSearchResult>>({
    queryKey: ['trainer-link', 'search', query, page, limit],
    queryFn: () => apiClient.get<PaginatedResponse<TrainerSearchResult>>(
      API_ENDPOINTS.trainerLink.search({ q: query, page, limit }),
    ),
    enabled: query.length >= 2,
  });
}

export function usePublicTrainerProfile(trainerId: string) {
  return useQuery<TrainerSearchResult>({
    queryKey: ['trainer-link', 'public-profile', trainerId],
    queryFn: () => apiClient.get<TrainerSearchResult>(
      API_ENDPOINTS.trainerLink.publicProfile(trainerId),
    ),
    enabled: !!trainerId,
  });
}

export function useSentLinkRequests(status?: LinkRequestStatus, page = 1) {
  return useQuery<PaginatedResponse<LinkRequest>>({
    queryKey: ['trainer-link', 'sent-requests', status, page],
    queryFn: () => apiClient.get<PaginatedResponse<LinkRequest>>(
      API_ENDPOINTS.trainerLink.sentRequests({ status, page }),
    ),
  });
}

export function useReceivedLinkRequests(status?: LinkRequestStatus, page = 1) {
  return useQuery<PaginatedResponse<LinkRequest>>({
    queryKey: ['trainer-link', 'received-requests', status, page],
    queryFn: () => apiClient.get<PaginatedResponse<LinkRequest>>(
      API_ENDPOINTS.trainerLink.receivedRequests({ status, page }),
    ),
  });
}

export function useMyTrainer() {
  return useQuery<ActiveTrainerResponse, ApiError>({
    queryKey: ['trainer-link', 'my-trainer'],
    queryFn: async () => {
      try {
        return await apiClient.get<ActiveTrainerResponse>(
          API_ENDPOINTS.trainerLink.myTrainer,
        );
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          return EMPTY_ACTIVE_TRAINER_RESPONSE;
        }
        throw error;
      }
    },
  });
}

export function useLinkedClients(page = 1, limit = 20) {
  return useQuery<PaginatedResponse<ActiveClient>>({
    queryKey: ['trainer-link', 'linked-clients', page, limit],
    queryFn: () => apiClient.get<PaginatedResponse<ActiveClient>>(
      API_ENDPOINTS.trainerLink.linkedClients({ page, limit }),
    ),
  });
}

export function useSendLinkRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SendLinkRequestInput) =>
      apiClient.post<{ id: string }>(API_ENDPOINTS.trainerLink.sendRequest, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-link'] });
    },
  });
}

export function useCancelLinkRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) =>
      apiClient.patch<{ id: string; status: string }>(
        API_ENDPOINTS.trainerLink.cancelRequest(requestId),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-link'] });
    },
  });
}

export function useAcceptLinkRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) =>
      apiClient.patch<AcceptLinkResponse>(
        API_ENDPOINTS.trainerLink.acceptRequest(requestId),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-link'] });
    },
  });
}

export function useRejectLinkRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, reason }: { requestId: string; reason?: string }) =>
      apiClient.patch<{ requestId: string; status: string }>(
        API_ENDPOINTS.trainerLink.rejectRequest(requestId),
        { reason },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-link'] });
    },
  });
}

export function useDeactivateLink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ linkId, reason }: { linkId: string; reason?: string }) =>
      apiClient.patch<{ linkId: string; status: string }>(
        API_ENDPOINTS.trainerLink.deactivateLink(linkId),
        { reason },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-link'] });
    },
  });
}

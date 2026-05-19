import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';
import type {
  PendingVerificationsResponse,
  VerificationDetailResponse,
  StartReviewResponse,
  ReviewResponse,
  ReviewInput,
} from '../types/admin-verification';

export function usePendingVerifications(
  page: number = 1,
  limit: number = 20,
  riskLevel?: string,
  sort?: 'ASC' | 'DESC',
) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (riskLevel) params.set('riskLevel', riskLevel);
  if (sort) params.set('sort', sort);

  return useQuery<PendingVerificationsResponse>({
    queryKey: ['admin', 'pending-verifications', page, limit, riskLevel, sort],
    queryFn: () =>
      apiClient.get<PendingVerificationsResponse>(
        `${API_ENDPOINTS.trainerVerification.pending}?${params.toString()}`,
      ),
    staleTime: 1000 * 30,
  });
}

export function useVerificationDetail(verificationId: string | null) {
  return useQuery<VerificationDetailResponse>({
    queryKey: ['admin', 'verification-detail', verificationId],
    queryFn: () =>
      apiClient.get<VerificationDetailResponse>(
        API_ENDPOINTS.trainerVerification.detail(verificationId!),
      ),
    enabled: !!verificationId,
    staleTime: 1000 * 15,
  });
}

export function useStartReview() {
  const queryClient = useQueryClient();

  return useMutation<
    StartReviewResponse,
    Error,
    { verificationId: string }
  >({
    mutationFn: ({ verificationId }) =>
      apiClient.post<StartReviewResponse>(
        API_ENDPOINTS.trainerVerification.startReview(verificationId),
      ),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'verification-detail', data.verificationId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'pending-verifications'] });
    },
  });
}

export function useReviewVerification() {
  const queryClient = useQueryClient();

  return useMutation<
    ReviewResponse,
    Error,
    { verificationId: string; input: ReviewInput }
  >({
    mutationFn: ({ verificationId, input }) =>
      apiClient.patch<ReviewResponse>(
        API_ENDPOINTS.trainerVerification.review(verificationId),
        input,
      ),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'verification-detail', data.verificationId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'pending-verifications'] });
    },
  });
}

import { useMutation } from '@tanstack/react-query';
import { apiClient, ApiError } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';

export interface VerifyEmailBody {
  token: string;
}

export interface VerifyEmailResponse {
  verified: boolean;
}

export interface ResendVerificationResponse {
  message: string;
}

export function useVerifyEmail() {
  return useMutation<VerifyEmailResponse, ApiError, VerifyEmailBody>({
    mutationFn: (body) =>
      apiClient.post<VerifyEmailResponse>(API_ENDPOINTS.auth.verifyEmail, body),
  });
}

export function useResendVerification() {
  return useMutation<ResendVerificationResponse, ApiError>({
    mutationFn: () =>
      apiClient.post<ResendVerificationResponse>(API_ENDPOINTS.auth.resendVerification),
  });
}

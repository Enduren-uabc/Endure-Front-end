import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, ApiError } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';
import { useSessionStore } from '@/features/auth/stores/session-store';

export interface AuthResponse {
  userId: string;
  role: string;
  email: string;
  username: string;
}

export interface RegisterBody {
  email: string;
  username: string;
  password: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface PasswordRecoveryBody {
  email: string;
}

export interface PasswordResetBody {
  token: string;
  password: string;
}

export interface MeResponse {
  userId: string;
  role: string;
  email: string;
  username: string;
  onboardingCompleted?: boolean;
}

export function useRegister() {
  return useMutation<AuthResponse, ApiError, RegisterBody>({
    mutationFn: (body) => apiClient.post<AuthResponse>(API_ENDPOINTS.auth.register, body),
  });
}

export function useLogin() {
  const setSession = useSessionStore((s) => s.setSession);

  return useMutation<AuthResponse, ApiError, LoginBody>({
    mutationFn: (body) => apiClient.post<AuthResponse>(API_ENDPOINTS.auth.login, body),
    onSuccess: (data) => {
      setSession(data.userId, data.role);
    },
  });
}

export function usePasswordRecovery() {
  return useMutation<{ message: string }, ApiError, PasswordRecoveryBody>({
    mutationFn: (body) =>
      apiClient.post<{ message: string }>(API_ENDPOINTS.auth.passwordRecovery, body),
  });
}

export function usePasswordReset() {
  return useMutation<{ message: string }, ApiError, PasswordResetBody>({
    mutationFn: (body) =>
      apiClient.post<{ message: string }>(API_ENDPOINTS.auth.passwordReset, body),
  });
}

export function useLogout() {
  const clearSession = useSessionStore((s) => s.clearSession);
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, ApiError>({
    mutationFn: () => apiClient.post<{ message: string }>(API_ENDPOINTS.auth.logout),
    onSuccess: () => {
      clearSession();
      queryClient.clear();
    },
  });
}

export async function fetchMe(): Promise<MeResponse> {
  return apiClient.get<MeResponse>(API_ENDPOINTS.auth.me);
}

export async function validateResetToken(token: string): Promise<{ valid: boolean }> {
  return apiClient.get<{ valid: boolean }>(
    `${API_ENDPOINTS.auth.passwordResetValidate}?token=${encodeURIComponent(token)}`,
  );
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';
import { useSessionStore } from '@/features/auth/stores/session-store';

export interface OnboardingProfileBody {
  fullName: string;
  birthDate: string;
  gender: 'male' | 'female' | 'other';
  weight: number;
  height: number;
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  mainGoal: 'lose_weight' | 'gain_muscle' | 'maintain' | 'improve_endurance' | 'general_fitness';
  daysAvailablePerWeek?: number;
  weightUnit?: 'kg' | 'lbs';
}

export interface OnboardingProfileResponse {
  id: string;
  userId: string;
  fullName: string;
  birthDate: string;
  gender: string;
  weight: number;
  height: number;
  experienceLevel: string;
  mainGoal: string;
  daysAvailablePerWeek: number;
  weightUnit: string;
  onboardingCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface OnboardingStatusResponse {
  completed: boolean;
}

export function useCreateOnboardingProfile() {
  const setOnboardingCompleted = useSessionStore((s) => s.setOnboardingCompleted);
  const queryClient = useQueryClient();

  return useMutation<OnboardingProfileResponse, Error, OnboardingProfileBody>({
    mutationFn: (body) =>
      apiClient.post<OnboardingProfileResponse>(API_ENDPOINTS.onboarding.profile, body),
    onSuccess: (data) => {
      setOnboardingCompleted(data.onboardingCompleted);
      queryClient.setQueryData<OnboardingStatusResponse>(['onboarding-status'], {
        completed: data.onboardingCompleted,
      });
    },
  });
}

export function useOnboardingStatus(enabled = true) {
  return useQuery<OnboardingStatusResponse, Error>({
    queryKey: ['onboarding-status'],
    queryFn: () => apiClient.get<OnboardingStatusResponse>(API_ENDPOINTS.onboarding.status),
    enabled,
    retry: 1,
  });
}

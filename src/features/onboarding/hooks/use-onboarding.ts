import { useQuery } from '@tanstack/react-query';

export interface OnboardingStatus {
  completed: boolean;
}

export function useOnboardingStatus(enabled: boolean) {
  return useQuery<OnboardingStatus>({
    queryKey: ['onboarding-status'],
    queryFn: () => Promise.resolve({ completed: true }),
    enabled,
  });
}

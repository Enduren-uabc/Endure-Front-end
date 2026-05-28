import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';
import { fetchMe, useLogout } from '@/features/auth/hooks/use-auth';
import { useSessionStore } from '@/features/auth/stores/session-store';
import { useMyVerificationStatus } from '@/features/trainer-verification/hooks/use-trainer-verification';
import { socialService } from '@/features/social/services/social.service';
import { useWorkoutStats } from '@/features/training/hooks/use-workout-stats';
import {
  buildTrainerApplicationCard,
  clientProfileDefaults,
  trainerProfileDefaults,
} from '../mocks/profile.mock';
import {
  type ClientProfileViewModel,
  type EditableProfileInput,
  mapTrainerApplicationStatus,
  type TrainerProfessionalProfile,
} from '../types/profile';
import type { OnboardingProfileResponse } from '@/features/onboarding/hooks/use-onboarding';

function initialsFromName(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || 'EN';
}

function handleFromName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '') || 'usuario';
}

export function useClientProfileDashboard() {
  const sessionUsername = useSessionStore((state) => state.username);
  const sessionEmail = useSessionStore((state) => state.email);
  const me = useQuery({
    queryKey: ['profile', 'me'],
    queryFn: fetchMe,
    retry: 1,
  });
  const socialProfile = useQuery({
    queryKey: ['social-profile', me.data?.id],
    queryFn: () => socialService.getProfile(me.data!.id),
    enabled: !!me.data?.id,
    retry: 1,
  });
  const profileQuery = useQuery<OnboardingProfileResponse>({
    queryKey: ['profile', 'data'],
    queryFn: () => apiClient.get<OnboardingProfileResponse>(API_ENDPOINTS.profile.get),
    retry: 1,
  });
  const stats = useWorkoutStats();
  const verification = useMyVerificationStatus();
  const logout = useLogout();
  const [localProfile, setLocalProfile] = React.useState<EditableProfileInput | null>(null);
  const [isSavingProfile, setIsSavingProfile] = React.useState(false);
  const [profileSaveError, setProfileSaveError] = React.useState<string | null>(null);

  const displayName =
    localProfile?.displayName ??
    socialProfile.data?.displayName ??
    me.data?.username ??
    sessionUsername ??
    '';
  const bio = localProfile?.bio ?? socialProfile.data?.bio ?? clientProfileDefaults.bio;
  const email = me.data?.email ?? sessionEmail ?? '';
  const avatarUrl = socialProfile.data?.avatarUrl ?? null;

  const weight = profileQuery.data?.weight;
  const weightUnit = profileQuery.data?.weightUnit ?? 'kg';
  const weightDisplay = weight ? `${weight} ${weightUnit}` : '--';

  const totalWorkouts = stats.data?.totalWorkouts ?? 0;
  const longestStreak = stats.data?.longestStreak ?? 0;
  const currentStreak = stats.data?.currentStreak ?? 0;

  const profile: ClientProfileViewModel = {
    displayName,
    email,
    handle: `@${handleFromName(displayName)}`,
    bio,
    avatarUrl,
    avatarInitials: initialsFromName(displayName),
    metrics: [
      { id: 'workouts', label: 'Entrenos', value: `${totalWorkouts}`, helper: 'Completados' },
      { id: 'streak', label: 'Mejor racha', value: `${longestStreak}d`, helper: 'Historica' },
      { id: 'currentStreak', label: 'Racha actual', value: `${currentStreak}d`, helper: 'Dias seguidos' },
      { id: 'weight', label: 'Peso', value: weightDisplay, helper: 'Actual' },
    ],
  };

  const applicationStatus = mapTrainerApplicationStatus(verification.data?.status);
  const trainerCard = buildTrainerApplicationCard(
    applicationStatus,
    verification.data?.rejectionReason,
  );

  const saveProfile = React.useCallback(async (input: EditableProfileInput): Promise<boolean> => {
    const nextDisplayName = input.displayName.trim();
    const nextBio = input.bio.trim();

    if (nextDisplayName.length < 2) {
      setProfileSaveError('Escribe un nombre visible de al menos 2 caracteres.');
      return false;
    }

    if (nextBio.length > 160) {
      setProfileSaveError('La bio debe tener maximo 160 caracteres.');
      return false;
    }

    setIsSavingProfile(true);
    setProfileSaveError(null);
    try {
      await apiClient.patch(API_ENDPOINTS.socialProfiles.update, {
        displayName: nextDisplayName,
        bio: nextBio.length > 0 ? nextBio : null,
      });
      setLocalProfile({
        displayName: nextDisplayName,
        bio: nextBio.length > 0 ? nextBio : clientProfileDefaults.bio,
      });
      return true;
    } catch {
      setProfileSaveError('Error al guardar. Intenta de nuevo.');
      return false;
    } finally {
      setIsSavingProfile(false);
    }
  }, []);

  return {
    profile,
    trainerCard,
    isLoading: me.isLoading || socialProfile.isLoading || profileQuery.isLoading || stats.isLoading || verification.isLoading,
    isError: me.isError || socialProfile.isError || profileQuery.isError || stats.isError,
    isRefreshing: me.isRefetching || socialProfile.isRefetching || profileQuery.isRefetching || stats.isRefetching || verification.isRefetching,
    refetch: () => {
      void me.refetch();
      void socialProfile.refetch();
      void profileQuery.refetch();
      void stats.refetch();
      void verification.refetch();
    },
    saveProfile,
    isSavingProfile,
    profileSaveError,
    clearProfileSaveError: () => setProfileSaveError(null),
    logout,
  };
}

export function useTrainerProfileDashboard() {
  const sessionUsername = useSessionStore((state) => state.username);
  const sessionEmail = useSessionStore((state) => state.email);
  const me = useQuery({
    queryKey: ['profile', 'trainer-me'],
    queryFn: fetchMe,
    retry: 1,
  });
  const socialProfile = useQuery({
    queryKey: ['social-profile', me.data?.id],
    queryFn: () => socialService.getProfile(me.data!.id),
    enabled: !!me.data?.id,
    retry: 1,
  });
  const logout = useLogout();
  const [localProfile, setLocalProfile] = React.useState<EditableProfileInput | null>(null);
  const [isSavingProfile, setIsSavingProfile] = React.useState(false);
  const [profileSaveError, setProfileSaveError] = React.useState<string | null>(null);

  const displayName =
    localProfile?.displayName ??
    socialProfile.data?.displayName ??
    me.data?.username ??
    sessionUsername ??
    '';
  const email = me.data?.email ?? sessionEmail ?? '';
  const bio = localProfile?.bio ?? socialProfile.data?.bio ?? trainerProfileDefaults.bio;
  const avatarUrl = socialProfile.data?.avatarUrl ?? null;

  const profile: TrainerProfessionalProfile = {
    ...trainerProfileDefaults,
    displayName,
    email,
    bio,
    handle: `@${handleFromName(displayName)}`,
    avatarUrl,
    avatarInitials: initialsFromName(displayName),
  };

  const saveProfile = React.useCallback(async (input: EditableProfileInput): Promise<boolean> => {
    const nextDisplayName = input.displayName.trim();
    const nextBio = input.bio.trim();

    if (nextDisplayName.length < 2) {
      setProfileSaveError('Escribe un nombre profesional de al menos 2 caracteres.');
      return false;
    }

    if (nextBio.length > 220) {
      setProfileSaveError('La bio profesional debe tener maximo 220 caracteres.');
      return false;
    }

    setIsSavingProfile(true);
    setProfileSaveError(null);
    try {
      await apiClient.patch(API_ENDPOINTS.socialProfiles.update, {
        displayName: nextDisplayName,
        bio: nextBio.length > 0 ? nextBio : null,
      });
      setLocalProfile({
        displayName: nextDisplayName,
        bio: nextBio.length > 0 ? nextBio : trainerProfileDefaults.bio,
      });
      return true;
    } catch {
      setProfileSaveError('Error al guardar. Intenta de nuevo.');
      return false;
    } finally {
      setIsSavingProfile(false);
    }
  }, []);

  return {
    profile,
    isLoading: me.isLoading || socialProfile.isLoading,
    isError: me.isError || socialProfile.isError,
    isRefreshing: me.isRefetching || socialProfile.isRefetching,
    refetch: () => {
      void me.refetch();
      void socialProfile.refetch();
    },
    saveProfile,
    isSavingProfile,
    profileSaveError,
    clearProfileSaveError: () => setProfileSaveError(null),
    logout,
  };
}

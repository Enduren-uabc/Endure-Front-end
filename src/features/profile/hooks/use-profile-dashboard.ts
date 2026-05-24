import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchMe, useLogout } from '@/features/auth/hooks/use-auth';
import { useSessionStore } from '@/features/auth/stores/session-store';
import { useMyVerificationStatus } from '@/features/trainer-verification/hooks/use-trainer-verification';
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
  const verification = useMyVerificationStatus();
  const logout = useLogout();
  const [localProfile, setLocalProfile] = React.useState<EditableProfileInput | null>(null);
  const [isSavingProfile, setIsSavingProfile] = React.useState(false);
  const [profileSaveError, setProfileSaveError] = React.useState<string | null>(null);

  const displayName =
    localProfile?.displayName ??
    me.data?.username ??
    sessionUsername ??
    'Gerardo Medina';
  const bio = localProfile?.bio ?? clientProfileDefaults.bio;
  const email = me.data?.email ?? sessionEmail ?? 'gerardo@endure.local';

  const profile: ClientProfileViewModel = {
    displayName,
    email,
    handle: `@${handleFromName(displayName)}`,
    bio,
    avatarInitials: initialsFromName(displayName),
    metrics: clientProfileDefaults.metrics,
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
    await new Promise((resolve) => setTimeout(resolve, 450));
    setLocalProfile({
      displayName: nextDisplayName,
      bio: nextBio.length > 0 ? nextBio : clientProfileDefaults.bio,
    });
    setIsSavingProfile(false);
    return true;
  }, []);

  return {
    profile,
    trainerCard,
    isLoading: me.isLoading || verification.isLoading,
    isError: me.isError,
    isRefreshing: me.isRefetching || verification.isRefetching,
    refetch: () => {
      void me.refetch();
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
  const logout = useLogout();
  const [localProfile, setLocalProfile] = React.useState<EditableProfileInput | null>(null);
  const [isSavingProfile, setIsSavingProfile] = React.useState(false);
  const [profileSaveError, setProfileSaveError] = React.useState<string | null>(null);

  const displayName =
    localProfile?.displayName ??
    me.data?.username ??
    sessionUsername ??
    'Coach Endure';
  const email = me.data?.email ?? sessionEmail ?? 'coach@endure.local';
  const bio = localProfile?.bio ?? trainerProfileDefaults.bio;

  const profile: TrainerProfessionalProfile = {
    ...trainerProfileDefaults,
    displayName,
    email,
    bio,
    handle: `@${handleFromName(displayName)}`,
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
    await new Promise((resolve) => setTimeout(resolve, 450));
    setLocalProfile({
      displayName: nextDisplayName,
      bio: nextBio.length > 0 ? nextBio : trainerProfileDefaults.bio,
    });
    setIsSavingProfile(false);
    return true;
  }, []);

  return {
    profile,
    isLoading: me.isLoading,
    isError: me.isError,
    isRefreshing: me.isRefetching,
    refetch: () => {
      void me.refetch();
    },
    saveProfile,
    isSavingProfile,
    profileSaveError,
    clearProfileSaveError: () => setProfileSaveError(null),
    logout,
  };
}

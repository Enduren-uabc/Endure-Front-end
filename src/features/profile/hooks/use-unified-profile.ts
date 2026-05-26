import React from 'react';
import { useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';
import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';
import { fetchMe, useLogout } from '@/features/auth/hooks/use-auth';
import { useSessionStore } from '@/features/auth/stores/session-store';
import { useMyVerificationStatus } from '@/features/trainer-verification/hooks/use-trainer-verification';
import { useWorkoutStats } from '@/features/training/hooks/use-workout-stats';
import { useWorkoutHistory } from '@/features/training/hooks/use-workout-session';
import { socialService } from '@/features/social/services/social.service';
import { mapTrainerApplicationStatus } from '../types/profile';
import {
  buildTrainerApplicationCard,
  clientProfileDefaults,
} from '../mocks/profile.mock';
import type { EditableProfileInput, ProfileMetric } from '../types/profile';
import type { PublicProfile, Publication } from '@/features/social/types/social.types';
import type { WorkoutSessionSummary } from '@/features/training/types/workout-session';

const PAGE_SIZE = 10;

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

export interface UnifiedProfileData {
  profile: PublicProfile;
  metrics: ProfileMetric[];
  recentSessions: WorkoutSessionSummary[];
  displayName: string;
}

export function useUnifiedProfile() {
  const userId = useSessionStore((state) => state.userId);
  const sessionUsername = useSessionStore((state) => state.username);
  const sessionEmail = useSessionStore((state) => state.email);
  const queryClient = useQueryClient();

  const me = useQuery({
    queryKey: ['profile', 'me'],
    queryFn: fetchMe,
    retry: 1,
  });

  const socialProfile = useQuery({
    queryKey: ['social-profile', userId],
    queryFn: () => socialService.getProfile(userId!),
    enabled: !!userId,
  });

  const publications = useInfiniteQuery({
    queryKey: ['social-profile-publications', userId],
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      socialService.getUserPublications({ userId: userId!, limit: PAGE_SIZE, offset: pageParam }),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.offset + lastPage.items.length : undefined,
    enabled: !!userId,
  });

  const stats = useWorkoutStats();
  const history = useWorkoutHistory();
  const verification = useMyVerificationStatus();
  const logout = useLogout();

  const [localProfile, setLocalProfile] = React.useState<EditableProfileInput | null>(null);
  const [isSavingProfile, setIsSavingProfile] = React.useState(false);
  const [profileSaveError, setProfileSaveError] = React.useState<string | null>(null);

  const social = socialProfile.data;
  const displayName = localProfile?.displayName
    ?? social?.displayName
    ?? me.data?.username
    ?? sessionUsername
    ?? 'Usuario';
  const bio = localProfile?.bio ?? social?.bio ?? clientProfileDefaults.bio;
  const handle = social?.handle ?? `@${handleFromName(displayName)}`;
  const avatarUrl = social?.avatarUrl ?? null;

  const weight = null; // TODO: from onboarding profile
  const weightDisplay = '--';

  const totalWorkouts = stats.data?.totalWorkouts ?? 0;
  const longestStreak = stats.data?.longestStreak ?? 0;
  const currentStreak = stats.data?.currentStreak ?? 0;

  const metrics: ProfileMetric[] = [
    { id: 'workouts', label: 'Entrenos', value: `${totalWorkouts}`, helper: 'Completados' },
    { id: 'streak', label: 'Racha actual', value: `${currentStreak}d`, helper: 'Días seguidos' },
    { id: 'bestStreak', label: 'Mejor racha', value: `${longestStreak}d`, helper: 'Histórica' },
  ];

  const recentSessions: WorkoutSessionSummary[] = (history.data?.sessions ?? []).slice(0, 5);

  const allPublications: Publication[] = publications.data?.pages.flatMap((page) => page.items) ?? [];

  const applicationStatus = mapTrainerApplicationStatus(verification.data?.status);
  const trainerCard = buildTrainerApplicationCard(
    applicationStatus,
    verification.data?.rejectionReason,
  );

  const saveProfile = React.useCallback(async (input: EditableProfileInput): Promise<boolean> => {
    const nextDisplayName = input.displayName.trim();
    const nextBio = input.bio.trim();
    const nextHandle = input.handle?.trim();

    if (nextDisplayName.length < 2) {
      setProfileSaveError('Escribe un nombre visible de al menos 2 caracteres.');
      return false;
    }

    if (nextBio.length > 160) {
      setProfileSaveError('La bio debe tener máximo 160 caracteres.');
      return false;
    }

    if (nextHandle && !/^[a-z0-9._]+$/.test(nextHandle)) {
      setProfileSaveError('El usuario solo puede contener minúsculas, números, puntos y guiones bajos.');
      return false;
    }

    if (nextHandle && nextHandle.length < 2) {
      setProfileSaveError('El usuario debe tener al menos 2 caracteres.');
      return false;
    }

    setIsSavingProfile(true);
    setProfileSaveError(null);
    try {
      const payload: Record<string, unknown> = {
        displayName: nextDisplayName,
        bio: nextBio.length > 0 ? nextBio : null,
      };
      if (nextHandle !== undefined) {
        payload.handle = nextHandle.length > 0 ? nextHandle : null;
      }
      await apiClient.patch(API_ENDPOINTS.socialProfiles.update, payload);
      setLocalProfile({
        displayName: nextDisplayName,
        bio: nextBio.length > 0 ? nextBio : '',
        ...(nextHandle !== undefined ? { handle: nextHandle } : {}),
      });
      await queryClient.invalidateQueries({ queryKey: ['social-profile', userId] });
      await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      return true;
    } catch {
      setProfileSaveError('Error al guardar. Intenta de nuevo.');
      return false;
    } finally {
      setIsSavingProfile(false);
    }
  }, [userId, queryClient]);

  const pickAvatar = React.useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    await socialService.uploadAvatar({
      uri: asset.uri,
      name: asset.fileName ?? 'avatar.jpg',
      type: asset.mimeType ?? 'image/jpeg',
    });
    await queryClient.invalidateQueries({ queryKey: ['social-profile', userId] });
    await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
  }, [userId, queryClient]);

  const pickAvatarFromCamera = React.useCallback(async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    await socialService.uploadAvatar({
      uri: asset.uri,
      name: asset.fileName ?? 'camera.jpg',
      type: asset.mimeType ?? 'image/jpeg',
    });
    await queryClient.invalidateQueries({ queryKey: ['social-profile', userId] });
    await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
  }, [userId, queryClient]);

  const showAvatarPicker = React.useCallback(() => {
    if (Platform.OS === 'ios') {
      const { ActionSheetIOS } = require('react-native');
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancelar', 'Tomar foto', 'Elegir de galería'],
          cancelButtonIndex: 0,
        },
        (index: number) => {
          if (index === 1) pickAvatarFromCamera();
          if (index === 2) pickAvatar();
        },
      );
    } else {
      pickAvatar();
    }
  }, [pickAvatar, pickAvatarFromCamera]);

  const fetchNextPublications = React.useCallback(() => {
    if (publications.hasNextPage && !publications.isFetchingNextPage) {
      void publications.fetchNextPage();
    }
  }, [publications]);

  const isLoading =
    !userId ||
    me.isLoading ||
    socialProfile.isLoading ||
    stats.isLoading ||
    history.isLoading ||
    verification.isLoading;

  const isError =
    me.isError ||
    socialProfile.isError ||
    stats.isError ||
    history.isError;

  return {
    userId,
    displayName,
    handle,
    bio,
    avatarUrl,
    avatarInitials: initialsFromName(displayName),
    followersCount: social?.followersCount ?? 0,
    followingCount: social?.followingCount ?? 0,
    metrics,
    recentSessions,
    allPublications,
    isLoadingPublications: publications.isLoading,
    isFetchingMorePublications: publications.isFetchingNextPage,
    hasMorePublications: !!publications.hasNextPage,
    fetchNextPublications,
    trainerCard,
    isLoading,
    isError,
    isRefreshing:
      me.isRefetching ||
      socialProfile.isRefetching ||
      stats.isRefetching ||
      history.isRefetching ||
      verification.isRefetching ||
      publications.isRefetching,
    refetch: () => {
      void me.refetch();
      void socialProfile.refetch();
      void stats.refetch();
      void history.refetch();
      void verification.refetch();
      void publications.refetch();
    },
    saveProfile,
    isSavingProfile,
    profileSaveError,
    clearProfileSaveError: () => setProfileSaveError(null),
    showAvatarPicker,
    logout,
  };
}

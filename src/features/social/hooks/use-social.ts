import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { socialService } from '../services/social.service';
import type { FeedFilter } from '../types/social.types';
import type {
  CreatePublicationRequestApi,
  UpdateOwnProfileRequestApi,
} from '../types/social-api.types';

const PAGE_SIZE = 10;

export const socialQueryKeys = {
  feed: (filter: FeedFilter) => ['social-feed', filter] as const,
  profile: (userId: string) => ['social-profile', userId] as const,
  profileSearch: (query: string) => ['social-profile-search', query] as const,
  profilePublications: (userId: string) => ['social-profile-publications', userId] as const,
  followers: (userId: string) => ['social-profile-followers', userId] as const,
  following: (userId: string) => ['social-profile-following', userId] as const,
  comments: (publicationId: string) => ['social-comments', publicationId] as const,
};

export function useFeed(filter: FeedFilter = 'all') {
  return useInfiniteQuery({
    queryKey: socialQueryKeys.feed(filter),
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      socialService.getFeed({ limit: PAGE_SIZE, offset: pageParam, filter }),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.offset + lastPage.items.length : undefined,
  });
}

export function useProfile(userId: string) {
  return useQuery({
    queryKey: socialQueryKeys.profile(userId),
    queryFn: () => socialService.getProfile(userId),
    enabled: userId.length > 0,
  });
}

export function useUserPublications(userId: string) {
  return useInfiniteQuery({
    queryKey: socialQueryKeys.profilePublications(userId),
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      socialService.getUserPublications({ userId, limit: PAGE_SIZE, offset: pageParam }),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.offset + lastPage.items.length : undefined,
    enabled: userId.length > 0,
  });
}

export function useComments(publicationId: string) {
  return useQuery({
    queryKey: socialQueryKeys.comments(publicationId),
    queryFn: () => socialService.getComments(publicationId),
    enabled: publicationId.length > 0,
  });
}

export function useProfileSearch(query: string) {
  const normalized = query.trim();
  return useQuery({
    queryKey: socialQueryKeys.profileSearch(normalized),
    queryFn: () => socialService.searchProfiles(normalized),
    enabled: normalized.length >= 2,
  });
}

export function useFollowers(userId: string) {
  return useQuery({
    queryKey: socialQueryKeys.followers(userId),
    queryFn: () => socialService.getFollowers(userId),
    enabled: userId.length > 0,
  });
}

export function useFollowing(userId: string) {
  return useQuery({
    queryKey: socialQueryKeys.following(userId),
    queryFn: () => socialService.getFollowing(userId),
    enabled: userId.length > 0,
  });
}

export function useCreatePublication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePublicationRequestApi) =>
      socialService.createPublication(payload),
    onSuccess: async (publication) => {
      await queryClient.invalidateQueries({ queryKey: ['social-feed'] });
      await queryClient.invalidateQueries({
        queryKey: socialQueryKeys.profilePublications(publication.authorUserId),
      });
    },
  });
}

export function useDeletePublication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (publicationId: string) => socialService.deletePublication(publicationId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['social-feed'] });
      await queryClient.invalidateQueries({ queryKey: ['social-profile-publications'] });
    },
  });
}

export function useInteractions(publicationId: string) {
  const queryClient = useQueryClient();

  const invalidateFeed = async () => {
    await queryClient.invalidateQueries({ queryKey: ['social-feed'] });
    await queryClient.invalidateQueries({ queryKey: socialQueryKeys.comments(publicationId) });
  };

  const like = useMutation({
    mutationFn: () => socialService.addReaction(publicationId),
    onSuccess: invalidateFeed,
  });

  const unlike = useMutation({
    mutationFn: () => socialService.removeReaction(publicationId),
    onSuccess: invalidateFeed,
  });

  const comment = useMutation({
    mutationFn: (content: string) =>
      socialService.createComment(publicationId, { content }),
    onSuccess: invalidateFeed,
  });

  return { like, unlike, comment };
}

export function useDeleteComment(publicationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => socialService.deleteComment(commentId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: socialQueryKeys.comments(publicationId) });
      await queryClient.invalidateQueries({ queryKey: ['social-feed'] });
    },
  });
}

export function useFollowProfile(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => socialService.followProfile(userId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: socialQueryKeys.profile(userId) });
      await queryClient.invalidateQueries({ queryKey: socialQueryKeys.followers(userId) });
      await queryClient.invalidateQueries({ queryKey: socialQueryKeys.following(userId) });
      await queryClient.invalidateQueries({ queryKey: socialQueryKeys.feed('following') });
    },
  });
}

export function useUnfollowProfile(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => socialService.unfollowProfile(userId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: socialQueryKeys.profile(userId) });
      await queryClient.invalidateQueries({ queryKey: socialQueryKeys.followers(userId) });
      await queryClient.invalidateQueries({ queryKey: socialQueryKeys.following(userId) });
      await queryClient.invalidateQueries({ queryKey: socialQueryKeys.feed('following') });
    },
  });
}

export function useUpdateOwnProfile(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateOwnProfileRequestApi) =>
      socialService.updateOwnProfile(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: socialQueryKeys.profile(userId) });
      await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}

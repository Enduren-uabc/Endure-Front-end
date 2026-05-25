import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/api-endpoints';
import type {
  CommentApi,
  CommentListApi,
  CreateCommentRequestApi,
  CreatePublicationRequestApi,
  DeleteCommentApi,
  DeletePublicationApi,
  DeleteReactionApi,
  FollowProfileApi,
  ProfileApi,
  ProfileListApi,
  PublicationApi,
  PublicationPageApi,
  PublicProfileApi,
  ReactionApi,
  UpdateOwnProfileRequestApi,
} from '../types/social-api.types';
import type { PublicationMedia } from '../types/social.types';
import type { FeedFilter } from '../types/social.types';
import {
  mapCommentFromApi,
  mapProfileFromApi,
  mapPublicationFromApi,
  mapPublicationPageFromApi,
  mapPublicProfileFromApi,
  mapReactionFromApi,
} from '../mappers/social.mapper';

function buildQuery(params: Record<string, string | number | undefined>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) searchParams.set(key, String(value));
  });
  const query = searchParams.toString();
  return query.length > 0 ? `?${query}` : '';
}

export const socialService = {
  async getFeed(input: { limit: number; offset: number; filter?: FeedFilter }) {
    const data = await apiClient.get<PublicationPageApi>(
      `${API_ENDPOINTS.publications.feed}${buildQuery(input)}`,
    );
    return mapPublicationPageFromApi(data);
  },

  async createPublication(payload: CreatePublicationRequestApi) {
    const data = await apiClient.post<PublicationApi>(
      API_ENDPOINTS.publications.feed,
      payload,
    );
    return mapPublicationFromApi(data);
  },

  async deletePublication(publicationId: string) {
    return apiClient.del<DeletePublicationApi>(API_ENDPOINTS.publications.detail(publicationId));
  },

  async getProfile(userId: string) {
    const data = await apiClient.get<PublicProfileApi>(
      API_ENDPOINTS.socialProfiles.detail(userId),
    );
    return mapPublicProfileFromApi(data);
  },

  async getUserPublications(input: { userId: string; limit: number; offset: number }) {
    const data = await apiClient.get<PublicationPageApi>(
      `${API_ENDPOINTS.socialProfiles.publications(input.userId)}${buildQuery({
        limit: input.limit,
        offset: input.offset,
      })}`,
    );
    return mapPublicationPageFromApi(data);
  },

  async searchProfiles(query: string) {
    const data = await apiClient.get<ProfileListApi>(
      `${API_ENDPOINTS.socialProfiles.search}${buildQuery({ q: query })}`,
    );
    return data.items.map(mapProfileFromApi);
  },

  async getFollowers(userId: string) {
    const data = await apiClient.get<ProfileListApi>(
      API_ENDPOINTS.socialProfiles.followers(userId),
    );
    return data.items.map(mapProfileFromApi);
  },

  async getFollowing(userId: string) {
    const data = await apiClient.get<ProfileListApi>(
      API_ENDPOINTS.socialProfiles.following(userId),
    );
    return data.items.map(mapProfileFromApi);
  },

  async updateOwnProfile(payload: UpdateOwnProfileRequestApi) {
    const data = await apiClient.patch<ProfileApi>(API_ENDPOINTS.socialProfiles.me, payload);
    return mapProfileFromApi(data);
  },

  async uploadAvatar(file: { uri: string; name: string; type: string }) {
    const formData = new FormData();
    formData.append('avatar', {
      uri: file.uri,
      name: file.name,
      type: file.type,
    } as unknown as Blob);
    const data = await apiClient.postMultipart<ProfileApi>(
      API_ENDPOINTS.socialProfiles.avatar,
      formData,
    );
    return mapProfileFromApi(data);
  },

  async followProfile(userId: string) {
    return apiClient.post<FollowProfileApi>(API_ENDPOINTS.socialProfiles.follow(userId));
  },

  async unfollowProfile(userId: string) {
    return apiClient.del<FollowProfileApi>(API_ENDPOINTS.socialProfiles.follow(userId));
  },

  async addReaction(publicationId: string) {
    const data = await apiClient.post<ReactionApi>(
      API_ENDPOINTS.publications.reactions(publicationId),
    );
    return mapReactionFromApi(data);
  },

  async removeReaction(publicationId: string) {
    return apiClient.del<DeleteReactionApi>(
      API_ENDPOINTS.publications.reactions(publicationId),
    );
  },

  async getComments(publicationId: string) {
    const data = await apiClient.get<CommentListApi>(
      API_ENDPOINTS.publications.comments(publicationId),
    );
    return data.items.map(mapCommentFromApi);
  },

  async createComment(publicationId: string, payload: CreateCommentRequestApi) {
    const data = await apiClient.post<CommentApi>(
      API_ENDPOINTS.publications.comments(publicationId),
      payload,
    );
    return mapCommentFromApi(data);
  },

  async deleteComment(commentId: string) {
    return apiClient.del<DeleteCommentApi>(API_ENDPOINTS.publications.comment(commentId));
  },

  async uploadMedia(file: { uri: string; name: string; type: string }): Promise<{ id: string; url: string; fileName: string; fileSize: number; mimeType: string }> {
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      name: file.name,
      type: file.type,
    } as unknown as Blob);
    return apiClient.postMultipart<{
      id: string;
      url: string;
      fileName: string;
      fileSize: number;
      mimeType: string;
    }>(API_ENDPOINTS.publications.uploadMedia, formData);
  },
};

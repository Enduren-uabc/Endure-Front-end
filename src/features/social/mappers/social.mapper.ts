import type {
  CommentApi,
  ProfileApi,
  PublicationApi,
  PublicationPageApi,
  PublicProfileApi,
  ReactionApi,
} from '../types/social-api.types';
import type {
  Comment,
  Profile,
  Publication,
  PublicationPage,
  PublicProfile,
  Reaction,
} from '../types/social.types';

export function mapPublicationFromApi(apiPublication: PublicationApi): Publication {
  return {
    id: apiPublication.id,
    authorUserId: apiPublication.authorUserId,
    title: apiPublication.title,
    content: apiPublication.content,
    mediaUrls: apiPublication.mediaUrls,
    createdAt: new Date(apiPublication.createdAt),
    updatedAt: new Date(apiPublication.updatedAt),
  };
}

export function mapPublicationPageFromApi(apiPage: PublicationPageApi): PublicationPage {
  return {
    items: apiPage.items.map(mapPublicationFromApi),
    limit: apiPage.limit,
    offset: apiPage.offset,
    total: apiPage.total,
    hasMore: apiPage.hasMore,
  };
}

export function mapProfileFromApi(apiProfile: ProfileApi): Profile {
  return {
    userId: apiProfile.userId,
    displayName: apiProfile.displayName,
    handle: apiProfile.handle,
    bio: apiProfile.bio,
    avatarUrl: apiProfile.avatarUrl,
  };
}

export function mapPublicProfileFromApi(apiProfile: PublicProfileApi): PublicProfile {
  return {
    ...mapProfileFromApi(apiProfile),
    followersCount: apiProfile.followersCount,
    followingCount: apiProfile.followingCount,
  };
}

export function mapReactionFromApi(apiReaction: ReactionApi): Reaction {
  return {
    id: apiReaction.id,
    publicationId: apiReaction.publicationId,
    authorUserId: apiReaction.authorUserId,
    createdAt: new Date(apiReaction.createdAt),
  };
}

export function mapCommentFromApi(apiComment: CommentApi): Comment {
  return {
    id: apiComment.id,
    publicationId: apiComment.publicationId,
    authorUserId: apiComment.authorUserId,
    content: apiComment.content,
    createdAt: new Date(apiComment.createdAt),
  };
}

export interface PublicationApi {
  id: string;
  authorUserId: string;
  title: string;
  content: string;
  mediaUrls: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PublicationPageApi {
  items: PublicationApi[];
  limit: number;
  offset: number;
  total: number;
  hasMore: boolean;
}

export interface CreatePublicationRequestApi {
  title: string;
  content: string;
  mediaUrls?: string[];
}

export interface DeletePublicationApi {
  id: string;
  deleted: boolean;
}

export interface ProfileApi {
  userId: string;
  displayName: string;
  handle: string;
  bio: string | null;
  avatarUrl: string | null;
}

export interface PublicProfileApi extends ProfileApi {
  followersCount: number;
  followingCount: number;
}

export interface ProfileListApi {
  items: ProfileApi[];
}

export interface ReactionApi {
  id: string;
  publicationId: string;
  authorUserId: string;
  createdAt: string;
}

export interface DeleteReactionApi {
  publicationId: string;
  deleted: boolean;
}

export interface CommentApi {
  id: string;
  publicationId: string;
  authorUserId: string;
  content: string;
  createdAt: string;
}

export interface CommentListApi {
  items: CommentApi[];
}

export interface CreateCommentRequestApi {
  content: string;
}

export interface DeleteCommentApi {
  id: string;
  deleted: boolean;
}

export interface UpdateOwnProfileRequestApi {
  bio?: string | null;
  avatarUrl?: string | null;
}

export interface FollowProfileApi {
  followerUserId: string;
  followedUserId: string;
  following: boolean;
}

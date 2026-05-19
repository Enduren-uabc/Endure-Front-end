export interface Publication {
  id: string;
  authorUserId: string;
  title: string;
  content: string;
  mediaUrls: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PublicationPage {
  items: Publication[];
  limit: number;
  offset: number;
  total: number;
  hasMore: boolean;
}

export interface Profile {
  userId: string;
  displayName: string;
  handle: string;
  bio: string | null;
  avatarUrl: string | null;
}

export interface PublicProfile extends Profile {
  followersCount: number;
  followingCount: number;
}

export interface Reaction {
  id: string;
  publicationId: string;
  authorUserId: string;
  createdAt: Date;
}

export interface Comment {
  id: string;
  publicationId: string;
  authorUserId: string;
  content: string;
  createdAt: Date;
}

export type FeedFilter = 'all' | 'following';

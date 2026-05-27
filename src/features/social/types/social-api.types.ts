export interface WorkoutSetSummaryApi {
  setNumber: number;
  repsPerformed: number | null;
  weightUsed: number | null;
  targetReps: number | null;
  targetWeight: number | null;
  completed: boolean;
}

export interface ExerciseSummaryItemApi {
  exerciseId: string;
  exerciseName: string;
  completedSets: number;
  totalSets: number;
  volume: number;
  workoutSets: WorkoutSetSummaryApi[];
}

export interface ExerciseSummaryApi {
  totalExercises: number;
  totalCompletedSets: number;
  totalSets: number;
  totalVolume: number;
  durationMinutes: number;
  routineName: string;
  dayOfWeek: string;
  exercises: ExerciseSummaryItemApi[];
}

export interface PublicationMediaApi {
  id: string;
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  sortOrder: number;
  createdAt: string;
}

export interface CommentPreviewApi {
  id: string;
  publicationId: string;
  authorUserId: string;
  authorDisplayName?: string;
  content: string;
  createdAt: string;
}

export interface PublicationApi {
  id: string;
  authorUserId: string;
  authorDisplayName?: string;
  authorAvatarUrl?: string;
  title: string;
  content: string;
  mediaUrls: string[];
  media: PublicationMediaApi[];
  workoutSessionId: string | null;
  exerciseSummary: ExerciseSummaryApi | null;
  reactionCount: number;
  recentReactorNames: string[];
  commentCount: number;
  recentComments: CommentPreviewApi[];
  likedByMe: boolean;
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
  mediaIds?: string[];
}

export interface CreateWorkoutPublicationRequestApi {
  caption?: string;
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
  displayName?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  handle?: string | null;
}

export interface ForkResponseApi {
  routineId: string;
  dayOfWeek: string;
  exercisesAdded: number;
}

export interface FollowProfileApi {
  followerUserId: string;
  followedUserId: string;
  following: boolean;
}

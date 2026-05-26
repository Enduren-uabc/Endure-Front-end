export interface WorkoutSetSummary {
  setNumber: number;
  repsPerformed: number | null;
  weightUsed: number | null;
  targetReps: number | null;
  targetWeight: number | null;
  completed: boolean;
}

export interface ExerciseSummaryItem {
  exerciseId: string;
  exerciseName: string;
  completedSets: number;
  totalSets: number;
  volume: number;
  workoutSets: WorkoutSetSummary[];
}

export interface ExerciseSummary {
  totalExercises: number;
  totalCompletedSets: number;
  totalSets: number;
  totalVolume: number;
  durationMinutes: number;
  routineName: string;
  dayOfWeek: string;
  exercises: ExerciseSummaryItem[];
}

export interface PublicationMedia {
  id: string;
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  sortOrder: number;
  createdAt: Date;
}

export interface Publication {
  id: string;
  authorUserId: string;
  authorDisplayName?: string;
  authorAvatarUrl?: string;
  title: string;
  content: string;
  mediaUrls: string[];
  media: PublicationMedia[];
  workoutSessionId: string | null;
  exerciseSummary: ExerciseSummary | null;
  reactionCount: number;
  recentReactorNames: string[];
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

export interface ForkPayload {
  sourceWorkoutSessionId: string;
  exercises?: ForkExerciseOverride[];
}

export interface ForkExerciseOverride {
  sourceExerciseId: string;
  sets?: number;
  repsPerSet?: number;
  weight?: number;
}

import type {
  CommentApi,
  ExerciseSummaryApi,
  ProfileApi,
  PublicationApi,
  PublicationMediaApi,
  PublicationPageApi,
  PublicProfileApi,
  ReactionApi,
} from '../types/social-api.types';
import type {
  Comment,
  ExerciseSummary,
  Profile,
  Publication,
  PublicationMedia,
  PublicationPage,
  PublicProfile,
  Reaction,
} from '../types/social.types';

function normalizeSetsCount(raw: unknown, fallback: number): number {
  if (typeof raw === 'number' && !isNaN(raw)) return raw;
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (trimmed.length === 0) return fallback;
    const directNum = Number(trimmed);
    if (!isNaN(directNum)) return directNum;
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        return Array.isArray(parsed) ? parsed.length : fallback;
      } catch {
        // no-op
      }
    }
    const prefixMatch = trimmed.match(/^(\d+)/);
    if (prefixMatch) {
      const prefix = parseInt(prefixMatch[1], 10);
      let arrayLengthSum = 0;
      const arrayRegex = /\[.*?\]/g;
      let m;
      while ((m = arrayRegex.exec(trimmed)) !== null) {
        try {
          const parsed = JSON.parse(m[0]);
          if (Array.isArray(parsed)) arrayLengthSum += parsed.length;
        } catch {
          // ignore
        }
      }
      if (arrayLengthSum > 0) return prefix + arrayLengthSum;
      return prefix;
    }
  }
  return fallback;
}

function mapExerciseSummaryFromApi(
  api: ExerciseSummaryApi | null,
): ExerciseSummary | null {
  if (!api) return null;

  const exercises = api.exercises.map((ex) => {
    const workoutSets = ex.workoutSets.map((s) => ({
      setNumber: s.setNumber,
      repsPerformed: s.repsPerformed,
      weightUsed: s.weightUsed,
      targetReps: s.targetReps,
      targetWeight: s.targetWeight,
      completed: s.completed,
    }));
    const normalizedTotalSets = normalizeSetsCount(
      ex.totalSets,
      workoutSets.length,
    );
    return {
      exerciseId: ex.exerciseId,
      exerciseName: ex.exerciseName,
      completedSets: ex.completedSets,
      totalSets: normalizedTotalSets,
      volume: ex.volume,
      workoutSets,
    };
  });

  const normalizedTotalSets = normalizeSetsCount(
    api.totalSets,
    exercises.reduce((sum, ex) => sum + ex.totalSets, 0),
  );
  const normalizedTotalCompletedSets = normalizeSetsCount(
    api.totalCompletedSets,
    exercises.reduce((sum, ex) => sum + ex.completedSets, 0),
  );

  return {
    totalExercises: api.totalExercises,
    totalCompletedSets: normalizedTotalCompletedSets,
    totalSets: normalizedTotalSets,
    totalVolume: api.totalVolume,
    durationMinutes: api.durationMinutes,
    routineName: api.routineName,
    dayOfWeek: api.dayOfWeek,
    exercises,
  };
}

function mapPublicationMediaFromApi(api: PublicationMediaApi): PublicationMedia {
  return {
    id: api.id,
    url: api.url,
    fileName: api.fileName,
    fileSize: api.fileSize,
    mimeType: api.mimeType,
    sortOrder: api.sortOrder,
    createdAt: new Date(api.createdAt),
  };
}

export function mapPublicationFromApi(apiPublication: PublicationApi): Publication {
  return {
    id: apiPublication.id,
    authorUserId: apiPublication.authorUserId,
    authorDisplayName: apiPublication.authorDisplayName,
    authorAvatarUrl: apiPublication.authorAvatarUrl,
    title: apiPublication.title,
    content: apiPublication.content,
    mediaUrls: apiPublication.mediaUrls,
    media: (apiPublication.media ?? []).map(mapPublicationMediaFromApi),
    workoutSessionId: apiPublication.workoutSessionId,
    exerciseSummary: mapExerciseSummaryFromApi(apiPublication.exerciseSummary),
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

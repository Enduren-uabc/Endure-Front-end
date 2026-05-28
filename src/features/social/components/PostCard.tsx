import React from 'react';
import {
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Dumbbell, GitFork, MessageCircle, Trash2 } from 'lucide-react-native';
import { theme } from '@/theme';
import type { Publication } from '../types/social.types';
import { PostHeader } from './PostHeader';
import { WorkoutSummaryGraphic } from './WorkoutSummaryGraphic';

const { width } = Dimensions.get('window');

interface PostCardProps {
  publication: Publication;
  onOpenPost: (publication: Publication) => void;
  onOpenProfile: (userId: string) => void;
  onLike: (publicationId: string) => void;
  onUnlike?: (publicationId: string) => void;
  onDelete?: (publicationId: string) => void;
  onFork?: (publication: Publication) => void;
  liked?: boolean;
  likeLoading?: boolean;
  deleteLoading?: boolean;
  canDelete?: boolean;
}

const MAX_COMMENT_PREVIEW = 2;

export function PostCard({
  publication,
  onOpenPost,
  onOpenProfile,
  onLike,
  onUnlike,
  onDelete,
  onFork,
  liked,
  likeLoading,
  deleteLoading,
  canDelete,
}: PostCardProps) {
  const handleReaction = () => {
    if (liked && onUnlike) {
      onUnlike(publication.id);
      return;
    }
    onLike(publication.id);
  };

  const mediaItems = publication.media.length > 0
    ? publication.media
    : publication.mediaUrls.map((url, idx) => ({ id: `url-${idx}`, url }));
  const hasMedia = mediaItems.length > 0;
  const hasSummary = !!publication.exerciseSummary;

  const previewComments = publication.recentComments.slice(0, MAX_COMMENT_PREVIEW);
  const remainingComments = publication.commentCount - previewComments.length;

  return (
    <View style={styles.card}>
      <PostHeader
        displayName={publication.authorDisplayName}
        avatarUrl={publication.authorAvatarUrl}
        createdAt={new Date(publication.createdAt)}
        onOpenProfile={() => onOpenProfile(publication.authorUserId)}
      />

      <View style={styles.mediaContainer}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.carousel}
        >
          {hasSummary && (
            <Pressable onPress={() => onOpenPost(publication)}>
              <WorkoutSummaryGraphic summary={publication.exerciseSummary!} />
            </Pressable>
          )}

          {mediaItems.map((m) => (
            <Pressable key={m.id} onPress={() => onOpenPost(publication)}>
              <Image
                source={{ uri: m.url }}
                style={styles.mediaImage}
                resizeMode="cover"
              />
            </Pressable>
          ))}
        </ScrollView>
        
        {(hasMedia && hasSummary) || mediaItems.length > 1 ? (
          <View style={styles.paginationTag}>
            <Text style={styles.paginationText}>
              1 / {(mediaItems.length + (hasSummary ? 1 : 0))}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.actionsContainer}>
        <View style={styles.leftActions}>
          <Pressable
            onPress={handleReaction}
            disabled={likeLoading}
            style={styles.actionIcon}
          >
            <Dumbbell
              color={liked ? theme.colors.primary : theme.colors.textPrimary}
              fill={liked ? theme.colors.primary : 'transparent'}
              size={26}
              strokeWidth={liked ? 2.5 : 1.5}
            />
          </Pressable>
          
          <Pressable
            onPress={() => onOpenPost(publication)}
            style={styles.actionIcon}
          >
            <MessageCircle color={theme.colors.textPrimary} size={26} strokeWidth={1.5} />
          </Pressable>

          {publication.workoutSessionId && onFork && (
            <Pressable
              onPress={() => onFork(publication)}
              style={styles.actionIcon}
            >
              <GitFork color={theme.colors.textPrimary} size={26} strokeWidth={1.5} />
            </Pressable>
          )}
        </View>

        {canDelete && onDelete && (
          <Pressable
            onPress={() => onDelete(publication.id)}
            disabled={deleteLoading}
            style={styles.actionIcon}
          >
            <Trash2 color={theme.colors.error} size={22} strokeWidth={1.5} />
          </Pressable>
        )}
      </View>

      {publication.reactionCount > 0 ? (
        <View style={styles.likesContainer}>
          <Text style={styles.likesText}>
            <Text style={styles.likesHighlight}>{publication.recentReactorNames[0]}</Text>
            {publication.reactionCount === 1
              ? ` le gusta esto`
              : publication.recentReactorNames.length === 2 && publication.reactionCount === 2
                ? ` y ${publication.recentReactorNames[1]} le gusta esto`
                : ` y ${publication.reactionCount - 1} personas más le gusta esto`}
          </Text>
        </View>
      ) : null}

      <View style={styles.captionContainer}>
        {publication.content ? (
          <Text style={styles.contentText} numberOfLines={3}>
            {publication.content}
          </Text>
        ) : null}

        {previewComments.map((comment) => (
          <View key={comment.id} style={styles.commentPreviewRow}>
            <Text style={styles.commentPreviewAuthor}>
              {comment.authorDisplayName ?? `@${comment.authorUserId.slice(0, 8)}`}
            </Text>
            <Text style={styles.commentPreviewContent} numberOfLines={1}>
              {comment.content}
            </Text>
          </View>
        ))}

        {publication.commentCount > 0 ? (
          <Pressable onPress={() => onOpenPost(publication)}>
            <Text style={styles.viewComments}>
              {remainingComments > 0
                ? `Ver los ${publication.commentCount} comentarios`
                : 'Ver comentarios...'}
            </Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.separator} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.background,
    marginBottom: theme.spacing.lg,
  },
  mediaContainer: {
    position: 'relative',
    width: width,
    aspectRatio: 1,
  },
  carousel: {
    flex: 1,
  },
  mediaImage: {
    width: width,
    height: width,
    backgroundColor: theme.colors.surfaceElevated,
  },
  paginationTag: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  paginationText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg,
  },
  actionIcon: {
    padding: 2,
  },
  captionContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  likesContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.xs,
    paddingBottom: 2,
  },
  likesText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  likesHighlight: {
    color: theme.colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  commentPreviewRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    marginTop: 4,
  },
  commentPreviewAuthor: {
    color: theme.colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    flexShrink: 0,
  },
  commentPreviewContent: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    flex: 1,
  },
  contentText: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    lineHeight: 18,
  },
  viewComments: {
    color: theme.colors.textMuted,
    fontSize: 13,
    marginTop: 6,
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.borderSoft,
    marginTop: theme.spacing.md,
    opacity: 0.3,
  },
});

import React from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GitFork, Trash2 } from 'lucide-react-native';
import { BaseCard } from '@/components/ui/BaseCard';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { theme } from '@/theme';
import { useSessionStore } from '@/features/auth/stores/session-store';
import { ExerciseSummaryCard } from '../components/ExerciseSummaryCard';
import ForkWorkoutModal from '../components/ForkWorkoutModal';
import { SocialEmptyState, SocialErrorState, SocialLoadingState } from '../components/SocialState';
import { useComments, useDeleteComment, useInteractions } from '../hooks/use-social';
import type { Comment, ExerciseSummary, Publication } from '../types/social.types';

const DEV_USER_ID = '00000000-0000-0000-0000-000000000001';

interface PostDetailScreenProps {
  postId: string;
  title?: string;
  content?: string;
  authorUserId?: string;
  workoutSessionId?: string;
  exerciseSummary?: ExerciseSummary;
}

function CommentRow({ comment, currentUserId }: { comment: Comment; currentUserId: string }) {
  const deleteComment = useDeleteComment(comment.publicationId);
  const canDelete = comment.authorUserId === currentUserId;

  return (
    <BaseCard style={styles.commentCard}>
      <View style={styles.commentHeader}>
        <Text style={styles.commentAuthor}>Usuario {comment.authorUserId.slice(0, 8)}</Text>
        {canDelete ? (
          <Pressable
            style={[styles.deleteCommentButton, deleteComment.isPending && styles.disabledAction]}
            onPress={() => deleteComment.mutate(comment.id)}
            disabled={deleteComment.isPending}
          >
            <Trash2 color={theme.colors.error} size={16} />
            <Text style={styles.deleteCommentText}>
              {deleteComment.isPending ? 'Eliminando' : 'Eliminar'}
            </Text>
          </Pressable>
        ) : null}
      </View>
      <Text style={styles.commentText}>{comment.content}</Text>
    </BaseCard>
  );
}

export default function PostDetailScreen({ postId, title, content, authorUserId, workoutSessionId, exerciseSummary }: PostDetailScreenProps) {
  const comments = useComments(postId);
  const interactions = useInteractions(postId);
  const currentUserId = useSessionStore((state) => state.userId) ?? DEV_USER_ID;
  const [draft, setDraft] = React.useState('');
  const [showForkModal, setShowForkModal] = React.useState(false);

  const submitComment = () => {
    const normalized = draft.trim();
    if (normalized.length === 0) return;
    interactions.comment.mutate(normalized, { onSuccess: () => setDraft('') });
  };

  if (comments.isLoading) return <SocialLoadingState />;

  if (comments.isError) {
    return (
      <SafeAreaView style={styles.container}>
        <SocialErrorState
          title="No pudimos cargar los comentarios"
          message="Intenta de nuevo para continuar la conversación."
          actionLabel="Reintentar"
          onAction={() => void comments.refetch()}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={comments.data ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CommentRow comment={item} currentUserId={currentUserId} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.kicker}>Publicación</Text>
            <Text style={styles.title}>{title ?? 'Detalle del post'}</Text>
            {content ? <Text style={styles.content}>{content}</Text> : null}
            {authorUserId ? <Text style={styles.meta}>Autor {authorUserId.slice(0, 8)}</Text> : null}
            {workoutSessionId && authorUserId !== currentUserId ? (
              <Pressable
                style={styles.forkButton}
                onPress={() => setShowForkModal(true)}
                accessibilityRole="button"
                accessibilityLabel="Forkear este entrenamiento"
              >
                <GitFork color={theme.colors.textSecondary} size={18} />
                <Text style={styles.forkButtonText}>Importar entrenamiento</Text>
              </Pressable>
            ) : null}
            {exerciseSummary ? (
              <ExerciseSummaryCard summary={exerciseSummary} expanded />
            ) : null}
            <ForkWorkoutModal
              visible={showForkModal}
              onClose={() => setShowForkModal(false)}
              publication={{
                id: postId,
                authorUserId: authorUserId ?? '',
                title: title ?? '',
                content: content ?? '',
                mediaUrls: [],
                media: [],
                workoutSessionId: workoutSessionId ?? null,
                exerciseSummary: exerciseSummary ?? null,
                reactionCount: 0,
                recentReactorNames: [],
                commentCount: 0,
                recentComments: [],
                likedByMe: false,
                createdAt: new Date(),
                updatedAt: new Date(),
              }}
              currentUserId={currentUserId}
            />
            <View style={styles.commentBox}>
              <TextInput
                value={draft}
                onChangeText={setDraft}
                placeholder="Escribe un comentario"
                placeholderTextColor={theme.colors.textMuted}
                style={styles.input}
                multiline
              />
              <PrimaryButton
                label="Comentar"
                onPress={submitComment}
                disabled={draft.trim().length === 0 || interactions.comment.isPending}
                loading={interactions.comment.isPending}
              />
            </View>
            <Text style={styles.sectionTitle}>Comentarios</Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={comments.isRefetching}
            onRefresh={() => void comments.refetch()}
            tintColor={theme.colors.primary}
          />
        }
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <SocialEmptyState
            title="Aún no hay comentarios"
            message="Sé la primera persona en iniciar la conversación."
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  kicker: {
    color: theme.colors.primary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading2.fontSize,
    lineHeight: theme.typography.heading2.lineHeight,
    fontWeight: theme.typography.heading2.fontWeight,
  },
  content: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
  },
  meta: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  commentBox: {
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  input: {
    minHeight: 72,
    color: theme.colors.textPrimary,
    backgroundColor: theme.colors.surfaceElevated,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    textAlignVertical: 'top',
  },
  forkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  forkButtonText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
  },
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading3.fontSize,
    lineHeight: theme.typography.heading3.lineHeight,
    fontWeight: theme.typography.heading3.fontWeight,
    marginTop: theme.spacing.md,
  },
  list: {
    paddingBottom: theme.spacing.xxl,
  },
  commentCard: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  commentAuthor: {
    color: theme.colors.primary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    fontWeight: '700',
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  deleteCommentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.md,
    borderColor: `${theme.colors.error}66`,
    borderWidth: 1,
  },
  deleteCommentText: {
    color: theme.colors.error,
    fontSize: theme.typography.caption.fontSize,
    fontWeight: '700',
  },
  disabledAction: {
    opacity: 0.6,
  },
  commentText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
  },
});

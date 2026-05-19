import React from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Heart, MessageCircle, Trash2, UserCircle } from 'lucide-react-native';
import { BaseCard } from '@/components/ui/BaseCard';
import { theme } from '@/theme';
import type { Publication } from '../types/social.types';

interface PostCardProps {
  publication: Publication;
  onOpenPost: (publication: Publication) => void;
  onOpenProfile: (userId: string) => void;
  onLike: (publicationId: string) => void;
  onUnlike?: (publicationId: string) => void;
  onDelete?: (publicationId: string) => void;
  liked?: boolean;
  likeLoading?: boolean;
  deleteLoading?: boolean;
  canDelete?: boolean;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function PostCard({
  publication,
  onOpenPost,
  onOpenProfile,
  onLike,
  onUnlike,
  onDelete,
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

  return (
    <BaseCard style={styles.card}>
      <Pressable
        style={styles.authorRow}
        onPress={() => onOpenProfile(publication.authorUserId)}
        accessibilityRole="button"
        accessibilityLabel="Ver perfil del autor"
      >
        <View style={styles.avatarPlaceholder}>
          <UserCircle color={theme.colors.primary} size={24} />
        </View>
        <View style={styles.authorCopy}>
          <Text style={styles.author}>Autor social</Text>
          <Text style={styles.meta}>{formatDate(publication.createdAt)}</Text>
        </View>
      </Pressable>

      <Pressable onPress={() => onOpenPost(publication)} accessibilityRole="button">
        <Text style={styles.title}>{publication.title}</Text>
        <Text style={styles.content}>{publication.content}</Text>
      </Pressable>

      {publication.mediaUrls.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.mediaStrip}
        >
          {publication.mediaUrls.map((url) => (
            <Image key={url} source={{ uri: url }} style={styles.media} resizeMode="cover" />
          ))}
        </ScrollView>
      ) : null}

      <View style={styles.actions}>
        <Pressable
          style={[styles.actionButton, likeLoading && styles.actionDisabled]}
          onPress={handleReaction}
          disabled={likeLoading}
          accessibilityRole="button"
          accessibilityLabel={liked ? 'Quitar reacción' : 'Reaccionar a la publicación'}
        >
          <Heart
            color={theme.colors.primary}
            fill={liked ? theme.colors.primary : 'transparent'}
            size={18}
          />
          <Text style={styles.actionText}>
            {likeLoading ? 'Enviando' : liked ? 'Quitar like' : 'Me gusta'}
          </Text>
        </Pressable>
        <Pressable
          style={styles.actionButton}
          onPress={() => onOpenPost(publication)}
          accessibilityRole="button"
          accessibilityLabel="Ver comentarios"
        >
          <MessageCircle color={theme.colors.textSecondary} size={18} />
          <Text style={styles.actionText}>Comentar</Text>
        </Pressable>
        {canDelete && onDelete ? (
          <Pressable
            style={[styles.actionButton, styles.deleteButton, deleteLoading && styles.actionDisabled]}
            onPress={() => onDelete(publication.id)}
            disabled={deleteLoading}
            accessibilityRole="button"
            accessibilityLabel="Eliminar publicación"
          >
            <Trash2 color={theme.colors.error} size={18} />
            <Text style={[styles.actionText, styles.deleteText]}>
              {deleteLoading ? 'Eliminando' : 'Eliminar'}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </BaseCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: theme.spacing.md,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  avatarPlaceholder: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  authorCopy: {
    flex: 1,
  },
  author: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: theme.typography.bodyStrong.fontWeight,
  },
  meta: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading3.fontSize,
    lineHeight: theme.typography.heading3.lineHeight,
    fontWeight: theme.typography.heading3.fontWeight,
    marginBottom: theme.spacing.xs,
  },
  content: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
  },
  mediaStrip: {
    gap: theme.spacing.sm,
  },
  media: {
    width: 220,
    height: 150,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surfaceElevated,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderSoft,
    paddingTop: theme.spacing.md,
  },
  deleteButton: {
    borderColor: `${theme.colors.error}66`,
    borderWidth: 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceElevated,
  },
  actionDisabled: {
    opacity: 0.6,
  },
  actionText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    fontWeight: '600',
  },
  deleteText: {
    color: theme.colors.error,
  },
});

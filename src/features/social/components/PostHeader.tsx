import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { UserCircle } from 'lucide-react-native';
import { theme } from '@/theme';

interface PostHeaderProps {
  displayName?: string;
  avatarUrl?: string;
  createdAt: Date;
  onOpenProfile: () => void;
}

export function PostHeader({
  displayName,
  avatarUrl,
  createdAt,
  onOpenProfile,
}: PostHeaderProps) {
  const formatDateRelative = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 7) {
      return new Intl.DateTimeFormat('es-MX', {
        day: '2-digit',
        month: 'short',
      }).format(date);
    }
    if (days > 0) return `Hace ${days} d`;
    if (hours > 0) return `Hace ${hours} h`;
    if (minutes > 0) return `Hace ${minutes} m`;
    return 'Ahora mismo';
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.authorRow}
        onPress={onOpenProfile}
        accessibilityRole="button"
      >
        <View style={styles.avatarContainer}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <UserCircle color={theme.colors.primary} size={28} />
            </View>
          )}
        </View>
        <View style={styles.authorCopy}>
          <Text style={styles.authorName} numberOfLines={1}>
            {displayName || 'Usuario de Endure'}
          </Text>
          <Text style={styles.meta}>{formatDateRelative(createdAt)}</Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  avatarContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.borderSoft,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceElevated,
  },
  authorCopy: {
    flex: 1,
  },
  authorName: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    fontWeight: '700',
  },
  meta: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small.fontSize,
    marginTop: -2,
  },
});

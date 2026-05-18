import React from 'react';
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Edit3, UserCircle, X } from 'lucide-react-native';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { theme } from '@/theme';
import { useSessionStore } from '@/features/auth/stores/session-store';
import { PostCard } from '../components/PostCard';
import { SocialEmptyState, SocialErrorState, SocialLoadingState } from '../components/SocialState';
import {
  useDeletePublication,
  useFollowProfile,
  useFollowers,
  useFollowing,
  useInteractions,
  useProfile,
  useUnfollowProfile,
  useUpdateOwnProfile,
  useUserPublications,
} from '../hooks/use-social';
import type { Profile, Publication } from '../types/social.types';

const DEV_USER_ID = '00000000-0000-0000-0000-000000000001';

function ProfilePost({ publication }: { publication: Publication }) {
  const interactions = useInteractions(publication.id);
  const deletePublication = useDeletePublication();
  const currentUserId = useSessionStore((state) => state.userId) ?? DEV_USER_ID;
  const [liked, setLiked] = React.useState(false);
  const reactionPending = interactions.like.isPending || interactions.unlike.isPending;

  return (
    <PostCard
      publication={publication}
      onOpenPost={(post) =>
        router.push({
          pathname: '/posts/[postId]',
          params: {
            postId: post.id,
            title: post.title,
            content: post.content,
            authorUserId: post.authorUserId,
          },
        })
      }
      onOpenProfile={() => undefined}
      onLike={() => interactions.like.mutate(undefined, { onSuccess: () => setLiked(true) })}
      onUnlike={() => interactions.unlike.mutate(undefined, { onSuccess: () => setLiked(false) })}
      onDelete={() => deletePublication.mutate(publication.id)}
      liked={liked}
      canDelete={publication.authorUserId === currentUserId}
      likeLoading={reactionPending}
      deleteLoading={deletePublication.isPending}
    />
  );
}

function ProfileListModal({
  title,
  visible,
  profiles,
  isLoading,
  onClose,
}: {
  title: string;
  visible: boolean;
  profiles: Profile[];
  isLoading: boolean;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <Pressable onPress={onClose}>
              <X color={theme.colors.textSecondary} size={22} />
            </Pressable>
          </View>
          {isLoading ? <Text style={styles.modalMeta}>Cargando...</Text> : null}
          {!isLoading && profiles.length === 0 ? (
            <Text style={styles.modalMeta}>No hay usuarios para mostrar.</Text>
          ) : null}
          {profiles.map((profile) => (
            <Pressable
              key={profile.userId}
              style={styles.profileListRow}
              onPress={() => {
                onClose();
                router.push({ pathname: '/profiles/[userId]', params: { userId: profile.userId } });
              }}
            >
              <Text style={styles.profileListName}>{profile.displayName}</Text>
              <Text style={styles.profileListHandle}>@{profile.handle}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </Modal>
  );
}

export default function ProfileScreen({ userId }: { userId: string }) {
  const currentUserId = useSessionStore((state) => state.userId) ?? DEV_USER_ID;
  const isOwnProfile = userId === currentUserId;
  const profile = useProfile(userId);
  const publications = useUserPublications(userId);
  const follow = useFollowProfile(userId);
  const unfollow = useUnfollowProfile(userId);
  const updateOwnProfile = useUpdateOwnProfile(userId);
  const followers = useFollowers(userId);
  const following = useFollowing(userId);
  const items = publications.data?.pages.flatMap((page) => page.items) ?? [];
  const [isFollowing, setIsFollowing] = React.useState(false);
  const [showEdit, setShowEdit] = React.useState(false);
  const [showFollowers, setShowFollowers] = React.useState(false);
  const [showFollowing, setShowFollowing] = React.useState(false);
  const [bio, setBio] = React.useState('');
  const [avatarUrl, setAvatarUrl] = React.useState('');

  React.useEffect(() => {
    if (!profile.data) return;
    setBio(profile.data.bio ?? '');
    setAvatarUrl(profile.data.avatarUrl ?? '');
  }, [profile.data]);

  const handleFollowToggle = () => {
    if (isFollowing) {
      unfollow.mutate(undefined, { onSuccess: () => setIsFollowing(false) });
      return;
    }
    follow.mutate(undefined, { onSuccess: () => setIsFollowing(true) });
  };

  const saveProfile = () => {
    updateOwnProfile.mutate(
      {
        bio: bio.trim().length > 0 ? bio.trim() : null,
        avatarUrl: avatarUrl.trim().length > 0 ? avatarUrl.trim() : null,
      },
      { onSuccess: () => setShowEdit(false) },
    );
  };

  if (profile.isLoading) return <SocialLoadingState />;

  if (profile.isError || !profile.data) {
    return (
      <SafeAreaView style={styles.container}>
        <SocialErrorState
          title="No pudimos cargar el perfil"
          message="El perfil no está disponible o hubo un problema de conexión."
          actionLabel="Reintentar"
          onAction={() => void profile.refetch()}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ProfilePost publication={item} />}
        ListHeaderComponent={
          <View style={styles.profileHeader}>
            {profile.data.avatarUrl ? (
              <Image source={{ uri: profile.data.avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <UserCircle color={theme.colors.primary} size={42} />
              </View>
            )}
            <Text style={styles.name}>{profile.data.displayName}</Text>
            <Text style={styles.handle}>@{profile.data.handle}</Text>
            <Text style={styles.bio}>{profile.data.bio ?? 'Este usuario aún no agregó una biografía.'}</Text>
            <View style={styles.statsRow}>
              <Pressable onPress={() => setShowFollowers(true)}>
                <Text style={styles.stat}>{profile.data.followersCount} seguidores</Text>
              </Pressable>
              <Pressable onPress={() => setShowFollowing(true)}>
                <Text style={styles.stat}>{profile.data.followingCount} siguiendo</Text>
              </Pressable>
            </View>
            <View style={styles.actions}>
              {isOwnProfile ? (
                <PrimaryButton label="Editar perfil" onPress={() => setShowEdit(true)} />
              ) : (
                <PrimaryButton
                  label={isFollowing ? 'Dejar de seguir' : 'Seguir'}
                  onPress={handleFollowToggle}
                  loading={follow.isPending || unfollow.isPending}
                  disabled={follow.isPending || unfollow.isPending}
                />
              )}
            </View>
            <Text style={styles.sectionTitle}>Publicaciones visibles</Text>
          </View>
        }
        contentContainerStyle={items.length === 0 ? styles.emptyList : styles.list}
        refreshControl={
          <RefreshControl
            refreshing={profile.isRefetching || publications.isRefetching}
            onRefresh={() => {
              void profile.refetch();
              void publications.refetch();
            }}
            tintColor={theme.colors.primary}
          />
        }
        onEndReached={() => {
          if (publications.hasNextPage && !publications.isFetchingNextPage) {
            void publications.fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={
          <SocialEmptyState
            title="Sin publicaciones visibles"
            message="Cuando este perfil comparta contenido público, aparecerá aquí."
          />
        }
      />

      <ProfileListModal
        title="Seguidores"
        visible={showFollowers}
        profiles={followers.data ?? []}
        isLoading={followers.isLoading}
        onClose={() => setShowFollowers(false)}
      />
      <ProfileListModal
        title="Siguiendo"
        visible={showFollowing}
        profiles={following.data ?? []}
        isLoading={following.isLoading}
        onClose={() => setShowFollowing(false)}
      />
      <Modal visible={showEdit} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.editTitleRow}>
                <Edit3 color={theme.colors.primary} size={20} />
                <Text style={styles.modalTitle}>Editar perfil</Text>
              </View>
              <Pressable onPress={() => setShowEdit(false)}>
                <X color={theme.colors.textSecondary} size={22} />
              </Pressable>
            </View>
            <TextInput
              value={bio}
              onChangeText={setBio}
              placeholder="Bio"
              placeholderTextColor={theme.colors.textMuted}
              style={[styles.modalInput, styles.modalTextArea]}
              multiline
              editable={!updateOwnProfile.isPending}
            />
            <TextInput
              value={avatarUrl}
              onChangeText={setAvatarUrl}
              placeholder="URL de avatar"
              placeholderTextColor={theme.colors.textMuted}
              style={styles.modalInput}
              autoCapitalize="none"
              editable={!updateOwnProfile.isPending}
            />
            <PrimaryButton
              label="Guardar cambios"
              onPress={saveProfile}
              loading={updateOwnProfile.isPending}
              disabled={updateOwnProfile.isPending}
            />
            <SecondaryButton
              label="Cancelar"
              onPress={() => setShowEdit(false)}
              disabled={updateOwnProfile.isPending}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  profileHeader: {
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: theme.colors.surfaceElevated,
  },
  avatarFallback: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  name: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading1.fontSize,
    lineHeight: theme.typography.heading1.lineHeight,
    fontWeight: theme.typography.heading1.fontWeight,
  },
  handle: {
    color: theme.colors.primary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: theme.typography.bodyStrong.fontWeight,
  },
  bio: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
  },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  stat: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    textDecorationLine: 'underline',
  },
  actions: {
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading3.fontSize,
    lineHeight: theme.typography.heading3.lineHeight,
    fontWeight: theme.typography.heading3.fontWeight,
    marginTop: theme.spacing.lg,
  },
  list: {
    paddingBottom: theme.spacing.xxl,
  },
  emptyList: {
    flexGrow: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: theme.colors.overlay,
  },
  modalCard: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  editTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  modalTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading3.fontSize,
    fontWeight: theme.typography.heading3.fontWeight,
  },
  modalMeta: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body.fontSize,
  },
  profileListRow: {
    paddingVertical: theme.spacing.sm,
    borderBottomColor: theme.colors.borderSoft,
    borderBottomWidth: 1,
  },
  profileListName: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    fontWeight: theme.typography.bodyStrong.fontWeight,
  },
  profileListHandle: {
    color: theme.colors.primary,
    fontSize: theme.typography.small.fontSize,
  },
  modalInput: {
    color: theme.colors.textPrimary,
    backgroundColor: theme.colors.surfaceElevated,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
  },
  modalTextArea: {
    minHeight: 110,
    textAlignVertical: 'top',
  },
});

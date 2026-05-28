import React from 'react';
import {
  ActionSheetIOS,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Edit3, Image as ImageIcon, UserCircle, X } from 'lucide-react-native';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { theme } from '@/theme';
import { useSessionStore } from '@/features/auth/stores/session-store';
import type { SocialStackParamList } from '@/navigation/types';
import { PostCard } from '../components/PostCard';
import ForkWorkoutModal from '../components/ForkWorkoutModal';
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
  useUploadAvatar,
  useUserPublications,
} from '../hooks/use-social';
import type { Profile, Publication } from '../types/social.types';

const DEV_USER_ID = '00000000-0000-0000-0000-000000000001';

function ProfilePost({ publication, onFork }: { publication: Publication; onFork?: (pub: Publication) => void }) {
  const navigation = useNavigation<NativeStackNavigationProp<SocialStackParamList>>();
  const interactions = useInteractions(publication.id);
  const deletePublication = useDeletePublication();
  const currentUserId = useSessionStore((state) => state.userId) ?? DEV_USER_ID;
  const [liked, setLiked] = React.useState(false);
  const reactionPending = interactions.like.isPending || interactions.unlike.isPending;

  return (
    <PostCard
      publication={publication}
      onOpenPost={(post) =>
        navigation.navigate('PostDetail', {
          postId: post.id,
          title: post.title,
          content: post.content,
          authorUserId: post.authorUserId,
          workoutSessionId: post.workoutSessionId ?? undefined,
          exerciseSummary: post.exerciseSummary ?? undefined,
        })
      }
      onOpenProfile={() => undefined}
      onLike={() => interactions.like.mutate(undefined, { onSuccess: () => setLiked(true) })}
      onUnlike={() => interactions.unlike.mutate(undefined, { onSuccess: () => setLiked(false) })}
      onDelete={() => deletePublication.mutate(publication.id)}
      onFork={onFork}
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
  const navigation = useNavigation<NativeStackNavigationProp<SocialStackParamList>>();

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
                navigation.navigate('PublicProfile', { userId: profile.userId });
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
  const uploadAvatar = useUploadAvatar(userId);
  const followers = useFollowers(userId);
  const following = useFollowing(userId);
  const items = React.useMemo(
    () =>
      publications.data?.pages.flatMap((page) =>
        page.items.map((item) => ({
          ...item,
          authorDisplayName: item.authorDisplayName || profile.data?.displayName || '',
          authorAvatarUrl: item.authorAvatarUrl || profile.data?.avatarUrl || undefined,
        })),
      ) ?? [],
    [publications.data, profile.data?.displayName, profile.data?.avatarUrl],
  );
  const [isFollowing, setIsFollowing] = React.useState(false);
  const [showEdit, setShowEdit] = React.useState(false);
  const [showFollowers, setShowFollowers] = React.useState(false);
  const [showFollowing, setShowFollowing] = React.useState(false);
  const [forkPublication, setForkPublication] = React.useState<Publication | null>(null);
  const [bio, setBio] = React.useState('');

  React.useEffect(() => {
    if (!profile.data) return;
    setBio(profile.data.bio ?? '');
    setIsFollowing(profile.data.isFollowing);
  }, [profile.data]);

  const handleFollowToggle = () => {
    if (isFollowing) {
      unfollow.mutate(undefined, { onSuccess: () => setIsFollowing(false) });
      return;
    }
    follow.mutate(undefined, { onSuccess: () => setIsFollowing(true) });
  };

  const pickAvatar = React.useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    uploadAvatar.mutate(
      {
        uri: asset.uri,
        name: asset.fileName ?? 'avatar.jpg',
        type: asset.mimeType ?? 'image/jpeg',
      },
      {
        onSuccess: () => {
          // No cerramos el modal para que el usuario vea su nueva foto antes de confirmar
          // setShowEdit(false) 
        }
      },
    );
  }, [uploadAvatar]);

  const pickAvatarFromCamera = React.useCallback(async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    uploadAvatar.mutate(
      {
        uri: asset.uri,
        name: asset.fileName ?? 'camera.jpg',
        type: asset.mimeType ?? 'image/jpeg',
      },
      {
        onSuccess: () => {
          // No cerramos el modal para que el usuario vea su nueva foto antes de confirmar
          // setShowEdit(false)
        }
      },
    );
  }, [uploadAvatar]);

  const showAvatarPicker = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancelar', 'Tomar foto', 'Elegir de galeria'],
          cancelButtonIndex: 0,
        },
        (index) => {
          if (index === 1) pickAvatarFromCamera();
          if (index === 2) pickAvatar();
        },
      );
    } else {
      pickAvatar();
    }
  };

  const saveProfile = () => {
    updateOwnProfile.mutate(
      { bio: bio.trim().length > 0 ? bio.trim() : null },
      { onSuccess: () => setShowEdit(false) },
    );
  };

  if (profile.isLoading) return <SocialLoadingState />;

  if (profile.isError || !profile.data) {
    return (
      <SafeAreaView style={styles.container}>
        <SocialErrorState
          title="No pudimos cargar el perfil"
          message="El perfil no esta disponible o hubo un problema de conexion."
          actionLabel="Reintentar"
          onAction={() => void profile.refetch()}
        />
      </SafeAreaView>
    );
  }

  const profileData = profile.data;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ProfilePost publication={item} onFork={setForkPublication} />}
        ListHeaderComponent={
          <View style={styles.profileHeader}>
            <Pressable onPress={isOwnProfile ? showAvatarPicker : undefined} style={styles.avatarWrap}>
              {profileData.avatarUrl ? (
                <Image source={{ uri: profileData.avatarUrl }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarFallback}>
                  <UserCircle color={theme.colors.primary} size={48} />
                </View>
              )}
              {isOwnProfile ? (
                <View style={styles.avatarOverlay}>
                  <Camera size={20} color={theme.colors.background} />
                </View>
              ) : null}
            </Pressable>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{profileData.displayName}</Text>
            </View>
            <Text style={styles.handle}>@{profileData.handle}</Text>
            <Text style={styles.bio}>
              {profileData.bio ?? 'Sin biografia aun.'}
            </Text>
            <View style={styles.statsRow}>
              <Pressable onPress={() => setShowFollowers(true)} style={styles.statItem}>
                <Text style={styles.statCount}>{profileData.followersCount}</Text>
                <Text style={styles.statLabel}>seguidores</Text>
              </Pressable>
              <View style={styles.statDot} />
              <Pressable onPress={() => setShowFollowing(true)} style={styles.statItem}>
                <Text style={styles.statCount}>{profileData.followingCount}</Text>
                <Text style={styles.statLabel}>siguiendo</Text>
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
            <Text style={styles.sectionTitle}>Publicaciones</Text>
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
            title="Sin publicaciones"
            message={
              isOwnProfile
                ? 'Comparte tu primer entrenamiento para verlo aqui.'
                : 'Este perfil aun no ha compartido contenido.'
            }
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
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalOverlay}
          >
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <View style={styles.editTitleRow}>
                  <Edit3 color={theme.colors.primary} size={20} />
                  <Text style={styles.modalTitle}>Editar perfil</Text>
                </View>
                <Pressable onPress={() => setShowEdit(false)} hitSlop={12}>
                  <X color={theme.colors.textSecondary} size={22} />
                </Pressable>
              </View>
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.modalScrollContent}
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.editAvatarSection}>
                  <Pressable onPress={showAvatarPicker} style={styles.editAvatarBtn}>
                    {profileData.avatarUrl ? (
                      <Image source={{ uri: profileData.avatarUrl }} style={styles.editAvatar} />
                    ) : (
                      <View style={styles.editAvatarEmpty}>
                        <ImageIcon size={28} color={theme.colors.textMuted} />
                      </View>
                    )}
                    <View style={styles.editAvatarOverlay}>
                      <Camera size={20} color={theme.colors.background} />
                    </View>
                  </Pressable>
                  <Pressable onPress={showAvatarPicker} hitSlop={8}>
                    <Text style={styles.editAvatarLabel}>Cambiar foto</Text>
                  </Pressable>
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Biografía</Text>
                  <TextInput
                    value={bio}
                    onChangeText={setBio}
                    placeholder="Cuéntale al mundo sobre tu entrenamiento..."
                    placeholderTextColor={theme.colors.textMuted}
                    style={[styles.modalInput, styles.modalTextArea]}
                    multiline
                    editable={!updateOwnProfile.isPending}
                    maxLength={160}
                    selectionColor={theme.colors.primary}
                  />
                  <Text style={styles.counter}>{bio.length}/160</Text>
                </View>
                <View style={styles.modalActions}>
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
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>
      <ForkWorkoutModal
        visible={forkPublication !== null}
        onClose={() => setForkPublication(null)}
        publication={forkPublication}
        currentUserId={currentUserId}
      />
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
    alignItems: 'center',
  },
  avatarWrap: {
    position: 'relative',
    marginBottom: theme.spacing.sm,
  },
  avatar: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  avatarFallback: {
    width: 104,
    height: 104,
    borderRadius: 52,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  avatarOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.background,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  name: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading2.fontSize,
    lineHeight: theme.typography.heading2.lineHeight,
    fontWeight: theme.typography.heading2.fontWeight,
  },
  handle: {
    color: theme.colors.primary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    fontWeight: '600',
  },
  bio: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  statItem: {
    alignItems: 'center',
    gap: 2,
  },
  statCount: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: '800',
  },
  statLabel: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: theme.colors.textMuted,
  },
  actions: {
    width: '100%',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading3.fontSize,
    lineHeight: theme.typography.heading3.lineHeight,
    fontWeight: theme.typography.heading3.fontWeight,
    marginTop: theme.spacing.xl,
    alignSelf: 'flex-start',
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
  editAvatarSection: {
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
  },
  editAvatarBtn: {
    position: 'relative',
  },
  editAvatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  editAvatarEmpty: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  editAvatarOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.background,
  },
  editAvatarLabel: {
    color: theme.colors.primary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: '700',
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
  modalScrollContent: {
    gap: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  modalActions: {
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  inputGroup: {
    gap: theme.spacing.xs,
  },
  inputLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    fontWeight: '600',
    marginLeft: 4,
  },
  counter: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    textAlign: 'right',
    marginTop: 4,
  },
});

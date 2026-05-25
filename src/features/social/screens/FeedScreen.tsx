import React from 'react';
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { GalleryHorizontal, Plus, Search, Trash2, UserCircle, X } from 'lucide-react-native';
import { DragIndicator } from '@/components/ui/DragIndicator';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { theme } from '@/theme';
import { useSessionStore } from '@/features/auth/stores/session-store';
import type { SocialStackParamList } from '@/navigation/types';
import { PostCard } from '../components/PostCard';
import ForkWorkoutModal from '../components/ForkWorkoutModal';
import { SocialEmptyState, SocialErrorState, SocialLoadingState } from '../components/SocialState';
import {
  useCreatePublication,
  useDeletePublication,
  useFeed,
  useInteractions,
  useProfileSearch,
  useUploadMedia,
} from '../hooks/use-social';
import type { FeedFilter, Publication } from '../types/social.types';

const DEV_USER_ID = '00000000-0000-0000-0000-000000000001';

function FeedPost({ publication, currentUserId, onFork }: { publication: Publication; currentUserId: string; onFork?: (pub: Publication) => void }) {
  const navigation = useNavigation<NativeStackNavigationProp<SocialStackParamList>>();
  const interactions = useInteractions(publication.id);
  const deletePublication = useDeletePublication();
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
      onOpenProfile={(userId) =>
        navigation.navigate('PublicProfile', { userId })
      }
      onLike={() => interactions.like.mutate(undefined, { onSuccess: () => setLiked(true) })}
      onUnlike={() => interactions.unlike.mutate(undefined, { onSuccess: () => setLiked(false) })}
      onDelete={() => deletePublication.mutate(publication.id)}
      onFork={publication.workoutSessionId ? onFork : undefined}
      liked={liked}
      canDelete={publication.authorUserId === currentUserId}
      likeLoading={reactionPending}
      deleteLoading={deletePublication.isPending}
    />
  );
}

export default function FeedScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<SocialStackParamList>>();
  const [filter, setFilter] = React.useState<FeedFilter>('all');
  const currentUserId = useSessionStore((state) => state.userId) ?? DEV_USER_ID;
  const feed = useFeed(filter);
  const createPublication = useCreatePublication();
  const uploadMedia = useUploadMedia();
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [forkPublication, setForkPublication] = React.useState<Publication | null>(null);
  const [title, setTitle] = React.useState('');
  const [content, setContent] = React.useState('');
  const [uploadedMedia, setUploadedMedia] = React.useState<{ id: string; url: string }[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const search = useProfileSearch(searchQuery);
  const publications = feed.data?.pages.flatMap((page) => page.items) ?? [];

  const pickImages = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 10 - uploadedMedia.length,
      quality: 0.8,
    });

    if (result.canceled) return;

    for (const asset of result.assets) {
      try {
        const uploaded = await uploadMedia.mutateAsync({
          uri: asset.uri,
          name: asset.fileName ?? `photo_${Date.now()}.jpg`,
          type: asset.mimeType ?? 'image/jpeg',
        });
        setUploadedMedia((prev) => [...prev, { id: uploaded.id, url: uploaded.url }]);
      } catch {
        // Silently skip failed uploads
      }
    }
  };

  const removeMedia = (index: number) => {
    setUploadedMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const submitPublication = () => {
    const normalizedTitle = title.trim();
    const normalizedContent = content.trim();

    if (normalizedTitle.length === 0 || normalizedContent.length === 0) return;

    createPublication.mutate(
      {
        title: normalizedTitle,
        content: normalizedContent,
        mediaIds: uploadedMedia.map((m) => m.id),
      },
      {
        onSuccess: () => {
          setTitle('');
          setContent('');
          setUploadedMedia([]);
          setShowCreateModal(false);
        },
      },
    );
  };

  if (feed.isLoading) return <SocialLoadingState />;

  if (feed.isError) {
    return (
      <SafeAreaView style={styles.container}>
        <SocialErrorState
          title="No pudimos cargar el feed"
          message="Revisa tu conexión e intenta de nuevo."
          actionLabel="Reintentar"
          onAction={() => void feed.refetch()}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <View style={styles.headerCopy}>
            <Text style={styles.kicker}>Comunidad</Text>
            <Text style={styles.title}>Feed social</Text>
          </View>
          <Pressable
            style={styles.headerAction}
            onPress={() => navigation.navigate('OwnProfile')}
            accessibilityRole="button"
            accessibilityLabel="Mi perfil"
          >
            <UserCircle color={theme.colors.textPrimary} size={24} />
          </Pressable>
          <Pressable
            style={styles.headerAction}
            onPress={() => setShowCreateModal(true)}
            accessibilityRole="button"
            accessibilityLabel="Crear publicación"
          >
            <Plus color={theme.colors.background} size={22} />
          </Pressable>
        </View>
        <Text style={styles.subtitle}>Comparte avances, comenta y descubre perfiles de Endure.</Text>
        <View style={styles.searchBox}>
          <Search color={theme.colors.textMuted} size={18} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Buscar perfiles"
            placeholderTextColor={theme.colors.textMuted}
            style={styles.searchInput}
            autoCapitalize="none"
          />
        </View>
        {searchQuery.trim().length >= 2 ? (
          <View style={styles.searchResults}>
            {search.isLoading ? <Text style={styles.searchMeta}>Buscando...</Text> : null}
            {search.data?.map((profile) => (
              <Pressable
                key={profile.userId}
                style={styles.searchResultRow}
                onPress={() => {
                  setSearchQuery('');
                  navigation.navigate('PublicProfile', { userId: profile.userId });
                }}
              >
                <Text style={styles.searchName}>{profile.displayName}</Text>
                <Text style={styles.searchHandle}>@{profile.handle}</Text>
              </Pressable>
            ))}
            {search.data?.length === 0 ? <Text style={styles.searchMeta}>Sin resultados.</Text> : null}
          </View>
        ) : null}
      </View>

      <View style={styles.tabsRow}>
        <Pressable
          style={[styles.tab, filter === 'all' && styles.tabActive]}
          onPress={() => setFilter('all')}
          accessibilityRole="tab"
          accessibilityState={{ selected: filter === 'all' }}
        >
          <Text style={[styles.tabText, filter === 'all' && styles.tabTextActive]}>
            Todos
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, filter === 'following' && styles.tabActive]}
          onPress={() => setFilter('following')}
          accessibilityRole="tab"
          accessibilityState={{ selected: filter === 'following' }}
        >
          <Text style={[styles.tabText, filter === 'following' && styles.tabTextActive]}>
            Siguiendo
          </Text>
        </Pressable>
      </View>

      <FlatList
        data={publications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <FeedPost publication={item} currentUserId={currentUserId} onFork={setForkPublication} />}
        contentContainerStyle={publications.length === 0 ? styles.emptyList : styles.list}
        refreshControl={
          <RefreshControl
            refreshing={feed.isRefetching}
            onRefresh={() => void feed.refetch()}
            tintColor={theme.colors.primary}
          />
        }
        onEndReached={() => {
          if (feed.hasNextPage && !feed.isFetchingNextPage) void feed.fetchNextPage();
        }}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={
          filter === 'following' ? (
            <SocialEmptyState
              title="Aún no sigues a nadie"
              message="Explora perfiles para descubrir contenido."
            />
          ) : (
            <SocialEmptyState
              title="Todavía no hay publicaciones"
              message="Cuando la comunidad comparta avances, aparecerán aquí."
            />
          )
        }
      />

      <Pressable style={styles.fab} onPress={() => setShowCreateModal(true)}>
        <Plus color={theme.colors.background} size={26} />
      </Pressable>

      <ForkWorkoutModal
        visible={forkPublication !== null}
        onClose={() => setForkPublication(null)}
        publication={forkPublication}
        currentUserId={currentUserId}
      />

      <Modal visible={showCreateModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <DragIndicator position="above" />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Crear publicación</Text>
              <Pressable onPress={() => setShowCreateModal(false)}>
                <X color={theme.colors.textSecondary} size={22} />
              </Pressable>
            </View>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Título"
              placeholderTextColor={theme.colors.textMuted}
              style={styles.modalInput}
              editable={!createPublication.isPending}
            />
            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder="¿Qué quieres compartir?"
              placeholderTextColor={theme.colors.textMuted}
              style={[styles.modalInput, styles.modalTextArea]}
              editable={!createPublication.isPending}
              multiline
            />
            {uploadedMedia.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mediaStrip}>
                {uploadedMedia.map((m, i) => (
                  <View key={m.id} style={styles.mediaThumbWrap}>
                    <Image source={{ uri: m.url }} style={styles.mediaThumb} resizeMode="cover" />
                    <Pressable style={styles.mediaRemove} onPress={() => removeMedia(i)}>
                      <Trash2 size={14} color={theme.colors.background} />
                    </Pressable>
                  </View>
                ))}
              </ScrollView>
            ) : null}
            {uploadedMedia.length < 10 ? (
              <Pressable
                style={styles.addMediaBtn}
                onPress={pickImages}
                disabled={uploadMedia.isPending}
              >
                <GalleryHorizontal size={20} color={theme.colors.primary} />
                <Text style={styles.addMediaText}>
                  {uploadMedia.isPending ? 'Subiendo...' : 'Agregar fotos'}
                </Text>
              </Pressable>
            ) : null}
            <PrimaryButton
              label="Publicar"
              onPress={submitPublication}
              loading={createPublication.isPending}
              disabled={createPublication.isPending || title.trim().length === 0 || content.trim().length === 0}
            />
            <SecondaryButton
              label="Cancelar"
              onPress={() => setShowCreateModal(false)}
              disabled={createPublication.isPending}
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
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  headerCopy: {
    flex: 1,
  },
  headerAction: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kicker: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    color: theme.colors.primary,
    fontSize: theme.typography.heading1.fontSize,
    lineHeight: theme.typography.heading1.lineHeight,
    fontWeight: theme.typography.heading1.fontWeight,
    marginTop: theme.spacing.xs,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    marginTop: theme.spacing.sm,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surfaceElevated,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  searchInput: {
    flex: 1,
    minHeight: 44,
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body.fontSize,
  },
  searchResults: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius.lg,
    marginTop: theme.spacing.sm,
    overflow: 'hidden',
  },
  searchResultRow: {
    padding: theme.spacing.md,
    borderBottomColor: theme.colors.borderSoft,
    borderBottomWidth: 1,
  },
  searchName: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    fontWeight: theme.typography.bodyStrong.fontWeight,
  },
  searchHandle: {
    color: theme.colors.primary,
    fontSize: theme.typography.small.fontSize,
  },
  searchMeta: {
    color: theme.colors.textMuted,
    padding: theme.spacing.md,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  tab: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tabActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  tabText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
  },
  tabTextActive: {
    color: theme.colors.background,
  },
  list: {
    paddingBottom: theme.spacing.xxl,
  },
  emptyList: {
    flexGrow: 1,
  },
  fab: {
    position: 'absolute',
    right: theme.spacing.lg,
    bottom: theme.spacing.xxl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading3.fontSize,
    fontWeight: theme.typography.heading3.fontWeight,
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
  addMediaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    minHeight: 48,
    borderRadius: theme.radius.md,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
    backgroundColor: `${theme.colors.primary}08`,
  },
  addMediaText: {
    color: theme.colors.primary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: '700',
  },
  mediaStrip: {
    gap: theme.spacing.sm,
  },
  mediaThumbWrap: {
    position: 'relative',
  },
  mediaThumb: {
    width: 80,
    height: 80,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceElevated,
  },
  mediaRemove: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

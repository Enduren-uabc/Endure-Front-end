import React from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Plus, Search, X } from 'lucide-react-native';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { theme } from '@/theme';
import { useSessionStore } from '@/features/auth/stores/session-store';
import type { SocialStackParamList } from '@/navigation/types';
import { PostCard } from '../components/PostCard';
import { SocialEmptyState, SocialErrorState, SocialLoadingState } from '../components/SocialState';
import {
  useCreatePublication,
  useDeletePublication,
  useFeed,
  useInteractions,
  useProfileSearch,
} from '../hooks/use-social';
import type { FeedFilter, Publication } from '../types/social.types';

const DEV_USER_ID = '00000000-0000-0000-0000-000000000001';

function FeedPost({ publication, currentUserId }: { publication: Publication; currentUserId: string }) {
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
        })
      }
      onOpenProfile={(userId) =>
        navigation.navigate('PublicProfile', { userId })
      }
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

export default function FeedScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<SocialStackParamList>>();
  const [filter] = React.useState<FeedFilter>('all');
  const currentUserId = useSessionStore((state) => state.userId) ?? DEV_USER_ID;
  const feed = useFeed(filter);
  const createPublication = useCreatePublication();
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [title, setTitle] = React.useState('');
  const [content, setContent] = React.useState('');
  const [mediaUrl, setMediaUrl] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');
  const search = useProfileSearch(searchQuery);
  const publications = feed.data?.pages.flatMap((page) => page.items) ?? [];

  const submitPublication = () => {
    const normalizedTitle = title.trim();
    const normalizedContent = content.trim();
    const normalizedMediaUrl = mediaUrl.trim();

    if (normalizedTitle.length === 0 || normalizedContent.length === 0) return;

    createPublication.mutate(
      {
        title: normalizedTitle,
        content: normalizedContent,
        mediaUrls: normalizedMediaUrl.length > 0 ? [normalizedMediaUrl] : [],
      },
      {
        onSuccess: () => {
          setTitle('');
          setContent('');
          setMediaUrl('');
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

      <FlatList
        data={publications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <FeedPost publication={item} currentUserId={currentUserId} />}
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
          <SocialEmptyState
            title="Todavía no hay publicaciones"
            message="Cuando la comunidad comparta avances, aparecerán aquí."
          />
        }
      />

      <Pressable style={styles.fab} onPress={() => setShowCreateModal(true)}>
        <Plus color={theme.colors.background} size={26} />
      </Pressable>

      <Modal visible={showCreateModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
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
            <TextInput
              value={mediaUrl}
              onChangeText={setMediaUrl}
              placeholder="URL de imagen opcional"
              placeholderTextColor={theme.colors.textMuted}
              style={styles.modalInput}
              editable={!createPublication.isPending}
              autoCapitalize="none"
            />
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
});

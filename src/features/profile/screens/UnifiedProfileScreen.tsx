import React from 'react';
import {
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
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import {
  AlertCircle,
  Award,
  Camera,
  ChevronRight,
  Clock,
  Dumbbell,
  Edit3,
  HelpCircle,
  History,
  LogOut,
  Medal,
  Ruler,
  Settings,
  Settings2,
  Trophy,
  UserRound,
  X,
} from 'lucide-react-native';
import { BaseCard } from '@/components/ui/BaseCard';
import { DragIndicator } from '@/components/ui/DragIndicator';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import {
  TrainingV2Screen,
  TrainingV2SectionHeader,
  TrainingV2Tag,
} from '@/features/training/screens/v2/TrainingV2Primitives';
import {
  TrainingV2ErrorState,
  TrainingV2SkeletonList,
} from '@/features/training/screens/v2/TrainingV2States';
import { PostCard } from '@/features/social/components/PostCard';
import {
  useDeletePublication,
  useInteractions,
} from '@/features/social/hooks/use-social';
import { useSessionStore } from '@/features/auth/stores/session-store';
import { theme } from '@/theme';
import type { UserDrawerParamList, UserTabsParamList } from '@/features/user/types/user-navigation.types';
import type { SocialStackParamList } from '@/navigation/types';
import { useWorkoutSessionDetail } from '@/features/training/hooks/use-workout-session';
import { useUnifiedProfile } from '../hooks/use-unified-profile';
import type { Publication } from '@/features/social/types/social.types';
import type { WorkoutSessionSummary } from '@/features/training/types/workout-session';
import { socialService } from '@/features/social/services/social.service';

type ProfileNavigation = NavigationProp<UserTabsParamList>;
type ProfileDrawerNavigation = NavigationProp<UserDrawerParamList>;

type TabKey = 'publications' | 'training';

type SheetAction = 'routines' | 'history' | 'achievements' | 'measurements';

const DEV_USER_ID = '00000000-0000-0000-0000-000000000001';

function ProfilePost({ publication, navigation }: { publication: Publication; navigation: ProfileNavigation }) {
  const interactions = useInteractions(publication.id);
  const deletePublication = useDeletePublication();
  const currentUserId = useSessionStore((state) => state.userId) ?? DEV_USER_ID;
  const [liked, setLiked] = React.useState(publication.likedByMe);
  const reactionPending = interactions.like.isPending || interactions.unlike.isPending;

  return (
    <PostCard
      publication={publication}
      onOpenPost={(pub) =>
        navigation.navigate('Social', {
          screen: 'PostDetail',
          params: {
            postId: pub.id,
            title: pub.title,
            content: pub.content,
            authorUserId: pub.authorUserId,
            workoutSessionId: pub.workoutSessionId ?? undefined,
            exerciseSummary: pub.exerciseSummary ?? undefined,
          },
        })
      }
      onOpenProfile={() => {}}
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

export default function UnifiedProfileScreen() {
  const navigation = useNavigation<ProfileNavigation>();
  const drawerNavigation = navigation.getParent<ProfileDrawerNavigation>();
  const profile = useUnifiedProfile();

  const [activeTab, setActiveTab] = React.useState<TabKey>('publications');
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [showFollowers, setShowFollowers] = React.useState(false);
  const [showFollowing, setShowFollowing] = React.useState(false);
  const [selectedSession, setSelectedSession] = React.useState<WorkoutSessionSummary | null>(null);
  const [draftName, setDraftName] = React.useState('');
  const [draftBio, setDraftBio] = React.useState('');
  const [draftHandle, setDraftHandle] = React.useState('');

  const openEdit = () => {
    setDraftName(profile.displayName);
    setDraftBio(profile.bio);
    setDraftHandle(profile.handle.replace('@', ''));
    profile.clearProfileSaveError();
    setEditOpen(true);
  };

  const saveEdit = async () => {
    const saved = await profile.saveProfile({
      displayName: draftName,
      bio: draftBio,
      handle: draftHandle,
    });
    if (saved) setEditOpen(false);
  };

  const handleAction = (key: SheetAction) => {
    setSheetOpen(false);
    if (key === 'routines') {
      navigation.navigate('Routines', { screen: 'RoutinesList' });
      return;
    }
    if (key === 'history') {
      drawerNavigation?.navigate('WorkoutStack', {
        screen: 'WorkoutHistory',
        params: { returnTo: 'Profile' },
      });
      return;
    }
    if (key === 'achievements') {
      drawerNavigation?.navigate('WorkoutStack', {
        screen: 'Achievements',
        params: { returnTo: 'Profile' },
      });
      return;
    }
    if (key === 'measurements') {
      drawerNavigation?.navigate('WorkoutStack', {
        screen: 'Measurements',
        params: { returnTo: 'Profile' },
      });
      return;
    }
  };

  const openTrainerApplication = () => {
    drawerNavigation?.navigate('CoachStack', {
      screen: profile.trainerCard.status === 'rejected' ? 'CoachRejected' : 'CoachHome',
    });
  };

  if (profile.isLoading) {
    return (
      <TrainingV2Screen title="Perfil" subtitle="Preparando tu información personal.">
        <TrainingV2SkeletonList rows={2} />
      </TrainingV2Screen>
    );
  }

  if (profile.isError) {
    return (
      <TrainingV2Screen title="Perfil">
        <TrainingV2ErrorState
          title="No pudimos cargar tu perfil"
          description="Intenta de nuevo para revisar tu información y accesos."
          onAction={profile.refetch}
        />
      </TrainingV2Screen>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={activeTab === 'publications' ? profile.allPublications : []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProfilePost publication={item} navigation={navigation} />
        )}
        ListHeaderComponent={
          <View>
            <View style={styles.heroSection}>
              <Pressable onPress={profile.showAvatarPicker} style={styles.avatarWrap}>
                {profile.avatarUrl ? (
                  <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarFallback}>
                    <Text style={styles.avatarText}>{profile.avatarInitials}</Text>
                  </View>
                )}
                <View style={styles.avatarOverlay}>
                  <Camera size={18} color={theme.colors.background} />
                </View>
              </Pressable>
              <TouchableOpacity
                activeOpacity={0.78}
                onPress={() => setSheetOpen(true)}
                style={styles.gearButton}
                accessibilityRole="button"
                accessibilityLabel="Menú de acciones"
              >
                <Settings2 size={22} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.name}>{profile.displayName}</Text>
            <Text style={styles.handle}>{profile.handle}</Text>
            <Text style={styles.bio}>{profile.bio}</Text>

            <View style={styles.statsRow}>
              <Pressable onPress={() => setShowFollowers(true)} style={styles.statItem}>
                <Text style={styles.statCount}>{profile.followersCount}</Text>
                <Text style={styles.statLabel}>seguidores</Text>
              </Pressable>
              <View style={styles.statDot} />
              <Pressable onPress={() => setShowFollowing(true)} style={styles.statItem}>
                <Text style={styles.statCount}>{profile.followingCount}</Text>
                <Text style={styles.statLabel}>siguiendo</Text>
              </Pressable>
            </View>

            <View style={styles.editButtonWrap}>
              <SecondaryButton label="Editar perfil" onPress={openEdit} />
            </View>

            {profile.trainerCard.status !== 'approved' ? (
              <TouchableOpacity
                activeOpacity={0.78}
                onPress={openTrainerApplication}
                style={styles.trainerPrompt}
              >
                <Award size={18} color={theme.colors.primary} />
                <Text style={styles.trainerPromptText}>
                  {profile.trainerCard.actionLabel ?? 'Solicita ser entrenador'}
                </Text>
                <ChevronRight size={16} color={theme.colors.textMuted} />
              </TouchableOpacity>
            ) : null}

            {activeTab === 'training' ? (
              <View style={styles.metricsRow}>
                {profile.metrics.map((metric) => (
                  <View key={metric.id} style={styles.metricItem}>
                    <Text style={styles.metricValue}>{metric.value}</Text>
                    <Text style={styles.metricLabel}>{metric.label}</Text>
                    <Text style={styles.metricHelper}>{metric.helper}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            <View style={styles.tabRow}>
              <TouchableOpacity
                activeOpacity={0.78}
                onPress={() => setActiveTab('publications')}
                style={[styles.tab, activeTab === 'publications' && styles.tabActive]}
              >
                <Text style={[styles.tabText, activeTab === 'publications' && styles.tabTextActive]}>
                  Publicaciones
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.78}
                onPress={() => setActiveTab('training')}
                style={[styles.tab, activeTab === 'training' && styles.tabActive]}
              >
                <Text style={[styles.tabText, activeTab === 'training' && styles.tabTextActive]}>
                  Entrenamiento
                </Text>
              </TouchableOpacity>
            </View>

            {activeTab === 'training' ? (
              <View style={styles.trainingContent}>
                {profile.trainerCard.status === 'approved' ? (
                  <BaseCard style={styles.trainerCardApproved}>
                    <View style={styles.trainerHeader}>
                      <View style={[styles.trainerIcon, { borderColor: theme.colors.success }]}>
                        <Award size={22} color={theme.colors.success} />
                      </View>
                      <View style={styles.trainerCopy}>
                        <Text style={styles.trainerTitle}>Entrenador verificado</Text>
                        <Text style={styles.trainerText}>Ya puedes gestionar clientes.</Text>
                      </View>
                    </View>
                  </BaseCard>
                ) : profile.trainerCard.status === 'in_review' ? (
                  <BaseCard>
                    <View style={styles.trainerHeader}>
                      <View style={[styles.trainerIcon, { borderColor: theme.colors.primary }]}>
                        <Award size={22} color={theme.colors.primary} />
                      </View>
                      <View style={styles.trainerCopy}>
                        <Text style={styles.trainerTitle}>Solicitud en revisión</Text>
                        <Text style={styles.trainerText}>Estamos revisando tu solicitud.</Text>
                      </View>
                    </View>
                    <TrainingV2Tag label="En revisión" />
                  </BaseCard>
                ) : null}

                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Últimos entrenos</Text>
                </View>
                {profile.recentSessions.length === 0 ? (
                  <BaseCard style={styles.emptyCard}>
                    <Dumbbell size={24} color={theme.colors.border} />
                    <Text style={styles.emptyText}>Aún no tienes entrenos registrados.</Text>
                  </BaseCard>
                ) : (
                  profile.recentSessions.map((session) => (
                    <Pressable
                      key={session.id}
                      style={styles.sessionRow}
                      onPress={() => setSelectedSession(session)}
                    >
                      <View style={styles.sessionLeft}>
                        <Text style={styles.sessionName}>{session.routineName}</Text>
                        <View style={styles.sessionMeta}>
                          <Clock size={12} color={theme.colors.textMuted} />
                          <Text style={styles.sessionMetaText}>
                            {session.durationMinutes ? `${session.durationMinutes} min` : '--'}
                          </Text>
                          <Text style={styles.sessionMetaSep}>·</Text>
                          <Text style={styles.sessionMetaText}>
                            {session.startedAt
                              ? new Date(session.startedAt).toLocaleDateString('es-MX', {
                                  weekday: 'short',
                                  day: 'numeric',
                                  month: 'short',
                                })
                              : ''}
                          </Text>
                        </View>
                      </View>
                      <ChevronRight size={16} color={theme.colors.textMuted} />
                    </Pressable>
                  ))
                )}
                <TouchableOpacity
                  activeOpacity={0.78}
                  onPress={() =>
                    drawerNavigation?.navigate('WorkoutStack', {
                      screen: 'WorkoutHistory',
                      params: { returnTo: 'Profile' },
                    })
                  }
                  style={styles.viewAllLink}
                >
                  <Text style={styles.viewAllText}>Ver historial completo →</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        }
        contentContainerStyle={
          activeTab === 'publications' && profile.allPublications.length === 0
            ? styles.emptyList
            : styles.list
        }
        refreshControl={
          <RefreshControl
            refreshing={profile.isRefreshing}
            onRefresh={profile.refetch}
            tintColor={theme.colors.primary}
          />
        }
        onEndReached={activeTab === 'publications' ? profile.fetchNextPublications : undefined}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          activeTab === 'publications' && profile.isFetchingMorePublications ? (
            <View style={styles.footerLoading}>
              <Text style={styles.footerLoadingText}>Cargando más publicaciones...</Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          activeTab === 'publications' ? (
            <BaseCard style={styles.emptyCard}>
              <UserRound size={24} color={theme.colors.border} />
              <Text style={styles.emptyText}>Aún no has publicado nada.</Text>
            </BaseCard>
          ) : null
        }
      />

      <ActionSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onAction={handleAction}
      />

      <FollowersSheet
        visible={showFollowers}
        title="Seguidores"
        userId={profile.userId!}
        onClose={() => setShowFollowers(false)}
      />

      <FollowersSheet
        visible={showFollowing}
        title="Siguiendo"
        userId={profile.userId!}
        onClose={() => setShowFollowing(false)}
      />

      <EditProfileSheet
        visible={editOpen}
        name={draftName}
        bio={draftBio}
        handle={draftHandle}
        isSaving={profile.isSavingProfile}
        error={profile.profileSaveError}
        onChangeName={setDraftName}
        onChangeBio={setDraftBio}
        onChangeHandle={setDraftHandle}
        onClose={() => setEditOpen(false)}
        onSave={() => void saveEdit()}
        onPickAvatar={profile.showAvatarPicker}
      />

      <SessionDetailSheet
        session={selectedSession}
        onClose={() => setSelectedSession(null)}
      />
    </View>
  );
}

function ActionSheet({
  visible,
  onClose,
  onAction,
}: {
  visible: boolean;
  onClose: () => void;
  onAction: (key: SheetAction) => void;
}) {
  const items: { key: SheetAction; label: string; icon: React.ReactNode }[] = [
    { key: 'routines', label: 'Rutinas', icon: <Dumbbell size={20} color={theme.colors.textPrimary} /> },
    { key: 'history', label: 'Historial completo', icon: <History size={20} color={theme.colors.textPrimary} /> },
    { key: 'achievements', label: 'Logros', icon: <Medal size={20} color={theme.colors.textPrimary} /> },
    { key: 'measurements', label: 'Medidas', icon: <Ruler size={20} color={theme.colors.textPrimary} /> },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.sheetOverlay}
      >
        <Pressable style={styles.sheetBackdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <DragIndicator position="inside" />
          <Text style={styles.sheetTitle}>Accesos rápidos</Text>
          <View style={styles.sheetContent}>
            {items.map((item) => (
              <TouchableOpacity
                key={item.key}
                activeOpacity={0.78}
                onPress={() => onAction(item.key)}
                style={styles.sheetRow}
              >
                <View style={styles.sheetRowIcon}>{item.icon}</View>
                <Text style={styles.sheetRowText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <SecondaryButton label="Cancelar" onPress={onClose} />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function FollowersSheet({
  visible,
  title,
  userId,
  onClose,
}: {
  visible: boolean;
  title: string;
  userId: string;
  onClose: () => void;
}) {
  const [profiles, setProfiles] = React.useState<{ userId: string; displayName: string; handle: string }[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const navigation = useNavigation<NavigationProp<SocialStackParamList>>();

  React.useEffect(() => {
    if (!visible) return;
    setIsLoading(true);
    const fetchFn = title === 'Seguidores'
      ? socialService.getFollowers(userId)
      : socialService.getFollowing(userId);
    fetchFn
      .then(setProfiles)
      .catch(() => setProfiles([]))
      .finally(() => setIsLoading(false));
  }, [visible, userId, title]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <Pressable onPress={onClose}>
              <X size={22} color={theme.colors.textSecondary} />
            </Pressable>
          </View>
          {isLoading ? (
            <Text style={styles.modalMeta}>Cargando...</Text>
          ) : profiles.length === 0 ? (
            <Text style={styles.modalMeta}>No hay usuarios para mostrar.</Text>
          ) : (
            profiles.map((p) => (
              <Pressable
                key={p.userId}
                style={styles.profileListRow}
                onPress={() => {
                  onClose();
                  navigation.navigate('PublicProfile', { userId: p.userId });
                }}
              >
                <Text style={styles.profileListName}>{p.displayName}</Text>
                <Text style={styles.profileListHandle}>@{p.handle}</Text>
              </Pressable>
            ))
          )}
        </View>
      </View>
    </Modal>
  );
}

function EditProfileSheet({
  visible,
  name,
  bio,
  handle,
  isSaving,
  error,
  onChangeName,
  onChangeBio,
  onChangeHandle,
  onClose,
  onSave,
  onPickAvatar,
}: {
  visible: boolean;
  name: string;
  bio: string;
  handle: string;
  isSaving: boolean;
  error: string | null;
  onChangeName: (value: string) => void;
  onChangeBio: (value: string) => void;
  onChangeHandle: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
  onPickAvatar: () => void;
}) {
  const hasChanges = name.trim().length > 0 || bio.trim().length > 0;
  const closeSheet = () => {
    Keyboard.dismiss();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={closeSheet}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={12}
        style={styles.sheetOverlay}
      >
        <View style={styles.sheet}>
          <DragIndicator position="inside" />
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Editar perfil</Text>
            <View style={styles.sheetActions}>
              <Pressable
                onPress={Keyboard.dismiss}
                disabled={isSaving}
                style={styles.keyboardDoneButton}
              >
                <Text style={styles.keyboardDoneText}>Listo</Text>
              </Pressable>
              <Pressable onPress={closeSheet} disabled={isSaving} style={styles.closeButton}>
                <X size={22} color={theme.colors.textSecondary} />
              </Pressable>
            </View>
          </View>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.sheetContent}
          >
            <TouchableOpacity
              activeOpacity={0.78}
              onPress={onPickAvatar}
              style={styles.avatarEditRow}
            >
              <Camera size={20} color={theme.colors.primary} />
              <Text style={styles.avatarEditText}>Cambiar foto de perfil</Text>
            </TouchableOpacity>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nombre visible</Text>
              <TextInput
                value={name}
                onChangeText={onChangeName}
                editable={!isSaving}
                placeholder="Tu nombre"
                placeholderTextColor={theme.colors.textMuted}
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
                selectionColor={theme.colors.primary}
                style={styles.input}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nombre de usuario</Text>
              <View style={styles.handleInputWrap}>
                <Text style={styles.handlePrefix}>@</Text>
                <TextInput
                  value={handle}
                  onChangeText={onChangeHandle}
                  editable={!isSaving}
                  placeholder="usuario"
                  placeholderTextColor={theme.colors.textMuted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                  selectionColor={theme.colors.primary}
                  style={styles.handleInput}
                  maxLength={60}
                />
              </View>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Bio corta</Text>
              <TextInput
                value={bio}
                onChangeText={onChangeBio}
                editable={!isSaving}
                placeholder="Cuenta cómo entrenas"
                placeholderTextColor={theme.colors.textMuted}
                selectionColor={theme.colors.primary}
                multiline
                blurOnSubmit
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
                maxLength={160}
                style={[styles.input, styles.textArea]}
              />
              <Text style={styles.counter}>{bio.length}/160</Text>
            </View>
            {error ? <Text style={styles.formError}>{error}</Text> : null}
            <PrimaryButton
              label={isSaving ? 'Guardando' : 'Guardar cambios'}
              onPress={onSave}
              loading={isSaving}
              disabled={isSaving || !hasChanges}
            />
            <SecondaryButton label="Cancelar" onPress={closeSheet} disabled={isSaving} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function SessionDetailSheet({
  session,
  onClose,
}: {
  session: WorkoutSessionSummary | null;
  onClose: () => void;
}) {
  const { data: detail, isLoading, isError, refetch } = useWorkoutSessionDetail(session?.id);

  const closeSheet = () => {
    Keyboard.dismiss();
    onClose();
  };

  return (
    <Modal visible={!!session} animationType="slide" transparent onRequestClose={closeSheet}>
      <Pressable style={styles.sheetOverlay} onPress={closeSheet}>
        <Pressable style={styles.sessionSheet} onPress={() => {}}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Detalle de sesión</Text>
            <Pressable onPress={closeSheet} style={styles.closeButton}>
              <X size={22} color={theme.colors.textSecondary} />
            </Pressable>
          </View>

          {isLoading ? (
            <View style={styles.sessionSheetLoading}>
              <TrainingV2SkeletonList rows={2} />
            </View>
          ) : isError ? (
            <BaseCard style={styles.sessionSheetError}>
              <Text style={styles.sessionSheetErrorTitle}>No pudimos cargar el detalle</Text>
              <Text style={styles.sessionSheetErrorText}>Revisa tu conexión e intenta de nuevo.</Text>
              <SecondaryButton label="Reintentar" onPress={() => void refetch()} />
              <PrimaryButton label="Cerrar" onPress={closeSheet} />
            </BaseCard>
          ) : detail ? (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.sessionSheetContent}
            >
              <View style={styles.sessionSheetHero}>
                <Text style={styles.sessionSheetRoutineName}>{detail.routineName}</Text>
                <View style={styles.sessionSheetMetaRow}>
                  <View style={styles.sessionSheetMetaItem}>
                    <Clock size={14} color={theme.colors.primary} />
                    <Text style={styles.sessionSheetMetaText}>
                      {detail.durationMinutes ? `${detail.durationMinutes} min` : '--'}
                    </Text>
                  </View>
                  <View style={styles.sessionSheetMetaDot} />
                  <Text style={styles.sessionSheetMetaText}>
                    {detail.startedAt
                      ? new Date(detail.startedAt).toLocaleDateString('es-MX', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })
                      : ''}
                  </Text>
                </View>
                <TrainingV2Tag
                  label={detail.status === 'finished' ? 'Completado' : 'En progreso'}
                />
              </View>

              <Text style={styles.sessionSheetSectionTitle}>
                Ejercicios ({detail.exercises.length})
              </Text>

              {detail.exercises.map((exercise) => {
                const completedSets = exercise.workoutSets.filter((s) => s.completed).length;
                const totalVolume = exercise.workoutSets.reduce(
                  (sum, s) => sum + (s.weightUsed ?? 0) * (s.repsPerformed ?? 0),
                  0,
                );

                return (
                  <View key={exercise.exerciseId} style={styles.exerciseBlock}>
                    <View style={styles.exerciseHeader}>
                      <Text style={styles.exerciseName}>{exercise.exerciseName}</Text>
                      <Text style={styles.exerciseSetsBadge}>
                        {completedSets}/{exercise.workoutSets.length} series
                      </Text>
                    </View>
                    {exercise.workoutSets.map((set) => (
                      <View
                        key={set.setNumber}
                        style={[
                          styles.setRow,
                          set.completed && styles.setRowCompleted,
                        ]}
                      >
                        <View style={styles.setLeft}>
                          <Text style={styles.setNumber}>{set.setNumber}</Text>
                        </View>
                        <View style={styles.setDetail}>
                          <Text style={styles.setReps}>
                            {set.repsPerformed ?? set.targetReps ?? '--'} reps
                          </Text>
                          <Text style={styles.setSep}>×</Text>
                          <Text style={styles.setWeight}>
                            {set.weightUsed ?? set.targetWeight ?? '--'} kg
                          </Text>
                        </View>
                        <View style={styles.setRight}>
                          {set.completed ? (
                            <Text style={styles.setDone}>✓</Text>
                          ) : (
                            <Text style={styles.setPending}>○</Text>
                          )}
                        </View>
                      </View>
                    ))}
                    {totalVolume > 0 ? (
                      <Text style={styles.exerciseVolume}>
                        Volumen: {totalVolume.toLocaleString()} kg
                      </Text>
                    ) : null}
                  </View>
                );
              })}

              {detail.exercises.length > 0 ? (
                <View style={styles.totalVolumeRow}>
                  <Text style={styles.totalVolumeLabel}>Volumen total</Text>
                  <Text style={styles.totalVolumeValue}>
                    {detail.exercises
                      .reduce(
                        (sum, ex) =>
                          sum +
                          ex.workoutSets.reduce(
                            (s, set) => s + (set.weightUsed ?? 0) * (set.repsPerformed ?? 0),
                            0,
                          ),
                        0,
                      )
                      .toLocaleString()}{' '}
                    kg
                  </Text>
                </View>
              ) : null}
            </ScrollView>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  heroSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingTop: 24,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
  },
  avatarWrap: {
    position: 'relative',
    width: 104,
    height: 104,
    borderRadius: 52,
  },
  avatar: {
    width: 104,
    height: 104,
    borderRadius: 52,
  },
  avatarFallback: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: theme.colors.primaryMuted,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: theme.colors.primary,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800',
  },
  avatarOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.background,
  },
  gearButton: {
    position: 'absolute',
    right: theme.spacing.lg,
    top: 24,
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading2.fontSize,
    lineHeight: theme.typography.heading2.lineHeight,
    fontWeight: theme.typography.heading2.fontWeight,
    textAlign: 'center',
    marginTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  handle: {
    color: theme.colors.primary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: theme.spacing.xs,
    paddingHorizontal: theme.spacing.lg,
  },
  bio: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  statItem: {
    alignItems: 'center',
    minWidth: 80,
  },
  statCount: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading3.fontSize,
    lineHeight: theme.typography.heading3.lineHeight,
    fontWeight: '800',
  },
  statLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  statDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.textMuted,
  },
  editButtonWrap: {
    paddingHorizontal: theme.spacing.xl,
    marginTop: theme.spacing.lg,
  },
  trainerPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    alignSelf: 'center',
  },
  trainerPromptText: {
    color: theme.colors.primary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    fontWeight: '600',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
  },
  metricItem: {
    flex: 1,
    minHeight: 88,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    gap: 2,
    alignItems: 'center',
  },
  metricValue: {
    color: theme.colors.textPrimary,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
  },
  metricLabel: {
    color: theme.colors.primary,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    fontWeight: '700',
  },
  metricHelper: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
  },
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.xl,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: 3,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: theme.radius.sm,
  },
  tabActive: {
    backgroundColor: theme.colors.primaryMuted,
  },
  tabText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: '600',
  },
  tabTextActive: {
    color: theme.colors.primary,
  },
  trainingContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  trainerCardApproved: {
    marginTop: theme.spacing.lg,
    borderColor: theme.colors.success,
  },
  trainerHeader: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    alignItems: 'center',
  },
  trainerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trainerCopy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  trainerTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: theme.typography.bodyStrong.fontWeight,
  },
  trainerText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  sectionHeader: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading3.fontSize,
    lineHeight: theme.typography.heading3.lineHeight,
    fontWeight: '700',
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  sessionLeft: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  sessionName: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: '600',
  },
  sessionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sessionMetaText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
  },
  sessionMetaSep: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
  },
  viewAllLink: {
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  viewAllText: {
    color: theme.colors.primary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: '600',
  },
  list: {
    paddingBottom: 24,
  },
  emptyList: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  footerLoading: {
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
  },
  footerLoadingText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small.fontSize,
  },
  emptyCard: {
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.xl,
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.xl,
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    textAlign: 'center',
  },
  sheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
  },
  sheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 36 : theme.spacing.lg,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sheetTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading3.fontSize,
    lineHeight: theme.typography.heading3.lineHeight,
    fontWeight: theme.typography.heading3.fontWeight,
  },
  sheetActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  sheetContent: {
    gap: theme.spacing.sm,
  },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radius.md,
  },
  sheetRowIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetRowText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: theme.colors.overlay,
  },
  modalCard: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    maxHeight: '70%',
    gap: theme.spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 36 : theme.spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading3.fontSize,
    lineHeight: theme.typography.heading3.lineHeight,
    fontWeight: theme.typography.heading3.fontWeight,
  },
  modalMeta: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    textAlign: 'center',
    paddingVertical: theme.spacing.xl,
  },
  profileListRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  profileListName: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: '600',
  },
  profileListHandle: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  keyboardDoneButton: {
    minHeight: 44,
    paddingHorizontal: theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyboardDoneText: {
    color: theme.colors.primary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    fontWeight: '700',
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputGroup: {
    gap: theme.spacing.xs,
  },
  inputLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    fontWeight: theme.typography.small.fontWeight,
  },
  input: {
    minHeight: 52,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceElevated,
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  textArea: {
    minHeight: 106,
    textAlignVertical: 'top',
  },
  counter: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    textAlign: 'right',
  },
  formError: {
    color: theme.colors.error,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  avatarEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    marginBottom: theme.spacing.sm,
  },
  avatarEditText: {
    color: theme.colors.primary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    fontWeight: '600',
  },
  sessionSheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    maxHeight: '88%',
    paddingBottom: Platform.OS === 'ios' ? 36 : theme.spacing.lg,
  },
  sessionSheetLoading: {
    minHeight: 200,
  },
  sessionSheetError: {
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.xl,
  },
  sessionSheetErrorTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading3.fontSize,
    lineHeight: theme.typography.heading3.lineHeight,
    fontWeight: '700',
    textAlign: 'center',
  },
  sessionSheetErrorText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    textAlign: 'center',
  },
  sessionSheetContent: {
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
  sessionSheetHero: {
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  sessionSheetRoutineName: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading2.fontSize,
    lineHeight: theme.typography.heading2.lineHeight,
    fontWeight: '800',
  },
  sessionSheetMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  sessionSheetMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sessionSheetMetaText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  sessionSheetMetaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.textMuted,
  },
  sessionSheetSectionTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading3.fontSize,
    lineHeight: theme.typography.heading3.lineHeight,
    fontWeight: '700',
    marginTop: theme.spacing.sm,
  },
  exerciseBlock: {
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseName: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: '600',
    flex: 1,
  },
  exerciseSetsBadge: {
    color: theme.colors.primary,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    fontWeight: '700',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radius.sm,
  },
  setRowCompleted: {
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
  },
  setLeft: {
    width: 28,
    alignItems: 'center',
  },
  setNumber: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    fontWeight: '700',
  },
  setDetail: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  setReps: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    fontWeight: '500',
  },
  setSep: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body.fontSize,
  },
  setWeight: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    fontWeight: '500',
  },
  setRight: {
    width: 24,
    alignItems: 'center',
  },
  setDone: {
    color: theme.colors.success,
    fontSize: 16,
    fontWeight: '800',
  },
  setPending: {
    color: theme.colors.textMuted,
    fontSize: 14,
  },
  exerciseVolume: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    marginTop: theme.spacing.xs,
  },
  totalVolumeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryMuted,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
  },
  totalVolumeLabel: {
    color: theme.colors.primary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: '600',
  },
  totalVolumeValue: {
    color: theme.colors.primary,
    fontSize: theme.typography.heading3.fontSize,
    lineHeight: theme.typography.heading3.lineHeight,
    fontWeight: '800',
  },
  handleInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceElevated,
    paddingHorizontal: theme.spacing.md,
  },
  handlePrefix: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    marginRight: 4,
  },
  handleInput: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    paddingVertical: theme.spacing.sm,
  },
});

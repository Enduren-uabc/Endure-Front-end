import React from 'react';
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import {
  AlertCircle,
  Award,
  ChevronRight,
  Dumbbell,
  Edit3,
  HelpCircle,
  History,
  LogOut,
  Medal,
  Ruler,
  Settings,
  ShieldCheck,
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
import { theme } from '@/theme';
import type { UserDrawerParamList, UserTabsParamList } from '@/features/user/types/user-navigation.types';
import { clientProfileActions } from '../mocks/profile.mock';
import { useClientProfileDashboard } from '../hooks/use-profile-dashboard';
import type { ProfileAction, ProfileActionKey } from '../types/profile';

type ClientProfileNavigation = NavigationProp<UserTabsParamList>;

const actionIcons: Record<ProfileActionKey, React.ComponentType<{ size: number; color: string }>> = {
  routines: Dumbbell,
  history: History,
  achievements: Medal,
  measurements: Ruler,
  settings: Settings,
  help: HelpCircle,
  logout: LogOut,
};

export default function ClientProfileScreen() {
  const navigation = useNavigation<ClientProfileNavigation>();
  const drawerNavigation = navigation.getParent<NavigationProp<UserDrawerParamList>>();
  const dashboard = useClientProfileDashboard();
  const [editOpen, setEditOpen] = React.useState(false);
  const [draftName, setDraftName] = React.useState('');
  const [draftBio, setDraftBio] = React.useState('');
  const [logoutError, setLogoutError] = React.useState<string | null>(null);

  const openEdit = () => {
    setDraftName(dashboard.profile.displayName);
    setDraftBio(dashboard.profile.bio);
    dashboard.clearProfileSaveError();
    setEditOpen(true);
  };

  const saveEdit = async () => {
    const saved = await dashboard.saveProfile({
      displayName: draftName,
      bio: draftBio,
    });
    if (saved) setEditOpen(false);
  };

  const openTrainerApplication = () => {
    drawerNavigation?.navigate('CoachStack', {
      screen: dashboard.trainerCard.status === 'rejected' ? 'CoachRejected' : 'CoachHome',
    });
  };

  const handleAction = (key: ProfileActionKey) => {
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

    if (key === 'settings') {
      drawerNavigation?.navigate('Settings', {
        screen: 'SettingsHome',
        params: { returnTo: 'Profile' },
      });
      return;
    }

    if (key === 'help') {
      drawerNavigation?.navigate('Help');
      return;
    }

    if (key === 'logout') {
      setLogoutError(null);
      dashboard.logout.mutate(undefined, {
        onError: () => {
          setLogoutError('No pudimos cerrar sesion. Revisa tu conexion e intenta de nuevo.');
        },
      });
    }
  };

  if (dashboard.isLoading) {
    return (
      <TrainingV2Screen title="Perfil" subtitle="Preparando tu informacion personal.">
        <TrainingV2SkeletonList rows={2} />
      </TrainingV2Screen>
    );
  }

  if (dashboard.isError) {
    return (
      <TrainingV2Screen title="Perfil">
        <TrainingV2ErrorState
          title="No pudimos cargar tu perfil"
          description="Intenta de nuevo para revisar tu informacion y accesos."
          onAction={dashboard.refetch}
        />
      </TrainingV2Screen>
    );
  }

  return (
    <>
      <TrainingV2Screen
        title="Perfil"
        subtitle="Tu identidad, progreso y accesos principales."
      >
        <BaseCard style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={styles.avatar}>
              {dashboard.profile.avatarUrl ? (
                <Image source={{ uri: dashboard.profile.avatarUrl }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>{dashboard.profile.avatarInitials}</Text>
              )}
            </View>
            <TouchableOpacity
              activeOpacity={0.78}
              onPress={openEdit}
              style={styles.iconButton}
              accessibilityRole="button"
              accessibilityLabel="Editar perfil"
            >
              <Edit3 size={20} color={theme.colors.textPrimary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.name}>{dashboard.profile.displayName}</Text>
          <Text style={styles.handle}>{dashboard.profile.handle}</Text>
          <Text style={styles.bio}>{dashboard.profile.bio}</Text>
          <View style={styles.metricRow}>
            {dashboard.profile.metrics.map((metric) => (
              <View key={metric.id} style={styles.metricItem}>
                <Text style={styles.metricValue}>{metric.value}</Text>
                <Text style={styles.metricLabel}>{metric.label}</Text>
                <Text style={styles.metricHelper}>{metric.helper}</Text>
              </View>
            ))}
          </View>
        </BaseCard>

        <TrainerApplicationCard
          title={dashboard.trainerCard.title}
          description={dashboard.trainerCard.description}
          status={dashboard.trainerCard.status}
          actionLabel={dashboard.trainerCard.actionLabel}
          rejectionReason={dashboard.trainerCard.rejectionReason}
          onAction={openTrainerApplication}
        />

        <TrainingV2SectionHeader title="Accesos" />
        <View style={styles.actionList}>
          {clientProfileActions.map((action) => (
            <ProfileActionRow
              key={action.key}
              action={action}
              loading={action.key === 'logout' && dashboard.logout.isPending}
              onPress={() => handleAction(action.key)}
            />
          ))}
        </View>

        {logoutError ? (
          <BaseCard style={styles.inlineError}>
            <AlertCircle size={20} color={theme.colors.error} />
            <Text style={styles.inlineErrorText}>{logoutError}</Text>
          </BaseCard>
        ) : null}

        <BaseCard style={styles.localNote}>
          <ShieldCheck size={18} color={theme.colors.primary} />
          <Text style={styles.localNoteText}>
            La edicion visual de perfil usa estado local aislado y queda lista para conectar a API
            cuando exista contrato aprobado.
          </Text>
        </BaseCard>
      </TrainingV2Screen>

      <EditProfileSheet
        visible={editOpen}
        name={draftName}
        bio={draftBio}
        isSaving={dashboard.isSavingProfile}
        error={dashboard.profileSaveError}
        onChangeName={setDraftName}
        onChangeBio={setDraftBio}
        onClose={() => setEditOpen(false)}
        onSave={() => void saveEdit()}
      />
    </>
  );
}

function TrainerApplicationCard({
  title,
  description,
  status,
  actionLabel,
  rejectionReason,
  onAction,
}: {
  title: string;
  description: string;
  status: 'not_applied' | 'in_review' | 'approved' | 'rejected';
  actionLabel?: string;
  rejectionReason?: string;
  onAction: () => void;
}) {
  const isRejected = status === 'rejected';
  const isApproved = status === 'approved';
  const iconColor = isRejected
    ? theme.colors.error
    : isApproved
      ? theme.colors.success
      : theme.colors.primary;

  return (
    <BaseCard style={[styles.trainerCard, isApproved ? styles.trainerCardApproved : null]}>
      <View style={styles.trainerHeader}>
        <View style={[styles.trainerIcon, { borderColor: iconColor }]}>
          <Award size={22} color={iconColor} />
        </View>
        <View style={styles.trainerCopy}>
          <Text style={styles.trainerTitle}>{title}</Text>
          <Text style={styles.trainerText}>{description}</Text>
          {rejectionReason ? (
            <Text style={styles.rejectionText}>Motivo: {rejectionReason}</Text>
          ) : null}
        </View>
      </View>
      {status === 'in_review' ? <TrainingV2Tag label="En revision" /> : null}
      {actionLabel ? (
        <SecondaryButton label={actionLabel} onPress={onAction} />
      ) : null}
    </BaseCard>
  );
}

function ProfileActionRow({
  action,
  loading,
  onPress,
}: {
  action: ProfileAction;
  loading: boolean;
  onPress: () => void;
}) {
  const Icon = actionIcons[action.key];
  const color = action.tone === 'danger' ? theme.colors.error : theme.colors.primary;

  return (
    <TouchableOpacity
      activeOpacity={0.78}
      onPress={onPress}
      disabled={loading}
      style={[styles.actionRow, action.tone === 'danger' ? styles.actionRowDanger : null]}
      accessibilityRole="button"
      accessibilityLabel={action.label}
    >
      <View style={[styles.actionIcon, { borderColor: color }]}>
        <Icon size={20} color={color} />
      </View>
      <View style={styles.actionCopy}>
        <Text style={[styles.actionTitle, action.tone === 'danger' ? styles.dangerText : null]}>
          {loading ? 'Cerrando sesion' : action.label}
        </Text>
        <Text style={styles.actionText}>{action.description}</Text>
      </View>
      <ChevronRight size={20} color={action.tone === 'danger' ? theme.colors.error : theme.colors.textMuted} />
    </TouchableOpacity>
  );
}

function EditProfileSheet({
  visible,
  name,
  bio,
  isSaving,
  error,
  onChangeName,
  onChangeBio,
  onClose,
  onSave,
}: {
  visible: boolean;
  name: string;
  bio: string;
  isSaving: boolean;
  error: string | null;
  onChangeName: (value: string) => void;
  onChangeBio: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
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
              <Text style={styles.inputLabel}>Bio corta</Text>
              <TextInput
                value={bio}
                onChangeText={onChangeBio}
                editable={!isSaving}
                placeholder="Cuenta como entrenas"
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

const styles = StyleSheet.create({
  heroCard: {
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surfaceElevated,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: theme.colors.primaryMuted,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 92,
    height: 92,
    borderRadius: 46,
  },
  avatarText: {
    color: theme.colors.primary,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
  },
  iconButton: {
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
  metricRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
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
  trainerCard: {
    gap: theme.spacing.md,
  },
  trainerCardApproved: {
    borderColor: theme.colors.success,
  },
  trainerHeader: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  trainerIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
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
  rejectionText: {
    color: theme.colors.error,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
  },
  actionList: {
    gap: theme.spacing.sm,
  },
  actionRow: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
  },
  actionRowDanger: {
    borderColor: 'rgba(239, 68, 68, 0.36)',
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionCopy: {
    flex: 1,
    gap: 2,
  },
  actionTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: theme.typography.bodyStrong.fontWeight,
  },
  actionText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  dangerText: {
    color: theme.colors.error,
  },
  inlineError: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    borderColor: 'rgba(239, 68, 68, 0.36)',
  },
  inlineErrorText: {
    flex: 1,
    color: theme.colors.error,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  localNote: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  localNoteText: {
    flex: 1,
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  sheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: theme.colors.overlay,
  },
  sheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    maxHeight: '88%',
    gap: theme.spacing.md,
  },
  sheetContent: {
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.md,
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
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
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
});

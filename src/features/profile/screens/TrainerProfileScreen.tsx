import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import {
  Award,
  BookOpenCheck,
  ChevronRight,
  Edit3,
  HelpCircle,
  LogOut,
  Settings,
  ShieldCheck,
  Sparkles,
  UserRound,
  X,
} from 'lucide-react-native';
import { BaseCard } from '@/components/ui/BaseCard';
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
import type {
  TrainerDrawerParamList,
  TrainerTabsParamList,
} from '@/features/trainer/types/trainer-navigation.types';
import { useTrainerProfileDashboard } from '../hooks/use-profile-dashboard';

type TrainerProfileNavigation = NavigationProp<TrainerTabsParamList>;

export default function TrainerProfileScreen() {
  const navigation = useNavigation<TrainerProfileNavigation>();
  const drawerNavigation = navigation.getParent<NavigationProp<TrainerDrawerParamList>>();
  const dashboard = useTrainerProfileDashboard();
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

  const logout = () => {
    setLogoutError(null);
    dashboard.logout.mutate(undefined, {
      onError: () => {
        setLogoutError('No pudimos cerrar sesion. Revisa tu conexion e intenta de nuevo.');
      },
    });
  };

  if (dashboard.isLoading) {
    return (
      <TrainingV2Screen title="Perfil" subtitle="Preparando informacion profesional.">
        <TrainingV2SkeletonList rows={2} />
      </TrainingV2Screen>
    );
  }

  if (dashboard.isError) {
    return (
      <TrainingV2Screen title="Perfil">
        <TrainingV2ErrorState
          title="No pudimos cargar tu perfil profesional"
          description="Intenta de nuevo para revisar certificaciones y accesos."
          onAction={dashboard.refetch}
        />
      </TrainingV2Screen>
    );
  }

  return (
    <>
      <TrainingV2Screen
        title="Perfil"
        subtitle="Informacion profesional visible para tus clientes."
      >
        <BaseCard style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{dashboard.profile.avatarInitials}</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.78}
              onPress={openEdit}
              style={styles.iconButton}
              accessibilityRole="button"
              accessibilityLabel="Editar perfil profesional"
            >
              <Edit3 size={20} color={theme.colors.textPrimary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.name}>{dashboard.profile.displayName}</Text>
          <Text style={styles.handle}>{dashboard.profile.handle}</Text>
          <View style={styles.tagRow}>
            <TrainingV2Tag label={dashboard.profile.specialty} tone="primary" />
            <TrainingV2Tag label={dashboard.profile.yearsOfExperience} />
          </View>
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

        <TrainingV2SectionHeader title="Informacion profesional" />
        <BaseCard style={styles.professionalCard}>
          <View style={styles.professionalHeader}>
            <View style={styles.professionalIcon}>
              <BookOpenCheck size={22} color={theme.colors.primary} />
            </View>
            <View style={styles.professionalCopy}>
              <Text style={styles.professionalTitle}>Certificaciones</Text>
              <Text style={styles.professionalText}>
                Datos visuales listos para conectar con el perfil publico del entrenador.
              </Text>
            </View>
          </View>
          <View style={styles.certList}>
            {dashboard.profile.certifications.map((certification) => (
              <View key={certification} style={styles.certRow}>
                <Award size={18} color={theme.colors.primary} />
                <Text style={styles.certText}>{certification}</Text>
              </View>
            ))}
          </View>
        </BaseCard>

        <TrainingV2SectionHeader title="Accesos" />
        <View style={styles.actionList}>
          <TrainerActionRow
            icon={<Settings size={20} color={theme.colors.primary} />}
            title="Configuracion"
            description="Recordatorios, privacidad y cuenta."
            onPress={() => drawerNavigation?.navigate('Settings', { screen: 'SettingsHome' })}
          />
          <TrainerActionRow
            icon={<HelpCircle size={20} color={theme.colors.primary} />}
            title="Ayuda y soporte"
            description="Resuelve dudas del panel entrenador."
            onPress={() => drawerNavigation?.navigate('Help')}
          />
          <TrainerActionRow
            icon={<LogOut size={20} color={theme.colors.error} />}
            title={dashboard.logout.isPending ? 'Cerrando sesion' : 'Cerrar sesion'}
            description="Salir de esta cuenta en el dispositivo."
            danger
            onPress={logout}
          />
        </View>

        {logoutError ? <Text style={styles.logoutError}>{logoutError}</Text> : null}

        <BaseCard style={styles.localNote}>
          <ShieldCheck size={18} color={theme.colors.primary} />
          <Text style={styles.localNoteText}>
            Esta vista no cambia contratos API. La edicion profesional vive en estado local
            reemplazable hasta conectar backend.
          </Text>
        </BaseCard>

        <BaseCard style={styles.publicPreview}>
          <Sparkles size={18} color={theme.colors.primary} />
          <Text style={styles.publicPreviewText}>
            El perfil mantiene consistencia con la ficha publica que ven los clientes al buscar
            entrenador.
          </Text>
        </BaseCard>
      </TrainingV2Screen>

      <EditTrainerProfileSheet
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

function TrainerActionRow({
  icon,
  title,
  description,
  danger = false,
  onPress,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  danger?: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.78}
      onPress={onPress}
      style={[styles.actionRow, danger ? styles.actionRowDanger : null]}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View style={styles.actionIcon}>{icon}</View>
      <View style={styles.actionCopy}>
        <Text style={[styles.actionTitle, danger ? styles.dangerText : null]}>{title}</Text>
        <Text style={styles.actionText}>{description}</Text>
      </View>
      <ChevronRight size={20} color={danger ? theme.colors.error : theme.colors.textMuted} />
    </TouchableOpacity>
  );
}

function EditTrainerProfileSheet({
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
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.sheetOverlay}>
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Editar perfil profesional</Text>
            <Pressable onPress={onClose} disabled={isSaving} style={styles.closeButton}>
              <X size={22} color={theme.colors.textSecondary} />
            </Pressable>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nombre visible</Text>
            <TextInput
              value={name}
              onChangeText={onChangeName}
              editable={!isSaving}
              placeholder="Nombre profesional"
              placeholderTextColor={theme.colors.textMuted}
              selectionColor={theme.colors.primary}
              style={styles.input}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Bio profesional</Text>
            <TextInput
              value={bio}
              onChangeText={onChangeBio}
              editable={!isSaving}
              placeholder="Resume tu enfoque de entrenamiento"
              placeholderTextColor={theme.colors.textMuted}
              selectionColor={theme.colors.primary}
              multiline
              maxLength={220}
              style={[styles.input, styles.textArea]}
            />
            <Text style={styles.counter}>{bio.length}/220</Text>
          </View>
          {error ? <Text style={styles.formError}>{error}</Text> : null}
          <PrimaryButton
            label={isSaving ? 'Guardando' : 'Guardar cambios'}
            onPress={onSave}
            loading={isSaving}
            disabled={isSaving}
          />
          <SecondaryButton label="Cancelar" onPress={onClose} disabled={isSaving} />
        </View>
      </View>
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
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
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
  professionalCard: {
    gap: theme.spacing.md,
  },
  professionalHeader: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  professionalIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: theme.colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  professionalCopy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  professionalTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: theme.typography.bodyStrong.fontWeight,
  },
  professionalText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  certList: {
    gap: theme.spacing.sm,
  },
  certRow: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceElevated,
    paddingHorizontal: theme.spacing.md,
  },
  certText: {
    flex: 1,
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
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
    borderColor: theme.colors.border,
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
  logoutError: {
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
  publicPreview: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  publicPreviewText: {
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
    gap: theme.spacing.md,
  },
  sheetHandle: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.border,
    alignSelf: 'center',
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
    minHeight: 124,
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

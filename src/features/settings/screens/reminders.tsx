import React from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StackActions, usePreventRemove, type NavigationAction } from '@react-navigation/native';
import {
  AlertCircle,
  ArrowLeft,
  Bell,
  BellOff,
  ChevronRight,
  Clock3,
  RefreshCcw,
  Save,
  X,
} from 'lucide-react-native';
import { Chip } from '@/components/ui/Chip';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { theme } from '@/theme';
import type { SettingsStackParamList } from '@/navigation/types';
import { useReminderPreferences } from '../hooks/use-reminder-preferences';
import { DEFAULT_REMINDER_PREFERENCES } from '../mocks/reminders.mock';
import type {
  NotificationPermissionStatus,
  ReminderPreferences,
  ReminderWeekDay,
} from '../types/reminders';

type Props = NativeStackScreenProps<SettingsStackParamList, 'Reminders'>;

const WEEK_DAYS: { key: ReminderWeekDay; label: string }[] = [
  { key: 'monday', label: 'L' },
  { key: 'tuesday', label: 'M' },
  { key: 'wednesday', label: 'M' },
  { key: 'thursday', label: 'J' },
  { key: 'friday', label: 'V' },
  { key: 'saturday', label: 'S' },
  { key: 'sunday', label: 'D' },
];

function formatTime(hour: number, minute: number) {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function arePreferencesEqual(a: ReminderPreferences, b: ReminderPreferences) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function arePreferencesEmpty(preferences: ReminderPreferences) {
  return (
    !preferences.trainingEnabled &&
    !preferences.inactivityEnabled &&
    !preferences.prsEnabled &&
    !preferences.weeklySummaryEnabled &&
    !preferences.trainerMessagesEnabled
  );
}

export default function RemindersScreen({ navigation }: Props) {
  const remindersQuery = useReminderPreferences();
  const [savedPreferences, setSavedPreferences] = React.useState<ReminderPreferences | null>(null);
  const [preferences, setPreferences] = React.useState<ReminderPreferences | null>(null);
  const [permissionStatus, setPermissionStatus] =
    React.useState<NotificationPermissionStatus>('checking');
  const [permissionMessage, setPermissionMessage] = React.useState<string | null>(null);
  const [timeSheetVisible, setTimeSheetVisible] = React.useState(false);
  const [unsavedSheetVisible, setUnsavedSheetVisible] = React.useState(false);
  const [pendingAction, setPendingAction] = React.useState<NavigationAction | null>(null);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const allowLeaveRef = React.useRef(false);

  React.useEffect(() => {
    if (!remindersQuery.data) return;

    setSavedPreferences(remindersQuery.data.preferences);
    setPreferences(remindersQuery.data.preferences);
    setPermissionStatus(remindersQuery.data.notificationPermission);
    setPermissionMessage(remindersQuery.data.permissionMessage);
  }, [remindersQuery.data]);

  const saving = remindersQuery.isSaving;
  const hasUnsavedChanges = Boolean(
    savedPreferences && preferences && !arePreferencesEqual(savedPreferences, preferences),
  );
  const hasDayValidationError = Boolean(
    preferences?.trainingEnabled && preferences.activeDays.length === 0,
  );
  const canSave = Boolean(hasUnsavedChanges && !hasDayValidationError && !saving);
  const isPermissionBlocked = permissionStatus === 'blocked';
  const isEmptyState = preferences ? arePreferencesEmpty(preferences) : false;

  usePreventRemove(hasUnsavedChanges && !allowLeaveRef.current, ({ data }) => {
    setPendingAction(data.action);
    setUnsavedSheetVisible(true);
  });

  React.useEffect(() => {
    if (hasUnsavedChanges) return;

    setPendingAction(null);
    setUnsavedSheetVisible(false);
    allowLeaveRef.current = false;
  }, [hasUnsavedChanges]);

  const requestLeave = React.useCallback(() => {
    if (hasUnsavedChanges) {
      setPendingAction(StackActions.pop(1));
      setUnsavedSheetVisible(true);
      return;
    }

    navigation.goBack();
  }, [hasUnsavedChanges, navigation]);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          activeOpacity={0.78}
          accessibilityRole="button"
          accessibilityLabel="Volver"
          onPress={requestLeave}
          style={styles.headerBackButton}
        >
          <ArrowLeft size={22} color={theme.colors.textPrimary} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, requestLeave]);

  const updatePreference = React.useCallback(
    <K extends keyof ReminderPreferences>(key: K, value: ReminderPreferences[K]) => {
      setPreferences((current) => ({
        ...(current ?? DEFAULT_REMINDER_PREFERENCES),
        [key]: value,
      }));
      setSaveError(null);
      setSuccessMessage(null);
      remindersQuery.clearSaveError();
    },
    [remindersQuery],
  );

  const toggleDay = React.useCallback((day: ReminderWeekDay) => {
    setPreferences((current) => {
      const base = current ?? DEFAULT_REMINDER_PREFERENCES;
      const exists = base.activeDays.includes(day);
      const activeDays = exists
        ? base.activeDays.filter((item) => item !== day)
        : [...base.activeDays, day];
      return { ...base, activeDays };
    });
    setSaveError(null);
    setSuccessMessage(null);
  }, []);

  const savePreferences = React.useCallback((afterSave?: () => void) => {
    if (!preferences) {
      setSaveError('No pudimos preparar tus preferencias. Intenta de nuevo.');
      return;
    }

    if (hasDayValidationError) {
      setSaveError('Selecciona al menos un dia para activar los recordatorios.');
      return;
    }

    setSaveError(null);
    remindersQuery.savePreferences(preferences)
      .then(() => {
        setSavedPreferences(preferences);
        setSuccessMessage('Recordatorios guardados.');
        afterSave?.();
      })
      .catch((error: unknown) => {
        const message = error instanceof Error
          ? error.message
          : 'No pudimos guardar tus recordatorios. Intenta de nuevo.';
        setSaveError(message);
      });
  }, [hasDayValidationError, preferences, remindersQuery]);

  const retryPermissionCheck = React.useCallback(() => {
    setPermissionStatus('checking');
    setPermissionMessage(null);
    setTimeout(() => {
      setPermissionStatus('blocked');
      setPermissionMessage('No pudimos habilitar permisos desde la app. Revisa Ajustes del sistema.');
    }, 650);
  }, []);

  const openSystemSettings = React.useCallback(() => {
    setPermissionMessage('Abrir Ajustes queda pendiente de integrar con permisos nativos.');
  }, []);

  const discardAndLeave = React.useCallback(() => {
    if (savedPreferences) {
      setPreferences(savedPreferences);
    }
    setUnsavedSheetVisible(false);
    allowLeaveRef.current = true;
    const action = pendingAction;
    setPendingAction(null);
    if (action) {
      navigation.dispatch(action);
    }
  }, [navigation, pendingAction, savedPreferences]);

  const keepEditing = React.useCallback(() => {
    setUnsavedSheetVisible(false);
    setPendingAction(null);
    allowLeaveRef.current = false;
  }, []);

  const saveAndLeave = React.useCallback(() => {
    const actionToDispatch = pendingAction ?? StackActions.pop(1);

    savePreferences(() => {
      setUnsavedSheetVisible(false);
      allowLeaveRef.current = true;
      setPendingAction(null);
      setTimeout(() => navigation.dispatch(actionToDispatch), 0);
    });
  }, [navigation, pendingAction, savePreferences]);

  if (remindersQuery.isLoading) {
    return <ReminderLoadingState />;
  }

  if (remindersQuery.isError) {
    return (
      <ReminderScreenState
        icon={<AlertCircle size={42} color={theme.colors.error} />}
        title="No pudimos cargar tus recordatorios"
        description={remindersQuery.error?.message ?? 'Revisa tu conexion e intenta de nuevo.'}
        actionLabel="Reintentar"
        onAction={remindersQuery.refetch}
      />
    );
  }

  if (!preferences || !savedPreferences) {
    return (
      <ReminderScreenState
        icon={<BellOff size={42} color={theme.colors.textMuted} />}
        title="Aun no hay preferencias"
        description="Preparamos un estado inicial para que configures tus recordatorios."
        actionLabel="Configurar"
        onAction={() => {
          setSavedPreferences(DEFAULT_REMINDER_PREFERENCES);
          setPreferences(DEFAULT_REMINDER_PREFERENCES);
          setPermissionStatus('granted');
        }}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Recordatorios</Text>
          <Text style={styles.subtitle}>
            Configura cuando quieres que Endure te ayude a mantener constancia.
          </Text>
        </View>

        {isPermissionBlocked ? (
          <PermissionBanner
            status={permissionStatus}
            message={permissionMessage}
            onRetry={retryPermissionCheck}
            onOpenSettings={openSystemSettings}
          />
        ) : null}

        {isEmptyState ? (
          <EmptyReminderCard
            onActivate={() => {
              setPreferences(DEFAULT_REMINDER_PREFERENCES);
              setSaveError(null);
              setSuccessMessage(null);
            }}
          />
        ) : null}

        <SettingsSection title="Recordatorios de entrenamiento">
          <SwitchRow
            label="Activar recordatorios"
            description="Recibe un aviso antes de tu hora de entrenamiento."
            value={preferences.trainingEnabled}
            disabled={isPermissionBlocked}
            onValueChange={(value) => updatePreference('trainingEnabled', value)}
          />
          <ActionRow
            label="Hora"
            value={formatTime(preferences.reminderHour, preferences.reminderMinute)}
            disabled={!preferences.trainingEnabled || isPermissionBlocked}
            onPress={() => setTimeSheetVisible(true)}
          />
          <View style={styles.daysBlock}>
            <Text style={styles.rowLabel}>Dias</Text>
            <View style={styles.days}>
              {WEEK_DAYS.map((day) => (
                <Chip
                  key={day.key}
                  label={day.label}
                  selected={preferences.activeDays.includes(day.key)}
                  disabled={!preferences.trainingEnabled || isPermissionBlocked}
                  onPress={() => toggleDay(day.key)}
                />
              ))}
            </View>
            {hasDayValidationError ? (
              <Text style={styles.validationText}>
                Selecciona al menos un dia para guardar recordatorios.
              </Text>
            ) : null}
          </View>
        </SettingsSection>

        <SettingsSection title="Avisos de inactividad">
          <SwitchRow
            label="Avisarme si no entreno"
            description="Te avisaremos cuando pasen varios dias sin actividad registrada."
            value={preferences.inactivityEnabled}
            disabled={isPermissionBlocked}
            onValueChange={(value) => updatePreference('inactivityEnabled', value)}
          />
          <StepperRow
            label="Dias sin entrenar"
            value={preferences.inactivityDays}
            disabled={!preferences.inactivityEnabled || isPermissionBlocked}
            onDecrease={() =>
              updatePreference('inactivityDays', Math.max(1, preferences.inactivityDays - 1))
            }
            onIncrease={() =>
              updatePreference('inactivityDays', Math.min(14, preferences.inactivityDays + 1))
            }
          />
        </SettingsSection>

        <SettingsSection title="Notificaciones">
          <SwitchRow
            label="PRs y records personales"
            description="Celebra nuevos logros y mejores marcas."
            value={preferences.prsEnabled}
            disabled={isPermissionBlocked}
            onValueChange={(value) => updatePreference('prsEnabled', value)}
          />
          <SwitchRow
            label="Resumen semanal"
            description="Recibe un resumen cada lunes."
            value={preferences.weeklySummaryEnabled}
            disabled={isPermissionBlocked}
            onValueChange={(value) => updatePreference('weeklySummaryEnabled', value)}
          />
          <SwitchRow
            label="Mensajes de mi entrenador"
            description="Avisos de rutinas asignadas o comentarios del entrenador."
            value={preferences.trainerMessagesEnabled}
            disabled={isPermissionBlocked || !remindersQuery.data?.trainerNotificationsAvailable}
            onValueChange={(value) => updatePreference('trainerMessagesEnabled', value)}
          />
        </SettingsSection>

        {saveError ? <InlineMessage tone="error" text={saveError} /> : null}
        {successMessage ? <InlineMessage tone="success" text={successMessage} /> : null}

        {hasUnsavedChanges ? (
          <View style={styles.saveBar}>
            <PrimaryButton
              label={saving ? 'Guardando' : 'Guardar cambios'}
              loading={saving}
              disabled={!canSave}
              onPress={() => savePreferences()}
              icon={!saving ? <Save size={18} color={theme.colors.background} /> : null}
            />
          </View>
        ) : null}
      </ScrollView>

      <TimePickerSheet
        visible={timeSheetVisible}
        hour={preferences.reminderHour}
        minute={preferences.reminderMinute}
        onClose={() => setTimeSheetVisible(false)}
        onConfirm={(hour, minute) => {
          updatePreference('reminderHour', hour);
          updatePreference('reminderMinute', minute);
          setTimeSheetVisible(false);
        }}
      />

      <UnsavedChangesSheet
        visible={unsavedSheetVisible}
        saving={saving}
        error={saveError}
        onKeepEditing={keepEditing}
        onDiscard={discardAndLeave}
        onSave={saveAndLeave}
      />
    </SafeAreaView>
  );
}

function ReminderLoadingState() {
  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Recordatorios</Text>
          <Text style={styles.subtitle}>Cargando tus preferencias de entrenamiento.</Text>
        </View>
        <View style={styles.skeletonHero} />
        <View style={styles.skeletonSection}>
          {Array.from({ length: 3 }, (_, index) => (
            <View key={`reminder-skeleton-${index}`} style={styles.skeletonRow} />
          ))}
        </View>
        <View style={styles.skeletonSection}>
          {Array.from({ length: 2 }, (_, index) => (
            <View key={`reminder-skeleton-extra-${index}`} style={styles.skeletonRow} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ReminderScreenState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.stateContainer}>
        <View style={styles.stateIcon}>{icon}</View>
        <Text style={styles.stateTitle}>{title}</Text>
        <Text style={styles.stateText}>{description}</Text>
        <PrimaryButton label={actionLabel} onPress={onAction} />
      </View>
    </SafeAreaView>
  );
}

function EmptyReminderCard({ onActivate }: { onActivate: () => void }) {
  return (
    <View style={styles.emptyCard}>
      <View style={styles.emptyHeader}>
        <View style={styles.emptyIcon}>
          <Bell size={24} color={theme.colors.primary} />
        </View>
        <View style={styles.emptyCopy}>
          <Text style={styles.emptyTitle}>Recordatorios desactivados</Text>
          <Text style={styles.emptyText}>
            Activa un horario y dias de entrenamiento cuando quieras que Endure te acompane.
          </Text>
        </View>
      </View>
      <SecondaryButton label="Configurar" onPress={onActivate} />
    </View>
  );
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

function SwitchRow({
  label,
  description,
  value,
  disabled,
  onValueChange,
}: {
  label: string;
  description: string;
  value: boolean;
  disabled?: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <View style={[styles.settingRow, disabled ? styles.disabledRow : null]}>
      <View style={styles.rowCopy}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        disabled={disabled}
        onValueChange={onValueChange}
        trackColor={{ false: theme.colors.surfacePressed, true: theme.colors.primaryMuted }}
        thumbColor={value ? theme.colors.primary : theme.colors.textMuted}
        ios_backgroundColor={theme.colors.surfacePressed}
      />
    </View>
  );
}

function ActionRow({
  label,
  value,
  disabled,
  onPress,
}: {
  label: string;
  value: string;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.settingRow, disabled ? styles.disabledRow : null]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.82}
    >
      <View style={styles.rowCopy}>
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      <View style={styles.actionValue}>
        <Text style={styles.actionValueText}>{value}</Text>
        <ChevronRight size={18} color={theme.colors.textMuted} />
      </View>
    </TouchableOpacity>
  );
}

function StepperRow({
  label,
  value,
  disabled,
  onDecrease,
  onIncrease,
}: {
  label: string;
  value: number;
  disabled?: boolean;
  onDecrease: () => void;
  onIncrease: () => void;
}) {
  return (
    <View style={[styles.settingRow, disabled ? styles.disabledRow : null]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.stepper}>
        <TouchableOpacity style={styles.stepperButton} disabled={disabled} onPress={onDecrease}>
          <Text style={styles.stepperText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.stepperValue}>{value}</Text>
        <TouchableOpacity style={styles.stepperButton} disabled={disabled} onPress={onIncrease}>
          <Text style={styles.stepperText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function PermissionBanner({
  status,
  message,
  onRetry,
  onOpenSettings,
}: {
  status: NotificationPermissionStatus;
  message: string | null;
  onRetry: () => void;
  onOpenSettings: () => void;
}) {
  const isChecking = status === 'checking';

  return (
    <View style={styles.permissionBanner}>
      <BellOff size={22} color={theme.colors.warning} />
      <View style={styles.permissionCopy}>
        <Text style={styles.permissionTitle}>Las notificaciones estan desactivadas en Ajustes</Text>
        <Text style={styles.permissionText}>
          Puedes revisar tu configuracion, pero no enviaremos avisos hasta que el permiso este activo.
        </Text>
        {message ? <Text style={styles.permissionHint}>{message}</Text> : null}
        <View style={styles.permissionActions}>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={onOpenSettings}
            activeOpacity={0.82}
          >
            <Text style={styles.permissionButtonText}>Abrir Ajustes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.retryPermissionButton}
            onPress={onRetry}
            disabled={isChecking}
            activeOpacity={0.82}
          >
            {isChecking ? (
              <ActivityIndicator color={theme.colors.primary} size="small" />
            ) : (
              <RefreshCcw size={16} color={theme.colors.primary} />
            )}
            <Text style={styles.retryPermissionText}>
              {isChecking ? 'Revisando' : 'Revisar de nuevo'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function InlineMessage({ tone, text }: { tone: 'error' | 'success'; text: string }) {
  const color = tone === 'error' ? theme.colors.error : theme.colors.success;
  const backgroundColor =
    tone === 'error' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(34, 197, 94, 0.12)';

  return (
    <View style={[styles.inlineMessage, { backgroundColor, borderColor: color }]}>
      <Text style={[styles.inlineMessageText, { color }]}>{text}</Text>
    </View>
  );
}

function TimePickerSheet({
  visible,
  hour,
  minute,
  onClose,
  onConfirm,
}: {
  visible: boolean;
  hour: number;
  minute: number;
  onClose: () => void;
  onConfirm: (hour: number, minute: number) => void;
}) {
  const [localHour, setLocalHour] = React.useState(hour);
  const [localMinute, setLocalMinute] = React.useState(minute);

  React.useEffect(() => {
    if (visible) {
      setLocalHour(hour);
      setLocalMinute(minute);
    }
  }, [hour, minute, visible]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.sheetBackdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.sheetTitle}>Hora del recordatorio</Text>
              <Text style={styles.sheetSubtitle}>Elige una hora compatible con tu rutina.</Text>
            </View>
            <TouchableOpacity style={styles.iconButton} onPress={onClose}>
              <X size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.timePicker}>
            <TimeColumn
              label="Hora"
              value={localHour}
              onDecrease={() => setLocalHour((current) => (current + 23) % 24)}
              onIncrease={() => setLocalHour((current) => (current + 1) % 24)}
            />
            <Text style={styles.timeSeparator}>:</Text>
            <TimeColumn
              label="Min"
              value={localMinute}
              onDecrease={() => setLocalMinute((current) => (current + 55) % 60)}
              onIncrease={() => setLocalMinute((current) => (current + 5) % 60)}
            />
          </View>

          <View style={styles.sheetActions}>
            <PrimaryButton
              label="Confirmar"
              onPress={() => onConfirm(localHour, localMinute)}
              icon={<Clock3 size={18} color={theme.colors.background} />}
            />
            <SecondaryButton label="Cancelar" onPress={onClose} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function TimeColumn({
  label,
  value,
  onDecrease,
  onIncrease,
}: {
  label: string;
  value: number;
  onDecrease: () => void;
  onIncrease: () => void;
}) {
  return (
    <View style={styles.timeColumn}>
      <TouchableOpacity style={styles.timeButton} onPress={onIncrease}>
        <Text style={styles.timeButtonText}>+</Text>
      </TouchableOpacity>
      <Text style={styles.timeValue}>{String(value).padStart(2, '0')}</Text>
      <Text style={styles.timeLabel}>{label}</Text>
      <TouchableOpacity style={styles.timeButton} onPress={onDecrease}>
        <Text style={styles.timeButtonText}>-</Text>
      </TouchableOpacity>
    </View>
  );
}

function UnsavedChangesSheet({
  visible,
  saving,
  error,
  onKeepEditing,
  onDiscard,
  onSave,
}: {
  visible: boolean;
  saving: boolean;
  error: string | null;
  onKeepEditing: () => void;
  onDiscard: () => void;
  onSave: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onKeepEditing}>
      <Pressable style={styles.sheetBackdrop} onPress={onKeepEditing}>
        <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Tienes cambios sin guardar</Text>
          <Text style={styles.sheetSubtitle}>
            Guarda tus recordatorios antes de salir o descarta los cambios.
          </Text>
          {error ? <InlineMessage tone="error" text={error} /> : null}
          <View style={styles.sheetActions}>
            <PrimaryButton
              label={saving ? 'Guardando' : 'Guardar cambios'}
              loading={saving}
              disabled={saving}
              onPress={onSave}
            />
            <SecondaryButton label="Seguir editando" onPress={onKeepEditing} disabled={saving} />
            <TouchableOpacity
              style={styles.destructiveAction}
              disabled={saving}
              onPress={onDiscard}
              activeOpacity={0.82}
            >
              <Text style={styles.destructiveActionText}>Descartar cambios</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scroll: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
    gap: theme.spacing.lg,
  },
  header: {
    gap: theme.spacing.sm,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading1.fontSize,
    lineHeight: theme.typography.heading1.lineHeight,
    fontWeight: theme.typography.heading1.fontWeight,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
  },
  headerBackButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 0,
  },
  stateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  stateIcon: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading2.fontSize,
    lineHeight: theme.typography.heading2.lineHeight,
    fontWeight: theme.typography.heading2.fontWeight,
    textAlign: 'center',
  },
  stateText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    textAlign: 'center',
  },
  skeletonHero: {
    minHeight: 112,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceElevated,
  },
  skeletonSection: {
    gap: theme.spacing.sm,
  },
  skeletonRow: {
    minHeight: 64,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  emptyCard: {
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  emptyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  emptyIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: theme.colors.primaryMuted,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCopy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  emptyTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: theme.typography.bodyStrong.fontWeight,
  },
  emptyText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  permissionBanner: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: theme.colors.warning,
  },
  permissionCopy: {
    flex: 1,
    gap: theme.spacing.sm,
  },
  permissionTitle: {
    color: theme.colors.warning,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: theme.typography.bodyStrong.fontWeight,
  },
  permissionText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  permissionHint: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
  },
  permissionActions: {
    gap: theme.spacing.sm,
  },
  permissionButton: {
    minHeight: 44,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.warning,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionButtonText: {
    color: theme.colors.warning,
    fontSize: theme.typography.button.fontSize,
    lineHeight: theme.typography.button.lineHeight,
    fontWeight: theme.typography.button.fontWeight,
  },
  retryPermissionButton: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  retryPermissionText: {
    color: theme.colors.primary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    fontWeight: '700',
  },
  section: {
    gap: theme.spacing.sm,
  },
  sectionTitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  sectionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  settingRow: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  disabledRow: {
    opacity: 0.52,
  },
  rowCopy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  rowLabel: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: theme.typography.bodyStrong.fontWeight,
  },
  rowDescription: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  actionValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  actionValueText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
  },
  daysBlock: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  days: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  validationText: {
    color: theme.colors.error,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  stepperButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperText: {
    color: theme.colors.primary,
    fontSize: 20,
    fontWeight: '700',
  },
  stepperValue: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: theme.typography.bodyStrong.fontWeight,
    minWidth: 24,
    textAlign: 'center',
  },
  inlineMessage: {
    borderWidth: 1,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
  },
  inlineMessageText: {
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    fontWeight: '600',
  },
  saveBar: {
    paddingTop: theme.spacing.sm,
  },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
    gap: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
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
    gap: theme.spacing.md,
  },
  sheetTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading2.fontSize,
    lineHeight: theme.typography.heading2.lineHeight,
    fontWeight: theme.typography.heading2.fontWeight,
  },
  sheetSubtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceElevated,
  },
  timePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.lg,
  },
  timeColumn: {
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  timeButton: {
    width: 56,
    height: 44,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeButtonText: {
    color: theme.colors.primary,
    fontSize: 24,
    fontWeight: '700',
  },
  timeValue: {
    color: theme.colors.textPrimary,
    fontSize: 44,
    lineHeight: 52,
    fontWeight: '800',
  },
  timeLabel: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    textTransform: 'uppercase',
  },
  timeSeparator: {
    color: theme.colors.primary,
    fontSize: 44,
    lineHeight: 52,
    fontWeight: '800',
  },
  sheetActions: {
    gap: theme.spacing.md,
  },
  destructiveAction: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  destructiveActionText: {
    color: theme.colors.error,
    fontSize: theme.typography.button.fontSize,
    lineHeight: theme.typography.button.lineHeight,
    fontWeight: theme.typography.button.fontWeight,
  },
});

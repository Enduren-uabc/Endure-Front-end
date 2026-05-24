import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Dumbbell,
  Lock,
  RefreshCcw,
  Search,
  TrendingUp,
  X,
} from 'lucide-react-native';
import { Chip } from '@/components/ui/Chip';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { useLinkedClients } from '@/features/trainer-link/hooks/use-trainer-link';
import { useRoutines } from '@/features/training/hooks/use-routines';
import { useWorkoutHistory } from '@/features/training/hooks/use-workout-session';
import type { Routine } from '@/features/training/types/routine';
import type { WorkoutSessionSummary } from '@/features/training/types/workout-session';
import { theme } from '@/theme';
import type { TrainerClientsStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<TrainerClientsStackParamList, 'ClientProgress'>;
type PeriodKey = '7d' | '30d' | '90d';

interface AssignedRoutine {
  routineId: string;
  routineName: string;
  assignedAt: string;
}

const PERIODS: { key: PeriodKey; label: string }[] = [
  { key: '7d', label: '7 dias' },
  { key: '30d', label: '30 dias' },
  { key: '90d', label: '90 dias' },
];

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function routineExerciseCount(routine: Routine): number {
  return routine.days.reduce((total, day) => total + day.exercises.length, 0);
}

function computeMetrics(sessions: WorkoutSessionSummary[], period: PeriodKey) {
  const now = new Date();
  const cutoff = new Date(now);
  const daysMap = { '7d': 7, '30d': 30, '90d': 90 };
  cutoff.setDate(cutoff.getDate() - daysMap[period]);

  const filtered = sessions.filter((s) => new Date(s.startedAt) >= cutoff);
  const totalSessions = filtered.length;
  const totalVolume = filtered.reduce((sum, s) => sum + (s.durationMinutes ?? 0) * 10, 0);
  const expected = period === '7d' ? 3 : period === '30d' ? 12 : 36;
  const adherence = expected > 0 ? Math.round((totalSessions / expected) * 100) : 0;

  return {
    adherence: Math.min(adherence, 100),
    sessions: totalSessions,
    volume: totalVolume,
  };
}

function buildRecentSessions(sessions: WorkoutSessionSummary[]) {
  return sessions.slice(0, 5).map((s) => ({
    id: s.id,
    title: s.routineName,
    date: formatRelativeDate(s.finishedAt ?? s.startedAt),
    detail: `${s.exerciseCount} ejercicios · ${s.durationMinutes} min`,
  }));
}

function formatRelativeDate(dateStr: string): string {
  try {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} dias`;
    return `Hace ${Math.floor(diffDays / 7)} semana${Math.floor(diffDays / 7) > 1 ? 's' : ''}`;
  } catch {
    return dateStr;
  }
}

export default function ClientProgressScreen({ navigation, route }: Props) {
  const { clientName, linkId, activatedAt } = route.params;
  const [period, setPeriod] = React.useState<PeriodKey>('30d');
  const [assignedRoutine, setAssignedRoutine] = React.useState<AssignedRoutine | null>(null);
  const [assignSheetVisible, setAssignSheetVisible] = React.useState(false);
  const [replaceSheetVisible, setReplaceSheetVisible] = React.useState(false);
  const linkedClients = useLinkedClients();
  const workoutHistory = useWorkoutHistory();

  const isStillLinked =
    linkedClients.data?.items.some((client) => client.linkId === linkId) ?? true;

  const sessions = workoutHistory.data ?? [];
  const metrics = computeMetrics(sessions, period);
  const recentSessions = buildRecentSessions(sessions);

  const isLoading = linkedClients.isLoading || workoutHistory.isLoading;
  const isError = linkedClients.isError || workoutHistory.isError;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.primary} size="large" />
          <Text style={styles.centerText}>Cargando progreso del cliente...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <StateBlock
          icon={<AlertCircle size={44} color={theme.colors.error} />}
          title="No pudimos cargar el progreso"
          text="Revisa tu conexion e intenta de nuevo."
          actionLabel="Reintentar"
          onAction={() => {
            linkedClients.refetch();
            workoutHistory.refetch();
          }}
        />
      </SafeAreaView>
    );
  }

  if (!isStillLinked) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <StateBlock
          icon={<Lock size={44} color={theme.colors.warning} />}
          title="Acceso no disponible"
          text="Solo puedes revisar progreso de clientes vinculados actualmente."
          actionLabel="Volver"
          onAction={() => navigation.goBack()}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{clientName.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.profileCopy}>
            <Text style={styles.clientName}>{clientName}</Text>
            <Text style={styles.clientMeta}>Vinculado desde {formatDate(activatedAt)}</Text>
          </View>
        </View>

        <View style={styles.periods}>
          {PERIODS.map((item) => (
            <Chip
              key={item.key}
              label={item.label}
              selected={period === item.key}
              onPress={() => setPeriod(item.key)}
            />
          ))}
        </View>

        <View style={styles.metricsGrid}>
          <MetricCard
            label="Adherencia"
            value={`${metrics.adherence}%`}
            caption="Sesiones planeadas"
            tone="success"
          />
          <MetricCard
            label="Sesiones"
            value={String(metrics.sessions)}
            caption="Completadas"
            tone="primary"
          />
          <MetricCard
            label="Volumen"
            value={`${Math.round(metrics.volume / 100) / 10}k`}
            caption="kg estimados"
            tone="warning"
          />
        </View>

        <View style={styles.assignedCard}>
          <View style={styles.assignedHeader}>
            <View style={styles.assignedIcon}>
              <Dumbbell size={22} color={theme.colors.primary} />
            </View>
            <View style={styles.assignedCopy}>
              <Text style={styles.assignedTitle}>Rutina asignada</Text>
              <Text style={styles.assignedText}>
                {assignedRoutine
                  ? `${assignedRoutine.routineName} · asignada ${formatDate(assignedRoutine.assignedAt)}`
                  : 'Este cliente aun no tiene rutina asignada desde esta vista.'}
              </Text>
            </View>
          </View>
          <View style={styles.assignedActions}>
            {assignedRoutine ? (
              <SecondaryButton
                label="Reemplazar rutina"
                onPress={() => setReplaceSheetVisible(true)}
              />
            ) : (
              <PrimaryButton
                label="Asignar rutina"
                onPress={() => setAssignSheetVisible(true)}
                icon={<Dumbbell size={18} color={theme.colors.background} />}
              />
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Entrenamientos recientes</Text>
          {recentSessions.length > 0 ? (
            <View style={styles.sessionList}>
              {recentSessions.map((session) => (
                <View key={session.id} style={styles.sessionRow}>
                  <View style={styles.sessionIcon}>
                    <TrendingUp size={18} color={theme.colors.primary} />
                  </View>
                  <View style={styles.sessionCopy}>
                    <Text style={styles.sessionTitle}>{session.title}</Text>
                    <Text style={styles.sessionDetail}>{session.detail}</Text>
                  </View>
                  <Text style={styles.sessionDate}>{session.date}</Text>
                </View>
              ))}
            </View>
          ) : (
            <StateCard text="Aun no hay sesiones registradas para este periodo." />
          )}
        </View>

        <View style={styles.noticeCard}>
          <CalendarDays size={18} color={theme.colors.textSecondary} />
          <Text style={styles.noticeText}>
            Las metricas y entrenamientos mostrados corresponden a tu historial como entrenador.
            El progreso especifico del cliente estara disponible cuando el contrato de progreso
            este implementado en el backend.
          </Text>
        </View>
      </ScrollView>

      <RoutineAssignmentSheet
        visible={assignSheetVisible}
        title="Asignar rutina"
        clientName={clientName}
        currentRoutine={assignedRoutine}
        confirmLabel="Asignar"
        onClose={() => setAssignSheetVisible(false)}
        onConfirm={(routine) => {
          setAssignedRoutine({
            routineId: routine.id,
            routineName: routine.name,
            assignedAt: new Date().toISOString(),
          });
          setAssignSheetVisible(false);
        }}
      />

      <RoutineAssignmentSheet
        visible={replaceSheetVisible}
        title="Reemplazar rutina"
        clientName={clientName}
        currentRoutine={assignedRoutine}
        confirmLabel="Confirmar reemplazo"
        onClose={() => setReplaceSheetVisible(false)}
        onConfirm={(routine) => {
          setAssignedRoutine({
            routineId: routine.id,
            routineName: routine.name,
            assignedAt: new Date().toISOString(),
          });
          setReplaceSheetVisible(false);
        }}
      />
    </SafeAreaView>
  );
}

function MetricCard({
  label,
  value,
  caption,
  tone,
}: {
  label: string;
  value: string;
  caption: string;
  tone: 'primary' | 'success' | 'warning';
}) {
  const color =
    tone === 'success' ? theme.colors.success : tone === 'warning' ? theme.colors.warning : theme.colors.primary;

  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
      <Text style={styles.metricCaption}>{caption}</Text>
    </View>
  );
}

function StateBlock({
  icon,
  title,
  text,
  actionLabel,
  onAction,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <View style={styles.center}>
      <View style={styles.stateIcon}>{icon}</View>
      <Text style={styles.centerTitle}>{title}</Text>
      <Text style={styles.centerText}>{text}</Text>
      <PrimaryButton
        label={actionLabel}
        onPress={onAction}
        icon={<RefreshCcw size={18} color={theme.colors.background} />}
      />
    </View>
  );
}

function StateCard({ text }: { text: string }) {
  return (
    <View style={styles.stateCard}>
      <Text style={styles.stateCardText}>{text}</Text>
    </View>
  );
}

function RoutineAssignmentSheet({
  visible,
  title,
  clientName,
  currentRoutine,
  confirmLabel,
  onClose,
  onConfirm,
}: {
  visible: boolean;
  title: string;
  clientName: string;
  currentRoutine: AssignedRoutine | null;
  confirmLabel: string;
  onClose: () => void;
  onConfirm: (routine: Routine) => void;
}) {
  const routinesQuery = useRoutines();
  const [search, setSearch] = React.useState('');
  const [selectedRoutineId, setSelectedRoutineId] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [validationError, setValidationError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (visible) {
      setSearch('');
      setSelectedRoutineId(null);
      setValidationError(null);
      setSubmitting(false);
    }
  }, [visible]);

  const routines = routinesQuery.data ?? [];
  const filteredRoutines = routines.filter((routine) =>
    routine.name.toLowerCase().includes(search.trim().toLowerCase()),
  );
  const selectedRoutine = routines.find((routine) => routine.id === selectedRoutineId) ?? null;

  const handleConfirm = React.useCallback(() => {
    if (!selectedRoutine) {
      setValidationError('Selecciona una rutina antes de continuar.');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      onConfirm(selectedRoutine);
    }, 550);
  }, [onConfirm, selectedRoutine]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.sheetBackdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.sheetTitle}>{title}</Text>
              <Text style={styles.sheetSubtitle}>Cliente: {clientName}</Text>
            </View>
            <TouchableOpacity style={styles.iconButton} onPress={onClose}>
              <X size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {currentRoutine ? (
            <View style={styles.currentRoutineCard}>
              <Text style={styles.currentRoutineLabel}>Rutina actual</Text>
              <Text style={styles.currentRoutineTitle}>{currentRoutine.routineName}</Text>
            </View>
          ) : null}

          <View style={styles.searchBox}>
            <Search size={18} color={theme.colors.textSecondary} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Buscar rutina"
              placeholderTextColor={theme.colors.textMuted}
              style={styles.searchInput}
            />
          </View>

          {routinesQuery.isLoading ? (
            <View style={styles.sheetState}>
              <ActivityIndicator color={theme.colors.primary} />
              <Text style={styles.sheetStateText}>Cargando rutinas...</Text>
            </View>
          ) : routinesQuery.isError ? (
            <View style={styles.sheetState}>
              <AlertCircle size={28} color={theme.colors.error} />
              <Text style={styles.sheetStateText}>No pudimos cargar tus rutinas.</Text>
              <SecondaryButton label="Reintentar" onPress={() => routinesQuery.refetch()} />
            </View>
          ) : filteredRoutines.length === 0 ? (
            <View style={styles.sheetState}>
              <Dumbbell size={28} color={theme.colors.textMuted} />
              <Text style={styles.sheetStateText}>Aun no tienes rutinas para asignar.</Text>
            </View>
          ) : (
            <FlatList
              data={filteredRoutines}
              keyExtractor={(item) => item.id}
              style={styles.routineList}
              contentContainerStyle={styles.routineListContent}
              renderItem={({ item }) => {
                const selected = selectedRoutineId === item.id;
                return (
                  <TouchableOpacity
                    style={[styles.routineRow, selected ? styles.routineRowSelected : null]}
                    onPress={() => {
                      setSelectedRoutineId(item.id);
                      setValidationError(null);
                    }}
                    activeOpacity={0.82}
                  >
                    <View style={styles.routineRowCopy}>
                      <Text style={styles.routineRowTitle}>{item.name}</Text>
                      <Text style={styles.routineRowMeta}>
                        {item.dayOfWeeks.length} dias · {routineExerciseCount(item)} ejercicios
                      </Text>
                    </View>
                    {selected ? (
                      <CheckCircle2 size={22} color={theme.colors.primary} />
                    ) : (
                      <ChevronRight size={18} color={theme.colors.textMuted} />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          )}

          {validationError ? (
            <Text style={styles.validationText}>{validationError}</Text>
          ) : null}

          <View style={styles.sheetImpact}>
            <Text style={styles.sheetImpactTitle}>Impacto para el cliente</Text>
            <Text style={styles.sheetImpactText}>
              La rutina seleccionada se muestra como asignacion local en esta vista. No se modifica
              historial pasado ni se llama un endpoint de asignacion.
            </Text>
          </View>

          <View style={styles.sheetActions}>
            <PrimaryButton
              label={submitting ? 'Aplicando' : confirmLabel}
              loading={submitting}
              disabled={submitting || !selectedRoutine}
              onPress={handleConfirm}
            />
            <SecondaryButton label="Cancelar" onPress={onClose} disabled={submitting} />
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
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primaryMuted,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: theme.colors.primary,
    fontSize: 24,
    fontWeight: '800',
  },
  profileCopy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  clientName: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading2.fontSize,
    lineHeight: theme.typography.heading2.lineHeight,
    fontWeight: theme.typography.heading2.fontWeight,
  },
  clientMeta: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  periods: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  metricCard: {
    flex: 1,
    minHeight: 116,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    justifyContent: 'space-between',
  },
  metricLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
  },
  metricCaption: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
  },
  assignedCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  assignedHeader: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  assignedIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assignedCopy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  assignedTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: theme.typography.bodyStrong.fontWeight,
  },
  assignedText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  assignedActions: {
    gap: theme.spacing.sm,
  },
  section: {
    gap: theme.spacing.md,
  },
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading3.fontSize,
    lineHeight: theme.typography.heading3.lineHeight,
    fontWeight: theme.typography.heading3.fontWeight,
  },
  sessionList: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
  },
  sessionRow: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  sessionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionCopy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  sessionTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: theme.typography.bodyStrong.fontWeight,
  },
  sessionDetail: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  sessionDate: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
  },
  noticeCard: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderColor: theme.colors.border,
    borderWidth: 1,
    padding: theme.spacing.lg,
  },
  noticeText: {
    flex: 1,
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  center: {
    flex: 1,
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
  },
  centerTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading2.fontSize,
    lineHeight: theme.typography.heading2.lineHeight,
    fontWeight: theme.typography.heading2.fontWeight,
    textAlign: 'center',
  },
  centerText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    textAlign: 'center',
  },
  stateIcon: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  stateCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
  },
  stateCardText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    textAlign: 'center',
  },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '88%',
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
    gap: theme.spacing.md,
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
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentRoutineCard: {
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  currentRoutineLabel: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    textTransform: 'uppercase',
  },
  currentRoutineTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: theme.typography.bodyStrong.fontWeight,
  },
  searchBox: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surfaceElevated,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
  },
  sheetState: {
    minHeight: 150,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
  },
  sheetStateText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    textAlign: 'center',
  },
  routineList: {
    maxHeight: 260,
  },
  routineListContent: {
    gap: theme.spacing.sm,
  },
  routineRow: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
  },
  routineRowSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryMuted,
  },
  routineRowCopy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  routineRowTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: theme.typography.bodyStrong.fontWeight,
  },
  routineRowMeta: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  validationText: {
    color: theme.colors.error,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  sheetImpact: {
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  sheetImpactTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    fontWeight: '700',
  },
  sheetImpactText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
  },
  sheetActions: {
    gap: theme.spacing.md,
  },
});

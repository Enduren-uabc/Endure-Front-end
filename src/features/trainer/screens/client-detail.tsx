import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  AlertCircle,
  CalendarDays,
  ChevronRight,
  Dumbbell,
  Lock,
  MoreHorizontal,
  Ruler,
  Sparkles,
  TrendingUp,
} from 'lucide-react-native';
import { BaseCard } from '@/components/ui/BaseCard';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { useLinkedClients } from '@/features/trainer-link/hooks/use-trainer-link';
import {
  TrainingV2ProgressBar,
  TrainingV2Screen,
  TrainingV2SectionHeader,
  TrainingV2Tag,
} from '@/features/training/screens/v2/TrainingV2Primitives';
import { theme } from '@/theme';
import type { TrainerClientsStackParamList } from '@/navigation/types';
import { useTrainerClientAssignmentsStore } from '../stores/trainer-client-assignments.store';
import type { TrainerClientMetric } from '../types/trainer-clients';
import {
  buildClientMeasurements,
  buildClientMetrics,
  buildClientSessions,
  buildTrainerClientViewModel,
} from './trainer-clients.mock';

type Props = NativeStackScreenProps<TrainerClientsStackParamList, 'ClientDetail'>;

export default function ClientDetailScreen({ navigation, route }: Props) {
  const linkedClients = useLinkedClients();
  const params = route.params;
  const assignment = useTrainerClientAssignmentsStore(
    (state) => state.assignmentsByLinkId[params.linkId],
  );
  const client = React.useMemo(() => buildTrainerClientViewModel(params), [params]);
  const metrics = React.useMemo(() => buildClientMetrics(client), [client]);
  const sessions = React.useMemo(() => buildClientSessions(client, '30d').slice(0, 3), [client]);
  const measurements = React.useMemo(() => buildClientMeasurements(client), [client]);
  const isStillLinked =
    linkedClients.data?.items.some((item) => item.linkId === params.linkId) ?? true;

  const openAssignRoutine = () => navigation.navigate('AssignRoutine', params);
  const openProgress = () => navigation.navigate('ClientProgress', params);

  if (linkedClients.isLoading) {
    return (
      <CenteredState
        icon={<ActivityIndicator color={theme.colors.primary} size="large" />}
        title="Cargando cliente"
        description="Estamos preparando el detalle del cliente vinculado."
      />
    );
  }

  if (linkedClients.isError) {
    return (
      <CenteredState
        icon={<AlertCircle size={38} color={theme.colors.error} />}
        title="No pudimos cargar el detalle"
        description="Revisa tu conexion e intenta de nuevo."
        actionLabel="Reintentar"
        onAction={() => linkedClients.refetch()}
      />
    );
  }

  if (!isStillLinked) {
    return (
      <CenteredState
        icon={<Lock size={38} color={theme.colors.warning} />}
        title="Cliente no vinculado"
        description="Solo puedes revisar clientes vinculados actualmente."
        actionLabel="Volver"
        onAction={() => navigation.goBack()}
      />
    );
  }

  return (
    <TrainingV2Screen
      title={client.clientName}
      subtitle={`${client.goal} - ${client.experience} - ${client.ageLabel}`}
      titleColor={theme.colors.textPrimary}
      onBack={() => navigation.goBack()}
    >
      <BaseCard style={styles.heroCard}>
        <View style={styles.heroTop}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{client.initials}</Text>
          </View>
          <View style={styles.heroCopy}>
            <Text style={styles.heroName}>{client.clientName}</Text>
            <Text style={styles.heroMeta}>Ultimo entrenamiento: {client.lastWorkoutLabel}</Text>
          </View>
          <TouchableOpacity style={styles.iconButton} activeOpacity={0.78}>
            <MoreHorizontal size={22} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
        <View style={styles.tags}>
          <TrainingV2Tag label={client.status === 'active' ? 'Activo' : 'Inactivo'} tone={client.status === 'active' ? 'success' : 'default'} />
          <TrainingV2Tag label={`${client.streakDays} dias de racha`} />
          <TrainingV2Tag label={`Adherencia ${client.adherence}%`} tone="primary" />
        </View>
        <TrainingV2ProgressBar
          progress={client.adherence / 100}
          label="Adherencia del periodo actual"
        />
      </BaseCard>

      <View style={styles.metricGrid}>
        {metrics.map((metric) => (
          <MetricCard key={metric.id} metric={metric} />
        ))}
      </View>

      <BaseCard style={styles.assignmentCard}>
        <View style={styles.cardHeader}>
          <View style={styles.cardIcon}>
            <Dumbbell size={22} color={theme.colors.primary} />
          </View>
          <View style={styles.cardCopy}>
            <Text style={styles.cardTitle}>Rutina asignada</Text>
            <Text style={styles.cardText}>
              {assignment
                ? `${assignment.routineName} - ${assignment.days.join(', ')}`
                : 'Este cliente aun no tiene una rutina asignada desde esta vista.'}
            </Text>
          </View>
        </View>
        {assignment ? (
          <View style={styles.assignmentMeta}>
            <CalendarDays size={16} color={theme.colors.textSecondary} />
            <Text style={styles.assignmentMetaText}>
              Asignada localmente el {formatDate(assignment.assignedAt)}
            </Text>
          </View>
        ) : null}
        <View style={styles.actions}>
          <PrimaryButton
            label={assignment ? 'Reemplazar rutina' : 'Asignar rutina'}
            onPress={openAssignRoutine}
            icon={<Dumbbell size={18} color={theme.colors.background} />}
          />
          <SecondaryButton label="Ver progreso completo" onPress={openProgress} />
        </View>
      </BaseCard>

      <TrainingV2SectionHeader title="Historial reciente" actionLabel="Ver todo" onAction={openProgress} />
      <BaseCard style={styles.listCard}>
        {sessions.map((session) => (
          <TouchableOpacity
            key={session.id}
            style={styles.historyRow}
            activeOpacity={0.78}
            onPress={openProgress}
          >
            <View style={styles.rowIcon}>
              <TrendingUp size={18} color={theme.colors.primary} />
            </View>
            <View style={styles.rowCopy}>
              <Text style={styles.rowTitle}>{session.routineName}</Text>
              <Text style={styles.rowText}>{session.detail}</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={styles.rowDate}>{session.dateLabel}</Text>
              <ChevronRight size={18} color={theme.colors.textMuted} />
            </View>
          </TouchableOpacity>
        ))}
      </BaseCard>

      <TrainingV2SectionHeader title="Mediciones" />
      <View style={styles.measureGrid}>
        {measurements.map((measurement) => (
          <BaseCard key={measurement.id} style={styles.measureCard}>
            <Ruler size={18} color={theme.colors.textSecondary} />
            <Text style={styles.measureLabel}>{measurement.label}</Text>
            <Text style={styles.measureValue}>{measurement.value}</Text>
            <Text style={styles.measureHelper}>{measurement.helper}</Text>
          </BaseCard>
        ))}
      </View>

      <BaseCard style={styles.noticeCard}>
        <Sparkles size={18} color={theme.colors.primary} />
        <Text style={styles.noticeText}>
          Datos de progreso, objetivo y mediciones son placeholders locales aislados para preparar
          el flujo visual. No se modifica ningun contrato API.
        </Text>
      </BaseCard>
    </TrainingV2Screen>
  );
}

function MetricCard({ metric }: { metric: TrainerClientMetric }) {
  const color =
    metric.tone === 'success'
      ? theme.colors.success
      : metric.tone === 'warning'
        ? theme.colors.warning
        : theme.colors.primary;

  return (
    <BaseCard style={styles.metricCard}>
      <Text style={styles.metricLabel}>{metric.label}</Text>
      <Text style={[styles.metricValue, { color }]}>{metric.value}</Text>
      <Text style={styles.metricHelper}>{metric.helper}</Text>
    </BaseCard>
  );
}

function CenteredState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <TrainingV2Screen title="Clientes" titleColor={theme.colors.textPrimary}>
      <BaseCard style={styles.centerCard}>
        <View style={styles.centerIcon}>{icon}</View>
        <Text style={styles.centerTitle}>{title}</Text>
        <Text style={styles.centerText}>{description}</Text>
        {actionLabel && onAction ? (
          <PrimaryButton label={actionLabel} onPress={onAction} />
        ) : null}
      </BaseCard>
    </TrainingV2Screen>
  );
}

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

const styles = StyleSheet.create({
  heroCard: {
    gap: theme.spacing.md,
    backgroundColor: theme.colors.surfaceElevated,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  avatar: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: theme.colors.primaryMuted,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: theme.colors.primary,
    fontSize: 22,
    fontWeight: '800',
  },
  heroCopy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  heroName: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading2.fontSize,
    lineHeight: theme.typography.heading2.lineHeight,
    fontWeight: theme.typography.heading2.fontWeight,
  },
  heroMeta: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  metricGrid: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  metricCard: {
    flex: 1,
    minHeight: 112,
    padding: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  metricLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
  },
  metricValue: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
  },
  metricHelper: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
  },
  assignmentCard: {
    gap: theme.spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardCopy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  cardTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: theme.typography.bodyStrong.fontWeight,
  },
  cardText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  assignmentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    minHeight: 32,
  },
  assignmentMetaText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
  },
  actions: {
    gap: theme.spacing.sm,
  },
  listCard: {
    padding: 0,
    overflow: 'hidden',
  },
  historyRow: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowCopy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  rowTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: theme.typography.bodyStrong.fontWeight,
  },
  rowText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  rowRight: {
    minWidth: 76,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: theme.spacing.xs,
  },
  rowDate: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    textAlign: 'right',
  },
  measureGrid: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  measureCard: {
    flex: 1,
    padding: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  measureLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
  },
  measureValue: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading3.fontSize,
    lineHeight: theme.typography.heading3.lineHeight,
    fontWeight: theme.typography.heading3.fontWeight,
  },
  measureHelper: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
  },
  noticeCard: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  noticeText: {
    flex: 1,
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  centerCard: {
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.xxl,
  },
  centerIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  centerTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading3.fontSize,
    lineHeight: theme.typography.heading3.lineHeight,
    fontWeight: theme.typography.heading3.fontWeight,
    textAlign: 'center',
  },
  centerText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    textAlign: 'center',
  },
});

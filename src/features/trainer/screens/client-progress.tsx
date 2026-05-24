import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AlertCircle, BarChart3, Clock, Lock, TrendingUp } from 'lucide-react-native';
import { BaseCard } from '@/components/ui/BaseCard';
import { Chip } from '@/components/ui/Chip';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useLinkedClients } from '@/features/trainer-link/hooks/use-trainer-link';
import {
  TrainingV2ProgressBar,
  TrainingV2Screen,
  TrainingV2SectionHeader,
} from '@/features/training/screens/v2/TrainingV2Primitives';
import { theme } from '@/theme';
import type { TrainerClientsStackParamList } from '@/navigation/types';
import type { ClientProgressPeriod, TrainerClientMetric } from '../types/trainer-clients';
import {
  buildClientMeasurements,
  buildClientMetrics,
  buildClientSessions,
  buildTrainerClientViewModel,
} from './trainer-clients.mock';

type Props = NativeStackScreenProps<TrainerClientsStackParamList, 'ClientProgress'>;

const PERIODS: { key: ClientProgressPeriod; label: string }[] = [
  { key: '7d', label: '7 dias' },
  { key: '30d', label: '30 dias' },
  { key: '90d', label: '90 dias' },
];


export default function ClientProgressScreen({ navigation, route }: Props) {
  const [period, setPeriod] = React.useState<ClientProgressPeriod>('30d');
  const linkedClients = useLinkedClients();
  const client = React.useMemo(() => buildTrainerClientViewModel(route.params), [route.params]);
  const metrics = React.useMemo(() => buildClientMetrics(client), [client]);
  const sessions = React.useMemo(() => buildClientSessions(client, period), [client, period]);
  const measurements = React.useMemo(() => buildClientMeasurements(client), [client]);
  const isStillLinked =
    linkedClients.data?.items.some((item) => item.linkId === route.params.linkId) ?? true;

  const isLoading = linkedClients.isLoading;
  const isError = linkedClients.isError;

  if (isLoading) {
    return (
      <CenteredState
        icon={<ActivityIndicator color={theme.colors.primary} size="large" />}
        title="Cargando historial"
        description="Estamos preparando la vista de progreso del cliente."
      />
    );
  }

  if (isError) {
    return (
      <CenteredState
        icon={<AlertCircle size={38} color={theme.colors.error} />}
        title="No pudimos cargar el progreso"
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
        title="Acceso no disponible"
        description="Solo puedes revisar progreso de clientes vinculados actualmente."
        actionLabel="Volver"
        onAction={() => navigation.goBack()}
      />
    );
  }

  return (
    <TrainingV2Screen
      title="Progreso"
      subtitle={client.clientName}
      titleColor={theme.colors.textPrimary}
      onBack={() => navigation.goBack()}
    >
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

      <View style={styles.metricGrid}>
        {metrics.map((metric) => (
          <MetricCard key={metric.id} metric={metric} />
        ))}
      </View>

      <BaseCard style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <View style={styles.summaryIcon}>
            <BarChart3 size={22} color={theme.colors.primary} />
          </View>
          <View style={styles.summaryCopy}>
            <Text style={styles.summaryTitle}>Adherencia del periodo</Text>
            <Text style={styles.summaryText}>
              {client.status === 'active'
                ? 'El cliente mantiene una frecuencia estable y suficiente para progresar.'
                : 'El cliente necesita seguimiento por baja actividad reciente.'}
            </Text>
          </View>
        </View>
        <TrainingV2ProgressBar progress={client.adherence / 100} label={`${client.adherence}% completado`} />
      </BaseCard>

      <TrainingV2SectionHeader title="Historial de entrenamientos" />
      {sessions.length > 0 ? (
        <BaseCard style={styles.sessionList}>
          {sessions.map((session) => (
            <View key={session.id} style={styles.sessionRow}>
              <View style={styles.sessionIcon}>
                <TrendingUp size={18} color={theme.colors.primary} />
              </View>
              <View style={styles.sessionCopy}>
                <Text style={styles.sessionTitle}>{session.routineName}</Text>
                <Text style={styles.sessionDetail}>{session.detail}</Text>
                <Text style={styles.sessionMeta}>
                  {session.volumeLabel} - {session.completionLabel}
                </Text>
              </View>
              <Text style={styles.sessionDate}>{session.dateLabel}</Text>
            </View>
          ))}
        </BaseCard>
      ) : (
        <BaseCard style={styles.emptyCard}>
          <Clock size={32} color={theme.colors.textMuted} />
          <Text style={styles.emptyTitle}>Sin historial en este periodo</Text>
          <Text style={styles.emptyText}>Cuando el cliente complete entrenamientos apareceran aqui.</Text>
        </BaseCard>
      )}

      <TrainingV2SectionHeader title="Mediciones recientes" />
      <View style={styles.measureGrid}>
        {measurements.map((measurement) => (
          <BaseCard key={measurement.id} style={styles.measureCard}>
            <Text style={styles.measureLabel}>{measurement.label}</Text>
            <Text style={styles.measureValue}>{measurement.value}</Text>
            <Text style={styles.measureHelper}>{measurement.helper}</Text>
          </BaseCard>
        ))}
      </View>

      <BaseCard style={styles.noticeCard}>
        <Text style={styles.noticeTitle}>Historial preliminar</Text>
        <Text style={styles.noticeText}>
          Esta pantalla esta lista para conectarse a progreso real. Por ahora usa datos locales
          aislados del modulo de entrenador.
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
    <TrainingV2Screen title="Progreso" titleColor={theme.colors.textPrimary}>
      <BaseCard style={styles.centerCard}>
        <View style={styles.centerIcon}>{icon}</View>
        <Text style={styles.centerTitle}>{title}</Text>
        <Text style={styles.centerText}>{description}</Text>
        {actionLabel && onAction ? <PrimaryButton label={actionLabel} onPress={onAction} /> : null}
      </BaseCard>
    </TrainingV2Screen>
  );
}

const styles = StyleSheet.create({
  periods: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
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
  summaryCard: {
    gap: theme.spacing.md,
    backgroundColor: theme.colors.surfaceElevated,
  },
  summaryHeader: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  summaryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCopy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  summaryTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: theme.typography.bodyStrong.fontWeight,
  },
  summaryText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  sessionList: {
    padding: 0,
    overflow: 'hidden',
  },
  sessionRow: {
    minHeight: 86,
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
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceElevated,
  },
  sessionCopy: {
    flex: 1,
    gap: 2,
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
  sessionMeta: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
  },
  sessionDate: {
    width: 68,
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    textAlign: 'right',
  },
  emptyCard: {
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.xl,
  },
  emptyTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading3.fontSize,
    lineHeight: theme.typography.heading3.lineHeight,
    fontWeight: theme.typography.heading3.fontWeight,
    textAlign: 'center',
  },
  emptyText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    textAlign: 'center',
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
    gap: theme.spacing.xs,
  },
  noticeTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    fontWeight: '700',
  },
  noticeText: {
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

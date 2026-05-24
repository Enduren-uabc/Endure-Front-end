import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import {
  AlertCircle,
  CalendarDays,
  ChevronRight,
  Dumbbell,
  Inbox,
  TrendingUp,
  UsersRound,
} from 'lucide-react-native';
import { BaseCard } from '@/components/ui/BaseCard';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import {
  TrainingV2ProgressBar,
  TrainingV2Screen,
  TrainingV2SectionHeader,
} from '@/features/training/screens/v2/TrainingV2Primitives';
import { theme } from '@/theme';
import { useLinkedClients, useReceivedLinkRequests } from '@/features/trainer-link/hooks/use-trainer-link';
import type {
  TrainerDrawerParamList,
  TrainerTabsParamList,
} from '../types/trainer-navigation.types';
import { useTrainerClientAssignmentsStore } from '../stores/trainer-client-assignments.store';
import {
  buildClientSessions,
  buildTrainerClientViewModel,
} from './trainer-clients.mock';

type TrainerDashboardNavigation = NavigationProp<TrainerTabsParamList>;

export default function TrainerDashboardScreen() {
  const navigation = useNavigation<TrainerDashboardNavigation>();
  const drawerNavigation = navigation.getParent<NavigationProp<TrainerDrawerParamList>>();
  const linkedClients = useLinkedClients();
  const pendingRequests = useReceivedLinkRequests('pendiente');
  const assignmentsByLinkId = useTrainerClientAssignmentsStore((state) => state.assignmentsByLinkId);

  const clients = React.useMemo(
    () => (linkedClients.data?.items ?? []).map(buildTrainerClientViewModel),
    [linkedClients.data?.items],
  );
  const pendingCount = pendingRequests.data?.items.length ?? 0;
  const activeClients = clients.filter((client) => client.status === 'active');
  const assignmentCount = Object.keys(assignmentsByLinkId).length;
  const averageAdherence =
    clients.length > 0
      ? Math.round(clients.reduce((total, client) => total + client.adherence, 0) / clients.length)
      : 0;
  const recentActivity = clients
    .flatMap((client) =>
      buildClientSessions(client, '30d').slice(0, 1).map((session) => ({
        client,
        session,
      })),
    )
    .slice(0, 4);

  const openRequests = () =>
    drawerNavigation?.navigate('TrainerLinkStack', { screen: 'ReceivedRequests' });

  const openClient = (client: (typeof clients)[number]) => {
    navigation.navigate('Clients', {
      screen: 'ClientDetail',
      params: {
        clientId: client.clientId,
        clientName: client.clientName,
        linkId: client.linkId,
        activatedAt: client.activatedAt,
      },
    });
  };

  if (linkedClients.isLoading || pendingRequests.isLoading) {
    return (
      <TrainingV2Screen title="Inicio" subtitle="Preparando panel entrenador.">
        <BaseCard style={styles.centerCard}>
          <ActivityIndicator color={theme.colors.primary} />
          <Text style={styles.centerTitle}>Cargando actividad</Text>
          <Text style={styles.centerText}>Estamos revisando solicitudes, clientes y rutinas.</Text>
        </BaseCard>
      </TrainingV2Screen>
    );
  }

  if (linkedClients.isError && pendingRequests.isError) {
    return (
      <TrainingV2Screen title="Inicio">
        <BaseCard style={styles.centerCard}>
          <AlertCircle size={34} color={theme.colors.error} />
          <Text style={styles.centerTitle}>No pudimos cargar el panel</Text>
          <Text style={styles.centerText}>Revisa tu conexion e intenta nuevamente.</Text>
          <PrimaryButton
            label="Reintentar"
            onPress={() => {
              void linkedClients.refetch();
              void pendingRequests.refetch();
            }}
          />
        </BaseCard>
      </TrainingV2Screen>
    );
  }

  return (
    <TrainingV2Screen
      title="Inicio"
      subtitle="Domingo, 24 de mayo - Panel entrenador"
    >
      <BaseCard style={styles.pendingCard}>
        <View style={styles.pendingHeader}>
          <View style={styles.pendingIcon}>
            <Inbox size={24} color={theme.colors.primary} />
          </View>
          <View style={styles.pendingCopy}>
            <Text style={styles.pendingValue}>{pendingCount}</Text>
            <Text style={styles.pendingTitle}>
              {pendingCount === 1 ? 'cliente espera respuesta' : 'clientes esperan respuesta'}
            </Text>
            <Text style={styles.pendingText}>
              {pendingCount > 0
                ? 'Revisa solicitudes pendientes antes de asignar nuevas rutinas.'
                : 'Sin solicitudes pendientes por ahora.'}
            </Text>
          </View>
        </View>
        {pendingCount > 0 ? (
          <SecondaryButton label="Ver solicitudes" onPress={openRequests} />
        ) : null}
      </BaseCard>

      <View style={styles.metricGrid}>
        <MetricCard
          icon={<UsersRound size={20} color={theme.colors.success} />}
          label="Clientes activos"
          value={String(activeClients.length)}
          helper={`${clients.length} vinculados`}
        />
        <MetricCard
          icon={<Dumbbell size={20} color={theme.colors.primary} />}
          label="Rutinas asignadas"
          value={String(assignmentCount)}
          helper="Esta semana"
        />
        <MetricCard
          icon={<TrendingUp size={20} color={theme.colors.warning} />}
          label="Adherencia"
          value={`${averageAdherence}%`}
          helper="Promedio"
        />
      </View>

      <BaseCard style={styles.adherenceCard}>
        <View style={styles.adherenceHeader}>
          <CalendarDays size={20} color={theme.colors.primary} />
          <Text style={styles.adherenceTitle}>Actividad de clientes</Text>
        </View>
        <TrainingV2ProgressBar
          progress={averageAdherence / 100}
          label={clients.length > 0 ? 'Promedio del grupo vinculado' : 'Sin clientes para calcular'}
        />
      </BaseCard>

      <TrainingV2SectionHeader
        title="Actividad reciente"
        actionLabel="Ver clientes"
        onAction={() => navigation.navigate('Clients', { screen: 'ClientsList' })}
      />

      {recentActivity.length === 0 ? (
        <BaseCard style={styles.centerCard}>
          <UsersRound size={34} color={theme.colors.textMuted} />
          <Text style={styles.centerTitle}>Sin actividad reciente</Text>
          <Text style={styles.centerText}>
            Cuando tus clientes completen entrenamientos, apareceran aqui.
          </Text>
        </BaseCard>
      ) : (
        <BaseCard style={styles.activityList}>
          {recentActivity.map(({ client, session }) => (
            <TouchableOpacity
              key={`${client.linkId}-${session.id}`}
              activeOpacity={0.78}
              style={styles.activityRow}
              onPress={() => openClient(client)}
              accessibilityRole="button"
              accessibilityLabel={`Abrir detalle de ${client.clientName}`}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{client.initials}</Text>
              </View>
              <View style={styles.activityCopy}>
                <Text style={styles.activityName}>{client.clientName}</Text>
                <Text style={styles.activityText}>{session.routineName}</Text>
                <Text style={styles.activityMeta}>{session.dateLabel} - {session.completionLabel}</Text>
              </View>
              <ChevronRight size={20} color={theme.colors.textMuted} />
            </TouchableOpacity>
          ))}
        </BaseCard>
      )}
    </TrainingV2Screen>
  );
}

function MetricCard({
  icon,
  label,
  value,
  helper,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <BaseCard style={styles.metricCard}>
      {icon}
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricHelper}>{helper}</Text>
    </BaseCard>
  );
}

const styles = StyleSheet.create({
  pendingCard: {
    gap: theme.spacing.md,
    backgroundColor: theme.colors.surfaceElevated,
  },
  pendingHeader: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  pendingIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingCopy: {
    flex: 1,
    gap: 2,
  },
  pendingValue: {
    color: theme.colors.textPrimary,
    fontSize: 46,
    lineHeight: 52,
    fontWeight: '800',
  },
  pendingTitle: {
    color: theme.colors.primary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: theme.typography.bodyStrong.fontWeight,
  },
  pendingText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  metricGrid: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  metricCard: {
    flex: 1,
    minHeight: 122,
    padding: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  metricValue: {
    color: theme.colors.textPrimary,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800',
  },
  metricLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    fontWeight: '700',
  },
  metricHelper: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
  },
  adherenceCard: {
    gap: theme.spacing.md,
  },
  adherenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  adherenceTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: theme.typography.bodyStrong.fontWeight,
  },
  activityList: {
    padding: 0,
    overflow: 'hidden',
  },
  activityRow: {
    minHeight: 82,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: theme.colors.primaryMuted,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '800',
  },
  activityCopy: {
    flex: 1,
    gap: 2,
  },
  activityName: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: theme.typography.bodyStrong.fontWeight,
  },
  activityText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  activityMeta: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
  },
  centerCard: {
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.xl,
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

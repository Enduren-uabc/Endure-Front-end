import React from 'react';
import {
  ActivityIndicator,
  FlatList,
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
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  AlertCircle,
  CalendarDays,
  ChevronRight,
  Clock3,
  Search,
  UserPlus,
  UsersRound,
} from 'lucide-react-native';
import { BaseCard } from '@/components/ui/BaseCard';
import { Chip } from '@/components/ui/Chip';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { useLinkedClients, useReceivedLinkRequests } from '@/features/trainer-link/hooks/use-trainer-link';
import type { LinkRequest } from '@/features/trainer-link/types/trainer-link';
import { theme } from '@/theme';
import type { TrainerClientsStackParamList } from '@/navigation/types';
import type { TrainerDrawerParamList } from '../types/trainer-navigation.types';
import { useTrainerClientAssignmentsStore } from '../stores/trainer-client-assignments.store';
import type { TrainerClientFilter, TrainerClientViewModel } from '../types/trainer-clients';
import { buildTrainerClientViewModel } from './trainer-clients.mock';

const FILTERS: { key: TrainerClientFilter; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'active', label: 'Activos' },
  { key: 'inactive', label: 'Inactivos' },
  { key: 'pending', label: 'Pendientes' },
];

export default function TrainerClientsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<TrainerClientsStackParamList, 'ClientsList'>>();
  const drawerNavigation = navigation.getParent()?.getParent<NavigationProp<TrainerDrawerParamList>>();
  const clientsQuery = useLinkedClients();
  const pendingRequests = useReceivedLinkRequests('pendiente');
  const assignmentsByLinkId = useTrainerClientAssignmentsStore((state) => state.assignmentsByLinkId);
  const [selectedFilter, setSelectedFilter] = React.useState<TrainerClientFilter>('all');
  const [search, setSearch] = React.useState('');

  const clients = React.useMemo(
    () => (clientsQuery.data?.items ?? []).map(buildTrainerClientViewModel),
    [clientsQuery.data?.items],
  );
  const pendingItems = pendingRequests.data?.items ?? [];
  const activeCount = clients.filter((client) => client.status === 'active').length;
  const inactiveCount = clients.filter((client) => client.status === 'inactive').length;
  const normalizedSearch = search.trim().toLowerCase();
  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.clientName.toLowerCase().includes(normalizedSearch) ||
      client.goal.toLowerCase().includes(normalizedSearch);
    const matchesFilter =
      selectedFilter === 'all' ||
      (selectedFilter === 'active' && client.status === 'active') ||
      (selectedFilter === 'inactive' && client.status === 'inactive');

    return matchesSearch && matchesFilter;
  });

  const openReceivedRequests = () =>
    drawerNavigation?.navigate('TrainerLinkStack', { screen: 'ReceivedRequests' });

  const refresh = () => {
    clientsQuery.refetch();
    pendingRequests.refetch();
  };

  if (clientsQuery.isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.container}>
          <Header total={0} pendingCount={0} />
          <ClientSkeletonList />
        </View>
      </SafeAreaView>
    );
  }

  if (clientsQuery.isError) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.container}>
          <Header total={0} pendingCount={pendingItems.length} />
          <StateCard
            icon={<AlertCircle size={34} color={theme.colors.error} />}
            title="No pudimos cargar tus clientes"
            description="Revisa tu conexion e intenta nuevamente."
            actionLabel="Reintentar"
            onAction={() => clientsQuery.refetch()}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <Header total={clientsQuery.data?.total ?? clients.length} pendingCount={pendingItems.length} />

        <View style={styles.statsRow}>
          <StatCard label="Activos" value={String(activeCount)} tone="success" />
          <StatCard label="Inactivos" value={String(inactiveCount)} tone="warning" />
          <StatCard label="Pendientes" value={String(pendingItems.length)} tone="primary" />
        </View>

        <View style={styles.searchBox}>
          <Search size={20} color={theme.colors.textMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar cliente u objetivo"
            placeholderTextColor={theme.colors.textMuted}
            selectionColor={theme.colors.primary}
            style={styles.searchInput}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTERS.map((filter) => (
            <Chip
              key={filter.key}
              label={
                filter.key === 'pending' && pendingItems.length > 0
                  ? `${filter.label} ${pendingItems.length}`
                  : filter.label
              }
              selected={selectedFilter === filter.key}
              onPress={() => setSelectedFilter(filter.key)}
            />
          ))}
        </ScrollView>

        {selectedFilter === 'pending' ? (
          <PendingRequestsList
            pendingItems={pendingItems}
            isLoading={pendingRequests.isLoading}
            isError={pendingRequests.isError}
            onRefresh={refresh}
            refreshing={clientsQuery.isRefetching || pendingRequests.isRefetching}
            onOpenRequests={openReceivedRequests}
            onRetry={() => pendingRequests.refetch()}
          />
        ) : (
          <FlatList
            data={filteredClients}
            keyExtractor={(item) => item.linkId}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                tintColor={theme.colors.primary}
                refreshing={clientsQuery.isRefetching || pendingRequests.isRefetching}
                onRefresh={refresh}
              />
            }
            ListEmptyComponent={
              <StateCard
                icon={<UsersRound size={34} color={theme.colors.textMuted} />}
                title={clients.length === 0 ? 'Aun no tienes clientes' : 'Sin resultados'}
                description={
                  clients.length === 0
                    ? 'Los clientes apareceran aqui cuando aceptes solicitudes de vinculacion.'
                    : 'Prueba con otro nombre, objetivo o filtro.'
                }
                actionLabel={pendingItems.length > 0 ? 'Ver solicitudes' : undefined}
                onAction={pendingItems.length > 0 ? openReceivedRequests : undefined}
              />
            }
            renderItem={({ item }) => (
              <ClientRow
                client={item}
                assignedRoutineName={assignmentsByLinkId[item.linkId]?.routineName}
                onPress={() =>
                  navigation.navigate('ClientDetail', {
                    clientId: item.clientId,
                    clientName: item.clientName,
                    linkId: item.linkId,
                    activatedAt: item.activatedAt,
                  })
                }
              />
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

function Header({ total, pendingCount }: { total: number; pendingCount: number }) {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.headerTitle}>Clientes</Text>
        <Text style={styles.headerSubtitle}>
          {total} cliente{total === 1 ? '' : 's'} vinculado{total === 1 ? '' : 's'}
          {pendingCount > 0 ? ` - ${pendingCount} pendiente${pendingCount === 1 ? '' : 's'}` : ''}
        </Text>
      </View>
    </View>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'primary' | 'success' | 'warning';
}) {
  const color =
    tone === 'success' ? theme.colors.success : tone === 'warning' ? theme.colors.warning : theme.colors.primary;

  return (
    <BaseCard style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={[styles.statLabel, { color }]}>{label}</Text>
    </BaseCard>
  );
}

function ClientRow({
  client,
  assignedRoutineName,
  onPress,
}: {
  client: TrainerClientViewModel;
  assignedRoutineName?: string;
  onPress: () => void;
}) {
  const statusColor = client.status === 'active' ? theme.colors.success : theme.colors.warning;

  return (
    <TouchableOpacity
      style={styles.clientCard}
      activeOpacity={0.82}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Abrir detalle de ${client.clientName}`}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{client.initials}</Text>
      </View>
      <View style={styles.clientCopy}>
        <View style={styles.clientTitleRow}>
          <Text style={styles.clientName}>{client.clientName}</Text>
          <View style={[styles.statusBadge, { borderColor: statusColor }]}>
            <Text style={[styles.statusBadgeText, { color: statusColor }]}>
              {client.status === 'active' ? 'Activo' : 'Inactivo'}
            </Text>
          </View>
        </View>
        <Text style={styles.clientMeta}>Ultimo entrenamiento: {client.lastWorkoutLabel}</Text>
        <Text style={styles.clientHint}>
          {assignedRoutineName ? `Rutina: ${assignedRoutineName}` : `${client.goal} - ${client.experience}`}
        </Text>
      </View>
      <View style={styles.clientRight}>
        {client.status === 'active' ? (
          <Text style={styles.streakText}>{client.streakDays}d</Text>
        ) : (
          <Clock3 size={18} color={theme.colors.warning} />
        )}
        <ChevronRight size={20} color={theme.colors.textMuted} />
      </View>
    </TouchableOpacity>
  );
}

function PendingRequestsList({
  pendingItems,
  isLoading,
  isError,
  refreshing,
  onRefresh,
  onOpenRequests,
  onRetry,
}: {
  pendingItems: LinkRequest[];
  isLoading: boolean;
  isError: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onOpenRequests: () => void;
  onRetry: () => void;
}) {
  if (isLoading) {
    return (
      <View style={styles.pendingState}>
        <ActivityIndicator color={theme.colors.primary} />
        <Text style={styles.pendingStateText}>Cargando solicitudes...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <StateCard
        icon={<AlertCircle size={34} color={theme.colors.error} />}
        title="No pudimos cargar solicitudes"
        description="Intenta nuevamente para revisar clientes pendientes."
        actionLabel="Reintentar"
        onAction={onRetry}
      />
    );
  }

  return (
    <FlatList
      data={pendingItems}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
      refreshControl={
        <RefreshControl tintColor={theme.colors.primary} refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListEmptyComponent={
        <StateCard
          icon={<UserPlus size={34} color={theme.colors.textMuted} />}
          title="Sin solicitudes pendientes"
          description="Cuando un cliente solicite vincularse contigo, aparecera aqui."
        />
      }
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.pendingCard} activeOpacity={0.82} onPress={onOpenRequests}>
          <View style={styles.pendingAvatar}>
            <Text style={styles.pendingAvatarText}>{item.clientName.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.pendingCopy}>
            <Text style={styles.pendingName}>{item.clientName}</Text>
            <Text style={styles.pendingMeta}>Solicitud del {formatDate(item.createdAt)}</Text>
            {item.message ? <Text style={styles.pendingMessage}>{item.message}</Text> : null}
          </View>
          <ChevronRight size={20} color={theme.colors.textMuted} />
        </TouchableOpacity>
      )}
      ListFooterComponent={
        pendingItems.length > 0 ? (
          <SecondaryButton label="Abrir solicitudes" onPress={onOpenRequests} style={styles.pendingButton} />
        ) : null
      }
    />
  );
}

function StateCard({
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
    <BaseCard style={styles.stateCard}>
      <View style={styles.stateIcon}>{icon}</View>
      <Text style={styles.stateTitle}>{title}</Text>
      <Text style={styles.stateDescription}>{description}</Text>
      {actionLabel && onAction ? (
        <PrimaryButton label={actionLabel} onPress={onAction} style={styles.stateAction} />
      ) : null}
    </BaseCard>
  );
}

function ClientSkeletonList() {
  return (
    <View style={styles.skeletonList}>
      {Array.from({ length: 4 }, (_, index) => (
        <View key={`trainer-client-skeleton-${index}`} style={styles.skeletonCard}>
          <View style={styles.skeletonAvatar} />
          <View style={styles.skeletonCopy}>
            <View style={styles.skeletonLineLarge} />
            <View style={styles.skeletonLine} />
            <View style={styles.skeletonLineSmall} />
          </View>
        </View>
      ))}
    </View>
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
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  header: {
    minHeight: 64,
    justifyContent: 'center',
  },
  headerTitle: {
    color: theme.colors.primary,
    fontSize: theme.typography.heading1.fontSize,
    lineHeight: theme.typography.heading1.lineHeight,
    fontWeight: theme.typography.heading1.fontWeight,
  },
  headerSubtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
  },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  statCard: {
    flex: 1,
    minHeight: 82,
    padding: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  statValue: {
    color: theme.colors.textPrimary,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    fontWeight: '700',
  },
  searchBox: {
    minHeight: 52,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceElevated,
    paddingHorizontal: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    paddingVertical: theme.spacing.sm,
  },
  filterRow: {
    gap: theme.spacing.sm,
    paddingRight: theme.spacing.xl,
  },
  listContent: {
    gap: theme.spacing.md,
    paddingBottom: 120,
  },
  clientCard: {
    minHeight: 96,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.primaryMuted,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: theme.colors.primary,
    fontSize: 17,
    fontWeight: '800',
  },
  clientCopy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  clientTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  clientName: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: theme.typography.bodyStrong.fontWeight,
  },
  statusBadge: {
    minHeight: 24,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadgeText: {
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    fontWeight: '700',
  },
  clientMeta: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  clientHint: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
  },
  clientRight: {
    minWidth: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: theme.spacing.xs,
  },
  streakText: {
    color: theme.colors.success,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    fontWeight: '800',
  },
  pendingCard: {
    minHeight: 96,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  pendingAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingAvatarText: {
    color: theme.colors.primary,
    fontSize: 17,
    fontWeight: '800',
  },
  pendingCopy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  pendingName: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: theme.typography.bodyStrong.fontWeight,
  },
  pendingMeta: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  pendingMessage: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
  },
  pendingButton: {
    marginTop: theme.spacing.sm,
  },
  pendingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
  },
  pendingStateText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
  },
  stateCard: {
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.xl,
  },
  stateIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  stateTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading3.fontSize,
    lineHeight: theme.typography.heading3.lineHeight,
    fontWeight: theme.typography.heading3.fontWeight,
    textAlign: 'center',
  },
  stateDescription: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    textAlign: 'center',
  },
  stateAction: {
    marginTop: theme.spacing.md,
  },
  skeletonList: {
    gap: theme.spacing.md,
  },
  skeletonCard: {
    minHeight: 96,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  skeletonAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.surfaceElevated,
  },
  skeletonCopy: {
    flex: 1,
    gap: theme.spacing.sm,
  },
  skeletonLineLarge: {
    width: '64%',
    height: 16,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfaceElevated,
  },
  skeletonLine: {
    width: '78%',
    height: 12,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfacePressed,
  },
  skeletonLineSmall: {
    width: '46%',
    height: 10,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfaceElevated,
  },
});

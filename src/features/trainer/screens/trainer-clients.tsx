import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AlertCircle, ChevronRight, RefreshCcw, UserPlus, UsersRound } from 'lucide-react-native';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useLinkedClients, useReceivedLinkRequests } from '@/features/trainer-link/hooks/use-trainer-link';
import type { ActiveClient } from '@/features/trainer-link/types/trainer-link';
import { theme } from '@/theme';
import type { ClientsStackParamList } from '@/navigation/types';

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export default function TrainerClientsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ClientsStackParamList, 'ClientList'>>();
  const { data, isLoading, isError, refetch } = useLinkedClients();
  const pendingRequests = useReceivedLinkRequests('pendiente');
  const pendingCount = pendingRequests.data?.items.length ?? 0;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.centerText}>Cargando clientes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.center}>
          <AlertCircle size={48} color={theme.colors.error} />
          <Text style={styles.centerTitle}>No pudimos cargar tus clientes</Text>
          <Text style={styles.centerText}>Revisa tu conexion e intenta nuevamente.</Text>
          <PrimaryButton
            label="Intentar de nuevo"
            onPress={() => refetch()}
            icon={<RefreshCcw size={18} color={theme.colors.background} />}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (!data || data.items.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.emptyContent}>
          <View style={styles.emptyIcon}>
            <UsersRound size={42} color={theme.colors.textMuted} />
          </View>
          <Text style={styles.centerTitle}>Aun no tienes clientes</Text>
          <Text style={styles.centerText}>
            Los clientes apareceran aqui cuando aceptes sus solicitudes de vinculacion.
          </Text>
          {pendingCount > 0 ? (
            <View style={styles.pendingBanner}>
              <UserPlus size={18} color={theme.colors.primary} />
              <Text style={styles.pendingText}>
                Tienes {pendingCount} solicitud{pendingCount === 1 ? '' : 'es'} pendiente
                {pendingCount === 1 ? '' : 's'} en el menu de solicitudes.
              </Text>
            </View>
          ) : null}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Clientes</Text>
          <Text style={styles.headerSubtitle}>
            {data.total} cliente{data.total === 1 ? '' : 's'} vinculado{data.total === 1 ? '' : 's'}
          </Text>
        </View>

        {pendingCount > 0 ? (
          <View style={styles.pendingBanner}>
            <UserPlus size={18} color={theme.colors.primary} />
            <Text style={styles.pendingText}>
              {pendingCount} solicitud{pendingCount === 1 ? '' : 'es'} pendiente
              {pendingCount === 1 ? '' : 's'} de revisar.
            </Text>
          </View>
        ) : null}

        <FlatList
          data={data.items}
          keyExtractor={(item: ActiveClient) => item.linkId}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.7}
              onPress={() =>
                navigation.navigate('ClientDetail', {
                  clientId: item.clientId,
                  clientName: item.clientName,

                })
              }
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {item.clientName?.charAt(0)?.toUpperCase() ?? '?'}
                </Text>
              </View>
              <View style={styles.cardInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.clientName}>{item.clientName}</Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>{item.linkStatus}</Text>
                  </View>
                </View>
                <Text style={styles.date}>Vinculado desde {formatDate(item.activatedAt)}</Text>
                <Text style={styles.cardHint}>Toca para revisar progreso y asignar rutina</Text>
              </View>
              <ChevronRight size={20} color={theme.colors.textMuted} />
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.list}
          refreshing={isLoading}
          onRefresh={refetch}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    gap: theme.spacing.lg,
  },
  header: {
    gap: theme.spacing.xs,
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  emptyIcon: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  pendingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.primaryMuted,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
  },
  pendingText: {
    flex: 1,
    color: theme.colors.primary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    fontWeight: '600',
  },
  list: {
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  cardInfo: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  clientName: {
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: theme.typography.bodyStrong.fontWeight,
    color: theme.colors.textPrimary,
  },
  statusBadge: {
    backgroundColor: '#1B4332',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#52B788',
  },
  date: {
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    color: theme.colors.textSecondary,
  },
  cardHint: {
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    color: theme.colors.textMuted,
  },
});

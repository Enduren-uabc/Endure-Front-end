import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Shield, AlertTriangle, ChevronRight, ArrowUpDown } from 'lucide-react-native';
import { BaseCard } from '@/components/ui/BaseCard';
import { theme } from '@/theme';
import { usePendingVerifications } from '../hooks/use-admin-verification';
import { SkeletonCard } from '../components/SkeletonLoader';
import type { AdminStackParamList } from '@/navigation/types';
import type { PendingVerificationItem, RiskLevel } from '../types/admin-verification';

type AdminNav = NativeStackNavigationProp<AdminStackParamList>;
type SortOrder = 'ASC' | 'DESC';

const RISK_COLORS: Record<string, string> = {
  low: theme.colors.success,
  medium: theme.colors.warning,
  high: theme.colors.error,
  critical: theme.colors.error,
};

const RISK_LABELS: Record<string, string> = {
  low: 'Bajo',
  medium: 'Medio',
  high: 'Alto',
  critical: 'Crítico',
};

const FILTER_OPTIONS: { label: string; value: RiskLevel | 'all' }[] = [
  { label: 'Todos', value: 'all' },
  { label: 'Bajo', value: 'low' },
  { label: 'Medio', value: 'medium' },
  { label: 'Alto', value: 'high' },
  { label: 'Crítico', value: 'critical' },
];

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function VerificatonCard({
  item,
  onPress,
}: {
  item: PendingVerificationItem;
  onPress: () => void;
}) {
  const riskColor = RISK_COLORS[item.riskLevel ?? ''] ?? theme.colors.textMuted;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <BaseCard style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.fullName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardName}>{item.fullName}</Text>
            <Text style={styles.cardUsername}>@{item.username}</Text>
          </View>
          <ChevronRight size={18} color={theme.colors.textMuted} />
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.specialties}>
            {item.specialties.slice(0, 3).join(', ')}
            {item.specialties.length > 3 ? ` y +${item.specialties.length - 3}` : ''}
          </Text>
          <Text style={styles.date}>{formatDate(item.submittedAt)}</Text>
        </View>

        {item.riskLevel && (
          <View style={styles.riskRow}>
            <View style={[styles.riskBadge, { backgroundColor: riskColor + '20', borderColor: riskColor }]}>
              <AlertTriangle size={12} color={riskColor} />
              <Text style={[styles.riskText, { color: riskColor }]}>
                Riesgo: {RISK_LABELS[item.riskLevel]} ({item.riskScore}/100)
              </Text>
            </View>
          </View>
        )}
      </BaseCard>
    </TouchableOpacity>
  );
}

export default function PendingVerificationsScreen() {
  const navigation = useNavigation<AdminNav>();
  const [page, setPage] = useState(1);
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'all'>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('ASC');

  const riskLevelParam = riskFilter === 'all' ? undefined : riskFilter;
  const { data, isLoading, isError, error, refetch, isFetching } = usePendingVerifications(
    page,
    20,
    riskLevelParam,
    sortOrder,
  );

  const handleItemPress = useCallback(
    (id: string) => {
      navigation.navigate('VerificationDetail', { verificationId: id });
    },
    [navigation],
  );

  const renderItem = useCallback(
    ({ item }: { item: PendingVerificationItem }) => (
      <VerificatonCard item={item} onPress={() => handleItemPress(item.id)} />
    ),
    [handleItemPress],
  );

  const renderFooter = () => {
    if (!data) return null;
    const hasMore = data.verifications.length < data.total;
    if (!hasMore) return null;
    return (
      <TouchableOpacity
        style={styles.loadMore}
        onPress={() => setPage((p) => p + 1)}
        activeOpacity={0.7}
        disabled={isFetching}
      >
        {isFetching ? (
          <ActivityIndicator size="small" color={theme.colors.primary} />
        ) : (
          <Text style={styles.loadMoreText}>
            Cargar más ({data.total - data.verifications.length} restantes)
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Shield size={24} color={theme.colors.primary} />
          <Text style={styles.title}>Solicitudes</Text>
        </View>
        <View style={styles.skeletonList}>
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Shield size={24} color={theme.colors.primary} />
          <Text style={styles.title}>Solicitudes</Text>
        </View>
        <View style={styles.center}>
          <AlertTriangle size={40} color={theme.colors.error} />
          <Text style={styles.errorText}>No se pudieron cargar las solicitudes.</Text>
          <Text style={styles.errorDetail}>{(error as Error)?.message}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()} activeOpacity={0.7}>
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Shield size={24} color={theme.colors.primary} />
        <Text style={styles.title}>Solicitudes</Text>
        {data && <Text style={styles.count}>{data.total} pendientes</Text>}
      </View>

      <View style={styles.filtersRow}>
        <View style={styles.chipsContainer}>
          {FILTER_OPTIONS.map((opt) => {
            const isActive =
              opt.value === 'all'
                ? riskFilter === 'all'
                : riskFilter === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => {
                  setRiskFilter(opt.value);
                  setPage(1);
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => {
            setSortOrder((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'));
            setPage(1);
          }}
          activeOpacity={0.7}
        >
          <ArrowUpDown size={16} color={theme.colors.primary} />
          <Text style={styles.sortText}>
            {sortOrder === 'ASC' ? 'Más antiguo' : 'Más reciente'}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={data?.verifications ?? []}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && page === 1}
            onRefresh={() => {
              setPage(1);
              refetch();
            }}
            tintColor={theme.colors.primary}
          />
        }
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          <View style={styles.center}>
            <Shield size={40} color={theme.colors.textMuted} />
            <Text style={styles.emptyText}>
              {riskFilter !== 'all'
                ? `No hay solicitudes con riesgo ${RISK_LABELS[riskFilter].toLowerCase()} pendientes de revisión.`
                : 'No hay solicitudes pendientes de revisión.'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    flex: 1,
  },
  count: {
    color: theme.colors.textMuted,
    fontSize: 14,
  },
  filtersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 8,
  },
  chipsContainer: {
    flexDirection: 'row',
    gap: 6,
    flex: 1,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: 'transparent',
  },
  chipActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryMuted,
  },
  chipText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  chipTextActive: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sortText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '500',
  },
  list: {
    padding: 20,
    paddingTop: 0,
  },
  skeletonList: {
    padding: 20,
    paddingTop: 0,
  },
  card: {
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: theme.colors.primary,
    fontSize: 18,
    fontWeight: '700',
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  cardUsername: {
    color: theme.colors.textMuted,
    fontSize: 13,
    marginTop: 1,
  },
  cardBody: {
    marginBottom: 8,
  },
  specialties: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    marginBottom: 4,
  },
  date: {
    color: theme.colors.textMuted,
    fontSize: 12,
  },
  riskRow: {
    flexDirection: 'row',
  },
  riskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  riskText: {
    fontSize: 11,
    fontWeight: '600',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 12,
  },
  errorText: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    textAlign: 'center',
  },
  errorDetail: {
    color: theme.colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  retryText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontSize: 16,
    textAlign: 'center',
  },
  loadMore: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  loadMoreText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});

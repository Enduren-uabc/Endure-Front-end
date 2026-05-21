import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Send, AlertCircle } from 'lucide-react-native';
import { theme } from '@/theme';
import { useSentLinkRequests, useCancelLinkRequest } from '../hooks/use-trainer-link';
import LinkRequestCard from '../components/link-request-card';
import type { TrainerLinkStackParamList } from '@/navigation/types';
import type { LinkRequestStatus } from '../types/trainer-link';

const FILTERS: { label: string; value?: LinkRequestStatus }[] = [
  { label: 'Todas' },
  { label: 'Pendientes', value: 'pendiente' },
  { label: 'Aceptadas', value: 'aceptada' },
  { label: 'Rechazadas', value: 'rechazada' },
];

export default function SentLinkRequestsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<TrainerLinkStackParamList>>();
  const [activeFilter, setActiveFilter] = useState<LinkRequestStatus | undefined>(undefined);
  const { data, isLoading, isError, refetch } = useSentLinkRequests(activeFilter);
  const cancelRequest = useCancelLinkRequest();

  const handleCancel = useCallback((requestId: string) => {
    Alert.alert(
      'Cancelar solicitud',
      '¿Estás seguro de cancelar esta solicitud?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: () => {
            cancelRequest.mutate(requestId, {
              onError: (err: any) => Alert.alert('Error', err?.message ?? 'No pudimos cancelar la solicitud.'),
            });
          },
        },
      ],
    );
  }, [cancelRequest]);

  const renderItem = useCallback(({ item }: any) => (
    <LinkRequestCard
      request={item}
      onCancel={handleCancel}
      onViewTrainer={(trainerId) => navigation.navigate('MyTrainer')}
    />
  ), [handleCancel, navigation]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <Text style={styles.title}>Solicitudes enviadas</Text>

        <View style={styles.filters}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.label}
              style={[styles.filterChip, activeFilter === f.value && styles.filterChipActive]}
              onPress={() => setActiveFilter(f.value)}
            >
              <Text style={[styles.filterText, activeFilter === f.value && styles.filterTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {isLoading && (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        )}

        {isError && (
          <View style={styles.center}>
            <AlertCircle size={40} color={theme.colors.error} />
            <Text style={styles.errorText}>No pudimos cargar las solicitudes</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
              <Text style={styles.retryText}>Intentar de nuevo</Text>
            </TouchableOpacity>
          </View>
        )}

        {data && data.items.length === 0 && (
          <View style={styles.center}>
            <Send size={40} color={theme.colors.textMuted} />
            <Text style={styles.emptyText}>No has enviado solicitudes de vinculación</Text>
          </View>
        )}

        {data && data.items.length > 0 && (
          <FlatList
            data={data.items}
            keyExtractor={(item: any) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            refreshing={isLoading}
            onRefresh={refetch}
          />
        )}
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
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  filters: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#1A1A2E',
    borderWidth: 1,
    borderColor: '#2A2A3E',
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterText: {
    fontSize: 13,
    color: '#A0A0B0',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#0A0A0F',
    fontWeight: '700',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    gap: 12,
  },
  errorText: {
    fontSize: 15,
    color: '#EF4444',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  retryText: {
    color: '#0A0A0F',
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 15,
    color: '#A0A0B0',
    textAlign: 'center',
  },
  list: {
    gap: 12,
    paddingBottom: 24,
  },
});

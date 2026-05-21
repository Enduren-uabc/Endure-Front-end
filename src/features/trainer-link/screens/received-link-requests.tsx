import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Inbox, AlertCircle } from 'lucide-react-native';
import { theme } from '@/theme';
import { useReceivedLinkRequests, useAcceptLinkRequest, useRejectLinkRequest } from '../hooks/use-trainer-link';
import type { LinkRequestStatus } from '../types/trainer-link';

const FILTERS: { label: string; value?: LinkRequestStatus }[] = [
  { label: 'Todas' },
  { label: 'Pendientes', value: 'pendiente' },
  { label: 'Aceptadas', value: 'aceptada' },
];

export default function ReceivedLinkRequestsScreen() {
  const [activeFilter, setActiveFilter] = useState<LinkRequestStatus | undefined>(undefined);
  const [rejectModal, setRejectModal] = useState<{ visible: boolean; requestId: string }>({ visible: false, requestId: '' });
  const [rejectReason, setRejectReason] = useState('');

  const { data, isLoading, isError, refetch } = useReceivedLinkRequests(activeFilter);
  const acceptRequest = useAcceptLinkRequest();
  const rejectRequest = useRejectLinkRequest();

  const handleAccept = useCallback((requestId: string) => {
    Alert.alert(
      'Aceptar solicitud',
      'Al aceptar, se creará un vínculo activo con este cliente.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aceptar',
          onPress: () => {
            acceptRequest.mutate(requestId, {
              onError: (err: any) => Alert.alert('Error', err?.message ?? 'No pudimos aceptar la solicitud.'),
            });
          },
        },
      ],
    );
  }, [acceptRequest]);

  const handleReject = useCallback((requestId: string) => {
    setRejectModal({ visible: true, requestId });
  }, []);

  const confirmReject = useCallback(() => {
    const reason = rejectReason.trim() || undefined;
    rejectRequest.mutate(
      { requestId: rejectModal.requestId, reason },
      {
        onSuccess: () => {
          setRejectModal({ visible: false, requestId: '' });
          setRejectReason('');
        },
        onError: (err: any) => {
          Alert.alert('Error', err?.message ?? 'No pudimos rechazar la solicitud.');
        },
      },
    );
  }, [rejectModal.requestId, rejectReason, rejectRequest]);

  const renderItem = useCallback(({ item }: any) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.clientName?.charAt(0)?.toUpperCase() ?? '?'}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.clientName}>{item.clientName}</Text>
          <Text style={styles.date}>
            {new Date(item.createdAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        <View style={[styles.statusBadge, {
          backgroundColor: item.status === 'pendiente' ? 'rgba(245, 158, 11, 0.1)' : item.status === 'aceptada' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
        }]}>
          <Text style={[styles.statusText, {
            color: item.status === 'pendiente' ? '#F59E0B' : item.status === 'aceptada' ? '#22C55E' : '#EF4444',
          }]}>
            {item.status === 'pendiente' ? 'Pendiente' : item.status === 'aceptada' ? 'Aceptada' : 'Rechazada'}
          </Text>
        </View>
      </View>
      {item.message && (
        <Text style={styles.message}>"{item.message}"</Text>
      )}
      {item.status === 'pendiente' && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.rejectBtn}
            onPress={() => handleReject(item.id)}
            disabled={rejectRequest.isPending}
          >
            <Text style={styles.rejectBtnText}>Rechazar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.acceptBtn}
            onPress={() => handleAccept(item.id)}
            disabled={acceptRequest.isPending}
          >
            <Text style={styles.acceptBtnText}>{acceptRequest.isPending ? '...' : 'Aceptar'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  ), [handleAccept, handleReject, acceptRequest.isPending, rejectRequest.isPending]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <Text style={styles.title}>Solicitudes</Text>

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
            <Inbox size={40} color={theme.colors.textMuted} />
            <Text style={styles.emptyText}>No tienes solicitudes de vinculación</Text>
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

      <Modal visible={rejectModal.visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Rechazar solicitud</Text>
            <Text style={styles.modalSubtitle}>Puedes agregar un motivo opcional</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Motivo (opcional)..."
              placeholderTextColor={theme.colors.textMuted}
              value={rejectReason}
              onChangeText={setRejectReason}
              multiline
              maxLength={500}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => {
                  setRejectModal({ visible: false, requestId: '' });
                  setRejectReason('');
                }}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirm}
                onPress={confirmReject}
                disabled={rejectRequest.isPending}
              >
                <Text style={styles.modalConfirmText}>
                  {rejectRequest.isPending ? '...' : 'Rechazar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  card: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2A2A3E',
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2A2A3E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  date: {
    fontSize: 11,
    color: '#A0A0B0',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  message: {
    fontSize: 13,
    color: '#A0A0B0',
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  rejectBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  rejectBtnText: {
    color: '#EF4444',
    fontWeight: '600',
    fontSize: 13,
  },
  acceptBtn: {
    flex: 1,
    backgroundColor: '#22C55E',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  acceptBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    gap: 12,
    borderWidth: 1,
    borderColor: '#2A2A3E',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#A0A0B0',
  },
  modalInput: {
    backgroundColor: '#0A0A0F',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#FFFFFF',
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#2A2A3E',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  modalCancel: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#2A2A3E',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#A0A0B0',
    fontWeight: '600',
  },
  modalConfirm: {
    flex: 1,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  modalConfirmText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

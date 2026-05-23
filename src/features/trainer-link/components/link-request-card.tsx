import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { User, Clock, XCircle, CheckCircle, Ban } from 'lucide-react-native';
import { theme } from '@/theme';
import type { LinkRequest, LinkRequestStatus } from '../types/trainer-link';

interface Props {
  request: LinkRequest;
  isTrainerView?: boolean;
  onCancel?: (requestId: string) => void;
  onViewTrainer?: (trainerId: string) => void;
  onAccept?: (requestId: string) => void;
  onReject?: (requestId: string) => void;
}

const STATUS_CONFIG: Record<LinkRequestStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  pendiente: { label: 'Pendiente', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)', icon: Clock },
  aceptada: { label: 'Aceptada', color: '#22C55E', bg: 'rgba(34, 197, 94, 0.1)', icon: CheckCircle },
  rechazada: { label: 'Rechazada', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)', icon: XCircle },
  cancelada: { label: 'Cancelada', color: '#A0A0B0', bg: 'rgba(160, 160, 176, 0.1)', icon: Ban },
};

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return 'Hace unos minutos';
    if (diffHours < 24) return `Hace ${diffHours} horas`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
  } catch {
    return dateStr;
  }
}

export default function LinkRequestCard({ request, isTrainerView, onCancel, onViewTrainer, onAccept, onReject }: Props) {
  const StatusIcon = STATUS_CONFIG[request.status].icon;
  const displayName = isTrainerView ? request.clientName : request.trainerName;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => !isTrainerView && onViewTrainer?.(request.trainerId)}
      activeOpacity={!isTrainerView ? 0.7 : 1}
    >
      <View style={styles.row}>
        <View style={styles.avatar}>
          <User size={20} color={theme.colors.textSecondary} />
        </View>
        <View style={styles.content}>
          <Text style={styles.name}>{displayName}</Text>
          {!isTrainerView && (
            <Text style={styles.code}>{request.trainerCode}</Text>
          )}
          {request.message && (
            <Text style={styles.message} numberOfLines={2}>
              "{request.message}"
            </Text>
          )}
          <View style={styles.footer}>
            <View style={[styles.statusBadge, { backgroundColor: STATUS_CONFIG[request.status].bg }]}>
              <StatusIcon size={12} color={STATUS_CONFIG[request.status].color} />
              <Text style={[styles.statusText, { color: STATUS_CONFIG[request.status].color }]}>
                {STATUS_CONFIG[request.status].label}
              </Text>
            </View>
            <Text style={styles.date}>{formatDate(request.createdAt)}</Text>
          </View>
          {request.status === 'rechazada' && request.rejectionReason && (
            <Text style={styles.rejection}>Motivo: {request.rejectionReason}</Text>
          )}
        </View>
      </View>
      <View style={styles.actions}>
        {request.status === 'pendiente' && isTrainerView && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.rejectButton}
              onPress={() => onReject?.(request.id)}
            >
              <Text style={styles.rejectText}>Rechazar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.acceptButton}
              onPress={() => onAccept?.(request.id)}
            >
              <Text style={styles.acceptText}>Aceptar</Text>
            </TouchableOpacity>
          </View>
        )}
        {request.status === 'pendiente' && !isTrainerView && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => onCancel?.(request.id)}
          >
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
        )}
        {request.status === 'aceptada' && !isTrainerView && (
          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => onViewTrainer?.(request.trainerId)}
          >
            <Text style={styles.viewText}>Ver mi entrenador</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2A2A3E',
    gap: 12,
  },
  row: {
    flexDirection: 'row',
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
  content: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  code: {
    fontSize: 11,
    color: theme.colors.primary,
    fontFamily: 'monospace',
  },
  message: {
    fontSize: 13,
    color: '#A0A0B0',
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  date: {
    fontSize: 11,
    color: '#A0A0B0',
  },
  rejection: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  actions: {
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  rejectButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  rejectText: {
    color: '#EF4444',
    fontWeight: '600',
    fontSize: 13,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#22C55E',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  acceptText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  cancelButton: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  cancelText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '500',
  },
  viewButton: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  viewText: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
});

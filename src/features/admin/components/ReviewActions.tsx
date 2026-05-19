import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert as RNAlert,
} from 'react-native';
import { CheckCircle2, XCircle, RefreshCw, AlertTriangle } from 'lucide-react-native';
import { BaseCard } from '@/components/ui/BaseCard';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { TextInput } from '@/components/ui/TextInput';
import { theme } from '@/theme';
import type { AdvancedStatus, ReviewInput } from '../types/admin-verification';

interface ReviewActionsProps {
  verificationId: string;
  advancedStatus?: AdvancedStatus;
  assignedReviewerId?: string | null;
  currentUserId?: string;
  onStartReview: () => void;
  onReview: (input: ReviewInput) => void;
  isStartReviewPending: boolean;
  isReviewPending: boolean;
}

type DecisionModal = 'approve' | 'reject' | 'correction' | null;

export function ReviewActions({
  verificationId: _verificationId,
  advancedStatus,
  assignedReviewerId,
  currentUserId,
  onStartReview,
  onReview,
  isStartReviewPending,
  isReviewPending,
}: ReviewActionsProps) {
  const [modal, setModal] = useState<DecisionModal>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [internalComment, setInternalComment] = useState('');
  const [userVisibleMessage, setUserVisibleMessage] = useState('');
  const [correctionType, setCorrectionType] = useState<'certificate' | 'id_document' | 'other'>('certificate');

  const isAssignedToMe = assignedReviewerId && assignedReviewerId === currentUserId;
  const isAssignedToOther = assignedReviewerId && assignedReviewerId !== currentUserId;

  const handleSubmit = () => {
    if (modal === 'reject' && !rejectionReason.trim()) {
      RNAlert.alert('Campo requerido', 'Escribe una razón de rechazo.');
      return;
    }
    if (modal === 'correction' && !userVisibleMessage.trim()) {
      RNAlert.alert('Campo requerido', 'Escribe un mensaje visible para el usuario.');
      return;
    }

    const input: ReviewInput = {
      decision: modal === 'approve' ? 'approved' : modal === 'reject' ? 'rejected' : 'correction_required',
      internalComment: internalComment.trim() || undefined,
    };

    if (modal === 'reject') {
      input.rejectionReason = rejectionReason.trim();
    }
    if (modal === 'correction') {
      input.userVisibleMessage = userVisibleMessage.trim();
      input.correctionType = correctionType;
    }

    onReview(input);
    setModal(null);
    setRejectionReason('');
    setInternalComment('');
    setUserVisibleMessage('');
  };

  const renderModal = () => {
    const isApproval = modal === 'approve';
    const isRejection = modal === 'reject';
    const isCorrection = modal === 'correction';

    return (
      <Modal visible={!!modal} transparent animationType="fade" onRequestClose={() => setModal(null)}>
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              {isApproval && 'Aprobar solicitud'}
              {isRejection && 'Rechazar solicitud'}
              {isCorrection && 'Solicitar corrección'}
            </Text>

            <Text style={styles.modalSubtitle}>
              {isApproval && 'El usuario será registrado como entrenador.'}
              {isRejection && 'El usuario podrá reenviar su solicitud.'}
              {isCorrection && 'El usuario recibirá un mensaje con lo que debe corregir.'}
            </Text>

            {isCorrection && (
              <>
                <Text style={styles.fieldLabel}>Mensaje visible para el usuario *</Text>
                <TextInput
                  label=""
                  value={userVisibleMessage}
                  onChangeText={setUserVisibleMessage}
                  placeholder="Ej: El certificado no es legible. Sube una foto más clara."
                />

                <Text style={styles.fieldLabel}>Tipo de corrección</Text>
                <View style={styles.correctionTypes}>
                  {(['certificate', 'id_document', 'other'] as const).map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[styles.correctionChip, correctionType === type && styles.correctionChipActive]}
                      onPress={() => setCorrectionType(type)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.correctionChipText, correctionType === type && styles.correctionChipTextActive]}>
                        {type === 'certificate' ? 'Certificado' : type === 'id_document' ? 'Identificación' : 'Otro'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {isRejection && (
              <TextInput
                label="Razón de rechazo *"
                value={rejectionReason}
                onChangeText={setRejectionReason}
                placeholder="Ej: El certificado no es válido."
              />
            )}

            <TextInput
              label="Comentario interno (opcional)"
              value={internalComment}
              onChangeText={setInternalComment}
              placeholder="Visible solo para administradores."
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModal(null)}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <PrimaryButton
                label={
                  isApproval ? 'Aprobar' :
                  isRejection ? 'Rechazar' :
                  'Solicitar corrección'
                }
                onPress={handleSubmit}
                disabled={isReviewPending}
                loading={isReviewPending}
                style={styles.modalPrimaryButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  if (advancedStatus === 'manual_review_pending' && !assignedReviewerId) {
    return (
      <BaseCard style={styles.card}>
        <Text style={styles.title}>Acciones de revisión</Text>
        <PrimaryButton
          label={isStartReviewPending ? 'Iniciando...' : 'Iniciar revisión'}
          onPress={onStartReview}
          disabled={isStartReviewPending}
          loading={isStartReviewPending}
          icon={<RefreshCw size={18} color={theme.colors.background} />}
        />
        {renderModal()}
      </BaseCard>
    );
  }

  if (advancedStatus === 'manual_review_in_progress' && isAssignedToMe) {
    return (
      <BaseCard style={styles.card}>
        <Text style={styles.title}>Acciones de revisión</Text>
        <Text style={styles.assignedText}>Eres el revisor de esta solicitud.</Text>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.approveBtn]}
            onPress={() => setModal('approve')}
            activeOpacity={0.7}
          >
            <CheckCircle2 size={22} color={theme.colors.success} />
            <Text style={styles.actionBtnText}>Aprobar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.correctionBtn]}
            onPress={() => setModal('correction')}
            activeOpacity={0.7}
          >
            <RefreshCw size={22} color={theme.colors.warning} />
            <Text style={styles.actionBtnText}>Corregir</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.rejectBtn]}
            onPress={() => setModal('reject')}
            activeOpacity={0.7}
          >
            <XCircle size={22} color={theme.colors.error} />
            <Text style={styles.actionBtnText}>Rechazar</Text>
          </TouchableOpacity>
        </View>
        {renderModal()}
      </BaseCard>
    );
  }

  if (advancedStatus === 'manual_review_in_progress' && isAssignedToOther) {
    return (
      <BaseCard style={styles.card}>
        <View style={styles.infoRow}>
          <AlertTriangle size={18} color={theme.colors.warning} />
          <Text style={styles.infoText}>
            Esta solicitud está siendo revisada por otro administrador.
          </Text>
        </View>
      </BaseCard>
    );
  }

  if (advancedStatus === 'approved') {
    return (
      <BaseCard style={styles.card}>
        <View style={styles.infoRow}>
          <CheckCircle2 size={18} color={theme.colors.success} />
          <Text style={[styles.infoText, { color: theme.colors.success }]}>
            Solicitud aprobada. El usuario ya es entrenador.
          </Text>
        </View>
      </BaseCard>
    );
  }

  if (advancedStatus === 'rejected') {
    return (
      <BaseCard style={styles.card}>
        <View style={styles.infoRow}>
          <XCircle size={18} color={theme.colors.error} />
          <Text style={[styles.infoText, { color: theme.colors.error }]}>
            Solicitud rechazada.
          </Text>
        </View>
      </BaseCard>
    );
  }

  if (advancedStatus === 'correction_required') {
    return (
      <BaseCard style={styles.card}>
        <View style={styles.infoRow}>
          <RefreshCw size={18} color={theme.colors.warning} />
          <Text style={[styles.infoText, { color: theme.colors.warning }]}>
            Se solicitó corrección al usuario. Esperando reenvío.
          </Text>
        </View>
      </BaseCard>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 16,
  },
  assignedText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  approveBtn: {
    borderColor: theme.colors.success,
    backgroundColor: theme.colors.success + '10',
  },
  correctionBtn: {
    borderColor: theme.colors.warning,
    backgroundColor: theme.colors.warning + '10',
  },
  rejectBtn: {
    borderColor: theme.colors.error,
    backgroundColor: theme.colors.error + '10',
  },
  actionBtnText: {
    color: theme.colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  overlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    color: theme.colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  modalSubtitle: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    marginBottom: 24,
    lineHeight: 20,
  },
  fieldLabel: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  correctionTypes: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  correctionChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  correctionChipActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryMuted,
  },
  correctionChipText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  correctionChipTextActive: {
    color: theme.colors.primary,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  modalPrimaryButton: {
    flex: 2,
  },
});

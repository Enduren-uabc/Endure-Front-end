import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { Shield, AlertTriangle, User, BookOpen, Hash, ArrowLeft } from 'lucide-react-native';
import { BaseCard } from '@/components/ui/BaseCard';
import { Chip } from '@/components/ui/Chip';
import { theme } from '@/theme';
import { useSessionStore } from '@/features/auth/stores/session-store';
import {
  useVerificationDetail,
  useStartReview,
  useReviewVerification,
} from '../hooks/use-admin-verification';
import { RiskSummaryCard } from '../components/RiskSummaryCard';
import { VerificationFilesCard } from '../components/VerificationFilesCard';
import { StatusTimeline } from '../components/StatusTimeline';
import { ReviewActions } from '../components/ReviewActions';
import { SkeletonDetail } from '../components/SkeletonLoader';
import type { AdminStackParamList } from '@/navigation/types';
import type { ReviewInput } from '../types/admin-verification';

type DetailRoute = RouteProp<AdminStackParamList, 'VerificationDetail'>;

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft: { label: 'Borrador', color: theme.colors.textMuted },
  manual_review_pending: { label: 'Pendiente de revisión', color: theme.colors.warning },
  manual_review_in_progress: { label: 'En revisión', color: theme.colors.primary },
  correction_required: { label: 'Corrección requerida', color: theme.colors.warning },
  approved: { label: 'Aprobado', color: theme.colors.success },
  rejected: { label: 'Rechazado', color: theme.colors.error },
  blocked_for_risk: { label: 'Bloqueado por riesgo', color: theme.colors.error },
};

export default function VerificationDetailScreen() {
  const route = useRoute<DetailRoute>();
  const { verificationId } = route.params;
  const currentUserId = useSessionStore((s) => s.userId);

  const { data, isLoading, isError, error, refetch } = useVerificationDetail(verificationId);
  const startReviewMutation = useStartReview();
  const reviewMutation = useReviewVerification();

  const handleStartReview = useCallback(() => {
    startReviewMutation.mutate({ verificationId });
  }, [verificationId, startReviewMutation]);

  const handleReview = useCallback(
    (input: ReviewInput) => {
      reviewMutation.mutate({ verificationId, input });
    },
    [verificationId, reviewMutation],
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView>
          <SkeletonDetail />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (isError || !data) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <AlertTriangle size={40} color={theme.colors.error} />
          <Text style={styles.errorText}>No se pudo cargar el detalle de la solicitud.</Text>
          <Text style={styles.errorDetail}>{(error as Error)?.message}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()} activeOpacity={0.7}>
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const statusConfig = STATUS_CONFIG[data.advancedStatus ?? data.status] ?? {
    label: data.status,
    color: theme.colors.textMuted,
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.headerInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {data.fullName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.headerText}>
              <Text style={styles.fullName}>{data.fullName}</Text>
              <Text style={styles.username}>@{data.username}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + '20', borderColor: statusConfig.color }]}>
            <Text style={[styles.statusText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
          </View>
        </View>

        <BaseCard style={styles.section}>
          <Text style={styles.sectionTitle}>Información del solicitante</Text>

          <View style={styles.infoRow}>
            <BookOpen size={16} color={theme.colors.textMuted} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Especialidades</Text>
              <View style={styles.chips}>
                {data.specialties.map((s) => (
                  <Chip key={s.key} label={s.displayName} selected={false} onPress={() => {}} />
                ))}
              </View>
            </View>
          </View>

          <View style={styles.infoRow}>
            <User size={16} color={theme.colors.textMuted} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Experiencia</Text>
              <Text style={styles.infoValue}>{data.yearsOfExperience} años</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Hash size={16} color={theme.colors.textMuted} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Número de identificación</Text>
              <Text style={styles.infoValue}>{data.idDocumentNumber || 'No disponible'}</Text>
            </View>
          </View>

          {data.shortBio ? (
            <View style={styles.bioSection}>
              <Text style={styles.infoLabel}>Biografía profesional</Text>
              <Text style={styles.bioText}>{data.shortBio}</Text>
            </View>
          ) : null}
        </BaseCard>

        <VerificationFilesCard
          certificates={data.certificates ?? []}
          idDocuments={data.idDocuments ?? []}
        />

        {data.extractedCertificateData || data.extractedIdData ? (
          <BaseCard style={styles.section}>
            <Text style={styles.sectionTitle}>Datos extraídos</Text>

            {data.extractedCertificateData && (
              <View style={styles.extractedSection}>
                <Text style={styles.extractedSubtitle}>Certificado</Text>
                <View style={styles.extractedRow}>
                  <Text style={styles.extractedLabel}>Nombre:</Text>
                  <Text style={styles.extractedValue}>{data.extractedCertificateData.fullName}</Text>
                </View>
                <View style={styles.extractedRow}>
                  <Text style={styles.extractedLabel}>Certificado:</Text>
                  <Text style={styles.extractedValue}>{data.extractedCertificateData.certificateName}</Text>
                </View>
                <View style={styles.extractedRow}>
                  <Text style={styles.extractedLabel}>Institución:</Text>
                  <Text style={styles.extractedValue}>{data.extractedCertificateData.issuingOrganization}</Text>
                </View>
                <View style={styles.extractedRow}>
                  <Text style={styles.extractedLabel}>Folio:</Text>
                  <Text style={styles.extractedValue}>{data.extractedCertificateData.folioNumber || 'No detectado'}</Text>
                </View>
                <View style={styles.extractedRow}>
                  <Text style={styles.extractedLabel}>Confianza OCR:</Text>
                  <Text style={styles.extractedValue}>
                    {(data.extractedCertificateData.ocrConfidence * 100).toFixed(0)}%
                  </Text>
                </View>
              </View>
            )}

            {data.extractedIdData && (
              <View style={styles.extractedSection}>
                <Text style={styles.extractedSubtitle}>Identificación</Text>
                <View style={styles.extractedRow}>
                  <Text style={styles.extractedLabel}>Nombre:</Text>
                  <Text style={styles.extractedValue}>{data.extractedIdData.fullName}</Text>
                </View>
                <View style={styles.extractedRow}>
                  <Text style={styles.extractedLabel}>Tipo:</Text>
                  <Text style={styles.extractedValue}>{data.extractedIdData.documentType}</Text>
                </View>
                <View style={styles.extractedRow}>
                  <Text style={styles.extractedLabel}>Identificador:</Text>
                  <Text style={styles.extractedValue}>{data.extractedIdData.documentIdentifier || 'No disponible'}</Text>
                </View>
                <View style={styles.extractedRow}>
                  <Text style={styles.extractedLabel}>Confianza OCR:</Text>
                  <Text style={styles.extractedValue}>
                    {(data.extractedIdData.ocrConfidence * 100).toFixed(0)}%
                  </Text>
                </View>
              </View>
            )}
          </BaseCard>
        ) : null}

        {data.scoringResult && (
          <RiskSummaryCard scoring={data.scoringResult} />
        )}

        <ReviewActions
          verificationId={verificationId}
          advancedStatus={data.advancedStatus}
          assignedReviewerId={data.assignedReviewerId}
          currentUserId={currentUserId ?? undefined}
          onStartReview={handleStartReview}
          onReview={handleReview}
          isStartReviewPending={startReviewMutation.isPending}
          isReviewPending={reviewMutation.isPending}
        />

        <StatusTimeline
          statusHistory={data.statusHistory}
          auditEvents={data.auditEvents}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: theme.colors.primary,
    fontSize: 20,
    fontWeight: '700',
  },
  headerText: {
    flex: 1,
  },
  fullName: {
    color: theme.colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  username: {
    color: theme.colors.textMuted,
    fontSize: 14,
    marginTop: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    marginBottom: 2,
  },
  infoValue: {
    color: theme.colors.textPrimary,
    fontSize: 15,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  bioSection: {
    marginTop: 8,
  },
  bioText: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  extractedSection: {
    marginBottom: 16,
  },
  extractedSubtitle: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  extractedRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  extractedLabel: {
    color: theme.colors.textMuted,
    fontSize: 13,
    width: 110,
  },
  extractedValue: {
    color: theme.colors.textPrimary,
    fontSize: 13,
    flex: 1,
  },
});

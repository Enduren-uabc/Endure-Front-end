import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Award, Clock, XCircle, AlertTriangle, RefreshCw } from 'lucide-react-native';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { BaseCard } from '@/components/ui/BaseCard';
import { CertificateExtractionCard, IdExtractionCard } from '@/features/trainer-verification/components/DocumentExtractionCard';
import { useMyVerificationStatus } from '@/features/trainer-verification/hooks/use-trainer-verification';
import type { CoachStackParamList } from '@/navigation/types';
import { theme } from '@/theme';

type CoachNav = NativeStackNavigationProp<CoachStackParamList>;

export default function PowerspikeStatus() {
  const navigation = useNavigation<CoachNav>();
  const { data: statusData, isLoading, isRefetching, refetch } = useMyVerificationStatus();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.primary} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!statusData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.errorText}>No pudimos cargar el estado de tu solicitud.</Text>
          <PrimaryButton label="Intentar de nuevo" onPress={() => refetch()} style={styles.retryBtn} />
        </View>
      </SafeAreaView>
    );
  }

  const advStatus = statusData.advancedStatus;
  const riskAlerts = statusData.riskAlerts;
  const certInfo = statusData.extractedCertificateInfo;
  const idInfo = statusData.extractedIdInfo;
  const hasExtractedDocs = Boolean(certInfo || idInfo);

  const renderDocumentInfo = () => {
    if (!hasExtractedDocs) return null;

    return (
      <>
        <Text style={styles.sectionTitle}>Documentos procesados</Text>
        {certInfo && <CertificateExtractionCard data={certInfo} />}
        {idInfo && <IdExtractionCard data={idInfo} />}

        {riskAlerts && riskAlerts.length > 0 && (
          <BaseCard style={styles.alertsCard}>
            <View style={styles.alertsHeader}>
              <AlertTriangle size={18} color={theme.colors.warning} />
              <Text style={styles.alertsTitle}>Alertas detectadas ({riskAlerts.length})</Text>
            </View>
            {riskAlerts.map((alert, idx) => (
              <View key={idx} style={styles.alertRow}>
                <Text style={styles.alertSeverity}>{alert.severity}</Text>
                <Text style={styles.alertText}>{alert.message}</Text>
              </View>
            ))}
          </BaseCard>
        )}

        {statusData.riskScore !== undefined && (
          <BaseCard style={styles.riskCard}>
            <Text style={styles.riskTitle}>Evaluación de riesgo</Text>
            <View style={styles.riskRow}>
              <View style={styles.riskBadge}>
                <Text style={[styles.riskBadgeText, {
                  color: statusData.riskLevel === 'low' ? theme.colors.success
                    : statusData.riskLevel === 'medium' ? theme.colors.warning
                    : theme.colors.error,
                }]}>
                  {statusData.riskLevel === 'low' ? 'Bajo'
                    : statusData.riskLevel === 'medium' ? 'Medio'
                    : 'Alto'}
                </Text>
              </View>
              <Text style={styles.riskScore}>Puntuación: {Math.round(statusData.riskScore)}/100</Text>
            </View>
          </BaseCard>
        )}
      </>
    );
  };

  const statusViews = {
    manual_review_pending: () => (
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.colors.primary} />}
      >
        <View style={styles.statusSection}>
          <View style={styles.iconWrapperPending}>
            <Clock size={48} color={theme.colors.primary} />
          </View>
          <Text style={styles.statusTitle}>Solicitud en revisión</Text>
          <Text style={styles.statusSubtitle}>
            Tu solicitud está siendo revisada por nuestro equipo. Normalmente procesamos las solicitudes en un plazo de 24 a 72 horas.
          </Text>
        </View>
        {renderDocumentInfo()}
      </ScrollView>
    ),
    manual_review_in_progress: () => (
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.colors.primary} />}
      >
        <View style={styles.statusSection}>
          <View style={styles.iconWrapperPending}>
            <RefreshCw size={48} color={theme.colors.primary} />
          </View>
          <Text style={styles.statusTitle}>Revisión en curso</Text>
          <Text style={styles.statusSubtitle}>
            Un administrador está revisando tu solicitud en este momento. Te notificaremos cuando tenga una decisión.
          </Text>
        </View>
        {renderDocumentInfo()}
      </ScrollView>
    ),
    correction_required: () => (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.statusSection}>
            <View style={styles.iconWrapperRejected}>
              <XCircle size={48} color={theme.colors.warning} />
            </View>
            <Text style={styles.statusTitleWarning}>Corrección requerida</Text>
            <Text style={styles.statusSubtitle}>
              Necesitamos que corrijas algunos datos antes de continuar con la revisión.
            </Text>
          </View>
          <BaseCard style={styles.infoCard}>
            <Text style={styles.cardTitle}>Mensaje del revisor</Text>
            <Text style={styles.correctionMessage}>
              {statusData.rejectionReason || 'Por favor revisa los documentos que subiste e intenta de nuevo.'}
            </Text>
          </BaseCard>
          {renderDocumentInfo()}
        </ScrollView>
        <View style={styles.footer}>
          <PrimaryButton
            label="Corregir y reenviar"
            onPress={() => navigation.navigate('PowerspikeForm')}
          />
        </View>
      </SafeAreaView>
    ),
    approved: () => (
      <ScrollView contentContainerStyle={styles.approvedScroll} bounces={false}>
        <View style={styles.approvedIconWrapper}>
          <Award size={80} color={theme.colors.success} />
        </View>
        <Text style={styles.approvedTitle}>Entrenador Verificado</Text>
        <Text style={styles.approvedSubtitle}>
          Ya eres parte de la red de entrenadores profesionales de Endure.
        </Text>
        {renderDocumentInfo()}
      </ScrollView>
    ),
    rejected: () => (
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.statusSection}>
          <View style={styles.iconWrapperRejected}>
            <XCircle size={48} color={theme.colors.error} />
          </View>
          <Text style={styles.statusTitleError}>Solicitud rechazada</Text>
          <Text style={styles.statusSubtitle}>
            {statusData.rejectionReason || 'Tu solicitud no pudo ser aprobada en esta ocasión.'}
          </Text>
        </View>
        {renderDocumentInfo()}
      </ScrollView>
    ),
    blocked_for_risk: () => (
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.statusSection}>
          <View style={styles.iconWrapperRejected}>
            <AlertTriangle size={48} color={theme.colors.error} />
          </View>
          <Text style={styles.statusTitleError}>Solicitud bloqueada</Text>
          <Text style={styles.statusSubtitle}>
            No podemos procesar tu solicitud en este momento. Si crees que esto es un error, contacta a soporte.
          </Text>
        </View>
        {renderDocumentInfo()}
      </ScrollView>
    ),
  };

  const view = statusViews[advStatus as keyof typeof statusViews] || statusViews.manual_review_pending;
  return view();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    color: theme.colors.textSecondary,
    fontSize: 17,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryBtn: {
    width: 200,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  statusSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 32,
  },
  iconWrapperPending: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(250, 204, 21, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  iconWrapperRejected: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  statusTitle: {
    color: theme.colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  statusTitleWarning: {
    color: theme.colors.warning,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  statusTitleError: {
    color: theme.colors.error,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  statusSubtitle: {
    color: theme.colors.textSecondary,
    fontSize: 17,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  infoCard: {
    marginBottom: 16,
  },
  cardTitle: {
    color: theme.colors.textPrimary,
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 16,
  },
  correctionMessage: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    lineHeight: 22,
  },
  alertsCard: {
    marginBottom: 16,
    borderColor: theme.colors.warning,
  },
  alertsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  alertsTitle: {
    color: theme.colors.warning,
    fontSize: 15,
    fontWeight: '600',
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  alertSeverity: {
    color: theme.colors.warning,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    minWidth: 40,
  },
  alertText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    flex: 1,
  },
  riskCard: {
    marginBottom: 16,
  },
  riskTitle: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
  },
  riskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  riskBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: theme.colors.surfaceElevated,
  },
  riskBadgeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  riskScore: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  footer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 0 : 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  approvedScroll: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  approvedIconWrapper: {
    marginBottom: 24,
    padding: 24,
    borderRadius: 40,
    backgroundColor: 'rgba(47, 224, 113, 0.1)',
  },
  approvedTitle: {
    color: theme.colors.success,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  approvedSubtitle: {
    color: theme.colors.textSecondary,
    fontSize: 17,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
});

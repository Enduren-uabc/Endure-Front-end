import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Award, Clock, XCircle, AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react-native';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { BaseCard } from '@/components/ui/BaseCard';
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

  const renderExtractionInfo = () => {
    if (!statusData.extractedCertificateInfo && !statusData.extractedIdInfo) return null;

    return (
      <BaseCard style={styles.infoCard}>
        <Text style={styles.cardTitle}>Documentos procesados</Text>
        {statusData.extractedCertificateInfo && (
          <View style={styles.docRow}>
            <Text style={styles.docLabel}>Certificado:</Text>
            <Text style={styles.docValue}>{statusData.extractedCertificateInfo.name}</Text>
          </View>
        )}
        {statusData.extractedIdInfo && (
          <View style={styles.docRow}>
            <Text style={styles.docLabel}>Identificación:</Text>
            <Text style={styles.docValue}>{statusData.extractedIdInfo.documentType}</Text>
          </View>
        )}
        {riskAlerts && riskAlerts.length > 0 && (
          <View style={styles.alertsContainer}>
            <Text style={styles.alertsTitle}>Alertas detectadas:</Text>
            {riskAlerts.map((alert, idx) => (
              <View key={idx} style={styles.alertRow}>
                <AlertTriangle size={14} color={theme.colors.warning} />
                <Text style={styles.alertText}>{alert.message}</Text>
              </View>
            ))}
          </View>
        )}
      </BaseCard>
    );
  };

  const renderPendingReview = () => (
    <SafeAreaView style={styles.container}>
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
        {renderExtractionInfo()}
      </ScrollView>
    </SafeAreaView>
  );

  const renderInProgress = () => (
    <SafeAreaView style={styles.container}>
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
      </ScrollView>
    </SafeAreaView>
  );

  const renderCorrectionRequired = () => (
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
      </ScrollView>
      <View style={styles.footer}>
        <PrimaryButton
          label="Corregir y reenviar"
          onPress={() => navigation.navigate('PowerspikeForm')}
        />
      </View>
    </SafeAreaView>
  );

  const renderApproved = () => (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.approvedScroll} bounces={false}>
        <View style={styles.approvedIconWrapper}>
          <Award size={80} color={theme.colors.success} />
        </View>
        <Text style={styles.approvedTitle}>Entrenador Verificado</Text>
        <Text style={styles.approvedSubtitle}>
          Ya eres parte de la red de entrenadores profesionales de Endure.
        </Text>
        <BaseCard style={styles.infoCard}>
          <Text style={styles.approvedCardText}>
            Tienes acceso total a las herramientas de coach.
            Pronto podrás gestionar clientes y rutinas personalizadas desde tu panel.
          </Text>
        </BaseCard>
      </ScrollView>
    </SafeAreaView>
  );

  const renderRejected = () => (
    <SafeAreaView style={styles.container}>
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
      </ScrollView>
    </SafeAreaView>
  );

  const renderBlocked = () => (
    <SafeAreaView style={styles.container}>
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
      </ScrollView>
    </SafeAreaView>
  );

  switch (advStatus) {
    case 'manual_review_pending':
      return renderPendingReview();
    case 'manual_review_in_progress':
      return renderInProgress();
    case 'correction_required':
      return renderCorrectionRequired();
    case 'approved':
      return renderApproved();
    case 'rejected':
      return renderRejected();
    case 'blocked_for_risk':
      return renderBlocked();
    default:
      return renderPendingReview();
  }
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
  infoCard: {
    marginBottom: 16,
  },
  cardTitle: {
    color: theme.colors.textPrimary,
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 16,
  },
  docRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  docLabel: {
    color: theme.colors.textSecondary,
    fontSize: 15,
    marginRight: 8,
  },
  docValue: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  alertsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  alertsTitle: {
    color: theme.colors.warning,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  alertText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    flex: 1,
  },
  correctionMessage: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    lineHeight: 22,
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
  approvedCardText: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
  },
});

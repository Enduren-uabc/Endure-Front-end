import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { XCircle, AlertCircle, RefreshCw } from 'lucide-react-native';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useMyVerificationStatus } from '@/features/trainer-verification/hooks/use-trainer-verification';
import type { CoachStackParamList } from '@/navigation/types';

type CoachNav = NativeStackNavigationProp<CoachStackParamList>;

const COLORS = {
  bg: '#0E0E10',
  surface: '#18181B',
  surface2: '#27272A',
  primary: '#FACC15',
  textPrimary: '#FAFAFA',
  textSecondary: '#A1A1AA',
  border: '#3F3F46',
  error: '#EF4444',
  errorMuted: 'rgba(239, 68, 68, 0.1)',
};

export default function CoachRejected() {
  const navigation = useNavigation<CoachNav>();
  const { data: statusData } = useMyVerificationStatus();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
        <View style={styles.iconWrapper}>
          <XCircle size={64} color={COLORS.error} />
        </View>

        <Text style={styles.title}>Solicitud rechazada</Text>
        <Text style={styles.subtitle}>
          Lamentablemente, no pudimos aprobar tu solicitud de verificación en esta ocasión.
        </Text>

        <View style={styles.reasonCard}>
          <View style={styles.reasonHeader}>
            <AlertCircle size={20} color={COLORS.error} />
            <Text style={styles.reasonTitle}>Motivo del rechazo</Text>
          </View>
          <Text style={styles.reasonText}>
            {statusData?.rejectionReason ??
              'No se proporcionó un motivo específico. Por favor, asegúrate de subir documentos oficiales legibles y de completar correctamente todos los campos.'}
          </Text>
        </View>

        <View style={styles.stepsCard}>
          <Text style={styles.stepsTitle}>Próximos pasos</Text>
          <View style={styles.stepItem}>
            <View style={styles.stepBullet} />
            <Text style={styles.stepText}>Revisa la claridad de las fotografías o PDFs.</Text>
          </View>
          <View style={styles.stepItem}>
            <View style={styles.stepBullet} />
            <Text style={styles.stepText}>Verifica que tus certificados tengan validez oficial.</Text>
          </View>
          <View style={styles.stepItem}>
            <View style={styles.stepBullet} />
            <Text style={styles.stepText}>Asegúrate de que tu información coincida con los documentos.</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          icon={<RefreshCw size={20} color="#0A0A0A" />}
          label="Corregir y reenviar"
          onPress={() => navigation.replace('CoachForm', { isResubmit: true })}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollContent: {
    padding: 24,
    alignItems: 'center',
    paddingTop: 40,
  },
  iconWrapper: {
    padding: 24,
    borderRadius: 40,
    backgroundColor: COLORS.errorMuted,
    marginBottom: 24,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 17,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  reasonCard: {
    width: '100%',
    backgroundColor: COLORS.errorMuted,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    marginBottom: 24,
  },
  reasonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  reasonTitle: {
    color: COLORS.error,
    fontSize: 17,
    fontWeight: '600',
  },
  reasonText: {
    color: COLORS.textPrimary,
    fontSize: 15,
    lineHeight: 24,
  },
  stepsCard: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  stepsTitle: {
    color: COLORS.textPrimary,
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  stepBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.textSecondary,
    marginTop: 8,
  },
  stepText: {
    color: COLORS.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    flex: 1,
  },
  footer: {
    padding: 20,
    backgroundColor: COLORS.bg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
});

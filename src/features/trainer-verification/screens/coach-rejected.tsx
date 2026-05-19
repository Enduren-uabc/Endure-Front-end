import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { XCircle, AlertCircle, RefreshCw } from 'lucide-react-native';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useMyVerificationStatus } from '@/features/trainer-verification/hooks/use-trainer-verification';
import type { CoachStackParamList } from '@/navigation/types';
import { theme } from '@/theme';

type CoachNav = NativeStackNavigationProp<CoachStackParamList>;

export default function CoachRejected() {
  const navigation = useNavigation<CoachNav>();
  const { data: statusData } = useMyVerificationStatus();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
        <View style={styles.iconWrapper}>
          <XCircle size={64} color={theme.colors.error} />
        </View>

        <Text style={styles.title}>Solicitud rechazada</Text>
        <Text style={styles.subtitle}>
          Lamentablemente, no pudimos aprobar tu solicitud de verificación en esta ocasión.
        </Text>

        <View style={styles.reasonCard}>
          <View style={styles.reasonHeader}>
            <AlertCircle size={20} color={theme.colors.error} />
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
          icon={<RefreshCw size={20} color={theme.colors.background} />}
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
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: 24,
    alignItems: 'center',
    paddingTop: 40,
  },
  iconWrapper: {
    padding: 24,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 77, 79, 0.1)',
    marginBottom: 24,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: 17,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  reasonCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 77, 79, 0.1)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 79, 0.3)',
    marginBottom: 24,
  },
  reasonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  reasonTitle: {
    color: theme.colors.error,
    fontSize: 17,
    fontWeight: '600',
  },
  reasonText: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    lineHeight: 24,
  },
  stepsCard: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  stepsTitle: {
    color: theme.colors.textPrimary,
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
    backgroundColor: theme.colors.textSecondary,
    marginTop: 8,
  },
  stepText: {
    color: theme.colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    flex: 1,
  },
  footer: {
    padding: 20,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
});

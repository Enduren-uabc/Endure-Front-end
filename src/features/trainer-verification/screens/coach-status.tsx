import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Clock, Info } from 'lucide-react-native';
import { useMyVerificationStatus, useSpecialtyCatalog } from '@/features/trainer-verification/hooks/use-trainer-verification';

const COLORS = {
  bg: '#0E0E10',
  surface: '#18181B',
  surface2: '#27272A',
  primary: '#FACC15',
  textPrimary: '#FAFAFA',
  textSecondary: '#A1A1AA',
  border: '#3F3F46',
  warning: '#F59E0B',
};

export default function CoachStatus() {
  const { data: statusData } = useMyVerificationStatus();
  const { data: specialties } = useSpecialtyCatalog();

  const specialtyNames = statusData?.specialties?.map((key) => {
    const found = specialties?.find((s) => s.key === key);
    return found?.displayName ?? key;
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
        <View style={styles.iconWrapper}>
          <Clock size={64} color={COLORS.warning} />
        </View>

        <Text style={styles.title}>Solicitud en revisión</Text>
        <Text style={styles.subtitle}>
          Nuestro equipo está validando tus documentos y experiencia. 
          Te notificaremos en cuanto haya una actualización.
        </Text>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Resumen de tu solicitud</Text>

          {specialtyNames && specialtyNames.length > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Especialidades</Text>
              <Text style={styles.summaryValue}>{specialtyNames.join(', ')}</Text>
            </View>
          )}

          {statusData?.yearsOfExperience !== undefined && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Experiencia</Text>
              <Text style={styles.summaryValue}>{statusData.yearsOfExperience} años</Text>
            </View>
          )}

          {statusData?.shortBio && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Biografía</Text>
              <Text style={styles.summaryValue}>{statusData.shortBio}</Text>
            </View>
          )}
        </View>

        <View style={styles.infoBox}>
          <Info size={20} color={COLORS.primary} />
          <Text style={styles.infoText}>
            Este proceso suele tomar entre 24 y 72 horas hábiles. Mantente atento a tus notificaciones.
          </Text>
        </View>
      </ScrollView>
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
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
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
  summaryCard: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
  },
  summaryTitle: {
    color: COLORS.textPrimary,
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'column',
    marginBottom: 16,
  },
  summaryLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  summaryValue: {
    color: COLORS.textPrimary,
    fontSize: 15,
    lineHeight: 22,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: COLORS.surface2,
    borderRadius: 12,
    padding: 16,
    width: '100%',
  },
  infoText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
});

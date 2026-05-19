import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Award, CheckCircle2, ChevronRight, Zap, Target, Users } from 'lucide-react-native';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useMyVerificationStatus } from '@/features/trainer-verification/hooks/use-trainer-verification';
import type { CoachStackParamList } from '@/navigation/types';
import { theme } from '@/theme';

type CoachNav = NativeStackNavigationProp<CoachStackParamList>;

export default function CoachHome() {
  const navigation = useNavigation<CoachNav>();
  const { data: statusData, isLoading } = useMyVerificationStatus();

  useEffect(() => {
    if (!statusData) return;
    if (statusData.status === 'pending') {
      navigation.replace('CoachStatus');
    } else if (statusData.status === 'rejected') {
      navigation.replace('CoachRejected');
    }
  }, [statusData, navigation]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.loadingText}>Cargando información...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (statusData?.status === 'approved') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.approvedScroll} bounces={false}>
          <View style={styles.approvedIconWrapper}>
            <Award size={80} color={theme.colors.success} />
          </View>
          <Text style={styles.approvedTitle}>Entrenador Verificado</Text>
          <Text style={styles.approvedSubtitle}>
            Ya eres parte de la red de entrenadores profesionales de Endure.
          </Text>
          <View style={styles.approvedCard}>
            <Text style={styles.approvedCardText}>
              Tienes acceso total a las herramientas de coach. 
              Pronto podrás gestionar clientes y rutinas personalizadas desde tu panel.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.badgeWrapper}>
            <Award size={24} color={theme.colors.primary} />
          </View>
          <Text style={styles.title}>Potencia tu carrera fitness</Text>
          <Text style={styles.description}>
            Únete a Endure como entrenador oficial. Crea programas, guía a tus clientes y escala tu negocio.
          </Text>
        </View>

        <View style={styles.benefitsSection}>
          <Text style={styles.sectionTitle}>¿Por qué unirte?</Text>
          
          <View style={styles.benefitRow}>
            <View style={styles.benefitIconBox}>
              <Zap size={20} color={theme.colors.textPrimary} />
            </View>
            <View style={styles.benefitTextCol}>
              <Text style={styles.benefitTitle}>Herramientas pro</Text>
              <Text style={styles.benefitDesc}>Diseña rutinas y monitorea progresos con datos precisos.</Text>
            </View>
          </View>

          <View style={styles.benefitRow}>
            <View style={styles.benefitIconBox}>
              <Users size={20} color={theme.colors.textPrimary} />
            </View>
            <View style={styles.benefitTextCol}>
              <Text style={styles.benefitTitle}>Más clientes</Text>
              <Text style={styles.benefitDesc}>Destaca con la insignia de verificado y llega a más atletas.</Text>
            </View>
          </View>

          <View style={styles.benefitRow}>
            <View style={styles.benefitIconBox}>
              <Target size={20} color={theme.colors.textPrimary} />
            </View>
            <View style={styles.benefitTextCol}>
              <Text style={styles.benefitTitle}>Control total</Text>
              <Text style={styles.benefitDesc}>Centraliza la gestión de clientes en una sola app.</Text>
            </View>
          </View>
        </View>

        <View style={styles.requirementsCard}>
          <Text style={styles.reqHeader}>Requisitos</Text>
          <View style={styles.reqItem}>
            <CheckCircle2 size={16} color={theme.colors.textSecondary} />
            <Text style={styles.reqText}>Identificación oficial</Text>
          </View>
          <View style={styles.reqItem}>
            <CheckCircle2 size={16} color={theme.colors.textSecondary} />
            <Text style={styles.reqText}>Certificado o título profesional</Text>
          </View>
          <View style={styles.reqItem}>
            <CheckCircle2 size={16} color={theme.colors.textSecondary} />
            <Text style={styles.reqText}>Información de perfil completa</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          label="Aplicar ahora"
          onPress={() => navigation.navigate('CoachForm')}
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: theme.colors.textSecondary,
    fontSize: 15,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginTop: 20,
    marginBottom: 40,
  },
  badgeWrapper: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 38,
    marginBottom: 12,
  },
  description: {
    color: theme.colors.textSecondary,
    fontSize: 17,
    lineHeight: 24,
  },
  benefitsSection: {
    gap: 24,
    marginBottom: 40,
  },
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  benefitIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  benefitTextCol: {
    flex: 1,
  },
  benefitTitle: {
    color: theme.colors.textPrimary,
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  benefitDesc: {
    color: theme.colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  requirementsCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  reqHeader: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
  },
  reqItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  reqText: {
    color: theme.colors.textSecondary,
    fontSize: 15,
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
  approvedCard: {
    backgroundColor: theme.colors.surface,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    width: '100%',
  },
  approvedCardText: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
  },
});

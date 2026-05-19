import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Award, CheckCircle2, Sparkles, Shield, ScanLine } from 'lucide-react-native';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import type { CoachStackParamList } from '@/navigation/types';
import { theme } from '@/theme';

type CoachNav = NativeStackNavigationProp<CoachStackParamList>;

export default function PowerspikeHome() {
  const navigation = useNavigation<CoachNav>();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.badgeWrapper}>
            <Sparkles size={28} color={theme.colors.primary} />
          </View>
          <Text style={styles.title}>Verificación inteligente</Text>
          <Text style={styles.description}>
            Activa tu perfil de entrenador con prevalidación documental automatizada.
            Sube tus documentos y recibe una revisión más rápida.
          </Text>
        </View>

        <View style={styles.benefitsSection}>
          <Text style={styles.sectionTitle}>Proceso simplificado</Text>

          <View style={styles.stepRow}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepTextCol}>
              <Text style={styles.stepTitle}>Sube tu certificado</Text>
              <Text style={styles.stepDesc}>Captura o selecciona tu título o certificado profesional.</Text>
            </View>
          </View>

          <View style={styles.stepRow}>
            <View style={styles.stepNumber}>
              <ScanLine size={18} color={theme.colors.primary} />
            </View>
            <View style={styles.stepTextCol}>
              <Text style={styles.stepTitle}>Prevalidación con IA</Text>
              <Text style={styles.stepDesc}>El sistema extrae y verifica los datos de tus documentos automáticamente.</Text>
            </View>
          </View>

          <View style={styles.stepRow}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepTextCol}>
              <Text style={styles.stepTitle}>Sube tu identificación</Text>
              <Text style={styles.stepDesc}>Agrega tu INE o pasaporte para confirmar tu identidad.</Text>
            </View>
          </View>

          <View style={styles.stepRow}>
            <View style={styles.stepNumber}>
              <Shield size={18} color={theme.colors.primary} />
            </View>
            <View style={styles.stepTextCol}>
              <Text style={styles.stepTitle}>Revisión humana final</Text>
              <Text style={styles.stepDesc}>Un administrador revisa tu expediente y confirma tu registro.</Text>
            </View>
          </View>
        </View>

        <View style={styles.requirementsCard}>
          <Text style={styles.reqHeader}>Requisitos</Text>
          <View style={styles.reqItem}>
            <CheckCircle2 size={16} color={theme.colors.textSecondary} />
            <Text style={styles.reqText}>Identificación oficial vigente</Text>
          </View>
          <View style={styles.reqItem}>
            <CheckCircle2 size={16} color={theme.colors.textSecondary} />
            <Text style={styles.reqText}>Certificado o título profesional en fitness</Text>
          </View>
          <View style={styles.reqItem}>
            <CheckCircle2 size={16} color={theme.colors.textSecondary} />
            <Text style={styles.reqText}>Información de perfil completa</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          label="Comenzar solicitud"
          onPress={() => navigation.navigate('PowerspikeForm')}
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
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginTop: 20,
    marginBottom: 40,
  },
  badgeWrapper: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.colors.primaryMuted,
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
    gap: 20,
    marginBottom: 40,
  },
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  stepNumberText: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  stepTextCol: {
    flex: 1,
  },
  stepTitle: {
    color: theme.colors.textPrimary,
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  stepDesc: {
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
});

import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertCircle, FileText, RefreshCcw, ShieldCheck, WifiOff } from 'lucide-react-native';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { theme } from '@/theme';

type PrivacyState = 'offline-copy' | 'loading' | 'error';

const PRIVACY_SECTIONS = [
  {
    title: 'Datos que usamos',
    body:
      'Endure usa los datos de tu cuenta, perfil deportivo, rutinas y sesiones para mostrar progreso, historial y recomendaciones dentro de la app.',
  },
  {
    title: 'Uso de entrenadores',
    body:
      'Si te vinculas con un entrenador, solo compartimos la informacion necesaria para gestionar rutinas asignadas y revisar tu progreso de entrenamiento.',
  },
  {
    title: 'Seguridad',
    body:
      'Tus credenciales y tokens se manejan mediante mecanismos seguros del dispositivo. No mostramos contrasenas ni informacion sensible en pantalla.',
  },
  {
    title: 'Tus decisiones',
    body:
      'Puedes configurar recordatorios, cerrar sesion y solicitar soporte desde la seccion de configuracion cuando lo necesites.',
  },
];

export default function PrivacyNoticeScreen() {
  const [state, setState] = React.useState<PrivacyState>('offline-copy');

  const retry = React.useCallback(() => {
    setState('loading');
    setTimeout(() => setState('offline-copy'), 700);
  }, []);

  const showError = React.useCallback(() => {
    setState('error');
  }, []);

  if (state === 'loading') {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.primary} size="large" />
          <Text style={styles.centerTitle}>Cargando aviso</Text>
          <Text style={styles.centerText}>Estamos revisando si hay una version mas reciente.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (state === 'error') {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <View style={styles.center}>
          <View style={styles.errorIcon}>
            <AlertCircle size={36} color={theme.colors.error} />
          </View>
          <Text style={styles.centerTitle}>No hay copia disponible</Text>
          <Text style={styles.centerText}>
            No pudimos cargar el aviso de privacidad ni encontrar una copia guardada.
          </Text>
          <PrimaryButton
            label="Reintentar"
            onPress={retry}
            icon={<RefreshCcw size={18} color={theme.colors.background} />}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <FileText size={28} color={theme.colors.primary} />
          </View>
          <Text style={styles.title}>Aviso de privacidad</Text>
          <Text style={styles.subtitle}>
            Version local 1.0 · Actualizado el 24 de mayo de 2026
          </Text>
        </View>

        <View style={styles.offlineBanner}>
          <WifiOff size={18} color={theme.colors.warning} />
          <View style={styles.bannerCopy}>
            <Text style={styles.bannerTitle}>Estas viendo una copia guardada</Text>
            <Text style={styles.bannerText}>
              Cuando vuelvas a tener conexion podras revisar si existe una version mas reciente.
            </Text>
          </View>
        </View>

        <View style={styles.legalCard}>
          <View style={styles.legalHeader}>
            <ShieldCheck size={22} color={theme.colors.success} />
            <Text style={styles.legalTitle}>Resumen de uso de datos</Text>
          </View>
          {PRIVACY_SECTIONS.map((section) => (
            <View key={section.title} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Text style={styles.sectionBody}>{section.body}</Text>
            </View>
          ))}
        </View>

        <View style={styles.actions}>
          <SecondaryButton
            label="Reintentar"
            onPress={retry}
          />
          <TouchableOpacity style={styles.textAction} onPress={showError} activeOpacity={0.8}>
            <Text style={styles.textActionLabel}>Ver estado sin copia local</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scroll: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
    gap: theme.spacing.lg,
  },
  header: {
    gap: theme.spacing.sm,
  },
  headerIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.primaryMuted,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading1.fontSize,
    lineHeight: theme.typography.heading1.lineHeight,
    fontWeight: theme.typography.heading1.fontWeight,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  offlineBanner: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: theme.colors.warning,
    borderWidth: 1,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
  },
  bannerCopy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  bannerTitle: {
    color: theme.colors.warning,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: theme.typography.bodyStrong.fontWeight,
  },
  bannerText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  legalCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  legalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  legalTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading3.fontSize,
    lineHeight: theme.typography.heading3.lineHeight,
    fontWeight: theme.typography.heading3.fontWeight,
  },
  section: {
    gap: theme.spacing.xs,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  sectionTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: theme.typography.bodyStrong.fontWeight,
  },
  sectionBody: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
  },
  actions: {
    gap: theme.spacing.md,
  },
  textAction: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textActionLabel: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  center: {
    flex: 1,
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
  },
  centerTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading2.fontSize,
    lineHeight: theme.typography.heading2.lineHeight,
    fontWeight: theme.typography.heading2.fontWeight,
    textAlign: 'center',
  },
  centerText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    textAlign: 'center',
  },
  errorIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.error,
  },
});

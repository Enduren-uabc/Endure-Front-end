import React from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Bell, ChevronRight, FileText, HelpCircle, LogOut, Shield } from 'lucide-react-native';
import { theme } from '@/theme';
import { useLogout } from '@/features/auth/hooks/use-auth';
import type { SettingsStackParamList } from '@/navigation/types';

type SettingsNavigation = NativeStackNavigationProp<SettingsStackParamList, 'SettingsHome'>;

export default function SettingsScreen() {
  const navigation = useNavigation<SettingsNavigation>();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: () => logoutMutation.mutate(),
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Configuración</Text>
          <Text style={styles.subtitle}>
            Ajusta notificaciones, privacidad y estado de tu cuenta.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferencias</Text>
          <View style={styles.card}>
            <SettingsRow
              icon={<Bell size={20} color={theme.colors.primary} />}
              title="Recordatorios"
              subtitle="Hora, días y avisos de entrenamiento"
              onPress={() => navigation.navigate('Reminders')}
            />
            <SettingsRow
              icon={<FileText size={20} color={theme.colors.primary} />}
              title="Aviso de privacidad"
              subtitle="Copia local, versión y disponibilidad"
              onPress={() => navigation.navigate('PrivacyNotice')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cuenta</Text>
          <View style={styles.card}>
            <StaticRow
              icon={<Shield size={20} color={theme.colors.success} />}
              title="Sesión segura"
              subtitle="Los tokens se limpian al cerrar sesión"
            />
            <StaticRow
              icon={<HelpCircle size={20} color={theme.colors.textSecondary} />}
              title="Soporte"
              subtitle="Disponible desde el menú lateral"
            />
          </View>
        </View>

        <View style={styles.optionsSection}>
          <TouchableOpacity
            style={styles.optionRow}
            onPress={() => navigation.navigate('PrivacyNotice')}
            activeOpacity={0.7}
          >
            <View style={styles.optionIconContainer}>
              <FileText size={22} color={theme.colors.primary} />
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>Aviso de privacidad</Text>
              <Text style={styles.optionSubtitle}>Consulta el aviso de privacidad de Endure</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <View style={styles.logoutSection}>
          <TouchableOpacity
            style={[styles.logoutButton, logoutMutation.isPending && styles.logoutButtonDisabled]}
            onPress={handleLogout}
            disabled={logoutMutation.isPending}
            activeOpacity={0.7}
          >
            {logoutMutation.isPending ? (
              <ActivityIndicator color={theme.colors.error} />
            ) : (
              <>
                <LogOut size={18} color={theme.colors.error} />
                <Text style={styles.logoutText}>Cerrar sesión</Text>
              </>
            )}
          </TouchableOpacity>
          {logoutMutation.isError && (
            <Text style={styles.errorText}>
              {logoutMutation.error?.message ?? 'Error al cerrar sesión'}
            </Text>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

function SettingsRow({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.82}>
      <View style={styles.rowIcon}>{icon}</View>
      <View style={styles.rowCopy}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowSubtitle}>{subtitle}</Text>
      </View>
      <ChevronRight size={18} color={theme.colors.textMuted} />
    </TouchableOpacity>
  );
}

function StaticRow({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowIcon}>{icon}</View>
      <View style={styles.rowCopy}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    gap: theme.spacing.xl,
  },
  header: {
    gap: theme.spacing.sm,
  },
  title: {
    color: theme.colors.primary,
    fontSize: theme.typography.heading1.fontSize,
    lineHeight: theme.typography.heading1.lineHeight,
    fontWeight: theme.typography.heading1.fontWeight,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
  },
  section: {
    gap: theme.spacing.sm,
  },
  sectionTitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
  },
  row: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomColor: theme.colors.border,
    borderBottomWidth: 1,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowCopy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  rowTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: theme.typography.bodyStrong.fontWeight,
  },
  rowSubtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  optionsSection: {
    marginTop: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.md,
    gap: theme.spacing.md,
  },
  optionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    fontWeight: '600',
  },
  optionSubtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    marginTop: 2,
  },
  },
  divider: {
    flex: 1,
  },
  logoutSection: {
    paddingTop: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  logoutButton: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    minHeight: 52,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    width: '100%',
  },
  logoutButtonDisabled: {
    borderColor: theme.colors.borderSoft,
  },
  logoutText: {
    color: theme.colors.error,
    fontSize: theme.typography.button.fontSize,
    lineHeight: theme.typography.button.lineHeight,
    fontWeight: theme.typography.button.fontWeight,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
});

import React from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { FileText } from 'lucide-react-native';
import { theme } from '@/theme';
import { useLogout } from '@/features/auth/hooks/use-auth';

export default function SettingsScreen() {
  const navigation = useNavigation<any>();
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
        <Text style={styles.title}>Configuración</Text>

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
              <Text style={styles.logoutText}>Cerrar sesión</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading1.fontSize,
    lineHeight: theme.typography.heading1.lineHeight,
    fontWeight: theme.typography.heading1.fontWeight,
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

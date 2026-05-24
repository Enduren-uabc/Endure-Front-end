import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShieldAlert } from 'lucide-react-native';
import { theme } from '@/theme';
import { usePrivacyNotice } from '../hooks/use-privacy-notice';

export default function PrivacyScreen() {
  const { state, refetch } = usePrivacyNotice();

  const renderContent = () => {
    switch (state.type) {
      case 'loading':
        return (
          <View style={styles.centeredContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Cargando aviso de privacidad...</Text>
          </View>
        );

      case 'error':
        return (
          <View style={styles.centeredContainer}>
            <ShieldAlert size={48} color={theme.colors.error} />
            <Text style={styles.errorTitle}>Error al cargar</Text>
            <Text style={styles.errorMessage}>{state.message}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={refetch} activeOpacity={0.7}>
              <Text style={styles.retryButtonText}>Intentar de nuevo</Text>
            </TouchableOpacity>
          </View>
        );

      case 'unavailable':
        return (
          <View style={styles.centeredContainer}>
            <ShieldAlert size={48} color={theme.colors.warning} />
            <Text style={styles.unavailableTitle}>No disponible</Text>
            <Text style={styles.unavailableMessage}>{state.message}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={refetch} activeOpacity={0.7}>
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        );

      case 'updateFailed':
        return (
          <View style={styles.centeredContainer}>
            <ShieldAlert size={48} color={theme.colors.error} />
            <Text style={styles.updateFailedTitle}>Actualización fallida</Text>
            <Text style={styles.updateFailedMessage}>{state.message}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={refetch} activeOpacity={0.7}>
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        );

      case 'success':
        return (
          <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
          >
            <View style={styles.metadataContainer}>
              <View style={styles.metadataBadge}>
                <Text style={styles.metadataLabel}>Versión</Text>
                <Text style={styles.metadataValue}>{state.notice.version}</Text>
              </View>
              <View style={styles.metadataBadge}>
                <Text style={styles.metadataLabel}>Actualizado</Text>
                <Text style={styles.metadataValue}>
                  {new Date(state.notice.updatedAt).toLocaleDateString('es-MX', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
              </View>
              {state.source === 'local' && (
                <View style={[styles.metadataBadge, styles.offlineBadge]}>
                  <Text style={[styles.metadataLabel, styles.offlineLabel]}>Sin conexión</Text>
                  <Text style={[styles.metadataValue, styles.offlineValue]}>Copia local</Text>
                </View>
              )}
            </View>

            <View style={styles.contentContainer}>
              <Text style={styles.contentText}>{state.notice.content}</Text>
            </View>
          </ScrollView>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {renderContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading2.fontSize,
    lineHeight: theme.typography.heading2.lineHeight,
    fontWeight: theme.typography.heading2.fontWeight,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  loadingText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    textAlign: 'center',
  },
  errorTitle: {
    color: theme.colors.error,
    fontSize: theme.typography.heading3.fontSize,
    lineHeight: theme.typography.heading3.lineHeight,
    fontWeight: theme.typography.heading3.fontWeight,
    textAlign: 'center',
  },
  errorMessage: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    textAlign: 'center',
  },
  unavailableTitle: {
    color: theme.colors.warning,
    fontSize: theme.typography.heading3.fontSize,
    lineHeight: theme.typography.heading3.lineHeight,
    fontWeight: theme.typography.heading3.fontWeight,
    textAlign: 'center',
  },
  unavailableMessage: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary,
    marginTop: theme.spacing.sm,
  },
  updateFailedTitle: {
    color: theme.colors.error,
    fontSize: theme.typography.heading3.fontSize,
    lineHeight: theme.typography.heading3.lineHeight,
    fontWeight: theme.typography.heading3.fontWeight,
    textAlign: 'center',
  },
  updateFailedMessage: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    textAlign: 'center',
  },
  retryButtonText: {
    color: theme.colors.background,
    fontSize: theme.typography.button.fontSize,
    lineHeight: theme.typography.button.lineHeight,
    fontWeight: theme.typography.button.fontWeight,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxxl,
  },
  metadataContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  metadataBadge: {
    backgroundColor: theme.colors.surfaceElevated,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  metadataLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    marginBottom: 2,
  },
  metadataValue: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
    fontWeight: '600',
  },
  offlineBadge: {
    backgroundColor: 'rgba(255, 138, 0, 0.1)',
    borderColor: theme.colors.warning,
  },
  offlineLabel: {
    color: theme.colors.warning,
  },
  offlineValue: {
    color: theme.colors.warning,
  },
  contentContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
  },
  contentText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight * 1.6,
  },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { FileText, Eye, Shield, X, Info } from 'lucide-react-native';
import { BaseCard } from '@/components/ui/BaseCard';
import { theme } from '@/theme';
import type { CertificateItem, IdDocumentItem } from '../types/admin-verification';

interface VerificationFilesCardProps {
  certificates: CertificateItem[];
  idDocuments: IdDocumentItem[];
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function openDocument(url: string): Promise<void> {
  try {
    await WebBrowser.openBrowserAsync(url, {
      toolbarColor: theme.colors.background,
      controlsColor: theme.colors.primary,
    });
  } catch {
    Alert.alert('Error', 'No se pudo abrir el documento.');
  }
}

function DocumentRow({
  label,
  fileName,
  fileSize,
  signedUrl,
  isProtected,
  onProtectedPress,
}: {
  label: string;
  fileName: string;
  fileSize: number;
  signedUrl?: string;
  isProtected?: boolean;
  onProtectedPress?: () => void;
}) {
  return (
    <View style={styles.documentRow}>
      <View style={styles.docIcon}>
        <FileText size={20} color={theme.colors.primary} />
      </View>
      <View style={styles.docInfo}>
        <Text style={styles.docLabel}>{label}</Text>
        <Text style={styles.docName}>{fileName}</Text>
        <Text style={styles.docSize}>{formatFileSize(fileSize)}</Text>
      </View>
      {signedUrl ? (
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => openDocument(signedUrl)}
          activeOpacity={0.7}
        >
          <Eye size={18} color={theme.colors.primary} />
          <Text style={styles.viewButtonText}>Ver</Text>
        </TouchableOpacity>
      ) : isProtected ? (
        <TouchableOpacity
          style={styles.protectedBadge}
          onPress={onProtectedPress}
          activeOpacity={0.7}
        >
          <Shield size={14} color={theme.colors.textMuted} />
          <Text style={styles.protectedText}>Protegido</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export function VerificationFilesCard({ certificates, idDocuments }: VerificationFilesCardProps) {
  const [showProtectedModal, setShowProtectedModal] = useState(false);

  return (
    <BaseCard style={styles.card}>
      <Text style={styles.title}>Documentos</Text>

      {certificates.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Certificados</Text>
          {certificates.map((cert) => (
            <DocumentRow
              key={cert.id}
              label={cert.name || 'Certificado'}
              fileName={cert.fileName}
              fileSize={cert.fileSize}
              signedUrl={cert.signedUrl}
            />
          ))}
        </View>
      )}

      {idDocuments.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Identificaciones</Text>
          {idDocuments.map((doc) => {
            const typeLabel: Record<string, string> = {
              ine_front: 'INE (Frente)',
              ine_back: 'INE (Reverso)',
              passport: 'Pasaporte',
              other: 'Identificación',
            };
            return (
              <DocumentRow
                key={doc.id}
                label={typeLabel[doc.documentType] || doc.documentType}
                fileName={doc.fileName}
                fileSize={doc.fileSize}
                signedUrl={doc.signedUrl}
                isProtected={!doc.signedUrl}
                onProtectedPress={() => setShowProtectedModal(true)}
              />
            );
          })}
        </View>
      )}

      {certificates.length === 0 && idDocuments.length === 0 && (
        <Text style={styles.emptyText}>No hay documentos disponibles.</Text>
      )}

      <Modal
        visible={showProtectedModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowProtectedModal(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowProtectedModal(false)}
              activeOpacity={0.7}
            >
              <X size={20} color={theme.colors.textMuted} />
            </TouchableOpacity>

            <View style={styles.modalIcon}>
              <Shield size={40} color={theme.colors.warning} />
            </View>

            <Text style={styles.modalTitle}>Documento protegido</Text>
            <Text style={styles.modalDescription}>
              Por política de seguridad y minimización de datos sensibles, los
              documentos de identificación no están disponibles para vista previa
              en el flujo PowerSpike.
            </Text>
            <Text style={styles.modalDescription}>
              Los datos extraídos del documento (nombre, tipo, vigencia) ya están
              disponibles en la sección "Datos extraídos" de esta pantalla.
            </Text>
            <Text style={styles.modalNote}>
              Si necesitas acceder al documento original, contacta al
              administrador del sistema.
            </Text>
          </View>
        </View>
      </Modal>
    </BaseCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 16,
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  documentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  docIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: theme.colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docInfo: {
    flex: 1,
  },
  docLabel: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  docName: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginTop: 1,
  },
  docSize: {
    color: theme.colors.textMuted,
    fontSize: 11,
    marginTop: 1,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  viewButtonText: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  protectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: theme.colors.surfaceElevated,
  },
  protectedText: {
    color: theme.colors.textMuted,
    fontSize: 11,
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 16,
  },
  overlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  modalContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: 24,
    maxWidth: 400,
    width: '100%',
    alignItems: 'center',
  },
  closeButton: {
    alignSelf: 'flex-end',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.warning + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  modalTitle: {
    color: theme.colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  modalDescription: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalNote: {
    color: theme.colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
});

import React from 'react';
import { View, Text, StyleSheet, Linking } from 'react-native';
import { CheckCircle2, AlertTriangle, FileText, Link, Calendar, Hash, Globe, CreditCard, User, Shield } from 'lucide-react-native';
import { BaseCard } from '@/components/ui/BaseCard';
import { theme } from '@/theme';

export interface CertificateExtractionData {
  fullName: string;
  name: string;
  institution: string;
  certifyingInstitution?: string;
  issueDate?: string;
  expirationDate?: string;
  folioNumber?: string;
  qrUrl?: string;
  ocrConfidence: number;
  curp?: string;
  competencyStandardCode?: string;
  competencyStandardName?: string;
}

export interface IdExtractionData {
  fullName: string;
  documentType: string;
  issuingCountry?: string;
  birthDate?: string;
  expirationDate?: string;
  documentIdentifier?: string;
  ocrConfidence: number;
  curp?: string;
}

function formatDate(dateStr?: string): string | null {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function ConfidenceBar({ value }: { value: number }) {
  let color: string = theme.colors.error;
  if (value >= 0.8) color = theme.colors.success;
  else if (value >= 0.5) color = theme.colors.warning;

  return (
    <View style={confidenceStyles.container}>
      <View style={[confidenceStyles.track, { backgroundColor: theme.colors.surfaceElevated }]}>
        <View
          style={[
            confidenceStyles.fill,
            { width: `${Math.round(value * 100)}%`, backgroundColor: color },
          ]}
        />
      </View>
      <Text style={[confidenceStyles.text, { color }]}>
        {Math.round(value * 100)}% confianza OCR
      </Text>
    </View>
  );
}

const confidenceStyles = StyleSheet.create({
  container: {
    marginTop: 12,
  },
  track: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
  },
});

function DataRow({
  icon,
  label,
  value,
  isLink,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
  isLink?: boolean;
}) {
  if (!value) return null;
  return (
    <View style={rowStyles.row}>
      <View style={rowStyles.icon}>{icon}</View>
      <View style={rowStyles.content}>
        <Text style={rowStyles.label}>{label}</Text>
        {isLink ? (
          <Text
            style={rowStyles.link}
            onPress={() => Linking.openURL(value)}
            numberOfLines={1}
          >
            {value}
          </Text>
        ) : (
          <Text style={rowStyles.value} numberOfLines={2}>
            {value}
          </Text>
        )}
      </View>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  icon: {
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  label: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  value: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  link: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});

export function CertificateExtractionCard({ data }: { data: CertificateExtractionData }) {
  return (
    <BaseCard style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.iconWrapper, { backgroundColor: 'rgba(34, 197, 94, 0.1)' }]}>
          <FileText size={18} color={theme.colors.success} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.cardTitle}>Datos extraídos del certificado</Text>
          <Text style={styles.cardSubtitle}>Verificación automática con IA</Text>
        </View>
        <CheckCircle2 size={20} color={theme.colors.success} />
      </View>

      <View style={styles.divider} />

      <DataRow icon={<User size={16} color={theme.colors.primary} />} label="Nombre del titular" value={data.fullName} />
      <DataRow icon={<Shield size={16} color={theme.colors.primary} />} label="Certificado" value={data.name} />
      <DataRow icon={<FileText size={16} color={theme.colors.primary} />} label="Institución emisora" value={data.institution} />
      <DataRow icon={<FileText size={16} color={theme.colors.primary} />} label="Institución certificadora" value={data.certifyingInstitution} />
      <DataRow icon={<Calendar size={16} color={theme.colors.primary} />} label="Fecha de emisión" value={formatDate(data.issueDate)} />
      <DataRow icon={<Calendar size={16} color={theme.colors.primary} />} label="Fecha de expiración" value={formatDate(data.expirationDate)} />
      <DataRow icon={<Hash size={16} color={theme.colors.primary} />} label="Folio / Número" value={data.folioNumber} />
      <DataRow icon={<CreditCard size={16} color={theme.colors.primary} />} label="CURP" value={data.curp} />
      <DataRow icon={<Shield size={16} color={theme.colors.primary} />} label="Estándar de competencia" value={data.competencyStandardName ?? data.competencyStandardCode} />
      <DataRow icon={<Link size={16} color={theme.colors.primary} />} label="URL de verificación" value={data.qrUrl} isLink />

      <ConfidenceBar value={data.ocrConfidence} />
    </BaseCard>
  );
}

export function IdExtractionCard({ data }: { data: IdExtractionData }) {
  const docTypeLabel: Record<string, string> = {
    ine: 'INE',
    passport: 'Pasaporte',
    driver_license: 'Licencia de conducir',
    other: 'Otro',
  };

  return (
    <BaseCard style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.iconWrapper, { backgroundColor: 'rgba(34, 197, 94, 0.1)' }]}>
          <CreditCard size={18} color={theme.colors.success} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.cardTitle}>Datos extraídos de la identificación</Text>
          <Text style={styles.cardSubtitle}>Verificación automática con IA</Text>
        </View>
        <CheckCircle2 size={20} color={theme.colors.success} />
      </View>

      <View style={styles.divider} />

      <DataRow icon={<User size={16} color={theme.colors.primary} />} label="Nombre completo" value={data.fullName} />
      <DataRow icon={<FileText size={16} color={theme.colors.primary} />} label="Tipo de documento" value={docTypeLabel[data.documentType] ?? data.documentType} />
      <DataRow icon={<Globe size={16} color={theme.colors.primary} />} label="País emisor" value={data.issuingCountry} />
      <DataRow icon={<Calendar size={16} color={theme.colors.primary} />} label="Fecha de nacimiento" value={formatDate(data.birthDate)} />
      <DataRow icon={<Calendar size={16} color={theme.colors.primary} />} label="Fecha de expiración" value={formatDate(data.expirationDate)} />
      <DataRow icon={<Hash size={16} color={theme.colors.primary} />} label="Número de documento" value={data.documentIdentifier} />
      <DataRow icon={<CreditCard size={16} color={theme.colors.primary} />} label="CURP" value={data.curp} />

      <ConfidenceBar value={data.ocrConfidence} />
    </BaseCard>
  );
}

export function ExtractionErrorCard({ message }: { message: string }) {
  return (
    <BaseCard style={[styles.card, styles.errorCard]}>
      <View style={styles.header}>
        <View style={[styles.iconWrapper, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
          <AlertTriangle size={18} color={theme.colors.error} />
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.cardTitle, { color: theme.colors.error }]}>Error en extracción</Text>
          <Text style={styles.cardSubtitle}>{message}</Text>
        </View>
      </View>
    </BaseCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    padding: 16,
  },
  errorCard: {
    borderColor: theme.colors.error,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  cardTitle: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  cardSubtitle: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 12,
  },
});

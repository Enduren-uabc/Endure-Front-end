import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  CheckCircle2,
  Clock,
  User,
  ShieldCheck,
  FileText,
  AlertTriangle,
  ScanLine,
  Activity,
} from 'lucide-react-native';
import { BaseCard } from '@/components/ui/BaseCard';
import { theme } from '@/theme';
import type { StatusChangeItem, AuditEventItem } from '../types/admin-verification';

interface StatusTimelineProps {
  statusHistory?: StatusChangeItem[];
  auditEvents?: AuditEventItem[];
}

function getEventIcon(eventType: string, size: number = 16) {
  const color = theme.colors.textMuted;
  const props = { size, color };

  if (eventType === 'admin_decision') return <CheckCircle2 {...props} color={theme.colors.success} />;
  if (eventType === 'admin_access') return <ShieldCheck {...props} color={theme.colors.primary} />;
  if (eventType === 'risk_calculated') return <Activity {...props} color={theme.colors.warning} />;
  if (eventType === 'document_uploaded') return <FileText {...props} />;
  if (eventType === 'extraction_failed') return <AlertTriangle {...props} color={theme.colors.error} />;
  if (eventType === 'document_extracted') return <ScanLine {...props} color={theme.colors.success} />;
  return <Clock {...props} />;
}

function getActorLabel(actorType: string): string {
  switch (actorType) {
    case 'system': return 'Sistema';
    case 'user': return 'Usuario';
    case 'admin': return 'Admin';
    default: return actorType;
  }
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: 'Borrador creado',
    certificate_uploaded: 'Certificado subido',
    certificate_extraction_pending: 'Extrayendo certificado...',
    certificate_extracted: 'Certificado extraído',
    certificate_extraction_failed: 'Error en extracción de certificado',
    id_uploaded: 'ID subido',
    id_extraction_pending: 'Extrayendo ID...',
    id_extracted: 'ID extraído',
    id_extraction_failed: 'Error en extracción de ID',
    identity_compared: 'Identidad comparada',
    risk_calculated: 'Riesgo calculado',
    manual_review_pending: 'Enviado a revisión',
    manual_review_in_progress: 'En revisión',
    correction_required: 'Corrección solicitada',
    approved: 'Aprobado',
    rejected: 'Rechazado',
    blocked_for_risk: 'Bloqueado por riesgo',
  };
  return labels[status] ?? status;
}

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Ahora';
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours} h`;
  if (diffDays < 7) return `Hace ${diffDays} d`;
  return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
}

export function StatusTimeline({ statusHistory, auditEvents }: StatusTimelineProps) {
  const merged: { date: Date; type: 'transition' | 'audit'; content: string; eventType: string }[] = [];

  statusHistory?.forEach((s) => {
    merged.push({
      date: new Date(s.createdAt),
      type: 'transition',
      content: `${getStatusLabel(s.toStatus)}${s.reason ? ` — ${s.reason}` : ''}`,
      eventType: s.actorType === 'system' ? 'system_transition' : 'user_transition',
    });
  });

  auditEvents?.forEach((e) => {
    merged.push({
      date: new Date(e.createdAt),
      type: 'audit',
      content: e.description,
      eventType: e.eventType,
    });
  });

  merged.sort((a, b) => b.date.getTime() - a.date.getTime());

  if (merged.length === 0) return null;

  return (
    <BaseCard style={styles.card}>
      <Text style={styles.title}>Historial</Text>
      <View style={styles.timeline}>
        {merged.map((item, idx) => (
          <View key={idx} style={styles.eventRow}>
            <View style={styles.eventDot}>
              {getEventIcon(item.eventType, 16)}
            </View>
            <View style={[styles.eventLine, idx === merged.length - 1 && styles.eventLineLast]}>
              <Text style={styles.eventContent}>{item.content}</Text>
              <Text style={styles.eventTime}>{formatTimestamp(item.date.toISOString())}</Text>
            </View>
          </View>
        ))}
      </View>
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
  timeline: {
    paddingLeft: 4,
  },
  eventRow: {
    flexDirection: 'row',
    gap: 12,
    minHeight: 36,
  },
  eventDot: {
    width: 24,
    alignItems: 'center',
    paddingTop: 2,
  },
  eventLine: {
    flex: 1,
    paddingBottom: 16,
    borderLeftWidth: 1,
    borderLeftColor: theme.colors.border,
    paddingLeft: 12,
  },
  eventLineLast: {
    borderLeftWidth: 0,
    paddingBottom: 0,
  },
  eventContent: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    lineHeight: 20,
  },
  eventTime: {
    color: theme.colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
});

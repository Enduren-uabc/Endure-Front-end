import React from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AlertCircle, Award, CheckCircle2, ChevronRight, Eye, History, Share2, X } from 'lucide-react-native';
import { BaseCard } from '@/components/ui/BaseCard';
import { DragIndicator } from '@/components/ui/DragIndicator';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { theme } from '@/theme';
import {
  TrainingV2ChipRow,
  TrainingV2FieldPreview,
  TrainingV2ProgressBar,
  TrainingV2Screen,
  TrainingV2SearchField,
  TrainingV2SectionHeader,
  TrainingV2Tag,
} from './TrainingV2Primitives';
import {
  TrainingV2EmptyState,
  TrainingV2ErrorState,
  TrainingV2SkeletonList,
} from './TrainingV2States';
import { useWorkoutHistory, useWorkoutSessionDetail } from '@/features/training/hooks/use-workout-session';
import type { WorkoutStackParamList } from '@/navigation/types';
import type { WorkoutSessionSummary } from '@/features/training/types/workout-session';

const filters = ['Todos', 'Semana', 'Mes'];
type Props = NativeStackScreenProps<WorkoutStackParamList, 'WorkoutHistory'>;

function formatDate(dateStr: string): string {
  try {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} dias`;
    return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
  } catch {
    return dateStr;
  }
}

export default function WorkoutHistoryV2Screen({ navigation }: Props) {
  const [query, setQuery] = React.useState('');
  const [selectedFilter, setSelectedFilter] = React.useState('Todos');
  const [selectedSession, setSelectedSession] = React.useState<WorkoutSessionSummary | null>(null);
  const [detailSessionId, setDetailSessionId] = React.useState<string | null>(null);
  const { data: history, isLoading, isError, refetch } = useWorkoutHistory();
  const { data: session, isLoading: detailLoading, isError: detailError, refetch: refetchDetail } = useWorkoutSessionDetail(detailSessionId ?? undefined);

  const sessions = history?.sessions ?? [];

  const filteredSessions = sessions.filter((item) => {
    const matchesQuery = item.routineName.toLowerCase().includes(query.trim().toLowerCase());
    if (selectedFilter === 'Todos') return matchesQuery;
    if (selectedFilter === 'Semana') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return matchesQuery && new Date(item.startedAt) >= weekAgo;
    }
    if (selectedFilter === 'Mes') {
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      return matchesQuery && new Date(item.startedAt) >= monthAgo;
    }
    return matchesQuery;
  });

  const closeActionModal = React.useCallback(() => {
    setSelectedSession(null);
  }, []);

  const handleViewDetail = React.useCallback(() => {
    const id = selectedSession?.id;
    closeActionModal();
    if (id) {
      setDetailSessionId(id);
    }
  }, [selectedSession, closeActionModal]);

  const handleShare = React.useCallback(() => {
    const id = selectedSession?.id;
    closeActionModal();
    if (id) {
      navigation.navigate('CreateWorkoutPost', { sessionId: id });
    }
  }, [selectedSession, closeActionModal, navigation]);

  const closeDetailSheet = React.useCallback(() => {
    setDetailSessionId(null);
  }, []);

  const totalSets = session?.exercises?.reduce(
    (sum, ex) => sum + (ex.workoutSets?.length ?? ex.targetSets?.length ?? 0), 0
  ) ?? 0;
  const completedSets = session?.exercises?.reduce(
    (sum, ex) => sum + (ex.workoutSets?.filter((s) => s.completed).length ?? 0), 0
  ) ?? 0;

  function renderContent() {
    if (isLoading) {
      return <TrainingV2SkeletonList rows={3} />;
    }

    if (isError) {
      return (
        <TrainingV2ErrorState
          title="No pudimos cargar tu historial"
          description="Intenta nuevamente para consultar tus entrenamientos."
          onAction={() => refetch()}
        />
      );
    }

    if (filteredSessions.length === 0) {
      return (
        <TrainingV2EmptyState
          title="Aun no hay entrenamientos"
          description="Cuando termines una sesion, aparecera en este historial."
          actionLabel="Empezar rutina"
          onAction={() => navigation.navigate('WorkoutStart')}
        />
      );
    }

    return (
      <View style={styles.historyList}>
        {filteredSessions.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.84}
            onPress={() => setSelectedSession(item)}
          >
            <BaseCard style={styles.historyCard}>
              <View style={styles.historyHeader}>
                <View style={styles.historyIcon}>
                  <History size={20} color={theme.colors.primary} />
                </View>
                <View style={styles.historyTitleWrap}>
                  <Text style={styles.historyTitle}>{item.routineName}</Text>
                  <Text style={styles.historyMeta}>
                    {formatDate(item.startedAt)} - {item.durationMinutes} min
                  </Text>
                </View>
                <ChevronRight size={20} color={theme.colors.textMuted} />
              </View>
              <View style={styles.historyTags}>
                <TrainingV2Tag label={`${item.durationMinutes} min`} tone="primary" />
                <TrainingV2Tag label={`${item.exerciseCount} ejercicios`} />
              </View>
              <TrainingV2ProgressBar
                progress={item.exerciseCount > 0 ? 0.7 : 0}
                label={item.status === 'finished' ? 'Completado' : 'En progreso'}
              />
            </BaseCard>
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  return (
    <TrainingV2Screen
      title="Historial"
      titleColor={theme.colors.textPrimary}
      subtitle="Consulta sesiones recientes, volumen y logros."
      onBack={navigation.goBack}
    >
      <TrainingV2SearchField
        value={query}
        onChangeText={setQuery}
        placeholder="Buscar por rutina"
      />
      <TrainingV2ChipRow options={filters} selected={selectedFilter} onSelect={setSelectedFilter} />
      <TrainingV2SectionHeader title="Entrenamientos" />
      {renderContent()}

      {/* Action modal: Ver detalle / Compartir */}
      <Modal visible={!!selectedSession} transparent animationType="fade" onRequestClose={closeActionModal}>
        <Pressable style={styles.modalOverlay} onPress={closeActionModal}>
          <Pressable style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedSession?.routineName ?? ''}</Text>
              <Pressable onPress={closeActionModal} style={styles.modalClose}>
                <X size={20} color={theme.colors.textSecondary} />
              </Pressable>
            </View>
            {selectedSession ? (
              <Text style={styles.modalSubtitle}>
                {formatDate(selectedSession.startedAt)} · {selectedSession.durationMinutes} min · {selectedSession.exerciseCount} ejercicios
              </Text>
            ) : null}
            <TouchableOpacity style={styles.modalBtn} onPress={handleViewDetail}>
              <Eye size={20} color={theme.colors.primary} />
              <Text style={styles.modalBtnText}>Ver detalle</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalBtn} onPress={handleShare}>
              <Share2 size={20} color={theme.colors.primary} />
              <Text style={styles.modalBtnText}>Compartir</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Bottom sheet: detalle de sesion */}
      <Modal visible={!!detailSessionId} animationType="slide" transparent onRequestClose={closeDetailSheet}>
        <View style={styles.sheetOverlay}>
          <View style={styles.sheet}>
            <DragIndicator position="inside" />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Resumen</Text>
              <Pressable onPress={closeDetailSheet} style={styles.sheetClose}>
                <X size={22} color={theme.colors.textSecondary} />
              </Pressable>
            </View>
            <ScrollView style={styles.sheetScroll} showsVerticalScrollIndicator={false}>
              {detailLoading ? (
                <View style={styles.sheetCenter}>
                  <ActivityIndicator size="large" color={theme.colors.primary} />
                  <Text style={styles.sheetCenterText}>Cargando resumen...</Text>
                </View>
              ) : detailError || !session ? (
                <View style={styles.sheetCenter}>
                  <AlertCircle size={36} color={theme.colors.error} />
                  <Text style={styles.sheetCenterTitle}>Error al cargar</Text>
                  <SecondaryButton label="Reintentar" onPress={() => refetchDetail()} />
                </View>
              ) : (
                <>
                  <BaseCard style={styles.heroCard}>
                    <View style={styles.heroIcon}>
                      <CheckCircle2 size={34} color={theme.colors.success} />
                    </View>
                    <Text style={styles.heroTitle}>Entrenamiento completado</Text>
                    <Text style={styles.heroText}>
                      {session.routineName ?? 'Rutina'} quedo registrada con progreso completo.
                    </Text>
                    <View style={styles.tagRow}>
                      <TrainingV2Tag label={`${session.durationMinutes ?? 0} min`} tone="primary" />
                      <TrainingV2Tag label={`${completedSets}/${totalSets} series`} />
                    </View>
                  </BaseCard>

                  <TrainingV2SectionHeader title="Detalle rapido" />
                  <View style={styles.detailGrid}>
                    <TrainingV2FieldPreview label="Duracion" value={`${session.durationMinutes ?? 0} min`} helper="Tiempo activo" />
                    <TrainingV2FieldPreview label="Series completadas" value={`${completedSets}/${totalSets}`} helper="De la sesion" />
                  </View>

                  <BaseCard style={styles.achievementCard}>
                    <Award size={20} color={theme.colors.primary} />
                    <Text style={styles.achievementText}>
                      {session.status === 'finished'
                        ? 'Sesion finalizada correctamente. Sigue asi.'
                        : 'Sesion registrada.'}
                    </Text>
                  </BaseCard>

                  <TrainingV2SectionHeader title="Ejercicios" />
                  {session.exercises.map((ex) => (
                    <BaseCard key={ex.exerciseId} style={styles.exerciseCard}>
                      <View style={styles.exerciseHeader}>
                        <Text style={styles.exerciseName}>{ex.order + 1}. {ex.exerciseName}</Text>
                        <TrainingV2Tag
                          label={`${ex.workoutSets?.filter((s) => s.completed).length ?? 0}/${ex.workoutSets?.length ?? ex.targetSets?.length ?? 0}`}
                        />
                      </View>
                      {ex.workoutSets?.map((ws) => (
                        <View key={ws.setNumber} style={styles.setRow}>
                          <Text style={styles.setLabel}>Serie {ws.setNumber}</Text>
                          <Text style={styles.setValue}>
                            {ws.completed
                              ? `${ws.weightUsed ?? 0} kg x ${ws.repsPerformed ?? 0} reps`
                              : 'Pendiente'}
                          </Text>
                        </View>
                      ))}
                    </BaseCard>
                  ))}

                  <View style={styles.sheetFooter}>
                    <PrimaryButton
                      label="Compartir en redes"
                      onPress={() => {
                        closeDetailSheet();
                        navigation.navigate('CreateWorkoutPost', { sessionId: session.id });
                      }}
                    />
                    <SecondaryButton label="Cerrar" onPress={closeDetailSheet} />
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </TrainingV2Screen>
  );
}

const styles = StyleSheet.create({
  historyList: {
    gap: theme.spacing.md,
  },
  historyCard: {
    gap: theme.spacing.md,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  historyIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyTitleWrap: {
    flex: 1,
    gap: 2,
  },
  historyTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: theme.typography.bodyStrong.fontWeight,
  },
  historyMeta: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  historyTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.overlay,
    padding: theme.spacing.xl,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading3.fontSize,
    lineHeight: theme.typography.heading3.lineHeight,
    fontWeight: theme.typography.heading3.fontWeight,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  modalClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSubtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  modalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceElevated,
  },
  modalBtnText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: theme.typography.bodyStrong.fontWeight,
  },
  sheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: theme.colors.overlay,
  },
  sheet: {
    maxHeight: '85%',
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sheetTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading3.fontSize,
    lineHeight: theme.typography.heading3.lineHeight,
    fontWeight: theme.typography.heading3.fontWeight,
  },
  sheetClose: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetScroll: {
    flexGrow: 0,
  },
  sheetCenter: {
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.xl,
  },
  sheetCenterText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
  },
  sheetCenterTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading3.fontSize,
    lineHeight: theme.typography.heading3.lineHeight,
    fontWeight: theme.typography.heading3.fontWeight,
  },
  sheetFooter: {
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
  },
  heroCard: {
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading2.fontSize,
    lineHeight: theme.typography.heading2.lineHeight,
    fontWeight: theme.typography.heading2.fontWeight,
    textAlign: 'center',
  },
  heroText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    textAlign: 'center',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  detailGrid: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.surfaceElevated,
  },
  achievementText: {
    flex: 1,
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
  },
  exerciseCard: {
    gap: theme.spacing.md,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseName: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: theme.typography.bodyStrong.fontWeight,
    flex: 1,
  },
  setRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: theme.spacing.sm,
    borderLeftWidth: 2,
    borderLeftColor: theme.colors.primaryMuted,
  },
  setLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  setValue: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: '700',
  },
});

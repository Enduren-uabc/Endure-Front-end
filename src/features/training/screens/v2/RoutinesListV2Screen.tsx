import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { type NavigationProp } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AlertCircle, ChevronRight, Dumbbell, Plus, UserRound } from 'lucide-react-native';
import { BaseCard } from '@/components/ui/BaseCard';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import { useSessionStore } from '@/features/auth/stores/session-store';
import { useAssignedRoutine } from '@/features/trainer-link/hooks/use-assigned-routine';
import {
  TrainingV2RoutineCard,
  TrainingV2Screen,
  TrainingV2SearchField,
  TrainingV2SectionHeader,
} from './TrainingV2Primitives';
import {
  TrainingV2EmptyState,
  TrainingV2ErrorState,
  TrainingV2SkeletonList,
} from './TrainingV2States';
import { useRoutines } from '@/features/training/hooks/use-routines';
import { DAY_OF_WEEK_LABELS } from '@/features/training/types/routine';
import type { Routine } from '@/features/training/types/routine';
import type { RoutineV2, TrainingV2State } from './training-v2.types';
import type { TrainingStackParamList } from '@/navigation/types';
import type { UserDrawerParamList } from '@/features/user/types/user-navigation.types';
import { theme } from '@/theme';

const noop = () => undefined;
type Props = NativeStackScreenProps<TrainingStackParamList, 'RoutinesList'>;

function toRoutineV2(routine: Routine): RoutineV2 {
  const exerciseCount = routine.days.reduce((sum, d) => sum + d.exercises.length, 0);
  const targetAudience = routine.targetAudience ?? 'self';
  return {
    id: routine.id,
    name: routine.name,
    type: 'Todas' as RoutineV2Filter,
    level: 'Intermedio' as const,
    durationMinutes: exerciseCount * 8,
    exerciseCount,
    description: routine.description ?? `${routine.dayOfWeeks.length} dias de entrenamiento`,
    goal: targetAudience === 'client' ? 'Para clientes' : routine.isActive ? 'Activa' : 'Personal',
    days: routine.dayOfWeeks.map((d) => DAY_OF_WEEK_LABELS[d] ?? d.slice(0, 3)),
    imageUri: '',
    isMine: true,
    exercises: [],
  };
}

export default function RoutinesListV2Screen({ navigation }: Props) {
  const { data: routines, isLoading, isError, refetch } = useRoutines();
  const drawerNavigation = navigation.getParent()?.getParent<NavigationProp<UserDrawerParamList>>();
  const role = useSessionStore((state) => state.role);
  const assignedRoutine = useAssignedRoutine();
  const [query, setQuery] = React.useState('');
  const createRoutine = () => navigation.navigate('RoutineBuilder', { id: 'new' });
  const openAssignedRoutine = () =>
    drawerNavigation?.navigate('TrainerLinkStack', { screen: 'AssignedRoutine' });
  const openTrainerLink = () =>
    drawerNavigation?.navigate('TrainerLinkStack', {
      screen: assignedRoutine.hasTrainer ? 'MyTrainer' : 'SearchTrainer',
    });
  const shouldShowAssignedRoutine =
    role !== 'trainer' && (assignedRoutine.hasTrainer || Boolean(assignedRoutine.data));

  const visualState: TrainingV2State = isLoading ? 'loading' : isError ? 'error' : 'success';
  const normalizedQuery = query.trim().toLowerCase();
  const personalRoutines = (routines ?? []).filter((routine) => {
    const matchesQuery = routine.name.toLowerCase().includes(normalizedQuery);
    return (routine.targetAudience ?? 'self') === 'self' && matchesQuery;
  });
  const clientRoutines = (routines ?? []).filter((routine) => {
    const matchesQuery = routine.name.toLowerCase().includes(normalizedQuery);
    return routine.targetAudience === 'client' && matchesQuery;
  });

  function renderContent() {
    if (visualState === 'loading') {
      return <TrainingV2SkeletonList rows={3} />;
    }

    if (visualState === 'error') {
      return (
        <TrainingV2ErrorState
          title="No pudimos cargar tus rutinas"
          description="Revisa tu conexion e intenta nuevamente."
          onAction={refetch}
        />
      );
    }

    if (personalRoutines.length === 0 && clientRoutines.length === 0) {
      return (
        <TrainingV2EmptyState
          title="Aun no hay rutinas aqui"
          description="Crea una rutina o cambia los filtros para encontrar otra opcion."
          actionLabel="Crear rutina"
          onAction={createRoutine}
        />
      );
    }

    return (
      <>
        <TrainingV2SectionHeader title="Mis rutinas" />
        {personalRoutines.length > 0 ? (
          <RoutineSection routines={personalRoutines} navigation={navigation} />
        ) : (
          <TrainingV2EmptyState
            title="Aun no tienes rutinas personales"
            description="Crea una rutina para entrenar por tu cuenta."
            actionLabel="Crear rutina"
            onAction={createRoutine}
          />
        )}
        {role === 'trainer' ? (
          <>
            <TrainingV2SectionHeader title="Rutinas para clientes" />
            {clientRoutines.length > 0 ? (
              <RoutineSection routines={clientRoutines} navigation={navigation} />
            ) : (
              <TrainingV2EmptyState
                title="Sin rutinas para clientes"
                description="Crea una rutina marcada para clientes para poder asignarla."
                actionLabel="Crear rutina"
                onAction={createRoutine}
              />
            )}
          </>
        ) : null}
      </>
    );
  }

  return (
    <View style={styles.root}>
      <TrainingV2Screen
        title="Rutinas"
        subtitle="Explora tus planes, filtra por objetivo y empieza cuando estes listo."
      >
        {shouldShowAssignedRoutine ? (
          <>
            <TrainingV2SectionHeader
              title="De mi entrenador"
              actionLabel={assignedRoutine.data ? 'Ver' : undefined}
              onAction={assignedRoutine.data ? openAssignedRoutine : undefined}
            />
            <AssignedRoutinePreview
              isLoading={assignedRoutine.isLoading}
              isError={assignedRoutine.isError}
              hasTrainer={assignedRoutine.hasTrainer}
              routineName={assignedRoutine.data?.name ?? null}
              trainerName={assignedRoutine.data?.trainer.name ?? null}
              daysCount={assignedRoutine.data?.days.length ?? 0}
              durationMinutes={assignedRoutine.data?.durationMinutes ?? 0}
              onOpenRoutine={openAssignedRoutine}
              onOpenTrainerLink={openTrainerLink}
              onRetry={assignedRoutine.refetch}
            />
          </>
        ) : null}
        <TrainingV2SearchField
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar rutina"
        />
        {renderContent()}
      </TrainingV2Screen>

      <TouchableOpacity
        activeOpacity={0.84}
        onPress={createRoutine}
        style={styles.fab}
        accessibilityRole="button"
        accessibilityLabel="Crear rutina"
      >
        <Plus size={26} color={theme.colors.background} />
      </TouchableOpacity>
      <Text style={styles.fabLabel}>Crear</Text>
    </View>
  );
}

function RoutineSection({
  routines,
  navigation,
}: {
  routines: Routine[];
  navigation: Props['navigation'];
}) {
  return (
    <View style={styles.list}>
      {routines.map((routine) => (
        <TrainingV2RoutineCard
          key={routine.id}
          routine={toRoutineV2(routine)}
          onPress={() => navigation.navigate('RoutineDetail', { id: routine.id })}
        />
      ))}
    </View>
  );
}

function AssignedRoutinePreview({
  isLoading,
  isError,
  hasTrainer,
  routineName,
  trainerName,
  daysCount,
  durationMinutes,
  onOpenRoutine,
  onOpenTrainerLink,
  onRetry,
}: {
  isLoading: boolean;
  isError: boolean;
  hasTrainer: boolean;
  routineName: string | null;
  trainerName: string | null;
  daysCount: number;
  durationMinutes: number;
  onOpenRoutine: () => void;
  onOpenTrainerLink: () => void;
  onRetry: () => void;
}) {
  if (isLoading) {
    return (
      <BaseCard style={styles.assignedCard}>
        <View style={styles.assignedIcon}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
        <View style={styles.assignedCopy}>
          <Text style={styles.assignedEyebrow}>Asignada por tu entrenador</Text>
          <Text style={styles.assignedTitle}>Cargando rutina asignada</Text>
          <Text style={styles.assignedText}>Estamos revisando si ya tienes un plan activo.</Text>
        </View>
      </BaseCard>
    );
  }

  if (isError) {
    return (
      <BaseCard style={styles.assignedCard}>
        <View style={styles.assignedIcon}>
          <AlertCircle size={22} color={theme.colors.error} />
        </View>
        <View style={styles.assignedCopy}>
          <Text style={styles.assignedEyebrow}>Asignada por tu entrenador</Text>
          <Text style={styles.assignedTitle}>No pudimos cargar tu plan</Text>
          <Text style={styles.assignedText}>Revisa tu conexion o intenta de nuevo.</Text>
        </View>
        <SecondaryButton label="Reintentar" onPress={onRetry} style={styles.assignedAction} />
      </BaseCard>
    );
  }

  if (!routineName) {
    return (
      <BaseCard style={styles.assignedEmptyCard}>
        <View style={styles.assignedIcon}>
          <UserRound size={22} color={theme.colors.primary} />
        </View>
        <View style={styles.assignedCopy}>
          <Text style={styles.assignedEyebrow}>Asignada por tu entrenador</Text>
          <Text style={styles.assignedTitle}>
            {hasTrainer ? 'Sin rutina asignada' : 'Conecta con un entrenador'}
          </Text>
          <Text style={styles.assignedText}>
            {hasTrainer
              ? 'Cuando tu entrenador te asigne un plan, aparecera aqui.'
              : 'Vinculate para recibir planes preparados desde el panel entrenador.'}
          </Text>
        </View>
        <SecondaryButton
          label={hasTrainer ? 'Ver entrenador' : 'Buscar'}
          onPress={onOpenTrainerLink}
          style={styles.assignedAction}
        />
      </BaseCard>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.84}
      onPress={onOpenRoutine}
      accessibilityRole="button"
      accessibilityLabel="Abrir rutina asignada"
    >
      <BaseCard style={styles.assignedSuccessCard}>
        <View style={styles.assignedIconStrong}>
          <Dumbbell size={24} color={theme.colors.background} />
        </View>
        <View style={styles.assignedCopy}>
          <Text style={styles.assignedEyebrow}>Asignada por tu entrenador</Text>
          <Text style={styles.assignedTitle}>{routineName}</Text>
          <Text style={styles.assignedText}>
            {trainerName} - {daysCount} dias - {durationMinutes} min por sesion
          </Text>
        </View>
        <ChevronRight size={22} color={theme.colors.textMuted} />
      </BaseCard>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  list: {
    gap: theme.spacing.md,
  },
  assignedCard: {
    minHeight: 112,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  assignedSuccessCard: {
    minHeight: 112,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.surfaceElevated,
    borderColor: theme.colors.primary,
  },
  assignedEmptyCard: {
    minHeight: 128,
    gap: theme.spacing.md,
  },
  assignedIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: theme.colors.primaryMuted,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assignedIconStrong: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assignedCopy: {
    flex: 1,
    gap: 3,
  },
  assignedEyebrow: {
    color: theme.colors.primary,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  assignedTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: theme.typography.bodyStrong.fontWeight,
  },
  assignedText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  assignedAction: {
    minWidth: 116,
    width: 'auto',
    paddingHorizontal: theme.spacing.md,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 32,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.primaryPressed,
  },
  fabLabel: {
    position: 'absolute',
    right: 26,
    bottom: 12,
    color: theme.colors.primary,
    fontSize: theme.typography.caption.fontSize,
    lineHeight: theme.typography.caption.lineHeight,
    fontWeight: '700',
  },
});

import React from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { AlertCircle, Dumbbell, Search, UserRound, X } from 'lucide-react-native';
import { BaseCard } from '@/components/ui/BaseCard';
import { Chip } from '@/components/ui/Chip';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';
import {
  TrainingV2RoutineCard,
  TrainingV2Screen,
  TrainingV2SearchField,
  TrainingV2SectionHeader,
} from '@/features/training/screens/v2/TrainingV2Primitives';
import {
  TrainingV2EmptyState,
  TrainingV2ErrorState,
  TrainingV2SkeletonList,
} from '@/features/training/screens/v2/TrainingV2States';
import { routineFiltersV2, routinesV2 } from '@/features/training/screens/v2/training-v2.mock';
import type { RoutineV2, RoutineV2Filter, TrainingV2State } from '@/features/training/screens/v2/training-v2.types';
import { useLinkedClients } from '@/features/trainer-link/hooks/use-trainer-link';
import { theme } from '@/theme';
import type {
  TrainerDrawerParamList,
  TrainerTabsParamList,
} from '../types/trainer-navigation.types';
import { buildTrainerClientViewModel } from './trainer-clients.mock';

type TrainerRoutinesNavigation = NavigationProp<TrainerTabsParamList>;

export default function TrainerRoutinesScreen() {
  const navigation = useNavigation<TrainerRoutinesNavigation>();
  const drawerNavigation = navigation.getParent<NavigationProp<TrainerDrawerParamList>>();
  const linkedClients = useLinkedClients();
  const [selectedFilter, setSelectedFilter] = React.useState<RoutineV2Filter>('Mias');
  const [query, setQuery] = React.useState('');
  const [clientSearch, setClientSearch] = React.useState('');
  const [selectedRoutine, setSelectedRoutine] = React.useState<RoutineV2 | null>(null);
  const visualState: TrainingV2State = 'success';

  const trainerRoutines = routinesV2.filter((routine) => routine.isMine);
  const filteredRoutines = trainerRoutines.filter((routine) => {
    const normalizedQuery = query.trim().toLowerCase();
    const matchesQuery = routine.name.toLowerCase().includes(normalizedQuery);
    const matchesFilter =
      selectedFilter === 'Todas' ||
      selectedFilter === 'Mias' ||
      routine.type === selectedFilter;

    return matchesQuery && matchesFilter;
  });
  const clients = (linkedClients.data?.items ?? []).map(buildTrainerClientViewModel);
  const filteredClients = clients.filter((client) =>
    client.clientName.toLowerCase().includes(clientSearch.trim().toLowerCase()),
  );

  const openDetail = (routine: RoutineV2) => {
    drawerNavigation?.navigate('TrainingStack', {
      screen: 'RoutineDetail',
      params: { id: routine.id },
    });
  };

  const createRoutine = () => {
    drawerNavigation?.navigate('TrainingStack', {
      screen: 'RoutineBuilder',
      params: { id: 'new' },
    });
  };

  function renderContent() {
    if (visualState === 'loading') return <TrainingV2SkeletonList rows={3} />;

    if (visualState === 'error') {
      return (
        <TrainingV2ErrorState
          title="No pudimos cargar tus rutinas"
          description="Intenta de nuevo para revisar tu biblioteca de entrenador."
          onAction={() => undefined}
        />
      );
    }

    if (filteredRoutines.length === 0) {
      return (
        <TrainingV2EmptyState
          title="Sin rutinas propias"
          description="Crea una rutina para asignarla despues a tus clientes vinculados."
          actionLabel="Crear rutina"
          onAction={createRoutine}
        />
      );
    }

    return (
      <View style={styles.list}>
        {filteredRoutines.map((routine) => (
          <View key={routine.id} style={styles.routineWrap}>
            <TrainingV2RoutineCard routine={routine} onPress={() => openDetail(routine)} />
            <SecondaryButton
              label="Asignar a cliente"
              onPress={() => setSelectedRoutine(routine)}
            />
          </View>
        ))}
      </View>
    );
  }

  return (
    <>
      <TrainingV2Screen
        title="Rutinas"
        subtitle="Biblioteca del entrenador con asignacion a clientes."
      >
        <TrainingV2SearchField
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar rutina propia"
        />
        <View style={styles.filterRow}>
          {routineFiltersV2.map((filter) => (
            <Chip
              key={filter}
              label={filter === 'Mias' ? 'Mias' : filter}
              selected={selectedFilter === filter}
              onPress={() => setSelectedFilter(filter)}
            />
          ))}
        </View>
        <TrainingV2SectionHeader title="Rutinas propias" actionLabel="Crear" onAction={createRoutine} />
        {renderContent()}
      </TrainingV2Screen>

      <Modal visible={selectedRoutine !== null} animationType="slide" transparent>
        <View style={styles.sheetOverlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTitle}>Asignar a cliente</Text>
                <Text style={styles.sheetSubtitle}>{selectedRoutine?.name ?? 'Rutina'}</Text>
              </View>
              <Pressable onPress={() => setSelectedRoutine(null)} style={styles.closeButton}>
                <X size={22} color={theme.colors.textSecondary} />
              </Pressable>
            </View>

            <View style={styles.searchBox}>
              <Search size={20} color={theme.colors.textMuted} />
              <TextInput
                value={clientSearch}
                onChangeText={setClientSearch}
                placeholder="Buscar cliente vinculado"
                placeholderTextColor={theme.colors.textMuted}
                selectionColor={theme.colors.primary}
                style={styles.searchInput}
              />
            </View>

            {linkedClients.isLoading ? (
              <BaseCard style={styles.selectorState}>
                <ActivityIndicator color={theme.colors.primary} />
                <Text style={styles.selectorTitle}>Cargando clientes</Text>
                <Text style={styles.selectorText}>Buscando clientes vinculados disponibles.</Text>
              </BaseCard>
            ) : null}

            {linkedClients.isError ? (
              <BaseCard style={styles.selectorState}>
                <AlertCircle size={32} color={theme.colors.error} />
                <Text style={styles.selectorTitle}>No pudimos cargar clientes</Text>
                <Text style={styles.selectorText}>Reintenta antes de asignar esta rutina.</Text>
                <SecondaryButton label="Reintentar" onPress={() => linkedClients.refetch()} />
              </BaseCard>
            ) : null}

            {!linkedClients.isLoading && !linkedClients.isError && filteredClients.length === 0 ? (
              <BaseCard style={styles.selectorState}>
                <UserRound size={32} color={theme.colors.textMuted} />
                <Text style={styles.selectorTitle}>Sin clientes para asignar</Text>
                <Text style={styles.selectorText}>
                  Acepta una solicitud o cambia la busqueda actual.
                </Text>
              </BaseCard>
            ) : null}

            {!linkedClients.isLoading && !linkedClients.isError && filteredClients.length > 0 ? (
              <View style={styles.clientList}>
                {filteredClients.map((client) => (
                  <TouchableOpacity
                    key={client.linkId}
                    activeOpacity={0.78}
                    style={styles.clientRow}
                    onPress={() => {
                      if (!selectedRoutine) return;
                      setSelectedRoutine(null);
                      navigation.navigate('Clients', {
                        screen: 'AssignRoutine',
                        params: {
                          clientId: client.clientId,
                          clientName: client.clientName,
                          linkId: client.linkId,
                          activatedAt: client.activatedAt,
                          preselectedRoutineId: selectedRoutine.id,
                          preselectedRoutineName: selectedRoutine.name,
                        },
                      });
                    }}
                  >
                    <View style={styles.clientAvatar}>
                      <Text style={styles.clientAvatarText}>{client.initials}</Text>
                    </View>
                    <View style={styles.clientCopy}>
                      <Text style={styles.clientName}>{client.clientName}</Text>
                      <Text style={styles.clientMeta}>{client.goal} - {client.experience}</Text>
                    </View>
                    <Dumbbell size={18} color={theme.colors.primary} />
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  list: {
    gap: theme.spacing.lg,
  },
  routineWrap: {
    gap: theme.spacing.sm,
  },
  sheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: theme.colors.overlay,
  },
  sheet: {
    maxHeight: '88%',
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  sheetHandle: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.border,
    alignSelf: 'center',
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
  sheetSubtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBox: {
    minHeight: 52,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceElevated,
    paddingHorizontal: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    paddingVertical: theme.spacing.sm,
  },
  selectorState: {
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.xl,
  },
  selectorTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.heading3.fontSize,
    lineHeight: theme.typography.heading3.lineHeight,
    fontWeight: theme.typography.heading3.fontWeight,
    textAlign: 'center',
  },
  selectorText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    textAlign: 'center',
  },
  clientList: {
    gap: theme.spacing.sm,
  },
  clientRow: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceElevated,
    padding: theme.spacing.md,
  },
  clientAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primaryMuted,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clientAvatarText: {
    color: theme.colors.primary,
    fontSize: 15,
    fontWeight: '800',
  },
  clientCopy: {
    flex: 1,
    gap: 2,
  },
  clientName: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.bodyStrong.fontSize,
    lineHeight: theme.typography.bodyStrong.lineHeight,
    fontWeight: theme.typography.bodyStrong.fontWeight,
  },
  clientMeta: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small.fontSize,
    lineHeight: theme.typography.small.lineHeight,
  },
});

import React from 'react';
import { useMyTrainer } from './use-trainer-link';
import { buildMockAssignedRoutine } from '../mocks/assigned-routine.mock';
import type { AssignedRoutineDetail } from '../types/assigned-routine';

interface AssignedRoutineQuery {
  data: AssignedRoutineDetail | null;
  hasTrainer: boolean;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useAssignedRoutine(): AssignedRoutineQuery {
  const trainerQuery = useMyTrainer();
  const trainer = trainerQuery.data?.trainer ?? null;

  const assignedRoutine = React.useMemo(() => {
    if (!trainerQuery.data?.hasTrainer || !trainer) {
      return null;
    }

    return buildMockAssignedRoutine(trainer);
  }, [trainer, trainerQuery.data?.hasTrainer]);

  return {
    data: assignedRoutine,
    hasTrainer: trainerQuery.data?.hasTrainer ?? false,
    isLoading: trainerQuery.isLoading,
    isError: trainerQuery.isError,
    error: trainerQuery.error ?? null,
    refetch: () => {
      void trainerQuery.refetch();
    },
  };
}

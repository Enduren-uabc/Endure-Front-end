import { create } from 'zustand';
import type { TrainerClientAssignedRoutine } from '../types/trainer-clients';

interface TrainerClientAssignmentsState {
  assignmentsByLinkId: Record<string, TrainerClientAssignedRoutine>;
  assignRoutine: (assignment: TrainerClientAssignedRoutine) => void;
  clearAssignment: (linkId: string) => void;
}

export const useTrainerClientAssignmentsStore = create<TrainerClientAssignmentsState>((set) => ({
  assignmentsByLinkId: {},
  assignRoutine: (assignment) =>
    set((state) => ({
      assignmentsByLinkId: {
        ...state.assignmentsByLinkId,
        [assignment.linkId]: assignment,
      },
    })),
  clearAssignment: (linkId) =>
    set((state) => {
      const nextAssignments = { ...state.assignmentsByLinkId };
      delete nextAssignments[linkId];
      return { assignmentsByLinkId: nextAssignments };
    }),
}));

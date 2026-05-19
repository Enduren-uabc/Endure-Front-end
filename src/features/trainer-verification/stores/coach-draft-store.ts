import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CoachDraftState {
  specialtyKeys: string[];
  yearsOfExperience: number;
  shortBio: string;
  idDocumentNumber: string;
  certificateMeta: { name: string; issuingOrganization: string }[];
}

interface CoachDraftActions {
  setDraft: (draft: Partial<CoachDraftState>) => void;
  clearDraft: () => void;
}

const initialState: CoachDraftState = {
  specialtyKeys: [],
  yearsOfExperience: 0,
  shortBio: '',
  idDocumentNumber: '',
  certificateMeta: [],
};

export const useCoachDraftStore = create<CoachDraftState & CoachDraftActions>()(
  persist(
    (set) => ({
      ...initialState,
      setDraft: (draft) => set((state) => ({ ...state, ...draft })),
      clearDraft: () => set(initialState),
    }),
    {
      name: 'endure-coach-draft',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

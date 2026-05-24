import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ViewMode = 'single' | 'overview';

export interface WorkoutSessionStoreState {
  sessionId: string | null;
  localEdits: Record<string, { reps: string; weight: string }>;
  setNotes: Record<string, string>;
  restTimerSeconds: number;
  restTimerActive: boolean;
  restEndTime: number | null;
  mutationError: string | null;
  viewingExerciseIndex: number;
  viewMode: ViewMode;
}

export interface WorkoutSessionStoreActions {
  setSessionId: (id: string | null) => void;
  getEditKey: (exerciseIndex: number, setNumber: number) => string;
  setLocalEdit: (exerciseIndex: number, setNumber: number, reps: string, weight: string) => void;
  clearLocalEdit: (exerciseIndex: number, setNumber: number) => void;
  clearAllLocalEdits: () => void;
  setSetNote: (exerciseIndex: number, setNumber: number, note: string) => void;
  setMutationError: (error: string | null) => void;
  setViewingExerciseIndex: (index: number) => void;
  setViewMode: (mode: ViewMode) => void;
  startRestTimer: (seconds: number) => void;
  stopRestTimer: () => void;
  clearStore: () => void;
}

const initialState: WorkoutSessionStoreState = {
  sessionId: null,
  localEdits: {},
  setNotes: {},
  restTimerSeconds: 0,
  restTimerActive: false,
  restEndTime: null,
  mutationError: null,
  viewingExerciseIndex: 0,
  viewMode: 'single',
};

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const useWorkoutSessionStore = create<
  WorkoutSessionStoreState & WorkoutSessionStoreActions
>()(
  persist(
    (set, get) => ({
      ...initialState,

      setSessionId: (id) => set({ sessionId: id }),

      getEditKey: (exerciseIndex, setNumber) =>
        `${exerciseIndex}-${setNumber}`,

      setLocalEdit: (exerciseIndex, setNumber, reps, weight) => {
        const key = get().getEditKey(exerciseIndex, setNumber);
        set((state) => ({
          localEdits: { ...state.localEdits, [key]: { reps, weight } },
        }));
      },

      clearLocalEdit: (exerciseIndex, setNumber) => {
        const key = get().getEditKey(exerciseIndex, setNumber);
        set((state) => {
          const next = { ...state.localEdits };
          delete next[key];
          return { localEdits: next };
        });
      },

      clearAllLocalEdits: () => set({ localEdits: {} }),

      setSetNote: (exerciseIndex, setNumber, note) => {
        const key = get().getEditKey(exerciseIndex, setNumber);
        set((state) => ({
          setNotes: { ...state.setNotes, [key]: note },
        }));
      },

      setMutationError: (error) => set({ mutationError: error }),

      setViewingExerciseIndex: (index) => set({ viewingExerciseIndex: index }),

      setViewMode: (mode) => set({ viewMode: mode }),

      startRestTimer: (seconds) => {
        const endTime = Date.now() + seconds * 1000;
        set({
          restTimerSeconds: seconds,
          restTimerActive: true,
          restEndTime: endTime,
        });
      },

      stopRestTimer: () =>
        set({
          restTimerSeconds: 0,
          restTimerActive: false,
          restEndTime: null,
        }),

      clearStore: () => set({ ...initialState }),
    }),
    {
      name: 'endure-workout-session',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        sessionId: state.sessionId,
        localEdits: state.localEdits,
        setNotes: state.setNotes,
      }),
    },
  ),
);

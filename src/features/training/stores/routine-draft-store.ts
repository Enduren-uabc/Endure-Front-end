import { create } from "zustand";
import type { DayOfWeek, ExerciseConfig, ExerciseSet } from "../types/routine";

interface RoutineDraftState {
  draftExercises: Record<DayOfWeek, ExerciseConfig[]>;
  generatedSets: Record<string, ExerciseSet[]>;
  pendingCatalogConfig: { days: DayOfWeek[] } | null;
  pendingExerciseName: string | null;
}

interface RoutineDraftActions {
  clearDraft: () => void;
  setPendingCatalogConfig: (config: { days: DayOfWeek[] } | null) => void;
  setPendingExerciseName: (name: string | null) => void;
  setDraftExercises: (day: DayOfWeek, exercises: ExerciseConfig[]) => void;
  addDraftExercise: (day: DayOfWeek, exercise: ExerciseConfig) => void;
  removeDraftExercise: (day: DayOfWeek, exerciseId: string) => void;
  updateDraftExercise: (
    day: DayOfWeek,
    exerciseId: string,
    updates: Partial<ExerciseConfig>,
  ) => void;
  reorderDraftExercise: (
    day: DayOfWeek,
    exerciseId: string,
    direction: "up" | "down",
  ) => void;
  setGeneratedSets: (exerciseId: string, sets: ExerciseSet[]) => void;
  clearGeneratedSets: (exerciseId: string) => void;
}

const initialState: RoutineDraftState = {
  draftExercises: {} as Record<DayOfWeek, ExerciseConfig[]>,
  generatedSets: {},
  pendingCatalogConfig: null,
  pendingExerciseName: null,
};

export const useRoutineDraftStore = create<
  RoutineDraftState & RoutineDraftActions
>()((set) => ({
  ...initialState,
  clearDraft: () =>
    set({
      draftExercises: {} as Record<DayOfWeek, ExerciseConfig[]>,
      generatedSets: {},
    }),
  setPendingCatalogConfig: (config) => set({ pendingCatalogConfig: config }),
  setPendingExerciseName: (name) => set({ pendingExerciseName: name }),
  setDraftExercises: (day, exercises) =>
    set((state) => ({
      draftExercises: { ...state.draftExercises, [day]: exercises },
    })),
  addDraftExercise: (day, exercise) =>
    set((state) => ({
      draftExercises: {
        ...state.draftExercises,
        [day]: [...(state.draftExercises[day] ?? []), exercise],
      },
    })),
  removeDraftExercise: (day, exerciseId) =>
    set((state) => {
      const nextGeneratedSets = { ...state.generatedSets };
      delete nextGeneratedSets[exerciseId];
      return {
        draftExercises: {
          ...state.draftExercises,
          [day]: (state.draftExercises[day] ?? []).filter(
            (ex) => ex.id !== exerciseId,
          ),
        },
        generatedSets: nextGeneratedSets,
      };
    }),
  updateDraftExercise: (day, exerciseId, updates) =>
    set((state) => ({
      draftExercises: {
        ...state.draftExercises,
        [day]: (state.draftExercises[day] ?? []).map((ex) =>
          ex.id === exerciseId ? { ...ex, ...updates } : ex,
        ),
      },
    })),
  reorderDraftExercise: (day, exerciseId, direction) =>
    set((state) => {
      const exercises = [...(state.draftExercises[day] ?? [])];
      const idx = exercises.findIndex((ex) => ex.id === exerciseId);
      if (idx === -1) return state;
      const newIdx = direction === "up" ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= exercises.length) return state;
      [exercises[idx], exercises[newIdx]] = [exercises[newIdx], exercises[idx]];
      return {
        draftExercises: {
          ...state.draftExercises,
          [day]: exercises,
        },
      };
    }),
  setGeneratedSets: (exerciseId, sets) =>
    set((state) => ({
      generatedSets: { ...state.generatedSets, [exerciseId]: sets },
    })),
  clearGeneratedSets: (exerciseId) =>
    set((state) => {
      const nextGeneratedSets = { ...state.generatedSets };
      delete nextGeneratedSets[exerciseId];
      return { generatedSets: nextGeneratedSets };
    }),
}));

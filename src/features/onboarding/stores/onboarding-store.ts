import { create } from 'zustand';

export type OnboardingGoal =
  | 'lose_weight'
  | 'gain_muscle'
  | 'maintain'
  | 'improve_endurance'
  | 'general_fitness';

export type OnboardingGender = 'male' | 'female' | 'other';

export type OnboardingExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

export type OnboardingWeightUnit = 'kg' | 'lbs';

interface OnboardingDraft {
  mainGoal?: OnboardingGoal;
  fullName?: string;
  birthDate?: string;
  gender?: OnboardingGender;
  weight?: string;
  height?: string;
  experienceLevel?: OnboardingExperienceLevel;
  daysAvailablePerWeek?: number;
  weightUnit?: OnboardingWeightUnit;
}

interface OnboardingState extends OnboardingDraft {
  setMainGoal: (goal: OnboardingGoal) => void;
  setBasicData: (data: {
    fullName: string;
    birthDate: string;
    gender: OnboardingGender;
    weight: string;
    height: string;
  }) => void;
  setExperienceLevel: (level: OnboardingExperienceLevel) => void;
  setDaysAvailablePerWeek: (days: number) => void;
  setWeightUnit: (unit: OnboardingWeightUnit) => void;
  reset: () => void;
}

const initialState: OnboardingDraft = {
  mainGoal: undefined,
  fullName: undefined,
  birthDate: undefined,
  gender: undefined,
  weight: undefined,
  height: undefined,
  experienceLevel: undefined,
  daysAvailablePerWeek: 3,
  weightUnit: 'kg',
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  ...initialState,
  setMainGoal: (mainGoal) => set({ mainGoal }),
  setBasicData: ({ fullName, birthDate, gender, weight, height }) =>
    set({ fullName, birthDate, gender, weight, height }),
  setExperienceLevel: (experienceLevel) => set({ experienceLevel }),
  setDaysAvailablePerWeek: (daysAvailablePerWeek) => set({ daysAvailablePerWeek }),
  setWeightUnit: (weightUnit) => set({ weightUnit }),
  reset: () => set({ ...initialState }),
}));

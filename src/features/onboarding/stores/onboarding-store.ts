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
  weightUnit?: OnboardingWeightUnit;
  trainingStrategyKey?: string;
  trainingSplitKey?: 'ppl' | 'arnold';
  displayName?: string;
  bio?: string;
  avatarUri?: string;
  avatarFile?: { uri: string; name: string; type: string };
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
  setWeightUnit: (unit: OnboardingWeightUnit) => void;
  setTrainingStrategyKey: (key: string) => void;
  setTrainingSplitKey: (key: 'ppl' | 'arnold') => void;
  setSocialData: (data: {
    displayName: string;
    bio: string;
    avatarUri?: string;
    avatarFile?: { uri: string; name: string; type: string } | null;
  }) => void;
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
  weightUnit: 'kg',
  displayName: undefined,
  bio: undefined,
  avatarUri: undefined,
  avatarFile: undefined,
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  ...initialState,
  setMainGoal: (mainGoal) => set({ mainGoal }),
  setBasicData: ({ fullName, birthDate, gender, weight, height }) =>
    set({ fullName, birthDate, gender, weight, height }),
  setExperienceLevel: (experienceLevel) => set({ experienceLevel }),
  setWeightUnit: (weightUnit) => set({ weightUnit }),
  setTrainingStrategyKey: (trainingStrategyKey) => set({ trainingStrategyKey }),
  setTrainingSplitKey: (trainingSplitKey) => set({ trainingSplitKey }),
  setSocialData: ({ displayName, bio, avatarUri, avatarFile }) =>
    set({ displayName, bio, avatarUri, avatarFile: avatarFile ?? undefined }),
  reset: () => set({ ...initialState }),
}));

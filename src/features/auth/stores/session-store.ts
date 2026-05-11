import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SessionState {
  userId: string | null;
  role: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  onboardingCompleted: boolean;
}

interface SessionActions {
  setSession: (userId: string, role: string) => void;
  clearSession: () => void;
  setLoading: (isLoading: boolean) => void;
  setOnboardingCompleted: (completed: boolean) => void;
}

const initialState: SessionState = {
  userId: null,
  role: null,
  isAuthenticated: false,
  isLoading: false,
  onboardingCompleted: false,
};

export const useSessionStore = create<SessionState & SessionActions>()(
  persist(
    (set) => ({
      ...initialState,
      setSession: (userId, role) =>
        set({
          userId,
          role,
          isAuthenticated: true,
        }),
      clearSession: () => set({ ...initialState }),
      setLoading: (isLoading) => set({ isLoading }),
      setOnboardingCompleted: (onboardingCompleted) => set({ onboardingCompleted }),
    }),
    {
      name: 'endure-session',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        userId: state.userId,
        role: state.role,
        isAuthenticated: state.isAuthenticated,
        onboardingCompleted: state.onboardingCompleted,
      }),
    },
  ),
);

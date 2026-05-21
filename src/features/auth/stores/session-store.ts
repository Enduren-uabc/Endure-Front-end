import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SessionState {
  userId: string | null;
  username: string | null;
  role: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasHydrated: boolean;
  onboardingCompleted: boolean | null;
}

interface SessionActions {
  setSession: (userId: string, role: string, username?: string, onboardingCompleted?: boolean | null) => void;
  clearSession: () => void;
  setLoading: (isLoading: boolean) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
  setOnboardingCompleted: (completed: boolean | null) => void;
}

const initialState: SessionState = {
  userId: null, username: null, role: null, isAuthenticated: false,
  isLoading: false, hasHydrated: false, onboardingCompleted: null,
};

export const useSessionStore = create<SessionState & SessionActions>()(
  persist(
    (set) => ({
      ...initialState,
      setSession: (userId, role, username, onboardingCompleted = null) =>
        set({
          userId,
          username: username ?? null,
          role,
          isAuthenticated: true,
          onboardingCompleted,
        }),
      clearSession: () => set({ ...initialState, hasHydrated: true }),
      setLoading: (isLoading) => set({ isLoading }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      setOnboardingCompleted: (onboardingCompleted) => set({ onboardingCompleted }),
    }),
    {
      name: 'endure-session',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        userId: state.userId, username: state.username, role: state.role,
        isAuthenticated: state.isAuthenticated, onboardingCompleted: state.onboardingCompleted,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setLoading(false);
        state?.setHasHydrated(true);
      },
    },
  ),
);

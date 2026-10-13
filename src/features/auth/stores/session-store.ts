import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

interface SessionState {
  userId: string | null;
  username: string | null;
  email: string | null;
  role: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasHydrated: boolean;
  onboardingCompleted: boolean | null;
  emailVerified: boolean;
}

interface SessionActions {
  setSession: (userId: string, role: string, username?: string, email?: string, onboardingCompleted?: boolean | null, emailVerified?: boolean) => void;
  clearSession: () => void;
  setLoading: (isLoading: boolean) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
  setOnboardingCompleted: (completed: boolean | null) => void;
  setEmailVerified: (verified: boolean) => void;
}

const initialState: SessionState = {
  userId: null, username: null, email: null, role: null, isAuthenticated: false,
  isLoading: false, hasHydrated: false, onboardingCompleted: null, emailVerified: false,
};

export const useSessionStore = create<SessionState & SessionActions>()(
  persist(
    (set) => ({
      ...initialState,
      setSession: (userId, role, username, email = undefined, onboardingCompleted = null, emailVerified = false) =>
        set({
          userId,
          username: username ?? null,
          email: email ?? null,
          role,
          isAuthenticated: true,
          onboardingCompleted,
          emailVerified,
        }),
      clearSession: () => set({ ...initialState, hasHydrated: true }),
      setLoading: (isLoading) => set({ isLoading }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      setOnboardingCompleted: (onboardingCompleted) => set({ onboardingCompleted }),
      setEmailVerified: (verified) => set({ emailVerified: verified }),
    }),
    {
      name: 'endure-session',
      storage: createJSONStorage(() => AsyncStorage),
      skipHydration: Platform.OS === 'web',
      partialize: (state) => Platform.OS === 'web' ? {} : ({
        userId: state.userId, username: state.username, email: state.email, role: state.role,
        isAuthenticated: state.isAuthenticated, onboardingCompleted: state.onboardingCompleted,
        emailVerified: state.emailVerified,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setLoading(false);
        if (Platform.OS !== 'web') state?.setHasHydrated(true);
      },
    },
  ),
);

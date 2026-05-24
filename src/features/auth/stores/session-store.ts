import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  sessionExpiredNotice: boolean;
}

interface SessionActions {
  setSession: (userId: string, role: string, username?: string, email?: string | null, onboardingCompleted?: boolean | null, emailVerified?: boolean) => void;
  clearSession: (reason?: 'manual' | 'expired') => void;
  setLoading: (isLoading: boolean) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
  setOnboardingCompleted: (completed: boolean | null) => void;
  setEmailVerified: (verified: boolean) => void;
  dismissSessionExpiredNotice: () => void;
}

const initialState: SessionState = {
  userId: null, username: null, email: null, role: null, isAuthenticated: false,
  isLoading: false, hasHydrated: false, onboardingCompleted: null, emailVerified: false,
  sessionExpiredNotice: false,
};

export const useSessionStore = create<SessionState & SessionActions>()(
  persist(
    (set) => ({
      ...initialState,
      setSession: (userId, role, username, email = null, onboardingCompleted = null, emailVerified = false) =>
        set({
          userId,
          username: username ?? null,
          email: email ?? null,
          role,
          isAuthenticated: true,
          onboardingCompleted,
          emailVerified,
          sessionExpiredNotice: false,
        }),
      clearSession: (reason = 'manual') =>
        set({ ...initialState, hasHydrated: true, sessionExpiredNotice: reason === 'expired' }),
      setLoading: (isLoading) => set({ isLoading }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      setOnboardingCompleted: (onboardingCompleted) => set({ onboardingCompleted }),
      setEmailVerified: (verified) => set({ emailVerified: verified }),
      dismissSessionExpiredNotice: () => set({ sessionExpiredNotice: false }),
    }),
    {
      name: 'endure-session',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        userId: state.userId, username: state.username, email: state.email, role: state.role,
        isAuthenticated: state.isAuthenticated, onboardingCompleted: state.onboardingCompleted,
        emailVerified: state.emailVerified,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setLoading(false);
        state?.setHasHydrated(true);
      },
    },
  ),
);

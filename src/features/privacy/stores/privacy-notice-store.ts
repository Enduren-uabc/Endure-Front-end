import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { LocalPrivacyNoticeCopy } from '../types/privacy';

interface PrivacyNoticeState {
  localCopy: LocalPrivacyNoticeCopy | null;
  setLocalCopy: (copy: LocalPrivacyNoticeCopy) => void;
  clearLocalCopy: () => void;
}

export const usePrivacyNoticeStore = create<PrivacyNoticeState>()(
  persist(
    (set) => ({
      localCopy: null,
      setLocalCopy: (copy) => set({ localCopy: copy }),
      clearLocalCopy: () => set({ localCopy: null }),
    }),
    {
      name: 'endure-privacy-notice',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ localCopy: state.localCopy }),
    },
  ),
);

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LinkRequestState {
  pendingRequestsCount: number;
  setPendingRequestsCount: (count: number) => void;
  lastSearchQuery: string;
  setLastSearchQuery: (query: string) => void;
}

export const useLinkRequestStore = create<LinkRequestState>()(
  persist(
    (set) => ({
      pendingRequestsCount: 0,
      setPendingRequestsCount: (count) => set({ pendingRequestsCount: count }),
      lastSearchQuery: '',
      setLastSearchQuery: (query) => set({ lastSearchQuery: query }),
    }),
    { name: 'link-request-store' },
  ),
);

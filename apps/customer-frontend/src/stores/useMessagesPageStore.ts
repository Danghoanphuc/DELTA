import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface MessagesPageState {
  hasLoadedMessagesPage: boolean;
  setHasLoadedMessagesPage: (status: boolean) => void;
}

export const useMessagesPageStore = create<MessagesPageState>()(
  persist(
    (set) => ({
      hasLoadedMessagesPage: false,
      setHasLoadedMessagesPage: (status) => set({ hasLoadedMessagesPage: status }),
    }),
    {
      name: 'printz-messages-page-storage',
      storage: createJSONStorage(() => localStorage), // Dùng localStorage để nhớ đã load rồi
    }
  )
);


import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface SplashState {
  hasShownSplash: boolean;
  setHasShownSplash: (status: boolean) => void;
}

export const useSplashStore = create<SplashState>()(
  persist(
    (set) => ({
      hasShownSplash: false,
      setHasShownSplash: (status) => set({ hasShownSplash: status }),
    }),
    {
      name: 'printz-splash-storage',
      storage: createJSONStorage(() => sessionStorage), // Dùng sessionStorage: Tắt tab là reset, mở lại sẽ thấy lại Splash
    }
  )
);
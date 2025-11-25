// src/stores/useZinStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ZinAccessory = 
  | "none" 
  | "beret"      // Mũ nồi
  | "glasses"    // Kính râm
  | "crown"      // Vương miện
  | "coffee"     // ✅ THAY THẾ: Cà phê/Trà sữa (Thay cho thuốc lào)
  | "headphone"  // Tai nghe
  | "flower"     // Hoa
  | "mask";      // Khẩu trang

interface ZinState {
  accessory: ZinAccessory;
  setAccessory: (acc: ZinAccessory) => void;
}

export const useZinStore = create<ZinState>()(
  persist(
    (set) => ({
      accessory: "none",
      setAccessory: (acc) => set({ accessory: acc }),
    }),
    {
      name: "zin-appearance-storage",
    }
  )
);
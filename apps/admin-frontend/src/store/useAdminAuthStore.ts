// apps/admin-frontend/src/store/useAdminAuthStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { type IAdmin } from "@printz/types"; // <-- Import type chung

type AdminAuthStatus = "idle" | "loading" | "success" | "error";

interface AdminAuthState {
  admin: IAdmin | null;
  token: string | null;
  status: AdminAuthStatus;
  setStatus: (status: AdminAuthStatus) => void;
  setToken: (token: string | null) => void;
  setAdmin: (admin: IAdmin | null) => void;
  logout: () => void;
}

/**
 * Zustand store để quản lý state xác thực của Admin.
 *
 * Dùng 'persist' middleware để lưu 'token' và 'admin' vào localStorage,
 * nhưng sử dụng một tên 'storage' riêng biệt ("printz-admin-auth")
 * để không xung đột với state của khách hàng ("printz-auth").
 */
export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set) => ({
      admin: null,
      token: null,
      status: "idle",

      setStatus: (status) => set({ status }),

      setToken: (token) => {
        set({ token });
      },

      setAdmin: (admin) => {
        set({ admin });
      },

      logout: () => {
        // Xóa thông tin admin và token
        set({ admin: null, token: null, status: "idle" });
        // (Middleware 'persist' sẽ tự động xóa chúng khỏi localStorage)
      },
    }),
    {
      name: "printz-admin-auth", // <-- Tên key LƯU TRỮ RIÊNG BIỆT
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        admin: state.admin,
      }),
    }
  )
);

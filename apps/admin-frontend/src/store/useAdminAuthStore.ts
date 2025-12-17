// apps/admin-frontend/src/store/useAdminAuthStore.ts
// ✅ STANDARDIZED: Admin auth store with cookie-based refresh token

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { type IAdmin } from "@printz/types";
import api from "@/lib/axios";

type AdminAuthStatus = "idle" | "loading" | "success" | "error";

interface AdminAuthState {
  admin: IAdmin | null;
  token: string | null;
  status: AdminAuthStatus;

  // Actions
  setStatus: (status: AdminAuthStatus) => void;
  setToken: (token: string | null) => void;
  setAdmin: (admin: IAdmin | null) => void;
  logout: () => void;

  // ✅ STANDARDIZED: Auth methods using cookie-based refresh
  signIn: (email: string, password: string) => Promise<void>;
  fetchMe: () => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * ✅ STANDARDIZED: Admin auth store with enhanced security
 */
export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set, get) => ({
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
        // ✅ STANDARDIZED: Clear state and call logout endpoint
        set({ admin: null, token: null, status: "idle" });

        // ✅ STANDARDIZED: Call logout endpoint to clear refresh token cookie
        api.post("/admin/auth/signout").catch((error) => {
          console.warn("Logout endpoint failed:", error);
        });
      },

      // ✅ STANDARDIZED: Sign in with cookie-based refresh token
      signIn: async (email: string, password: string) => {
        try {
          set({ status: "loading" });

          const response = await api.post("/admin/auth/signin", {
            email,
            password,
          });

          const { accessToken, admin } = response.data.data;

          if (!accessToken || !admin) {
            throw new Error("Invalid response from server");
          }

          // ✅ STANDARDIZED: Store access token and admin info
          set({
            token: accessToken,
            admin,
            status: "success",
          });

          console.log("✅ [Admin] Signed in successfully");
        } catch (error: any) {
          console.error("❌ [Admin] Sign in failed:", error);
          set({ status: "error" });
          throw error;
        }
      },

      // ✅ STANDARDIZED: Fetch current admin profile
      fetchMe: async () => {
        try {
          const response = await api.get("/admin/auth/me");
          const { admin } = response.data.data;

          if (admin) {
            set({ admin });
          }
        } catch (error: any) {
          console.error("❌ [Admin] Fetch me failed:", error);
          // Don't throw - this is often called on app init
          if (error.response?.status === 401) {
            get().logout();
          }
        }
      },

      // ✅ STANDARDIZED: Refresh access token using cookie
      refresh: async () => {
        try {
          const response = await api.post("/admin/auth/refresh");
          const { accessToken } = response.data.data;

          if (accessToken) {
            set({ token: accessToken });
            console.log("✅ [Admin] Token refreshed");
          }
        } catch (error: any) {
          console.error("❌ [Admin] Refresh failed:", error);
          get().logout();
          throw error;
        }
      },
    }),
    {
      name: "printz-admin-auth", // ✅ STANDARDIZED: Separate storage key
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        admin: state.admin,
      }),
      onRehydrateStorage: () => (state) => {
        // ✅ STANDARDIZED: Reset loading state on rehydration
        if (state) {
          state.status = "idle";
        }
      },
    }
  )
);

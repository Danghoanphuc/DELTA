// src/stores/useAuthStore.ts (SỬA LẠI)

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { toast } from "sonner";
import { authService } from "@/services/authService";
import type { AuthState } from "@/types/store";
import { User } from "@/types/user"; // 👈 Thêm import User

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      loading: false,

      // --- Setter cơ bản ---
      setAccessToken: (accessToken) => set({ accessToken }),
      setUser: (user: User) => set({ user }), // 👈 *** THÊM HÀM setUser ***
      clearState: () => set({ accessToken: null, user: null, loading: false }),

      // --- Đăng ký (SỬA LẠI THAM SỐ) ---
      signUp: async (
        username,
        password,
        email,
        firstName, // 👈 Sửa ...args thành tham số rõ ràng
        lastName
      ) => {
        try {
          set({ loading: true });
          // 👇 *** Sửa lại cách gọi hàm ***
          const res = await authService.signUp(
            username,
            password,
            email,
            firstName,
            lastName
          );
          if (import.meta.env.DEV) console.log("✅ [Signup]", res);
          toast.success("Đăng ký thành công! Hãy đăng nhập để tiếp tục.");
        } catch (err: any) {
          console.error("❌ [Signup Error]", err);
          const msg =
            err.response?.data?.message || "Đăng ký thất bại, thử lại!";
          toast.error(msg);
        } finally {
          set({ loading: false });
        }
      },

      // --- Đăng nhập thường ---
      signIn: async (username, password) => {
        try {
          set({ loading: true });
          const res = await authService.signIn(username, password);
          if (import.meta.env.DEV) console.log("✅ [Signin]", res);

          if (!res?.accessToken) throw new Error("Thiếu access token!");
          get().setAccessToken(res.accessToken);
          await get().fetchMe(true);
          toast.success("Chào mừng bạn quay lại PrintZ 🎉");
        } catch (err: any) {
          console.error("❌ [Signin Error]", err);
          const status = err.response?.status;
          if (status === 401) toast.error("Sai tên đăng nhập hoặc mật khẩu!");
          else if (status === 403)
            toast.error("Tài khoản bị khoá hoặc hết phiên đăng nhập!");
          else toast.error("Không thể đăng nhập!");
        } finally {
          set({ loading: false });
        }
      },

      // --- Đăng nhập Google ---
      signInWithGoogle: async () => {
        try {
          set({ loading: true });
          const popup = window.open(
            `${import.meta.env.VITE_SERVER_URL}/api/auth/google`,
            "googleLogin",
            "width=600,height=700"
          );

          if (!popup) throw new Error("Không thể mở cửa sổ đăng nhập Google!");

          const token = await new Promise<string>((resolve, reject) => {
            const timer = setTimeout(() => {
              reject(new Error("Hết thời gian chờ đăng nhập Google!"));
            }, 10000);

            window.addEventListener("message", (event) => {
              if (event.data?.accessToken) {
                clearTimeout(timer);
                resolve(event.data.accessToken);
                popup.close();
              }
            });
          });

          get().setAccessToken(token);
          await get().fetchMe(true);
          toast.success("Đăng nhập Google thành công 🎉");
        } catch (err: any) {
          console.error("❌ [Google Login Error]", err);
          toast.error(err.message || "Không thể đăng nhập bằng Google!");
        } finally {
          set({ loading: false });
        }
      },

      // --- Đăng xuất ---
      signOut: async () => {
        try {
          const res = await authService.signOut();
          if (import.meta.env.DEV) console.log("✅ [Signout]", res);
          set({ accessToken: null, user: null });
          localStorage.removeItem("auth-store");
          toast.success("Đăng xuất thành công!");
        } catch (err) {
          console.error("❌ [Signout Error]", err);
          toast.error("Lỗi khi đăng xuất!");
        }
      },

      // --- Lấy thông tin người dùng ---
      fetchMe: async (silent = false) => {
        try {
          const user = await authService.fetchMe();
          if (import.meta.env.DEV) console.log("✅ [FetchMe]", user);
          set({ user });
        } catch (err: any) {
          console.error("❌ [FetchMe Error]", err);
          get().clearState();
          if (!silent)
            toast.error(
              "Không thể tải thông tin người dùng. Hãy đăng nhập lại!"
            );
        }
      },

      // --- Làm mới token ---
      refresh: async () => {
        try {
          const res = await authService.refresh();
          if (import.meta.env.DEV) console.log("✅ [Refresh]", res);
          if (!res?.accessToken) throw new Error("Không có accessToken!");
          get().setAccessToken(res.accessToken);
          if (!get().user) await get().fetchMe(true);
        } catch (err) {
          console.error("❌ [Refresh Error]", err);
          get().clearState();
          toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!");
        }
      },
    }),
    {
      name: "auth-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
      }),
      onRehydrateStorage: () => (state) => {
        if (import.meta.env.DEV) {
          console.log("♻️ [Rehydrate AuthStore]", state);
        }
      },
    }
  )
);

// src/stores/useAuthStore.ts (CẬP NHẬT)

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { toast } from "sonner";
import { authService } from "@/services/authService";
import { printerService } from "@/services/printerService"; // <-- THÊM IMPORT
import type { AuthState } from "@/types/store";
import { User } from "@/types/user";
import { PrinterProfile } from "@/types/printerProfile"; // <-- THÊM IMPORT

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      printerProfile: null, // <-- THÊM STATE
      loading: false,

      // --- Setter cơ bản ---
      setAccessToken: (accessToken) => set({ accessToken }),
      setUser: (user: User) => set({ user }),
      setPrinterProfile: (profile: PrinterProfile | null) =>
        set({ printerProfile: profile }), // <-- THÊM SETTER
      clearState: () =>
        set({
          accessToken: null,
          user: null,
          printerProfile: null, // <-- CẬP NHẬT
          loading: false,
        }),

      // --- (Giữ nguyên signUp, signIn, signInWithGoogle) ---
      signUp: async (
        email,
        password,
        displayName
        // (Bỏ firstName, lastName, username)
      ) => {
        try {
          set({ loading: true });
          const res = await authService.signUp(email, password, displayName);
          if (import.meta.env.DEV) console.log("✅ [Signup]", res);
          // (Không toast ở đây, AuthFlow sẽ tự chuyển step)
        } catch (err: any) {
          console.error("❌ [Signup Error]", err);
          const msg =
            err.response?.data?.message || "Đăng ký thất bại, thử lại!";
          toast.error(msg);
          throw err; // Ném lỗi để AuthFlow bắt được
        } finally {
          set({ loading: false });
        }
      },
      // --- (SỬA) Đăng nhập thường ---
      signIn: async (email, password) => {
        // <-- Sửa 'username' thành 'email'
        try {
          set({ loading: true });
          const res = await authService.signIn(email, password); // <-- Gửi 'email'
          if (import.meta.env.DEV) console.log("✅ [Signin]", res);

          if (!res?.accessToken) throw new Error("Thiếu access token!");
          get().setAccessToken(res.accessToken);
          await get().fetchMe(true);
          toast.success("Chào mừng bạn quay lại PrintZ 🎉");
        } catch (err: any) {
          console.error("❌ [Signin Error]", err);
          const status = err.response?.status;

          // (BỎ) Interceptor 401 tự refresh
          // if (status === 401) toast.error("Sai email hoặc mật khẩu!");
          if (status === 403)
            toast.error("Tài khoản chưa xác thực hoặc đã bị khoá!");
          else toast.error("Sai email hoặc mật khẩu!");

          throw err; // Ném lỗi để AuthFlow bắt được
        } finally {
          set({ loading: false });
        }
      },
      // src/stores/useAuthStore.ts

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
            }, 10000); // 10 giây chờ

            window.addEventListener("message", (event) => {
              // (Bạn có thể thêm kiểm tra event.origin ở đây)
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
      // --- Đăng xuất (SỬA LẠI) ---
      signOut: async () => {
        try {
          const res = await authService.signOut();
          if (import.meta.env.DEV) console.log("✅ [Signout]", res);
          get().clearState(); // <-- SỬA LẠI: Dùng clearState
          localStorage.removeItem("auth-store");
          toast.success("Đăng xuất thành công!");
        } catch (err) {
          console.error("❌ [Signout Error]", err);
          get().clearState(); // Vẫn clear state kể cả khi lỗi
          toast.error("Lỗi khi đăng xuất!");
        }
      },

      // --- Lấy thông tin người dùng (SỬA LẠI) ---
      fetchMe: async (silent = false) => {
        try {
          const user = await authService.fetchMe();
          if (import.meta.env.DEV) console.log("✅ [FetchMe]", user);
          set({ user });

          // --- (LOGIC MỚI) ---
          // Nếu là nhà in, lấy thêm thông tin hồ sơ
          if (user.role === "printer" && user.printerProfile) {
            try {
              const profile = await printerService.getMyProfile();
              if (import.meta.env.DEV)
                console.log("✅ [FetchProfile]", profile);
              set({ printerProfile: profile });
            } catch (profileError) {
              console.error("❌ [FetchProfile Error]", profileError);
              // Lỗi này không nghiêm trọng bằng lỗi fetchMe,
              // không cần clearState, chỉ cần báo lỗi
              toast.error("Không thể tải hồ sơ xưởng in.");
              set({ printerProfile: null }); // Set về null
            }
          }
          // --- (HẾT LOGIC MỚI) ---
        } catch (err: any) {
          console.error("❌ [FetchMe Error]", err);
          get().clearState(); // Lỗi fetchMe là nghiêm trọng, đăng xuất user
          if (!silent)
            toast.error(
              "Không thể tải thông tin người dùng. Hãy đăng nhập lại!"
            );
        }
      },

      // --- Làm mới token (SỬA LẠI) ---
      refresh: async () => {
        try {
          const res = await authService.refresh();
          if (import.meta.env.DEV) console.log("✅ [Refresh]", res);
          if (!res?.accessToken) throw new Error("Không có accessToken!");
          get().setAccessToken(res.accessToken);

          // (Sửa lại) Chỉ fetchMe nếu chưa có user
          if (!get().user) {
            await get().fetchMe(true); // fetchMe đã bao gồm cả fetchProfile
          }
        } catch (err) {
          console.error("❌ [Refresh Error]", err);
          get().clearState();
          // (Không toast ở đây, vì axios interceptor sẽ xử lý)
        }
      },
    }),
    {
      name: "auth-store",
      storage: createJSONStorage(() => localStorage),
      // (Cập nhật partialize để bao gồm cả printerProfile)
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        printerProfile: state.printerProfile, // <-- THÊM
      }),
      onRehydrateStorage: () => (state) => {
        if (import.meta.env.DEV) {
          console.log("♻️ [Rehydrate AuthStore]", state);
        }
      },
    }
  )
);

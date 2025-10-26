// frontend/src/stores/useAuthStore.ts (FIXED VERSION)

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { toast } from "sonner";
import { authService } from "@/services/authService";
import { printerService } from "@/services/printerService";
import type { User } from "@/types/user";
import type { PrinterProfile } from "@/types/printerProfile";

// ==================== TYPES ====================
interface AuthState {
  accessToken: string | null;
  user: User | null;
  printerProfile: PrinterProfile | null;
  loading: boolean;

  // --- Setters ---
  setAccessToken: (token: string | null) => void;
  setUser: (user: User) => void;
  setPrinterProfile: (profile: PrinterProfile | null) => void;
  clearState: () => void;

  // --- Actions ---
  signUp: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  fetchMe: (silent?: boolean) => Promise<void>;
  refresh: () => Promise<void>;
}

// ==================== STORE ====================
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      printerProfile: null,
      loading: false,

      // --- SETTERS ---
      setAccessToken: (accessToken) => set({ accessToken }),
      setUser: (user: User) => set({ user }),
      setPrinterProfile: (profile: PrinterProfile | null) =>
        set({ printerProfile: profile }),
      clearState: () =>
        set({
          accessToken: null,
          user: null,
          printerProfile: null,
          loading: false,
        }),

      // --- SIGN UP ---
      signUp: async (email, password, displayName) => {
        try {
          set({ loading: true });
          const res = await authService.signUp(email, password, displayName);
          if (import.meta.env.DEV) console.log("✅ [Signup]", res);
        } catch (err: any) {
          console.error("❌ [Signup Error]", err);
          const msg =
            err.response?.data?.message || "Đăng ký thất bại, thử lại!";
          toast.error(msg);
          throw err;
        } finally {
          set({ loading: false });
        }
      },

      // --- SIGN IN ---
      signIn: async (email, password) => {
        try {
          set({ loading: true });
          const res = await authService.signIn(email, password);
          if (import.meta.env.DEV) console.log("✅ [Signin]", res);

          if (!res?.accessToken) throw new Error("Thiếu access token!");
          get().setAccessToken(res.accessToken);
          await get().fetchMe(true);
          toast.success("Chào mừng bạn quay lại PrintZ 🎉");
        } catch (err: any) {
          console.error("❌ [Signin Error]", err);
          const status = err.response?.status;

          if (status === 403)
            toast.error("Tài khoản chưa xác thực hoặc đã bị khoá!");
          else toast.error("Sai email hoặc mật khẩu!");

          throw err;
        } finally {
          set({ loading: false });
        }
      },

      // --- SIGN IN WITH GOOGLE ---
      signInWithGoogle: async () => {
        try {
          set({ loading: true });
          const popup = window.open(
            `${import.meta.env.VITE_SERVER_URL}/api/auth/google`,
            "googleLogin",
            "width=600,height=700"
          );

          if (!popup) {
            throw new Error("Không thể mở cửa sổ đăng nhập Google. Vui lòng kiểm tra popup blocker!");
          }

          const token = await new Promise<string>((resolve, reject) => {
            const timer = setTimeout(() => {
              popup.close();
              reject(new Error("Hết thời gian chờ đăng nhập Google!"));
            }, 60000); // Increased to 60 seconds

            const handleMessage = (event: MessageEvent) => {
              // Verify origin for security
              const validOrigins = [
                import.meta.env.VITE_SERVER_URL,
                "http://localhost:5001",
              ];
              
              if (!validOrigins.some(origin => event.origin === origin)) {
                return;
              }

              if (event.data?.type === "GOOGLE_AUTH_SUCCESS" && event.data?.accessToken) {
                clearTimeout(timer);
                window.removeEventListener("message", handleMessage);
                resolve(event.data.accessToken);
                popup.close();
              }
            };

            window.addEventListener("message", handleMessage);

            // Check if popup was closed by user
            const checkPopupClosed = setInterval(() => {
              if (popup.closed) {
                clearInterval(checkPopupClosed);
                clearTimeout(timer);
                window.removeEventListener("message", handleMessage);
                reject(new Error("Đã hủy đăng nhập!"));
              }
            }, 1000);
          });

          get().setAccessToken(token);
          await get().fetchMe(true);
          toast.success("Đăng nhập Google thành công 🎉");
        } catch (err: any) {
          console.error("❌ [Google Login Error]", err);
          toast.error(err.message || "Không thể đăng nhập bằng Google!");
          throw err;
        } finally {
          set({ loading: false });
        }
      },

      // --- SIGN OUT ---
      signOut: async () => {
        try {
          const res = await authService.signOut();
          if (import.meta.env.DEV) console.log("✅ [Signout]", res);
          get().clearState();
          localStorage.removeItem("auth-store");
          toast.success("Đăng xuất thành công!");
        } catch (err) {
          console.error("❌ [Signout Error]", err);
          get().clearState();
          toast.error("Lỗi khi đăng xuất!");
        }
      },

      // --- FETCH ME ---
      fetchMe: async (silent = false) => {
        try {
          const user = await authService.fetchMe();
          if (import.meta.env.DEV) console.log("✅ [FetchMe]", user);
          set({ user });

          // Nếu là nhà in, lấy thêm profile
          if (user.role === "printer" && user.printerProfile) {
            try {
              const profile = await printerService.getMyProfile();
              if (import.meta.env.DEV)
                console.log("✅ [FetchProfile]", profile);
              set({ printerProfile: profile });
            } catch (profileError) {
              console.error("❌ [FetchProfile Error]", profileError);
              toast.error("Không thể tải hồ sơ xưởng in.");
              set({ printerProfile: null });
            }
          }
        } catch (err: any) {
          console.error("❌ [FetchMe Error]", err);
          get().clearState();
          if (!silent)
            toast.error(
              "Không thể tải thông tin người dùng. Hãy đăng nhập lại!"
            );
        }
      },

      // --- REFRESH TOKEN ---
      refresh: async () => {
        try {
          const res = await authService.refresh();
          if (import.meta.env.DEV) console.log("✅ [Refresh]", res);
          if (!res?.accessToken) throw new Error("Không có accessToken!");
          get().setAccessToken(res.accessToken);

          if (!get().user) {
            await get().fetchMe(true);
          }
        } catch (err) {
          console.error("❌ [Refresh Error]", err);
          get().clearState();
        }
      },
    }),
    {
      name: "auth-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        printerProfile: state.printerProfile,
      }),
      onRehydrateStorage: () => (state) => {
        if (import.meta.env.DEV) {
          console.log("♻️ [Rehydrate AuthStore]", state);
        }
      },
    }
  )
);

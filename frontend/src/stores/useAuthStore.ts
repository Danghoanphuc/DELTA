// frontend/src/stores/useAuthStore.ts (✅ REFACTORED - CONTEXT-AWARE)

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { toast } from "sonner";
import { authService } from "@/services/authService";
import { printerService } from "@/services/printerService";
import type { User } from "@/types/user";
import type { PrinterProfile } from "@/types/printerProfile";
import { useNavigate } from "react-router-dom";

// --- TYPES ---
export type AuthContext = "customer" | "printer";

interface AuthState {
  accessToken: string | null;
  user: User | null;
  loading: boolean; // Loading chung (refresh, fetchMe)
  
  // --- State cho Bối cảnh (Context) ---
  activeContext: AuthContext;
  activePrinterProfile: PrinterProfile | null;
  isContextLoading: boolean; // Loading khi chuyển bối cảnh

  // --- Setters ---
  setAccessToken: (token: string | null) => void;
  setUser: (user: User) => void;
  clearState: () => void;

  // --- Actions ---
  signUp: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  fetchMe: (silent?: boolean) => Promise<void>;
  refresh: () => Promise<void>;
  
  // --- Hành động chuyển đổi bối cảnh ---
  setActiveContext: (
    context: AuthContext,
    navigate: ReturnType<typeof useNavigate>
  ) => Promise<void>;
  
  // --- Hành động Onboarding (Sau khi tạo profile nhà in) ---
  onPrinterProfileCreated: (newProfile: PrinterProfile) => void;
}

const initialState = {
  accessToken: null,
  user: null,
  loading: false,
  activeContext: "customer" as AuthContext,
  activePrinterProfile: null,
  isContextLoading: false,
};

// ==================== STORE ====================
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // --- SETTERS ---
      setAccessToken: (accessToken) => set({ accessToken }),
      setUser: (user: User) => set({ user }),
      clearState: () => {
        set(initialState);
        // Xóa hoàn toàn localStorage, chỉ giữ lại phần persist
        localStorage.removeItem("auth-store"); 
      },

      // --- SIGN UP ---
      signUp: async (email, password, displayName) => {
        try {
          set({ loading: true });
          // Chỉ còn 1 hàm signUp duy nhất
          await authService.signUp(email, password, displayName);
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
          if (!res?.data?.accessToken) throw new Error("Thiếu access token!");
          
          get().setAccessToken(res.data.accessToken);
          
          // fetchMe sẽ tự động cập nhật user và activeContext
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

      // --- SIGN OUT ---
      signOut: async () => {
        try {
          await authService.signOut();
        } catch (err) {
          console.error("❌ [Signout Error]", err);
          // Vẫn clear state dù có lỗi
        } finally {
          get().clearState();
          toast.success("Đăng xuất thành công!");
        }
      },

      // --- FETCH ME ---
      fetchMe: async (silent = false) => {
        if (!silent) set({ loading: true });
        try {
          const user = await authService.fetchMe();
          set({ user, loading: false });

          // Tự động set bối cảnh mặc định
          const currentContext = get().activeContext;
          if (currentContext === 'printer' && !user.printerProfileId) {
            set({ activeContext: 'customer' });
          }
          
        } catch (err: any) {
          console.error("❌ [FetchMe Error]", err);
          get().clearState(); // Xóa state hỏng
          if (!silent)
            toast.error(
              "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!"
            );
        }
      },

      // --- REFRESH TOKEN ---
      refresh: async () => {
        try {
          set({ loading: true });
          const res = await authService.refresh();
          if (!res?.accessToken) throw new Error("Không có accessToken!");
          get().setAccessToken(res.accessToken);

          if (!get().user) {
            await get().fetchMe(true);
          }
        } catch (err) {
          console.error("❌ [Refresh Error]", err);
          get().clearState();
        } finally {
          set({ loading: false });
        }
      },

      // --- HÀNH ĐỘNG CHUYỂN BỐI CẢNH ---
      setActiveContext: async (context, navigate) => {
        const { user, activePrinterProfile } = get();
        if (!user) return; // Chưa đăng nhập

        set({ isContextLoading: true });

        if (context === "customer") {
          set({ activeContext: "customer", isContextLoading: false });
          navigate("/app"); // Điều hướng về trang chat
          return;
        }

        if (context === "printer") {
          // 1. Kiểm tra xem user có hồ sơ nhà in không
          if (!user.printerProfileId) {
            // 1a. Không có -> Đưa đến trang onboarding
            toast.info("Vui lòng hoàn tất hồ sơ nhà in của bạn.");
            set({ isContextLoading: false });
            navigate("/printer/onboarding");
            return;
          }

          // 2. Kiểm tra xem đã fetch profile nhà in chưa
          if (activePrinterProfile) {
            // 2a. Đã có -> Đặt làm active và điều hướng
            set({ activeContext: "printer", isContextLoading: false });
            navigate("/printer/dashboard");
            return;
          }

          // 3. Chưa có -> Fetch profile
          try {
            const profile = await printerService.getMyProfile();
            set({
              activePrinterProfile: profile,
              activeContext: "printer",
              isContextLoading: false,
            });
            navigate("/printer/dashboard");
          } catch (err) {
            toast.error("Không thể tải hồ sơ nhà in của bạn.");
            set({ isContextLoading: false });
          }
        }
      },

      // --- HÀNH ĐỘNG SAU KHI ONBOARDING ---
      onPrinterProfileCreated: (newProfile) => {
        set((state) => ({
          // Cập nhật user object với ID mới
          user: state.user ? { ...state.user, printerProfileId: newProfile._id } : null,
          // Lưu profile vừa tạo
          activePrinterProfile: newProfile,
          // Set bối cảnh mới
          activeContext: "printer",
        }));
      },

    }),
    {
      name: "auth-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
        activeContext: state.activeContext,
        // Không persist activePrinterProfile, sẽ fetch lại
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Khi tải lại trang, nếu bối cảnh là 'printer' nhưng user không có
          // printerProfileId (ví dụ: data cũ), reset về 'customer'
          if (state.activeContext === 'printer' && !state.user?.printerProfileId) {
            state.activeContext = 'customer';
          }
          state.isContextLoading = false;
          state.loading = false; // Luôn bắt đầu với loading = false
        }
      },
    }
  )
);
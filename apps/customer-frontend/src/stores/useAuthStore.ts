// src/stores/useAuthStore.ts

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

          // fetchMe sẽ tự động cập nhật user VÀ activeContext/activePrinterProfile
          // Đây là điểm mấu chốt: `fetchMe` đã được sửa để xử lý việc này
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

      // --- FETCH ME (ĐÃ SỬA VÀ NÂNG CẤP) ---
      fetchMe: async (silent = false) => {
        if (!silent) set({ loading: true });
        try {
          const user = await authService.fetchMe();
          set({ user }); // Cập nhật user ngay

          const currentContext = get().activeContext;
          const isUserInStore = get().user;

          if (!isUserInStore) return;

          // 1. Tự động KIỂM TRA và SỬA LỖI bối cảnh
          if (currentContext === "printer") {
            const printerProfileId = isUserInStore.printerProfileId;

            if (!printerProfileId) {
              set({ activeContext: "customer", activePrinterProfile: null });
              return;
            }

            // 2. Tải profile nếu đang ở context 'printer' và CÓ profile ID

            // 2.1. Sử dụng Lightweight API để kiểm tra tính hợp lệ của ID
            set({ isContextLoading: true });
            const isValid = await printerService.validateProfileExistence();

            if (!isValid) {
              // ✅ FIX LỖI STALE ID: Nếu ID cũ không còn tồn tại trên DB
              console.error("❌ [FetchMe] Printer Profile is STALE/DELETED.");
              set((state) => {
                const userWithClearedId = state.user
                  ? { ...state.user, printerProfileId: null } // <--- BƯỚC QUAN TRỌNG: Xóa ID lỗi
                  : null;
                if (!silent) {
                  toast.error(
                    "Hồ sơ nhà in không tồn tại. Đang chuyển về chế độ mua hàng."
                  );
                }
                return {
                  user: userWithClearedId,
                  activeContext: "customer",
                  activePrinterProfile: null,
                };
              });
              return; // Dừng lại ở đây
            }

            // 2.2. Nếu ID HỢP LỆ -> Chỉ tải full profile nếu chưa có sẵn
            if (!get().activePrinterProfile) {
              try {
                const profile = await printerService.getMyProfile();
                set({
                  activePrinterProfile: profile,
                  activeContext: "printer",
                });
              } catch (profileError) {
                // Nếu lỗi tải full profile (500 internal server error)
                console.error(
                  "❌ [FetchMe] Failed to load full profile:",
                  profileError
                );
                toast.error("Lỗi khi tải hồ sơ nhà in. Vui lòng thử lại.");
                // Vẫn giữ ID và context 'printer' để người dùng thử lại
              }
            }
          }
          // Nếu context là 'customer' thì không cần làm gì thêm.
        } catch (err: any) {
          console.error("❌ [FetchMe Error]", err);
          get().clearState(); // Xóa state hỏng
          if (!silent)
            toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
        } finally {
          set({ loading: false, isContextLoading: false }); // Tắt tất cả loading
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
            // Dùng fetchMe đã sửa, nó sẽ tự xử lý context
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
        if (!user) {
          console.warn("⚠️ [setActiveContext] User chưa đăng nhập");
          return; // Chưa đăng nhập
        }

        // ✅ FIX: Đảm bảo set loading state trước khi xử lý
        set({ isContextLoading: true });

        try {
          if (context === "customer") {
            // ✅ FIX: Chuyển sang customer context - đơn giản và nhanh
            set({ 
              activeContext: "customer", 
              isContextLoading: false,
              // Không cần clear activePrinterProfile, giữ lại để cache
            });
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

            // 2. ✅ FIX: Kiểm tra xem đã fetch profile nhà in chưa
            // Nếu đã có profile và vẫn còn hợp lệ, dùng luôn
            if (activePrinterProfile && activePrinterProfile._id === user.printerProfileId) {
              // 2a. Đã có và hợp lệ -> Đặt làm active và điều hướng ngay
              set({ 
                activeContext: "printer", 
                isContextLoading: false 
              });
              navigate("/printer/dashboard");
              return;
            }

            // 3. Chưa có hoặc profile không khớp -> Fetch profile
            try {
              const profile = await printerService.getMyProfile();
              set({
                activePrinterProfile: profile,
                activeContext: "printer",
                isContextLoading: false,
              });
              navigate("/printer/dashboard");
            } catch (err: any) {
              console.error("❌ [setActiveContext] Lỗi khi fetch profile:", err);
              toast.error(
                err.response?.data?.message || "Không thể tải hồ sơ nhà in của bạn. Vui lòng thử lại."
              );
              set({ isContextLoading: false }); // Vẫn ở context cũ
            }
          }
        } catch (error: any) {
          // ✅ FIX: Xử lý lỗi tổng quát
          console.error("❌ [setActiveContext] Lỗi không mong đợi:", error);
          set({ isContextLoading: false });
        }
      },

      // --- HÀNH ĐỘNG SAU KHI ONBOARDING ---
      onPrinterProfileCreated: (newProfile) => {
        set((state) => ({
          // Cập nhật user object với ID mới
          user: state.user
            ? { ...state.user, printerProfileId: newProfile._id }
            : null,
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
          if (
            state.activeContext === "printer" &&
            !state.user?.printerProfileId
          ) {
            state.activeContext = "customer";
          }
          state.isContextLoading = false;
          state.loading = false; // Luôn bắt đầu với loading = false
        }
      },
    }
  )
);

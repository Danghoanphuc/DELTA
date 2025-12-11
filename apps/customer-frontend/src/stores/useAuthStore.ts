// src/stores/useAuthStore.ts

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { toast } from "@/shared/utils/toast";
import { authService } from "@/services/authService";
import { printerService } from "@/services/printerService";
import type { User } from "@/types/user";
import type { PrinterProfile } from "@/types/printerProfile";
import { useNavigate } from "react-router-dom";

// --- TYPES ---
export type AuthContext = "customer" | "printer" | "organization" | "shipper";

interface OrganizationProfile {
  _id: string;
  businessName: string;
  taxCode?: string;
  contactPhone?: string;
  billingAddress?: string;
  logoUrl?: string;
  usageIntent?: string;
  industry?: string;
  onboardingCompleted?: boolean;
  pendingInvites?: Array<{ email: string; status: string; invitedAt?: string }>;
  teamMembers?: Array<{
    userId: string;
    role: string;
    joinedAt: string;
    user?: { displayName: string; email: string; avatarUrl?: string };
  }>;
  isVerified?: boolean;
  isActive?: boolean;
  totalOrders?: number;
  totalSpent?: number;
  credits?: number;
}

interface ShipperProfile {
  _id: string;
  displayName: string;
  phone?: string;
  vehicleType?: string;
  licensePlate?: string;
  isActive?: boolean;
}

interface AuthState {
  accessToken: string | null;
  user: User | null;
  loading: boolean; // Loading chung (refresh, fetchMe)

  // --- State cho Bối cảnh (Context) ---
  activeContext: AuthContext;
  activePrinterProfile: PrinterProfile | null;
  activeOrganizationProfile: OrganizationProfile | null; // ✅ NEW: B2B Organization
  activeShipperProfile: ShipperProfile | null; // ✅ NEW: Shipper
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
  activeOrganizationProfile: null,
  activeShipperProfile: null,
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
        set({ isContextLoading: true }); // ✅ Set loading at start
        try {
          const user = await authService.fetchMe();

          const currentContext = get().activeContext;

          // ✅ AUTO-DETECT CONTEXT: Ưu tiên organization > shipper > printer > customer
          let detectedContext: AuthContext = "customer";

          console.log("[FetchMe] User profile IDs:", {
            organizationProfileId: user.organizationProfileId,
            shipperProfileId: user.shipperProfileId,
            printerProfileId: user.printerProfileId,
            customerProfileId: user.customerProfileId,
          });

          if (user.organizationProfileId) {
            detectedContext = "organization";
            console.log("[FetchMe] Detected organization context");
          } else if (user.shipperProfileId) {
            detectedContext = "shipper";
            console.log("[FetchMe] Detected shipper context");
          } else if (user.printerProfileId) {
            detectedContext = "printer";
            console.log("[FetchMe] Detected printer context");
          } else {
            console.log("[FetchMe] Detected customer context");
          }

          // 1. Xử lý SHIPPER context
          if (detectedContext === "shipper") {
            const shipperProfileId = user.shipperProfileId;

            if (!shipperProfileId) {
              set({
                user,
                activeContext: "customer",
                activeShipperProfile: null,
                loading: false,
                isContextLoading: false, // ✅ Always set to false
              });
              return;
            }

            // Load shipper profile nếu chưa có
            if (!get().activeShipperProfile) {
              try {
                const res = await authService.getShipperProfile();
                const profile = res.data?.data?.profile;

                set({
                  user,
                  activeShipperProfile: profile,
                  activeContext: "shipper",
                  loading: false,
                  isContextLoading: false,
                });
              } catch (profileError) {
                console.error(
                  "❌ [FetchMe] Failed to load shipper profile:",
                  profileError
                );
                toast.error("Lỗi khi tải hồ sơ shipper. Vui lòng thử lại.");
                set({
                  user,
                  activeContext: "customer",
                  activeShipperProfile: null,
                  loading: false,
                  isContextLoading: false,
                });
              }
            } else {
              set({
                user,
                activeContext: "shipper",
                loading: false,
                isContextLoading: false, // ✅ Always set to false
              });
            }
            return;
          }

          // 2. Xử lý ORGANIZATION context
          if (detectedContext === "organization") {
            const organizationProfileId = user.organizationProfileId;

            if (!organizationProfileId) {
              // ✅ Single state update
              set({
                user,
                activeContext: "customer",
                activeOrganizationProfile: null,
                loading: false,
                isContextLoading: false, // ✅ Always set to false
              });
              return;
            }

            // Load organization profile nếu chưa có
            if (!get().activeOrganizationProfile) {
              try {
                const res = await authService.getOrganizationProfile();
                const profile = res.data?.data?.profile;

                // ✅ Single state update - combine all changes
                set({
                  user,
                  activeOrganizationProfile: profile,
                  activeContext: "organization",
                  loading: false,
                  isContextLoading: false,
                });
              } catch (profileError) {
                console.error(
                  "❌ [FetchMe] Failed to load organization profile:",
                  profileError
                );
                toast.error(
                  "Lỗi khi tải hồ sơ doanh nghiệp. Vui lòng thử lại."
                );
                // ✅ Fallback to customer context on error
                set({
                  user,
                  activeContext: "customer",
                  activeOrganizationProfile: null,
                  loading: false,
                  isContextLoading: false,
                });
              }
            } else {
              // ✅ Already have profile - just update user and context
              set({
                user,
                activeContext: "organization",
                loading: false,
                isContextLoading: false, // ✅ Always set to false
              });
            }
            return;
          }

          // 3. Xử lý PRINTER context
          if (detectedContext === "printer") {
            const printerProfileId = user.printerProfileId;

            if (!printerProfileId) {
              // ✅ Single state update
              set({
                user,
                activeContext: "customer",
                activePrinterProfile: null,
                loading: false,
                isContextLoading: false, // ✅ Always set to false
              });
              return;
            }

            // 2.1. Sử dụng Lightweight API để kiểm tra tính hợp lệ của ID
            const isValid = await printerService.validateProfileExistence();

            if (!isValid) {
              // ✅ FIX LỖI STALE ID: Nếu ID cũ không còn tồn tại trên DB
              console.error("❌ [FetchMe] Printer Profile is STALE/DELETED.");
              const userWithClearedId = { ...user, printerProfileId: null };
              if (!silent) {
                toast.error(
                  "Hồ sơ nhà in không tồn tại. Đang chuyển về chế độ mua hàng."
                );
              }
              // ✅ Single state update
              set({
                user: userWithClearedId,
                activeContext: "customer",
                activePrinterProfile: null,
                loading: false,
                isContextLoading: false,
              });
              return;
            }

            // 2.2. Nếu ID HỢP LỆ -> Chỉ tải full profile nếu chưa có sẵn
            if (!get().activePrinterProfile) {
              try {
                const profile = await printerService.getMyProfile();
                // ✅ Single state update
                set({
                  user,
                  activePrinterProfile: profile,
                  activeContext: "printer",
                  loading: false,
                  isContextLoading: false,
                });
              } catch (profileError) {
                console.error(
                  "❌ [FetchMe] Failed to load full profile:",
                  profileError
                );
                toast.error("Lỗi khi tải hồ sơ nhà in. Vui lòng thử lại.");
                // ✅ Fallback to customer
                set({
                  user,
                  activeContext: "customer",
                  loading: false,
                  isContextLoading: false,
                });
              }
            } else {
              // ✅ Already have profile
              set({
                user,
                activeContext: "printer",
                loading: false,
                isContextLoading: false, // ✅ Always set to false
              });
            }
            return;
          }

          // 4. CUSTOMER context - simple update
          set({
            user,
            activeContext: "customer",
            loading: false,
            isContextLoading: false, // ✅ Always set to false
          });
        } catch (err: any) {
          console.error("❌ [FetchMe Error]", err);
          get().clearState(); // Xóa state hỏng
          if (!silent)
            toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
        } finally {
          set({ loading: false, isContextLoading: false }); // ✅ Ensure always set to false
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
        console.log("[setActiveContext] ⚠️ Called with context:", context);
        console.trace("[setActiveContext] Call stack");

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

          if (context === "shipper") {
            // Kiểm tra xem user có hồ sơ shipper không
            if (!user.shipperProfileId) {
              toast.info("Bạn chưa có quyền shipper.");
              set({ isContextLoading: false });
              navigate("/app");
              return;
            }

            // Đã có shipperProfileId -> chuyển context
            set({
              activeContext: "shipper",
              isContextLoading: false,
            });
            navigate("/shipper/app");
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
            if (
              activePrinterProfile &&
              activePrinterProfile._id === user.printerProfileId
            ) {
              // 2a. Đã có và hợp lệ -> Đặt làm active và điều hướng ngay
              set({
                activeContext: "printer",
                isContextLoading: false,
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
              console.error(
                "❌ [setActiveContext] Lỗi khi fetch profile:",
                err
              );
              toast.error(
                err.response?.data?.message ||
                  "Không thể tải hồ sơ nhà in của bạn. Vui lòng thử lại."
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
        // Không persist profiles, sẽ fetch lại
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Reset về customer nếu context không hợp lệ
          if (
            state.activeContext === "printer" &&
            !state.user?.printerProfileId
          ) {
            state.activeContext = "customer";
          }
          if (
            state.activeContext === "shipper" &&
            !state.user?.shipperProfileId
          ) {
            state.activeContext = "customer";
          }
          if (
            state.activeContext === "organization" &&
            !state.user?.organizationProfileId
          ) {
            state.activeContext = "customer";
          }
          state.isContextLoading = false;
          state.loading = false;
        }
      },
    }
  )
);

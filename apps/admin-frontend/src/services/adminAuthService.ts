// apps/admin-frontend/src/services/adminAuthService.ts
import api from "@/lib/axios"; // Import này LÀ ĐÚNG
import { useAdminAuthStore } from "@/store/useAdminAuthStore"; // Import này LÀ ĐÚNG
import { type IAdmin } from "@printz/types";

/**
 * Hàm gọi API đăng nhập
 */
export const signIn = async (
  email: string,
  password: string
): Promise<IAdmin> => {
  const { setToken, setAdmin, setStatus } = useAdminAuthStore.getState();
  setStatus("loading");

  try {
    // === SỬA LỖI Ở ĐÂY: TRẢ LẠI "/auth/signin" ===
    const res = await api.post("/auth/signin", { email, password });
    const { token, data } = res.data;
    const admin: IAdmin = data.admin;

    setToken(token);
    setAdmin(admin);
    setStatus("success");

    return admin;
  } catch (error: any) {
    setStatus("error");
    setToken(null);
    setAdmin(null);

    const message =
      error.response?.data?.message || "Lỗi đăng nhập không xác định";
    throw new Error(message);
  }
};

/**
 * Hàm gọi API lấy thông tin admin hiện tại (đã đăng nhập)
 */
export const fetchMe = async (): Promise<IAdmin> => {
  const { setAdmin, setStatus } = useAdminAuthStore.getState();
  setStatus("loading");

  try {
    // === SỬA LỖI Ở ĐÂY: TRẢ LẠI "/auth/me" ===
    const res = await api.get("/auth/me");
    const admin: IAdmin = res.data.data.admin;

    setAdmin(admin);
    setStatus("success");
    return admin;
  } catch (error: any) {
    // Interceptor sẽ tự động xử lý logout 401
    setStatus("error");
    const message =
      error.response?.data?.message || "Phiên đăng nhập không hợp lệ";
    throw new Error(message);
  }
};

/**
 * Hàm đăng xuất (chỉ cần xóa state ở local)
 */
export const signOut = () => {
  useAdminAuthStore.getState().logout();
};

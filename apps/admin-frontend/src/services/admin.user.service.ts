// apps/admin-frontend/src/services/admin.user.service.ts
import api from "@/lib/axios";
import { type IUser } from "@printz/types"; // Import "Hợp đồng"

// Kiểu dữ liệu cho response phân trang
export interface IPaginatedUsers {
  data: IUser[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Kiểu dữ liệu cho params
export interface IGetUserParams {
  page?: number;
  limit?: number;
  status?: "all" | "active" | "banned";
  search?: string;
}

/**
 * Lấy danh sách người dùng (phân trang, filter)
 */
export const getListUsers = async (
  params: IGetUserParams
): Promise<IPaginatedUsers> => {
  try {
    const res = await api.get("/admin/users", {
      params: {
        ...params,
        _t: Date.now(), // Cache busting
      },
    });
    return res.data.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message || "Lỗi khi tải danh sách người dùng";
    throw new Error(message);
  }
};

/**
 * Cập nhật trạng thái user (ban/unban)
 */
export const updateUserStatus = async (
  userId: string,
  status: "active" | "banned"
): Promise<IUser> => {
  try {
    const res = await api.patch(`/admin/users/${userId}/status`, { status });
    return res.data.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message || "Lỗi khi cập nhật trạng thái";
    throw new Error(message);
  }
};

/**
 * Lấy token giả mạo (impersonate)
 */
export const impersonateUser = async (
  userId: string
): Promise<{ accessToken: string }> => {
  try {
    const res = await api.post(`/admin/users/${userId}/impersonate`);
    return res.data.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message || "Lỗi khi thực hiện giả mạo";
    throw new Error(message);
  }
};

/**
 * Toggle Shipper Role - Đổi user thành shipper hoặc remove shipper role
 */
export const toggleShipperRole = async (
  userId: string
): Promise<{
  success: boolean;
  message: string;
  isShipper: boolean;
  user?: any;
}> => {
  try {
    const res = await api.post(`/admin/users/${userId}/toggle-shipper`);
    return res.data.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message || "Lỗi khi đổi vai trò Shipper";
    throw new Error(message);
  }
};

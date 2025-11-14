// apps/admin-frontend/src/services/dashboardService.ts
import api from "@/lib/axios";

// Định nghĩa kiểu dữ liệu trả về từ API (Rất quan trọng)
export interface IDashboardStats {
  stats: {
    totalUsers: number;
    totalOrders: number;
    totalRevenue: number;
  };
  chartData: Array<{
    name: string;
    revenue: number;
  }>;
}

/**
 * Hàm gọi API lấy dữ liệu thống kê dashboard
 */
export const fetchDashboardStats = async (): Promise<IDashboardStats> => {
  try {
    const res = await api.get("/admin/dashboard/stats");
    return res.data.data;
  } catch (error: any) {
    // Ném lỗi ra để React Query bắt
    const message =
      error.response?.data?.message || "Lỗi khi tải dữ liệu dashboard";
    throw new Error(message);
  }
};

// apps/customer-frontend/src/features/printer/hooks/usePrinterStats.ts
import { useQuery } from "@tanstack/react-query";
import api from "@/shared/lib/axios";

interface RevenueChartData {
  date: string;
  revenue: number;
}

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  revenueGrowth: string;
  revenueChart: RevenueChartData[];
}

/**
 * Hook để lấy thống kê Dashboard của Printer
 */
export function usePrinterStats() {
  return useQuery<DashboardStats>({
    queryKey: ["printer", "dashboard-stats"],
    queryFn: async () => {
      const response = await api.get("/printer/dashboard-stats");
      return response.data.data;
    },
    refetchInterval: 30000, // Refresh mỗi 30 giây
  });
}


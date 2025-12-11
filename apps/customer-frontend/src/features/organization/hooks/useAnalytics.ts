// src/features/organization/hooks/useAnalytics.ts
// ✅ SOLID - Analytics data hook

import { useState, useEffect, useCallback } from "react";
import api from "@/shared/lib/axios";

interface AnalyticsData {
  overview: {
    totalOrders: number;
    totalRecipients: number;
    totalSpent: number;
    deliveryRate: number;
  };
  ordersByStatus: Record<
    string,
    { count: number; totalRecipients: number; totalSpent: number }
  >;
  topPacks: Array<{ name: string; count: number; recipients: number }>;
  monthlyTrend: Array<{ month: string; orders: number; spent: number }>;
  recipientStats: {
    totalActive: number;
    totalGiftsSent: number;
    avgGiftsPerRecipient: number;
  };
  inventoryStats: {
    totalSkus: number;
    totalQuantity: number;
    totalValue: number;
    lowStockCount: number;
  };
}

export function useAnalytics(timeRange: string = "30d") {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    try {
      const [ordersRes, recipientsRes, inventoryRes, packsRes] =
        await Promise.allSettled([
          api.get("/swag-orders/stats"),
          api.get("/recipients/filters"),
          api.get("/inventory/stats"),
          api.get("/swag-packs/stats"),
        ]);

      const ordersData =
        ordersRes.status === "fulfilled" ? ordersRes.value.data?.data : {};
      const recipientsData =
        recipientsRes.status === "fulfilled"
          ? recipientsRes.value.data?.data
          : {};
      const inventoryData =
        inventoryRes.status === "fulfilled"
          ? inventoryRes.value.data?.data?.stats
          : {};
      const packsData =
        packsRes.status === "fulfilled" ? packsRes.value.data?.data : {};

      // Calculate delivery rate
      const totalDelivered =
        ordersData.byStatus?.delivered?.totalRecipients || 0;
      const totalRecipients = ordersData.totalRecipients || 0;
      const deliveryRate =
        totalRecipients > 0
          ? Math.round((totalDelivered / totalRecipients) * 100)
          : 0;

      setData({
        overview: {
          totalOrders: ordersData.totalOrders || 0,
          totalRecipients: ordersData.totalRecipients || 0,
          totalSpent: ordersData.totalSpent || 0,
          deliveryRate,
        },
        ordersByStatus: ordersData.byStatus || {},
        topPacks: packsData.popularPacks || [],
        monthlyTrend: [],
        recipientStats: {
          totalActive: recipientsData.totalCount || 0,
          totalGiftsSent: totalDelivered,
          avgGiftsPerRecipient:
            recipientsData.totalCount > 0
              ? Math.round((totalDelivered / recipientsData.totalCount) * 10) /
                10
              : 0,
        },
        inventoryStats: {
          totalSkus: inventoryData.totalSkus || 0,
          totalQuantity: inventoryData.totalQuantity || 0,
          totalValue: inventoryData.totalValue || 0,
          lowStockCount: inventoryData.lowStockCount || 0,
        },
      });
    } catch (error) {
      console.error("[useAnalytics] Error fetching analytics:", error);
    } finally {
      setIsLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    data,
    isLoading,
    refetch: fetchAnalytics,
  };
}

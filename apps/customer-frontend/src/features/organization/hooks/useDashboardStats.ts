// src/features/organization/hooks/useDashboardStats.ts
// ✅ SOLID - Dashboard stats hook

import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import api from "@/shared/lib/axios";

interface DashboardStats {
  swagPacks: { totalPacks: number; activePacks: number; draftPacks: number };
  recipients: { totalCount: number };
  inventory: {
    totalSkus: number;
    totalQuantity: number;
    lowStockCount: number;
  };
  orders: { total: number; pending: number };
}

export function useDashboardStats() {
  const profile = useAuthStore((s) => s.activeOrganizationProfile);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const [swagPacksRes, recipientsRes, inventoryRes] =
        await Promise.allSettled([
          api.get("/swag-packs/stats"),
          api.get("/recipients/filters"),
          api.get("/inventory/stats"),
        ]);

      setStats({
        swagPacks:
          swagPacksRes.status === "fulfilled"
            ? swagPacksRes.value.data?.data
            : { totalPacks: 0, activePacks: 0, draftPacks: 0 },
        recipients:
          recipientsRes.status === "fulfilled"
            ? recipientsRes.value.data?.data
            : { totalCount: 0 },
        inventory:
          inventoryRes.status === "fulfilled"
            ? inventoryRes.value.data?.data?.stats
            : { totalSkus: 0, totalQuantity: 0, lowStockCount: 0 },
        orders: { total: (profile as any)?.totalOrders || 0, pending: 0 },
      });
    } catch (error) {
      console.error("[useDashboardStats] Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    refetch: fetchStats,
  };
}

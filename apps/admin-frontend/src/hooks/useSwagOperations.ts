// apps/admin-frontend/src/hooks/useSwagOperations.ts
// ✅ SOLID: Single Responsibility - State management only

import { useState, useEffect, useCallback } from "react";
import {
  swagOpsService,
  DashboardStats,
} from "@/services/admin.swag-operations.service";

export function useSwagOperations() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await swagOpsService.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    fetchStats,
  };
}

// apps/customer-frontend/src/features/delivery-checkin/hooks/useAssignedOrders.ts
/**
 * Custom hook for fetching shipper's assigned orders
 */

import { useState, useEffect, useCallback } from "react";
import { toast } from "@/shared/utils/toast";
import { deliveryCheckinService } from "../services/delivery-checkin.service";
import type { AssignedOrder } from "../types";

interface UseAssignedOrdersReturn {
  orders: AssignedOrder[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useAssignedOrders(): UseAssignedOrdersReturn {
  const [orders, setOrders] = useState<AssignedOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await deliveryCheckinService.getAssignedOrders();
      setOrders(data);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Không thể tải danh sách đơn hàng";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error fetching assigned orders:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    isLoading,
    error,
    refetch: fetchOrders,
  };
}

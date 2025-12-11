// apps/admin-frontend/src/hooks/useProductionManagement.ts
// ✅ Production Management Hook
// Phase 5.2: Production Management UI - Hook Layer

import { useState, useCallback } from "react";
import {
  productionService,
  ProductionOrder,
  ProductionStatistics,
  UpdateStatusData,
  QCCheckData,
} from "@/services/admin.production.service";
import { useToast } from "./use-toast";

export function useProductionManagement() {
  const { toast } = useToast();
  const [productionOrders, setProductionOrders] = useState<ProductionOrder[]>(
    []
  );
  const [currentOrder, setCurrentOrder] = useState<ProductionOrder | null>(
    null
  );
  const [statistics, setStatistics] = useState<ProductionStatistics | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Get production order by ID
   */
  const fetchProductionOrder = useCallback(
    async (id: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const order = await productionService.getProductionOrder(id);
        setCurrentOrder(order);
        return order;
      } catch (err: any) {
        const message =
          err.response?.data?.message || "Không thể tải production order";
        setError(message);
        toast({ title: "Lỗi", description: message, variant: "destructive" });
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  /**
   * Get production orders by status
   */
  const fetchProductionOrdersByStatus = useCallback(
    async (
      status: string,
      options?: {
        page?: number;
        limit?: number;
      }
    ) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await productionService.getProductionOrdersByStatus(
          status,
          options
        );
        setProductionOrders(result.orders);
        return result;
      } catch (err: any) {
        const message =
          err.response?.data?.message ||
          "Không thể tải danh sách production orders";
        setError(message);
        toast({ title: "Lỗi", description: message, variant: "destructive" });
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  /**
   * Get production orders by supplier
   */
  const fetchProductionOrdersBySupplier = useCallback(
    async (
      supplierId: string,
      options?: {
        status?: string;
        startDate?: string;
        endDate?: string;
        page?: number;
        limit?: number;
      }
    ) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await productionService.getProductionOrdersBySupplier(
          supplierId,
          options
        );
        setProductionOrders(result.orders);
        return result;
      } catch (err: any) {
        const message =
          err.response?.data?.message ||
          "Không thể tải danh sách production orders";
        setError(message);
        toast({ title: "Lỗi", description: message, variant: "destructive" });
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  /**
   * Get delayed production orders
   */
  const fetchDelayedOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const orders = await productionService.getDelayedProductionOrders();
      setProductionOrders(orders);
      return orders;
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Không thể tải danh sách orders trễ hạn";
      setError(message);
      toast({ title: "Lỗi", description: message, variant: "destructive" });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  /**
   * Update production status
   */
  const updateStatus = useCallback(
    async (id: string, data: UpdateStatusData) => {
      try {
        const updatedOrder = await productionService.updateProductionStatus(
          id,
          data
        );

        // Update current order if it's the same
        if (currentOrder?._id === id) {
          setCurrentOrder(updatedOrder);
        }

        // Update in list
        setProductionOrders((prev) =>
          prev.map((order) => (order._id === id ? updatedOrder : order))
        );

        toast({
          title: "Thành công",
          description: "Cập nhật trạng thái thành công",
        });
        return updatedOrder;
      } catch (err: any) {
        const message =
          err.response?.data?.message || "Không thể cập nhật trạng thái";
        toast({ title: "Lỗi", description: message, variant: "destructive" });
        throw err;
      }
    },
    [currentOrder, toast]
  );

  /**
   * Perform QC check
   */
  const performQCCheck = useCallback(
    async (id: string, data: QCCheckData) => {
      try {
        const updatedOrder = await productionService.performQCCheck(id, data);

        // Update current order if it's the same
        if (currentOrder?._id === id) {
          setCurrentOrder(updatedOrder);
        }

        // Update in list
        setProductionOrders((prev) =>
          prev.map((order) => (order._id === id ? updatedOrder : order))
        );

        toast({
          title: "Thành công",
          description: data.passed
            ? "QC check passed thành công"
            : "QC check failed",
        });
        return updatedOrder;
      } catch (err: any) {
        const message =
          err.response?.data?.message || "Không thể thực hiện QC check";
        toast({ title: "Lỗi", description: message, variant: "destructive" });
        throw err;
      }
    },
    [currentOrder, toast]
  );

  /**
   * Complete production
   */
  const completeProduction = useCallback(
    async (id: string, actualCost?: number) => {
      try {
        const updatedOrder = await productionService.completeProduction(
          id,
          actualCost
        );

        // Update current order if it's the same
        if (currentOrder?._id === id) {
          setCurrentOrder(updatedOrder);
        }

        // Update in list
        setProductionOrders((prev) =>
          prev.map((order) => (order._id === id ? updatedOrder : order))
        );

        toast({
          title: "Thành công",
          description: "Hoàn thành production order thành công",
        });
        return updatedOrder;
      } catch (err: any) {
        const message =
          err.response?.data?.message ||
          "Không thể hoàn thành production order";
        toast({ title: "Lỗi", description: message, variant: "destructive" });
        throw err;
      }
    },
    [currentOrder, toast]
  );

  /**
   * Get production statistics
   */
  const fetchStatistics = useCallback(
    async (supplierId?: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const stats = await productionService.getProductionStatistics(
          supplierId
        );
        setStatistics(stats);
        return stats;
      } catch (err: any) {
        const message =
          err.response?.data?.message || "Không thể tải thống kê production";
        setError(message);
        toast({ title: "Lỗi", description: message, variant: "destructive" });
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  return {
    // State
    productionOrders,
    currentOrder,
    statistics,
    isLoading,
    error,

    // Actions
    fetchProductionOrder,
    fetchProductionOrdersByStatus,
    fetchProductionOrdersBySupplier,
    fetchDelayedOrders,
    updateStatus,
    performQCCheck,
    completeProduction,
    fetchStatistics,
  };
}

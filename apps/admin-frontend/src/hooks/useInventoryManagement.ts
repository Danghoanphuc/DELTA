// src/hooks/useInventoryManagement.ts
// ✅ SOLID: Single Responsibility - State management cho Inventory

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  adminInventoryService,
  InventoryOverview,
  LowStockItem,
  SkuVariant,
  InventoryTransaction,
} from "@/services/admin.inventory.service";

export function useInventoryManagement() {
  const [overview, setOverview] = useState<InventoryOverview | null>(null);
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOperating, setIsOperating] = useState(false);

  // Fetch overview
  const fetchOverview = useCallback(async () => {
    try {
      const data = await adminInventoryService.getInventoryOverview();
      setOverview(data);
    } catch (error: any) {
      console.error("Error fetching inventory overview:", error);
      toast.error(
        error.response?.data?.message || "Không thể tải tổng quan tồn kho"
      );
    }
  }, []);

  // Fetch low stock items
  const fetchLowStockItems = useCallback(async (threshold?: number) => {
    try {
      const data = await adminInventoryService.getLowStockItems(threshold);
      setLowStockItems(data);
    } catch (error: any) {
      console.error("Error fetching low stock items:", error);
      toast.error(
        error.response?.data?.message || "Không thể tải danh sách sắp hết hàng"
      );
    }
  }, []);

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([fetchOverview(), fetchLowStockItems()]);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [fetchOverview, fetchLowStockItems]);

  // Adjust inventory
  const adjustInventory = async (
    variantId: string,
    quantityChange: number,
    reason: string,
    notes?: string
  ) => {
    setIsOperating(true);
    try {
      await adminInventoryService.adjustInventory(variantId, {
        quantityChange,
        reason,
        notes,
      });
      toast.success("Đã điều chỉnh tồn kho");
      await Promise.all([fetchOverview(), fetchLowStockItems()]);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Không thể điều chỉnh tồn kho"
      );
      throw error;
    } finally {
      setIsOperating(false);
    }
  };

  // Record purchase
  const recordPurchase = async (
    variantId: string,
    quantity: number,
    unitCost: number,
    purchaseOrderNumber?: string,
    notes?: string
  ) => {
    setIsOperating(true);
    try {
      await adminInventoryService.recordPurchase(variantId, {
        quantity,
        unitCost,
        purchaseOrderNumber,
        notes,
      });
      toast.success("Đã ghi nhận nhập hàng");
      await Promise.all([fetchOverview(), fetchLowStockItems()]);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Không thể ghi nhận nhập hàng"
      );
      throw error;
    } finally {
      setIsOperating(false);
    }
  };

  return {
    overview,
    lowStockItems,
    isLoading,
    isOperating,
    fetchOverview,
    fetchLowStockItems,
    adjustInventory,
    recordPurchase,
  };
}

// Hook for variant details
export function useVariantInventory(variantId: string | null) {
  const [variant, setVariant] = useState<SkuVariant | null>(null);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Fetch variant details
  const fetchVariant = useCallback(async () => {
    if (!variantId) return;
    setIsLoading(true);
    try {
      const data = await adminInventoryService.getVariantInventory(variantId);
      setVariant(data);
    } catch (error: any) {
      console.error("Error fetching variant:", error);
      toast.error(
        error.response?.data?.message || "Không thể tải thông tin variant"
      );
    } finally {
      setIsLoading(false);
    }
  }, [variantId]);

  // Fetch transactions
  const fetchTransactions = useCallback(
    async (page: number = 1, type?: string) => {
      if (!variantId) return;
      setIsLoading(true);
      try {
        const data = await adminInventoryService.getTransactionHistory(
          variantId,
          {
            page,
            limit: 20,
            type,
          }
        );
        setTransactions(data.transactions);
        setPagination(data.pagination);
      } catch (error: any) {
        console.error("Error fetching transactions:", error);
        toast.error(
          error.response?.data?.message || "Không thể tải lịch sử giao dịch"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [variantId]
  );

  useEffect(() => {
    if (variantId) {
      fetchVariant();
      fetchTransactions();
    }
  }, [variantId, fetchVariant, fetchTransactions]);

  return {
    variant,
    transactions,
    pagination,
    isLoading,
    fetchVariant,
    fetchTransactions,
  };
}

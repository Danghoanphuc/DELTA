// src/hooks/useInventoryManagement.ts
// ✅ SOLID: Single Responsibility - State management cho Inventory

import { useState, useEffect, useCallback } from "react";
import { useToast } from "./use-toast";
import {
  adminInventoryService,
  InventoryOverview,
  LowStockItem,
  SkuVariant,
  InventoryTransaction,
} from "@/services/admin.inventory.service";

export function useInventoryManagement() {
  const { toast } = useToast();
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
      toast({
        title: "Lỗi",
        description:
          error.response?.data?.message || "Không thể tải tổng quan tồn kho",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Fetch low stock items
  const fetchLowStockItems = useCallback(
    async (threshold?: number) => {
      try {
        const data = await adminInventoryService.getLowStockItems(threshold);
        setLowStockItems(data);
      } catch (error: any) {
        console.error("Error fetching low stock items:", error);
        toast({
          title: "Lỗi",
          description:
            error.response?.data?.message ||
            "Không thể tải danh sách sắp hết hàng",
          variant: "destructive",
        });
      }
    },
    [toast]
  );

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
      toast({ title: "Thành công", description: "Đã điều chỉnh tồn kho" });
      await Promise.all([fetchOverview(), fetchLowStockItems()]);
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description:
          error.response?.data?.message || "Không thể điều chỉnh tồn kho",
        variant: "destructive",
      });
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
      toast({ title: "Thành công", description: "Đã ghi nhận nhập hàng" });
      await Promise.all([fetchOverview(), fetchLowStockItems()]);
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description:
          error.response?.data?.message || "Không thể ghi nhận nhập hàng",
        variant: "destructive",
      });
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
  const { toast } = useToast();
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
      toast({
        title: "Lỗi",
        description:
          error.response?.data?.message || "Không thể tải thông tin variant",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [variantId, toast]);

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
        toast({
          title: "Lỗi",
          description:
            error.response?.data?.message || "Không thể tải lịch sử giao dịch",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [variantId, toast]
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

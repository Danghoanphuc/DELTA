// src/features/organization/hooks/useInventory.ts
// ✅ SOLID - Inventory management hook

import { useState, useEffect, useCallback } from "react";
import { toast } from "@/shared/utils/toast";
import api from "@/shared/lib/axios";

interface InventoryItem {
  _id: string;
  product: string;
  productName: string;
  productSku?: string;
  productImage?: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  unitCost: number;
  totalValue: number;
  status: string;
  lowStockThreshold: number;
  warehouseLocation: string;
  lastRestockedAt?: string;
  lastShippedAt?: string;
}

interface InventoryStats {
  totalSkus: number;
  totalQuantity: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
}

export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch inventory
  const fetchInventory = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (statusFilter !== "all") params.append("status", statusFilter);

      const res = await api.get(`/inventory?${params}`);
      setItems(res.data?.data?.items || []);
      setStats(res.data?.data?.stats || null);
    } catch (error) {
      console.error("[useInventory] Error fetching inventory:", error);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInventory();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, fetchInventory]);

  // Update quantity
  const updateQuantity = async (
    itemId: string,
    quantity: number,
    operation: string
  ) => {
    try {
      await api.put(`/inventory/items/${itemId}/quantity`, {
        quantity,
        operation,
      });
      toast.success("Đã cập nhật số lượng!");
      await fetchInventory();
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
      return false;
    }
  };

  // Remove item
  const removeItem = async (itemId: string) => {
    try {
      await api.delete(`/inventory/items/${itemId}`);
      toast.success("Đã xóa khỏi kho!");
      await fetchInventory();
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
      return false;
    }
  };

  return {
    items,
    stats,
    isLoading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    updateQuantity,
    removeItem,
    refetch: fetchInventory,
  };
}

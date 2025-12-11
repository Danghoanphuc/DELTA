// src/hooks/useInventory.ts
// ✅ SOLID: Single Responsibility - State management cho Inventory

import { useState, useEffect, useCallback } from "react";
import {
  swagOpsService,
  Organization,
} from "@/services/admin.swag-operations.service";

export interface InventoryItem {
  _id: string;
  name: string;
  sku: string;
  quantity: number;
  lowStockThreshold: number;
  unitCost: number;
  totalValue: number;
  status: string;
  organizationId: string;
  organizationName: string;
  imageUrl?: string;
}

export interface InventoryStats {
  totalItems: number;
  totalValue: number;
  lowStockCount: number;
  organizationCount: number;
}

export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [orgFilter, setOrgFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch inventory data
  const fetchInventory = useCallback(async () => {
    setIsLoading(true);
    try {
      const [inventoryData, orgsData] = await Promise.all([
        swagOpsService.getInventoryOverview({
          organizationId: orgFilter !== "all" ? orgFilter : undefined,
          lowStockOnly: statusFilter === "low_stock",
        }),
        swagOpsService.getOrganizations(),
      ]);

      setItems(inventoryData.items || []);
      setStats(inventoryData.stats || null);
      setOrganizations(orgsData);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    } finally {
      setIsLoading(false);
    }
  }, [orgFilter, statusFilter]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // Update inventory item
  const updateInventoryItem = async (
    itemId: string,
    data: { quantity: number; operation: "add" | "subtract" | "set" }
  ) => {
    setIsUpdating(true);
    try {
      await swagOpsService.updateInventoryItem(itemId, data);
      await fetchInventory();
    } catch (error) {
      console.error("Error updating inventory:", error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  // Filter items by search
  const filteredItems = items.filter((item) => {
    if (!search) return true;
    return (
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase())
    );
  });

  return {
    items: filteredItems,
    stats,
    organizations,
    isLoading,
    isUpdating,
    search,
    setSearch,
    orgFilter,
    setOrgFilter,
    statusFilter,
    setStatusFilter,
    fetchInventory,
    updateInventoryItem,
  };
}

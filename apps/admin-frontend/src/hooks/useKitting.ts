// apps/admin-frontend/src/hooks/useKitting.ts
// ✅ Kitting Hook - Phase 6.2
// State management cho kitting operations

import { useState, useCallback } from "react";
import { useToast } from "./use-toast";
import {
  kittingService,
  type SwagOrderKitting,
  type KittingChecklist,
  type ScanResult,
  type InventoryValidation,
} from "../services/admin.kitting.service";

export function useKitting() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<SwagOrderKitting[]>([]);
  const [checklist, setChecklist] = useState<KittingChecklist | null>(null);
  const [validation, setValidation] = useState<InventoryValidation | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch kitting queue
   * Requirements: 8.1
   */
  const fetchKittingQueue = useCallback(
    async (
      filters: {
        status?: string;
        priority?: string;
        sortBy?: string;
      } = {}
    ) => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await kittingService.getKittingQueue(filters);
        setOrders(data);
      } catch (err: any) {
        const message =
          err.response?.data?.message || "Không thể tải danh sách kitting";
        setError(message);
        toast({ title: "Lỗi", description: message, variant: "destructive" });
        console.error("Error fetching kitting queue:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  /**
   * Fetch kitting checklist
   * Requirements: 8.1, 8.2
   */
  const fetchKittingChecklist = useCallback(
    async (orderId: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await kittingService.getKittingChecklist(orderId);
        setChecklist(data);
      } catch (err: any) {
        const message =
          err.response?.data?.message || "Không thể tải checklist";
        setError(message);
        toast({ title: "Lỗi", description: message, variant: "destructive" });
        console.error("Error fetching checklist:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  /**
   * Validate inventory
   * Requirements: 8.2
   */
  const validateInventory = useCallback(
    async (orderId: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await kittingService.validateInventory(orderId);
        setValidation(data);

        if (!data.allAvailable) {
          toast({
            title: "Lỗi",
            description: "Tồn kho không đủ để kitting",
            variant: "destructive",
          });
        } else {
          toast({ title: "Thành công", description: "Tồn kho đủ để kitting" });
        }

        return data;
      } catch (err: any) {
        const message =
          err.response?.data?.message || "Không thể kiểm tra tồn kho";
        setError(message);
        toast({ title: "Lỗi", description: message, variant: "destructive" });
        console.error("Error validating inventory:", err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  /**
   * Start kitting
   * Requirements: 8.2
   */
  const startKitting = useCallback(
    async (orderId: string) => {
      setIsLoading(true);
      setError(null);
      try {
        await kittingService.startKitting(orderId);
        toast({ title: "Thành công", description: "Đã bắt đầu kitting" });

        // Refresh checklist
        await fetchKittingChecklist(orderId);
      } catch (err: any) {
        const message =
          err.response?.data?.message || "Không thể bắt đầu kitting";
        setError(message);
        toast({ title: "Lỗi", description: message, variant: "destructive" });
        console.error("Error starting kitting:", err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchKittingChecklist, toast]
  );

  /**
   * Scan item
   * Requirements: 8.2, 8.3
   */
  const scanItem = useCallback(
    async (orderId: string, sku: string, quantity?: number) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await kittingService.scanItem(orderId, sku, quantity);
        toast({ title: "Thành công", description: `Đã scan ${sku}` });

        // Refresh checklist
        await fetchKittingChecklist(orderId);

        return result;
      } catch (err: any) {
        const message = err.response?.data?.message || "Không thể scan item";
        setError(message);
        toast({ title: "Lỗi", description: message, variant: "destructive" });
        console.error("Error scanning item:", err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchKittingChecklist, toast]
  );

  /**
   * Complete kitting
   * Requirements: 8.3, 8.4
   */
  const completeKitting = useCallback(
    async (orderId: string) => {
      setIsLoading(true);
      setError(null);
      try {
        await kittingService.completeKitting(orderId);
        toast({ title: "Thành công", description: "Đã hoàn tất kitting" });

        // Clear checklist
        setChecklist(null);
      } catch (err: any) {
        const message =
          err.response?.data?.message || "Không thể hoàn tất kitting";
        setError(message);
        toast({ title: "Lỗi", description: message, variant: "destructive" });
        console.error("Error completing kitting:", err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  return {
    // State
    orders,
    checklist,
    validation,
    isLoading,
    error,

    // Actions
    fetchKittingQueue,
    fetchKittingChecklist,
    validateInventory,
    startKitting,
    scanItem,
    completeKitting,
  };
}

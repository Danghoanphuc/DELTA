// apps/customer-frontend/src/features/delivery-checkin/hooks/useShipperCheckins.ts
/**
 * Hook for managing shipper check-in history
 * Handles fetching, filtering, pagination, and deletion of check-ins
 *
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5
 */

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { deliveryCheckinService } from "../services/delivery-checkin.service";
import type { DeliveryCheckin } from "../types";

export interface CheckinFilters {
  startDate: string | null;
  endDate: string | null;
  status: string | null;
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface UseShipperCheckinsReturn {
  // Data
  checkins: DeliveryCheckin[];
  selectedCheckin: DeliveryCheckin | null;

  // Loading states
  isLoading: boolean;
  isLoadingDetail: boolean;
  isDeleting: boolean;

  // Error state
  error: string | null;

  // Filters
  filters: CheckinFilters;
  setFilters: (filters: CheckinFilters) => void;
  clearFilters: () => void;

  // Pagination
  pagination: PaginationState;
  setPage: (page: number) => void;

  // Actions
  fetchCheckins: () => Promise<void>;
  viewCheckinDetail: (checkinId: string) => Promise<void>;
  closeCheckinDetail: () => void;
  deleteCheckin: (checkinId: string) => Promise<boolean>;
  refreshList: () => Promise<void>;
}

const DEFAULT_FILTERS: CheckinFilters = {
  startDate: null,
  endDate: null,
  status: null,
};

const DEFAULT_PAGINATION: PaginationState = {
  page: 1,
  limit: 20, // Requirements: 9.5 - 20 items per page
  total: 0,
  totalPages: 0,
};

export function useShipperCheckins(): UseShipperCheckinsReturn {
  // Data state
  const [checkins, setCheckins] = useState<DeliveryCheckin[]>([]);
  const [selectedCheckin, setSelectedCheckin] =
    useState<DeliveryCheckin | null>(null);

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Error state
  const [error, setError] = useState<string | null>(null);

  // Filters state - Requirements: 9.3
  const [filters, setFiltersState] = useState<CheckinFilters>(DEFAULT_FILTERS);

  // Pagination state - Requirements: 9.5
  const [pagination, setPagination] =
    useState<PaginationState>(DEFAULT_PAGINATION);

  /**
   * Fetch check-ins with current filters and pagination
   * Requirements: 9.1, 9.2, 9.3, 9.5
   */
  const fetchCheckins = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await deliveryCheckinService.getShipperCheckins({
        page: pagination.page,
        limit: pagination.limit,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        status: filters.status || undefined,
      });

      setCheckins(result.checkins);
      setPagination((prev) => ({
        ...prev,
        total: result.pagination.total,
        totalPages: Math.ceil(result.pagination.total / prev.limit),
      }));
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Không thể tải lịch sử check-in";
      setError(message);
      toast.error(message);
      console.error("Error fetching shipper checkins:", err);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  /**
   * View check-in detail
   * Requirements: 9.4
   */
  const viewCheckinDetail = useCallback(async (checkinId: string) => {
    setIsLoadingDetail(true);

    try {
      const checkin = await deliveryCheckinService.getCheckin(checkinId);
      setSelectedCheckin(checkin);
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Không thể tải chi tiết check-in";
      toast.error(message);
      console.error("Error fetching checkin detail:", err);
    } finally {
      setIsLoadingDetail(false);
    }
  }, []);

  /**
   * Close check-in detail modal
   */
  const closeCheckinDetail = useCallback(() => {
    setSelectedCheckin(null);
  }, []);

  /**
   * Delete a check-in
   * Requirements: Task 16 - delete functionality
   */
  const deleteCheckin = useCallback(
    async (checkinId: string): Promise<boolean> => {
      setIsDeleting(true);

      try {
        await deliveryCheckinService.deleteCheckin(checkinId);
        toast.success("Đã xóa check-in thành công");

        // Remove from local state
        setCheckins((prev) => prev.filter((c) => c._id !== checkinId));

        // Close detail modal if viewing the deleted checkin
        if (selectedCheckin?._id === checkinId) {
          setSelectedCheckin(null);
        }

        // Update pagination total
        setPagination((prev) => ({
          ...prev,
          total: Math.max(0, prev.total - 1),
          totalPages: Math.ceil(Math.max(0, prev.total - 1) / prev.limit),
        }));

        return true;
      } catch (err: any) {
        const message = err.response?.data?.message || "Không thể xóa check-in";
        toast.error(message);
        console.error("Error deleting checkin:", err);
        return false;
      } finally {
        setIsDeleting(false);
      }
    },
    [selectedCheckin]
  );

  /**
   * Set filters and reset to page 1
   */
  const setFilters = useCallback((newFilters: CheckinFilters) => {
    setFiltersState(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  /**
   * Clear all filters
   */
  const clearFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  /**
   * Set current page
   */
  const setPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  /**
   * Refresh the list (re-fetch with current filters)
   */
  const refreshList = useCallback(async () => {
    await fetchCheckins();
  }, [fetchCheckins]);

  // Fetch checkins when filters or pagination changes
  useEffect(() => {
    fetchCheckins();
  }, [fetchCheckins]);

  return {
    // Data
    checkins,
    selectedCheckin,

    // Loading states
    isLoading,
    isLoadingDetail,
    isDeleting,

    // Error state
    error,

    // Filters
    filters,
    setFilters,
    clearFilters,

    // Pagination
    pagination,
    setPage,

    // Actions
    fetchCheckins,
    viewCheckinDetail,
    closeCheckinDetail,
    deleteCheckin,
    refreshList,
  };
}

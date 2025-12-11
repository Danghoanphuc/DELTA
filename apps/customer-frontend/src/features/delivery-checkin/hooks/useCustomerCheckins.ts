// apps/customer-frontend/src/features/delivery-checkin/hooks/useCustomerCheckins.ts
/**
 * Hook for managing customer check-in data for map view
 * Handles fetching, filtering, and viewport-based loading with caching
 *
 * **Feature: delivery-checkin-system, Property 44: Viewport Bounds Loading**
 * **Validates: Requirements 5.1, 5.6, 12.3, 12.5**
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { deliveryCheckinService } from "../services/delivery-checkin.service";
import { deliveryCheckinCacheService } from "../services/cache.service";
import type {
  CheckinMarker,
  DeliveryCheckin,
  MapBounds,
  DateRangeFilter,
} from "../types";

interface UseCustomerCheckinsOptions {
  autoFetch?: boolean;
  initialDateRange?: DateRangeFilter;
}

interface UseCustomerCheckinsReturn {
  // Data
  checkins: CheckinMarker[];
  selectedCheckin: DeliveryCheckin | null;

  // Loading states
  isLoading: boolean;
  isLoadingDetail: boolean;

  // Error state
  error: string | null;

  // Date range filter
  dateRange: DateRangeFilter;
  setDateRange: (range: DateRangeFilter) => void;
  clearDateRange: () => void;

  // Actions
  fetchCheckins: () => Promise<void>;
  fetchCheckinsInBounds: (bounds: MapBounds) => Promise<void>;
  selectCheckin: (checkinId: string) => Promise<void>;
  clearSelectedCheckin: () => void;
  refreshCheckins: () => Promise<void>;
}

export function useCustomerCheckins(
  options: UseCustomerCheckinsOptions = {}
): UseCustomerCheckinsReturn {
  const { autoFetch = true, initialDateRange } = options;

  // State
  const [checkins, setCheckins] = useState<CheckinMarker[]>([]);
  const [selectedCheckin, setSelectedCheckin] =
    useState<DeliveryCheckin | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRangeFilter>(
    initialDateRange || { startDate: null, endDate: null }
  );

  // Ref to track current bounds for deduplication
  const currentBoundsRef = useRef<MapBounds | null>(null);

  /**
   * Fetch all customer check-ins with optional date filter
   */
  const fetchCheckins = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await deliveryCheckinService.getCustomerCheckins({
        startDate: dateRange.startDate || undefined,
        endDate: dateRange.endDate || undefined,
      });
      setCheckins(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Không thể tải danh sách check-in";
      setError(message);
      toast.error(message);
      console.error("Error fetching customer checkins:", err);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange.startDate, dateRange.endDate]);

  /**
   * Fetch check-ins within geographic bounds (viewport loading)
   * Implements Property 44: Viewport Bounds Loading
   * Uses caching for improved performance
   *
   * **Feature: delivery-checkin-system, Property 44: Viewport Bounds Loading**
   * **Validates: Requirements 12.3, 12.5**
   */
  const fetchCheckinsInBounds = useCallback(async (bounds: MapBounds) => {
    // Skip if bounds haven't changed significantly
    if (
      currentBoundsRef.current &&
      Math.abs(currentBoundsRef.current.minLng - bounds.minLng) < 0.001 &&
      Math.abs(currentBoundsRef.current.minLat - bounds.minLat) < 0.001 &&
      Math.abs(currentBoundsRef.current.maxLng - bounds.maxLng) < 0.001 &&
      Math.abs(currentBoundsRef.current.maxLat - bounds.maxLat) < 0.001
    ) {
      return;
    }

    currentBoundsRef.current = bounds;

    // Check cache first for fast response
    const cachedMarkers =
      deliveryCheckinCacheService.getMarkersForBounds(bounds);
    if (cachedMarkers) {
      setCheckins(cachedMarkers);
      // Still fetch in background to update cache
      deliveryCheckinService
        .getCheckinsInBounds(bounds)
        .then((data) => {
          deliveryCheckinCacheService.setMarkersForBounds(bounds, data);
          setCheckins(data);
        })
        .catch(() => {
          // Ignore background fetch errors, we have cached data
        });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await deliveryCheckinService.getCheckinsInBounds(bounds);
      // Cache the results
      deliveryCheckinCacheService.setMarkersForBounds(bounds, data);
      setCheckins(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Không thể tải check-in trong khu vực";
      setError(message);
      console.error("Error fetching checkins in bounds:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Select a check-in and load full details for popup
   * Uses caching for improved performance
   */
  const selectCheckin = useCallback(async (checkinId: string) => {
    // Check cache first
    const cachedCheckin = deliveryCheckinCacheService.getCheckin(checkinId);
    if (cachedCheckin) {
      setSelectedCheckin(cachedCheckin);
      return;
    }

    setIsLoadingDetail(true);

    try {
      const detail = await deliveryCheckinService.getCheckinDetail(checkinId);
      // Cache the result
      deliveryCheckinCacheService.setCheckin(detail);
      setSelectedCheckin(detail);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Không thể tải chi tiết check-in";
      toast.error(message);
      console.error("Error fetching checkin detail:", err);
    } finally {
      setIsLoadingDetail(false);
    }
  }, []);

  /**
   * Clear selected check-in
   */
  const clearSelectedCheckin = useCallback(() => {
    setSelectedCheckin(null);
  }, []);

  /**
   * Clear date range filter
   */
  const clearDateRange = useCallback(() => {
    setDateRange({ startDate: null, endDate: null });
  }, []);

  /**
   * Refresh check-ins (re-fetch with current filters)
   */
  const refreshCheckins = useCallback(async () => {
    await fetchCheckins();
  }, [fetchCheckins]);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      fetchCheckins();
    }
  }, [autoFetch, fetchCheckins]);

  return {
    checkins,
    selectedCheckin,
    isLoading,
    isLoadingDetail,
    error,
    dateRange,
    setDateRange,
    clearDateRange,
    fetchCheckins,
    fetchCheckinsInBounds,
    selectCheckin,
    clearSelectedCheckin,
    refreshCheckins,
  };
}

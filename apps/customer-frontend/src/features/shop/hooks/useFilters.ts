// apps/customer-frontend/src/features/shop/hooks/useFilters.ts
// Hook to manage filter state with URL synchronization

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import type { FilterState } from "../types/filter.types";

export const useFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<FilterState>({});

  // Initialize filters from URL on mount
  useEffect(() => {
    const initialFilters: FilterState = {};
    
    searchParams.forEach((value, key) => {
      // Parse comma-separated values
      initialFilters[key] = value.split(',');
    });

    setFilters(initialFilters);
  }, []); // Only run once on mount

  // Update URL when filters change
  const updateFilters = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);

    // Convert filters to URL params
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, values]) => {
      if (values.length > 0) {
        params.set(key, values.join(','));
      }
    });

    setSearchParams(params, { replace: true });
  }, [setSearchParams]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(arr => arr.length > 0);

  // Get active filter count
  const activeFilterCount = Object.values(filters).reduce(
    (sum, arr) => sum + arr.length,
    0
  );

  return {
    filters,
    updateFilters,
    clearFilters,
    hasActiveFilters,
    activeFilterCount
  };
};


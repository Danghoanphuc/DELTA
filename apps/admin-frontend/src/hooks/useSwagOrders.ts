// apps/admin-frontend/src/hooks/useSwagOrders.ts
// ✅ SOLID: Single Responsibility - State management only

import { useState, useEffect, useCallback } from "react";
import {
  swagOpsService,
  SwagOrder,
  Organization,
} from "@/services/admin.swag-operations.service";

interface UseSwagOrdersParams {
  search?: string;
  status?: string;
  organization?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
}

export function useSwagOrders(params: UseSwagOrdersParams = {}) {
  const [orders, setOrders] = useState<SwagOrder[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const apiParams: any = {
        page: params.page || 1,
        limit: 20,
      };

      if (params.search) apiParams.search = params.search;
      if (params.status && params.status !== "all")
        apiParams.status = params.status;
      if (params.organization && params.organization !== "all")
        apiParams.organization = params.organization;
      if (params.dateFrom) apiParams.dateFrom = params.dateFrom;
      if (params.dateTo) apiParams.dateTo = params.dateTo;

      const result = await swagOpsService.getOrders(apiParams);
      setOrders(result.orders || []);
      setPagination(result.pagination || { page: 1, total: 0, totalPages: 1 });
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  }, [
    params.page,
    params.search,
    params.status,
    params.organization,
    params.dateFrom,
    params.dateTo,
  ]);

  const fetchOrganizations = useCallback(async () => {
    try {
      const orgs = await swagOpsService.getOrganizations();
      setOrganizations(orgs);
    } catch (error) {
      console.error("Error fetching organizations:", error);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  const exportOrders = async () => {
    setIsExporting(true);
    try {
      const blob = await swagOpsService.exportOrders({
        dateFrom: params.dateFrom || undefined,
        dateTo: params.dateTo || undefined,
        organization:
          params.organization !== "all" ? params.organization : undefined,
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `swag-orders-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export error:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return {
    orders,
    organizations,
    pagination,
    isLoading,
    isExporting,
    fetchOrders,
    exportOrders,
  };
}

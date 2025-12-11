/**
 * Analytics Hook
 *
 * Custom hook for managing analytics data and state
 * Handles product analytics, supplier analytics, and order trends
 *
 * @module hooks/useAnalytics
 */

import { useState, useEffect, useCallback } from "react";
import { useToast } from "./use-toast";
import {
  adminAnalyticsService,
  ProductAnalytics,
  SupplierAnalytics,
  OrderAnalytics,
  AnalyticsFilters,
} from "../services/admin.analytics.service";

export function useProductAnalytics(initialFilters?: AnalyticsFilters) {
  const { toast } = useToast();
  const [data, setData] = useState<ProductAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AnalyticsFilters>(
    initialFilters || {}
  );

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await adminAnalyticsService.getProductAnalytics(filters);
      setData(result);
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        "Không thể tải dữ liệu phân tích sản phẩm";
      setError(message);
      toast({ title: "Lỗi", description: message, variant: "destructive" });
      console.error("Error fetching product analytics:", err);
    } finally {
      setIsLoading(false);
    }
  }, [filters, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    filters,
    setFilters,
    refetch: fetchData,
  };
}

export function useSupplierAnalytics(initialFilters?: AnalyticsFilters) {
  const { toast } = useToast();
  const [data, setData] = useState<SupplierAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AnalyticsFilters>(
    initialFilters || {}
  );

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await adminAnalyticsService.getSupplierAnalytics(filters);
      setData(result);
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        "Không thể tải dữ liệu phân tích nhà cung cấp";
      setError(message);
      toast({ title: "Lỗi", description: message, variant: "destructive" });
      console.error("Error fetching supplier analytics:", err);
    } finally {
      setIsLoading(false);
    }
  }, [filters, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    filters,
    setFilters,
    refetch: fetchData,
  };
}

export function useOrderAnalytics(initialFilters?: AnalyticsFilters) {
  const { toast } = useToast();
  const [data, setData] = useState<OrderAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AnalyticsFilters>(
    initialFilters || {}
  );

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await adminAnalyticsService.getOrderAnalytics(filters);
      setData(result);
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        "Không thể tải dữ liệu phân tích đơn hàng";
      setError(message);
      toast({ title: "Lỗi", description: message, variant: "destructive" });
      console.error("Error fetching order analytics:", err);
    } finally {
      setIsLoading(false);
    }
  }, [filters, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    filters,
    setFilters,
    refetch: fetchData,
  };
}

export function useReportExport() {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const exportReport = async (
    filters: AnalyticsFilters & { metrics: string[] }
  ) => {
    setIsExporting(true);
    try {
      const blob = await adminAnalyticsService.exportReport(filters);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `analytics-report-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({ title: "Thành công", description: "Đã xuất báo cáo thành công" });
    } catch (err: any) {
      const message = err.response?.data?.message || "Không thể xuất báo cáo";
      toast({ title: "Lỗi", description: message, variant: "destructive" });
      console.error("Error exporting report:", err);
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportReport,
    isExporting,
  };
}

/**
 * Admin Analytics Service
 *
 * Service layer for analytics and reporting APIs
 * Handles product analytics, supplier analytics, order trends, and report export
 *
 * @module services/admin.analytics
 */

import api from "../lib/axios";

export interface ProductAnalytics {
  topProducts: {
    productId: string;
    productName: string;
    totalSold: number;
    totalRevenue: number;
    averagePrice: number;
  }[];
  revenueByCategory: {
    category: string;
    revenue: number;
    orderCount: number;
    percentage: number;
  }[];
  inventoryTurnover: {
    productId: string;
    productName: string;
    turnoverRate: number;
    daysToSell: number;
    stockLevel: number;
  }[];
  slowMovingItems: {
    productId: string;
    productName: string;
    daysSinceLastSale: number;
    stockLevel: number;
    estimatedValue: number;
  }[];
}

export interface SupplierAnalytics {
  supplierComparison: {
    supplierId: string;
    supplierName: string;
    totalOrders: number;
    onTimeDeliveryRate: number;
    qualityScore: number;
    averageLeadTime: number;
    totalCost: number;
  }[];
  onTimeDeliveryTrend: {
    month: string;
    onTimeRate: number;
    totalDeliveries: number;
  }[];
  qualityScoreTrend: {
    month: string;
    averageScore: number;
    totalOrders: number;
  }[];
}

export interface OrderAnalytics {
  orderVolumeTrend: {
    date: string;
    orderCount: number;
    newOrders: number;
    completedOrders: number;
  }[];
  revenueTrend: {
    date: string;
    revenue: number;
    orderCount: number;
  }[];
  aovTrend: {
    date: string;
    averageOrderValue: number;
    orderCount: number;
  }[];
  ordersByStatus: {
    status: string;
    count: number;
    percentage: number;
  }[];
}

export interface AnalyticsFilters {
  startDate?: string;
  endDate?: string;
  category?: string;
  supplierId?: string;
  productId?: string;
  groupBy?: "day" | "week" | "month";
}

class AdminAnalyticsService {
  /**
   * Get product analytics
   */
  async getProductAnalytics(
    filters?: AnalyticsFilters
  ): Promise<ProductAnalytics> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);
    if (filters?.category) params.append("category", filters.category);

    const res = await api.get(`/analytics/products?${params}`);
    return res.data?.data || {};
  }

  /**
   * Get supplier analytics
   */
  async getSupplierAnalytics(
    filters?: AnalyticsFilters
  ): Promise<SupplierAnalytics> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);
    if (filters?.supplierId) params.append("supplierId", filters.supplierId);

    const res = await api.get(`/analytics/suppliers?${params}`);
    return res.data?.data || {};
  }

  /**
   * Get order analytics
   */
  async getOrderAnalytics(filters?: AnalyticsFilters): Promise<OrderAnalytics> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);
    if (filters?.groupBy) params.append("groupBy", filters.groupBy);

    const res = await api.get(`/analytics/orders?${params}`);
    return res.data?.data || {};
  }

  /**
   * Export analytics report
   */
  async exportReport(
    filters: AnalyticsFilters & { metrics: string[] }
  ): Promise<Blob> {
    const params = new URLSearchParams();
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    if (filters.metrics) params.append("metrics", filters.metrics.join(","));

    const res = await api.get(`/analytics/export?${params}`, {
      responseType: "blob",
    });
    return res.data;
  }
}

export const adminAnalyticsService = new AdminAnalyticsService();

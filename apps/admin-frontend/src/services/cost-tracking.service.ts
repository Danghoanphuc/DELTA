/**
 * Cost Tracking Service
 *
 * API service cho cost và margin tracking
 */

import api from "@/lib/axios";

export interface CostBreakdown {
  orderId: string;
  baseProductsCost: number;
  customizationCost: number;
  setupFees: number;
  kittingFee: number;
  packagingCost: number;
  shippingCost: number;
  handlingFee: number;
  totalCost: number;
  totalPrice: number;
  grossMargin: number;
  marginPercentage: number;
}

export interface ProductMargin {
  productId: string;
  productName: string;
  revenue: number;
  cost: number;
  margin: number;
  marginPercentage: number;
  orderCount: number;
}

export interface CustomerMargin {
  organizationId: string;
  organizationName: string;
  revenue: number;
  cost: number;
  margin: number;
  marginPercentage: number;
  orderCount: number;
}

export interface MarginReport {
  summary: {
    totalRevenue: number;
    totalCost: number;
    totalMargin: number;
    averageMarginPercentage: number;
    orderCount: number;
  };
  byProduct: ProductMargin[];
  byCustomer: CustomerMargin[];
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
}

export interface OrderVariance {
  orderId: string;
  orderNumber: string;
  estimatedCost: number;
  actualCost: number;
  variance: number;
  variancePercentage: number;
  reasons: string[];
}

export interface VarianceAnalysis {
  summary: {
    totalEstimated: number;
    totalActual: number;
    totalVariance: number;
    variancePercentage: number;
    orderCount: number;
  };
  byOrder: OrderVariance[];
  reasons: string[];
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
}

export interface ActualCostData {
  actualCost: number;
  costBreakdown?: {
    materials: number;
    labor: number;
    overhead: number;
  };
  notes?: string;
}

class CostTrackingService {
  /**
   * Get cost breakdown for order
   */
  async getCostBreakdown(orderId: string): Promise<CostBreakdown> {
    const res = await api.get(`/admin/costs/${orderId}`);
    return res.data?.data?.breakdown;
  }

  /**
   * Get margin report
   */
  async getMarginReport(
    startDate?: string,
    endDate?: string
  ): Promise<MarginReport> {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const res = await api.get(`/admin/costs/margin-report?${params}`);
    return res.data?.data?.report;
  }

  /**
   * Update actual cost for production order
   */
  async updateActualCost(
    productionOrderId: string,
    data: ActualCostData
  ): Promise<any> {
    const res = await api.put(`/admin/costs/${productionOrderId}/actual`, data);
    return res.data?.data?.productionOrder;
  }

  /**
   * Get variance analysis
   */
  async getVarianceAnalysis(
    startDate?: string,
    endDate?: string
  ): Promise<VarianceAnalysis> {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const res = await api.get(`/admin/costs/variance?${params}`);
    return res.data?.data?.analysis;
  }

  /**
   * Get variance for specific order
   */
  async getOrderVariance(orderId: string): Promise<OrderVariance> {
    const res = await api.get(`/admin/costs/${orderId}/variance`);
    return res.data?.data?.variance;
  }
}

export const costTrackingService = new CostTrackingService();

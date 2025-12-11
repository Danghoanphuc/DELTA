// apps/admin-frontend/src/services/admin.production.service.ts
// ✅ Production Order Service
// Phase 5.2: Production Management UI - Service Layer

import api from "@/lib/axios";

export interface ProductionOrder {
  _id: string;
  swagOrderId: string;
  swagOrderNumber: string;
  supplierId: string;
  supplierName: string;
  supplierContact: {
    email: string;
    phone: string;
  };
  items: {
    skuVariantId: string;
    sku: string;
    productName: string;
    quantity: number;
    printMethod?: string;
    printAreas?: {
      area: string;
      artworkId: string;
      artworkUrl: string;
      colors: string[];
    }[];
    personalization?: {
      text: string;
      font: string;
      color: string;
    };
    unitCost: number;
    setupFee: number;
    totalCost: number;
  }[];
  specifications: {
    printInstructions: string;
    qualityRequirements: string;
    packagingInstructions: string;
    specialNotes?: string;
  };
  orderedAt: string;
  expectedCompletionDate: string;
  actualCompletionDate?: string;
  status:
    | "pending"
    | "confirmed"
    | "in_production"
    | "qc_check"
    | "completed"
    | "failed";
  statusHistory: {
    status: string;
    timestamp: string;
    note?: string;
    updatedBy: string;
  }[];
  qcChecks: {
    checkDate: string;
    checkedBy: string;
    passed: boolean;
    photos: string[];
    notes: string;
    issues: string[];
  }[];
  deliveryMethod?: string;
  trackingNumber?: string;
  deliveredAt?: string;
  estimatedCost: number;
  actualCost?: number;
  costVariance?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductionStatistics {
  total: number;
  byStatus: Record<string, number>;
  avgLeadTime: number;
  onTimeRate: number;
}

export interface UpdateStatusData {
  status: string;
  note?: string;
}

export interface QCCheckData {
  passed: boolean;
  photos?: string[];
  notes?: string;
  issues?: string[];
}

class ProductionService {
  /**
   * Get production order by ID
   */
  async getProductionOrder(id: string): Promise<ProductionOrder> {
    const res = await api.get(`/admin/production-orders/${id}`);
    return res.data?.data?.productionOrder;
  }

  /**
   * Get production orders by swag order
   */
  async getProductionOrdersBySwagOrder(
    swagOrderId: string
  ): Promise<ProductionOrder[]> {
    const res = await api.get(
      `/admin/production-orders/swag-order/${swagOrderId}`
    );
    return res.data?.data?.productionOrders || [];
  }

  /**
   * Get production orders by supplier
   */
  async getProductionOrdersBySupplier(
    supplierId: string,
    options?: {
      status?: string;
      startDate?: string;
      endDate?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<{
    orders: ProductionOrder[];
    total: number;
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const params = new URLSearchParams();
    if (options?.status) params.append("status", options.status);
    if (options?.startDate) params.append("startDate", options.startDate);
    if (options?.endDate) params.append("endDate", options.endDate);
    if (options?.page) params.append("page", options.page.toString());
    if (options?.limit) params.append("limit", options.limit.toString());

    const res = await api.get(
      `/admin/production-orders/supplier/${supplierId}?${params}`
    );
    return res.data?.data;
  }

  /**
   * Get production orders by status
   */
  async getProductionOrdersByStatus(
    status: string,
    options?: {
      page?: number;
      limit?: number;
    }
  ): Promise<{
    orders: ProductionOrder[];
    total: number;
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const params = new URLSearchParams();
    if (options?.page) params.append("page", options.page.toString());
    if (options?.limit) params.append("limit", options.limit.toString());

    const res = await api.get(
      `/admin/production-orders/status/${status}?${params}`
    );
    return res.data?.data;
  }

  /**
   * Get delayed production orders
   */
  async getDelayedProductionOrders(): Promise<ProductionOrder[]> {
    const res = await api.get("/admin/production-orders/delayed");
    return res.data?.data?.productionOrders || [];
  }

  /**
   * Update production order status
   */
  async updateProductionStatus(
    id: string,
    data: UpdateStatusData
  ): Promise<ProductionOrder> {
    const res = await api.put(`/admin/production-orders/${id}/status`, data);
    return res.data?.data?.productionOrder;
  }

  /**
   * Perform QC check
   */
  async performQCCheck(
    id: string,
    data: QCCheckData
  ): Promise<ProductionOrder> {
    const res = await api.post(`/admin/production-orders/${id}/qc`, data);
    return res.data?.data?.productionOrder;
  }

  /**
   * Complete production order
   */
  async completeProduction(
    id: string,
    actualCost?: number
  ): Promise<ProductionOrder> {
    const res = await api.post(`/admin/production-orders/${id}/complete`, {
      actualCost,
    });
    return res.data?.data?.productionOrder;
  }

  /**
   * Get production statistics
   */
  async getProductionStatistics(
    supplierId?: string
  ): Promise<ProductionStatistics> {
    const params = supplierId
      ? new URLSearchParams({ supplierId })
      : new URLSearchParams();
    const res = await api.get(`/admin/production-orders/statistics?${params}`);
    return res.data?.data?.statistics;
  }
}

export const productionService = new ProductionService();

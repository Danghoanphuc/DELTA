// src/services/admin.swag-operations.service.ts
// ✅ Admin Swag Operations API Service

import api from "@/lib/axios";

export interface SwagOrder {
  _id: string;
  orderNumber: string;
  name: string;
  status: string;
  organization: {
    _id: string;
    businessName: string;
  };
  swagPack?: {
    _id: string;
    name: string;
  };
  totalRecipients: number;
  pricing: {
    total: number;
  };
  stats: {
    pendingInfo: number;
    processing: number;
    shipped: number;
    delivered: number;
    failed: number;
  };
  createdAt: string;
  paidAt?: string;
  processedAt?: string;
  shippedAt?: string;
}

export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  shippedToday: number;
  totalOrganizations: number;
  totalRevenue: number;
  attentionNeeded: number;
  ordersByStatus: Record<string, number>;
}

export interface Organization {
  _id: string;
  businessName: string;
  contactEmail?: string;
}

class SwagOperationsService {
  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await api.get("/admin/swag-ops/dashboard");
    return res.data?.data;
  }

  // Orders
  async getOrders(params: {
    status?: string;
    organization?: string;
    page?: number;
    limit?: number;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    const res = await api.get("/admin/swag-ops/orders", { params });
    return res.data?.data;
  }

  async getOrder(id: string) {
    const res = await api.get(`/admin/swag-ops/orders/${id}`);
    return res.data?.data?.order;
  }

  async updateOrderStatus(id: string, status: string, note?: string) {
    const res = await api.put(`/admin/swag-ops/orders/${id}/status`, {
      status,
      note,
    });
    return res.data?.data?.order;
  }

  async getOrderActivityLog(id: string) {
    const res = await api.get(`/admin/swag-ops/orders/${id}/activity`);
    return res.data?.data?.logs;
  }

  // Shipments
  async updateShipmentStatus(
    orderId: string,
    recipientId: string,
    data: {
      status: string;
      trackingNumber?: string;
      trackingUrl?: string;
      carrier?: string;
    }
  ) {
    const res = await api.put(
      `/admin/swag-ops/orders/${orderId}/shipments/${recipientId}`,
      data
    );
    return res.data?.data?.order;
  }

  async bulkUpdateShipments(
    orderId: string,
    data: {
      recipientIds: string[];
      status: string;
      trackingNumbers?: Record<string, string>;
      carrier?: string;
    }
  ) {
    const res = await api.post(
      `/admin/swag-ops/orders/${orderId}/shipments/bulk`,
      data
    );
    return res.data?.data;
  }

  async generateShippingLabels(orderId: string, recipientIds: string[]) {
    const res = await api.post(`/admin/swag-ops/orders/${orderId}/labels`, {
      recipientIds,
    });
    return res.data?.data?.labels;
  }

  // Fulfillment Queue
  async getFulfillmentQueue() {
    const res = await api.get("/admin/swag-ops/fulfillment/queue");
    return res.data?.data;
  }

  async startProcessing(orderId: string) {
    const res = await api.post(`/admin/swag-ops/orders/${orderId}/process`);
    return res.data?.data?.order;
  }

  async completeKitting(orderId: string) {
    const res = await api.post(
      `/admin/swag-ops/orders/${orderId}/kitting-complete`
    );
    return res.data?.data?.order;
  }

  // Inventory
  async getInventoryOverview(params?: {
    organizationId?: string;
    lowStockOnly?: boolean;
  }) {
    const res = await api.get("/admin/swag-ops/inventory", { params });
    return res.data?.data;
  }

  async updateInventoryItem(
    itemId: string,
    data: { quantity: number; operation: string; note?: string }
  ) {
    const res = await api.put(`/admin/swag-ops/inventory/${itemId}`, data);
    return res.data?.data?.item;
  }

  // Organizations
  async getOrganizations(): Promise<Organization[]> {
    const res = await api.get("/admin/swag-ops/organizations");
    return res.data?.data?.organizations || [];
  }

  // Carriers
  async getCarriers(): Promise<
    Array<{ id: string; name: string; available: boolean }>
  > {
    const res = await api.get("/admin/swag-ops/carriers");
    return res.data?.data?.carriers || [];
  }

  // Create shipment with carrier
  async createShipment(orderId: string, recipientId: string, carrier: string) {
    const res = await api.post(
      `/admin/swag-ops/orders/${orderId}/shipments/${recipientId}/create`,
      { carrier }
    );
    return res.data?.data;
  }

  // Get tracking info
  async getTrackingInfo(orderId: string, recipientId: string) {
    const res = await api.get(
      `/admin/swag-ops/orders/${orderId}/shipments/${recipientId}/tracking`
    );
    return res.data?.data;
  }

  // Export orders to CSV
  async exportOrders(params?: {
    dateFrom?: string;
    dateTo?: string;
    organization?: string;
  }): Promise<Blob> {
    const res = await api.get("/admin/swag-ops/export", {
      params,
      responseType: "blob",
    });
    return res.data;
  }
}

export const swagOpsService = new SwagOperationsService();

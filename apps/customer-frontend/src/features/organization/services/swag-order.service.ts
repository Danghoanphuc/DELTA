// src/features/organization/services/swag-order.service.ts
// ✅ SOLID: Single Responsibility - API calls only

import api from "@/shared/lib/axios";

export interface SwagPack {
  _id: string;
  name: string;
  description?: string;
  items: Array<{
    productName: string;
    productImage?: string;
    quantity: number;
  }>;
  pricing: { unitPrice: number };
  thumbnailUrl?: string;
}

export interface Recipient {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  customFields?: { department?: string };
  address?: { city?: string };
}

export interface SwagOrder {
  _id: string;
  orderNumber: string;
  name: string;
  status: string;
  totalRecipients: number;
  pricing: { total: number };
  stats: {
    pendingInfo: number;
    processing: number;
    shipped: number;
    delivered: number;
    failed: number;
  };
  swagPack?: { name: string };
  createdAt: string;
  recipientShipments?: Array<{
    recipient: string;
    recipientInfo: { firstName: string; lastName: string; email: string };
    shipmentStatus: string;
    trackingNumber?: string;
    selfServiceCompleted: boolean;
  }>;
}

export interface CreateOrderData {
  name: string;
  swagPackId: string;
  recipientIds: string[];
  shippingMethod: string;
  scheduledSendDate?: string | null;
  notifyRecipients: boolean;
  customMessage?: string;
}

class SwagOrderService {
  async getPacks() {
    const res = await api.get("/swag-packs?status=active");
    return res.data?.data?.packs || [];
  }

  async getRecipients() {
    const res = await api.get("/recipients?status=active&limit=200");
    return res.data?.data?.recipients || [];
  }

  async getOrders(status?: string) {
    const params = new URLSearchParams();
    if (status && status !== "all") params.append("status", status);
    const res = await api.get(`/swag-orders?${params}`);
    return res.data?.data?.orders || [];
  }

  async getOrderStats() {
    const res = await api.get("/swag-orders/stats");
    return res.data?.data;
  }

  async getOrderDetail(orderId: string) {
    const res = await api.get(`/swag-orders/${orderId}`);
    return res.data?.data?.order;
  }

  async createOrder(data: CreateOrderData) {
    const res = await api.post("/swag-orders", data);
    return res.data?.data;
  }

  async cancelOrder(orderId: string, reason: string) {
    return api.post(`/swag-orders/${orderId}/cancel`, { reason });
  }

  async resendEmail(orderId: string, recipientId: string) {
    return api.post(`/swag-orders/${orderId}/resend-email/${recipientId}`);
  }
}

export const swagOrderService = new SwagOrderService();

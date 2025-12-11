// src/services/admin.shipping.service.ts
// ✅ Shipping Service - API calls cho shipping operations

import api from "@/lib/axios";

export interface PackageDetails {
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  value: number;
  notes?: string;
}

export interface CreateShipmentRequest {
  orderId: string;
  recipientId: string;
  carrierId: string;
  packageDetails: PackageDetails;
}

export interface BulkShipmentRequest {
  orderId: string;
  carrierId: string;
  recipientIds?: string[];
  packageDetails?: PackageDetails;
}

export interface Shipment {
  carrier: string;
  trackingNumber: string;
  trackingUrl: string;
  status: string;
  createdAt: string;
  estimatedDelivery?: string;
  fee?: number;
  lastUpdated?: string;
}

export interface TrackingEvent {
  timestamp: string;
  status: string;
  location?: string;
  description: string;
}

export interface TrackingInfo {
  recipient: {
    _id: string;
    name: string;
    phone: string;
  };
  shipment: Shipment;
  tracking: {
    status: string;
    events: TrackingEvent[];
    estimatedDelivery?: string;
  };
}

export interface Carrier {
  id: string;
  name: string;
  logo?: string;
  isActive: boolean;
}

export interface FeeCalculation {
  fee: number;
  estimatedDays: string;
}

class ShippingService {
  /**
   * Create shipment for a recipient
   */
  async createShipment(data: CreateShipmentRequest) {
    const res = await api.post("/admin/shipments", data);
    return res.data?.data;
  }

  /**
   * Create bulk shipments for order
   */
  async createBulkShipments(data: BulkShipmentRequest) {
    const res = await api.post("/admin/shipments/bulk", data);
    return res.data?.data;
  }

  /**
   * Get tracking info for shipment
   */
  async getTracking(
    orderId: string,
    recipientId: string
  ): Promise<TrackingInfo> {
    const res = await api.get(
      `/admin/shipments/${orderId}/recipients/${recipientId}/tracking`
    );
    return res.data?.data;
  }

  /**
   * Cancel shipment
   */
  async cancelShipment(orderId: string, recipientId: string, reason: string) {
    const res = await api.post(
      `/admin/shipments/${orderId}/recipients/${recipientId}/cancel`,
      { reason }
    );
    return res.data?.data;
  }

  /**
   * Get available carriers
   */
  async getCarriers(): Promise<Carrier[]> {
    const res = await api.get("/admin/shipments/carriers");
    return res.data?.data?.carriers || [];
  }

  /**
   * Calculate shipping fee
   */
  async calculateFee(
    carrierId: string,
    toDistrict: string,
    weight: number,
    fromDistrict?: string
  ): Promise<FeeCalculation> {
    const res = await api.post("/admin/shipments/calculate-fee", {
      carrierId,
      fromDistrict,
      toDistrict,
      weight,
    });
    return res.data?.data;
  }
}

export const shippingService = new ShippingService();

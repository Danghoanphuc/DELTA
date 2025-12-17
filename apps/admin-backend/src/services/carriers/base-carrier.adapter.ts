// src/services/carriers/base-carrier.adapter.ts
// ✅ Base Carrier Adapter - Template Method Pattern

import { Logger } from "../../shared/utils/logger.js";
import {
  ICarrierAdapter,
  ShipmentRequest,
  ShipmentResponse,
  TrackingResponse,
  FeeCalculation,
} from "../../interfaces/carrier.interface.js";

/**
 * BaseCarrierAdapter - Abstract base class cho tất cả carriers
 * Tuân thủ Open/Closed Principle (OCP) - extend để thêm carrier mới
 */
export abstract class BaseCarrierAdapter implements ICarrierAdapter {
  abstract readonly carrierId: string;
  abstract readonly carrierName: string;
  protected abstract readonly trackingUrlBase: string;
  protected abstract readonly apiUrl: string;

  abstract isAvailable(): boolean;

  async createShipment(request: ShipmentRequest): Promise<ShipmentResponse> {
    Logger.info(
      `[${this.carrierId}] Creating shipment for order ${request.orderId}`
    );

    try {
      if (!this.isAvailable()) {
        Logger.warn(`[${this.carrierId}] Not available, using mock`);
        return this.createMockShipment(request);
      }
      return await this.doCreateShipment(request);
    } catch (error: any) {
      Logger.error(
        `[${this.carrierId}] Error creating shipment: ${error.message}`
      );
      return this.createMockShipment(request);
    }
  }

  async getTracking(trackingNumber: string): Promise<TrackingResponse> {
    Logger.info(`[${this.carrierId}] Getting tracking for ${trackingNumber}`);

    try {
      if (!this.isAvailable()) {
        return this.getMockTracking(trackingNumber);
      }
      return await this.doGetTracking(trackingNumber);
    } catch (error: any) {
      Logger.error(
        `[${this.carrierId}] Error getting tracking: ${error.message}`
      );
      return this.getMockTracking(trackingNumber);
    }
  }

  async calculateFee(
    fromDistrict: string,
    toDistrict: string,
    weight: number
  ): Promise<FeeCalculation> {
    const baseFee = 25000;
    const weightFee = Math.ceil(weight / 500) * 5000;
    const isSameCity = fromDistrict.includes(toDistrict.split(",")[0]);

    return {
      fee: isSameCity ? baseFee + weightFee : baseFee + weightFee + 15000,
      estimatedDays: isSameCity ? "1-2" : "2-4",
    };
  }

  async generateLabel(
    trackingNumber: string,
    _shipmentData: any
  ): Promise<string> {
    return `/api/admin/swag-ops/labels/${trackingNumber}.pdf`;
  }

  async cancelShipment(trackingNumber: string): Promise<boolean> {
    Logger.info(`[${this.carrierId}] Cancelling shipment ${trackingNumber}`);
    return true;
  }

  getTrackingUrl(trackingNumber: string): string {
    return `${this.trackingUrlBase}${trackingNumber}`;
  }

  // Template methods - override in subclasses
  protected abstract doCreateShipment(
    request: ShipmentRequest
  ): Promise<ShipmentResponse>;
  protected abstract doGetTracking(
    trackingNumber: string
  ): Promise<TrackingResponse>;

  // Mock implementations
  protected createMockShipment(request: ShipmentRequest): ShipmentResponse {
    const trackingNumber = this.generateTrackingNumber();
    return {
      success: true,
      trackingNumber,
      trackingUrl: this.getTrackingUrl(trackingNumber),
      labelUrl: `/api/admin/swag-ops/labels/${trackingNumber}.pdf`,
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      fee: 35000,
    };
  }

  protected getMockTracking(_trackingNumber: string): TrackingResponse {
    const now = new Date();
    return {
      success: true,
      status: "in_transit",
      events: [
        {
          status: "picked_up",
          description: "Đã lấy hàng từ kho Printz",
          timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
          location: "Kho Printz, TP.HCM",
        },
        {
          status: "in_transit",
          description: "Đang vận chuyển đến trung tâm phân loại",
          timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
          location: "Trung tâm phân loại",
        },
        {
          status: "in_transit",
          description: "Đang vận chuyển đến địa phương",
          timestamp: now,
          location: "Đang trên đường",
        },
      ],
      estimatedDelivery: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
    };
  }

  protected generateTrackingNumber(): string {
    const prefix = this.carrierId.toUpperCase().substring(0, 3);
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}${timestamp}${random}`;
  }

  protected calculateWeight(
    items: Array<{ quantity: number; weight?: number }>
  ): number {
    return items.reduce(
      (total, item) => total + item.quantity * (item.weight || 500),
      0
    );
  }
}

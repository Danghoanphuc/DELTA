// src/services/carrier-integration.service.ts
// ✅ Carrier Integration Service - Refactored with Strategy Pattern
// Tuân thủ SOLID: OCP, DIP, SRP

import { Logger } from "../shared/utils/logger.js";
import { CarrierFactory } from "./carriers/carrier.factory";
import {
  ShipmentRequest,
  ShipmentResponse,
  TrackingResponse,
  CarrierInfo,
  FeeCalculation,
} from "../interfaces/carrier.interface";

/**
 * CarrierIntegrationService - Facade cho carrier operations
 * Delegate sang CarrierFactory và các Adapters
 */
export class CarrierIntegrationService {
  constructor() {
    // Initialize carrier factory
    CarrierFactory.initialize();
  }

  /**
   * Get available carriers
   */
  getCarriers(): CarrierInfo[] {
    return CarrierFactory.getCarriers();
  }

  /**
   * Create shipment with carrier
   */
  async createShipment(
    carrierId: string,
    request: ShipmentRequest
  ): Promise<ShipmentResponse> {
    const adapter = CarrierFactory.getAdapter(carrierId);

    if (!adapter) {
      Logger.warn(
        `[CarrierService] Carrier ${carrierId} not found, using default`
      );
      const defaultAdapter = CarrierFactory.getAdapter("ghn");
      if (!defaultAdapter) {
        return { success: false, error: "No carrier available" };
      }
      return defaultAdapter.createShipment(request);
    }

    return adapter.createShipment(request);
  }

  /**
   * Get tracking info from carrier
   */
  async getTracking(
    carrierId: string,
    trackingNumber: string
  ): Promise<TrackingResponse> {
    const adapter = CarrierFactory.getAdapter(carrierId);

    if (!adapter) {
      return {
        success: false,
        status: "unknown",
        events: [],
        error: `Carrier ${carrierId} not found`,
      };
    }

    return adapter.getTracking(trackingNumber);
  }

  /**
   * Calculate shipping fee
   */
  async calculateFee(
    carrierId: string,
    fromDistrict: string,
    toDistrict: string,
    weight: number
  ): Promise<FeeCalculation> {
    const adapter = CarrierFactory.getAdapter(carrierId);

    if (!adapter) {
      // Default calculation
      return { fee: 35000, estimatedDays: "2-4" };
    }

    return adapter.calculateFee(fromDistrict, toDistrict, weight);
  }

  /**
   * Generate shipping label PDF
   */
  async generateLabel(
    carrierId: string,
    trackingNumber: string,
    shipmentData: any
  ): Promise<string> {
    const adapter = CarrierFactory.getAdapter(carrierId);

    if (!adapter) {
      return `/api/admin/swag-ops/labels/${trackingNumber}.pdf`;
    }

    return adapter.generateLabel(trackingNumber, shipmentData);
  }

  /**
   * Cancel shipment
   */
  async cancelShipment(
    carrierId: string,
    trackingNumber: string
  ): Promise<boolean> {
    const adapter = CarrierFactory.getAdapter(carrierId);

    if (!adapter) {
      Logger.warn(
        `[CarrierService] Carrier ${carrierId} not found for cancellation`
      );
      return false;
    }

    return adapter.cancelShipment(trackingNumber);
  }

  /**
   * Get tracking URL for a carrier
   */
  getTrackingUrl(carrierId: string, trackingNumber: string): string {
    const adapter = CarrierFactory.getAdapter(carrierId);
    return adapter ? adapter.getTrackingUrl(trackingNumber) : "";
  }
}

export const carrierService = new CarrierIntegrationService();

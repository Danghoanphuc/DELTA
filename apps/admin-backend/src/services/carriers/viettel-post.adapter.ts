// src/services/carriers/viettel-post.adapter.ts
// ✅ Viettel Post Adapter

import { BaseCarrierAdapter } from "./base-carrier.adapter";
import {
  ShipmentRequest,
  ShipmentResponse,
  TrackingResponse,
} from "../../interfaces/carrier.interface.js";

export class ViettelPostAdapter extends BaseCarrierAdapter {
  readonly carrierId = "viettelpost";
  readonly carrierName = "Viettel Post";
  protected readonly trackingUrlBase = "https://viettelpost.vn/tra-cuu?code=";
  protected readonly apiUrl = "https://partner.viettelpost.vn/v2";

  private readonly token: string;

  constructor() {
    super();
    this.token = process.env.VIETTEL_POST_TOKEN || "";
  }

  isAvailable(): boolean {
    return !!this.token;
  }

  protected async doCreateShipment(
    request: ShipmentRequest
  ): Promise<ShipmentResponse> {
    // Viettel Post API implementation
    // For now, return mock
    return this.createMockShipment(request);
  }

  protected async doGetTracking(
    trackingNumber: string
  ): Promise<TrackingResponse> {
    // Viettel Post tracking API implementation
    return this.getMockTracking(trackingNumber);
  }
}

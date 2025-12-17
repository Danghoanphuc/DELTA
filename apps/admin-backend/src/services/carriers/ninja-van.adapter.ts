// src/services/carriers/ninja-van.adapter.ts
// ✅ Ninja Van Adapter

import { BaseCarrierAdapter } from "./base-carrier.adapter";
import {
  ShipmentRequest,
  ShipmentResponse,
  TrackingResponse,
} from "../../interfaces/carrier.interface.js";

export class NinjaVanAdapter extends BaseCarrierAdapter {
  readonly carrierId = "ninja";
  readonly carrierName = "Ninja Van";
  protected readonly trackingUrlBase =
    "https://www.ninjavan.co/vi-vn/tracking?id=";
  protected readonly apiUrl = "https://api.ninjavan.co/vn";

  private readonly token: string;

  constructor() {
    super();
    this.token = process.env.NINJA_VAN_TOKEN || "";
  }

  isAvailable(): boolean {
    return !!this.token;
  }

  protected async doCreateShipment(
    request: ShipmentRequest
  ): Promise<ShipmentResponse> {
    return this.createMockShipment(request);
  }

  protected async doGetTracking(
    trackingNumber: string
  ): Promise<TrackingResponse> {
    return this.getMockTracking(trackingNumber);
  }
}

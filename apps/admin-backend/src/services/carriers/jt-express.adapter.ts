// src/services/carriers/jt-express.adapter.ts
// ✅ J&T Express Adapter

import { BaseCarrierAdapter } from "./base-carrier.adapter";
import {
  ShipmentRequest,
  ShipmentResponse,
  TrackingResponse,
} from "../../interfaces/carrier.interface.js";

export class JTExpressAdapter extends BaseCarrierAdapter {
  readonly carrierId = "jt";
  readonly carrierName = "J&T Express";
  protected readonly trackingUrlBase =
    "https://jtexpress.vn/vi/tracking?type=track&billcode=";
  protected readonly apiUrl = "https://jtexpress.vn/api";

  private readonly token: string;

  constructor() {
    super();
    this.token = process.env.JT_API_TOKEN || "";
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

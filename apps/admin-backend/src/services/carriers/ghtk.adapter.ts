// src/services/carriers/ghtk.adapter.ts
// ✅ GHTK (Giao Hàng Tiết Kiệm) Adapter

import { BaseCarrierAdapter } from "./base-carrier.adapter";
import {
  ShipmentRequest,
  ShipmentResponse,
  TrackingResponse,
} from "../../interfaces/carrier.interface";

export class GHTKAdapter extends BaseCarrierAdapter {
  readonly carrierId = "ghtk";
  readonly carrierName = "Giao Hàng Tiết Kiệm";
  protected readonly trackingUrlBase = "https://i.ghtk.vn/";
  protected readonly apiUrl = "https://services.giaohangtietkiem.vn";

  private readonly token: string;

  constructor() {
    super();
    this.token = process.env.GHTK_API_TOKEN || "";
  }

  isAvailable(): boolean {
    return !!this.token;
  }

  protected async doCreateShipment(
    request: ShipmentRequest
  ): Promise<ShipmentResponse> {
    const response = await fetch(`${this.apiUrl}/services/shipment/order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Token: this.token,
      },
      body: JSON.stringify({
        order: {
          id: request.orderId,
          pick_name: "Printz Warehouse",
          pick_address: process.env.WAREHOUSE_ADDRESS || "123 Nguyen Hue",
          pick_province: "TP. Hồ Chí Minh",
          pick_district: "Quận 1",
          pick_tel: process.env.WAREHOUSE_PHONE || "0901234567",
          name: request.address.fullName,
          address: request.address.street,
          province: request.address.city,
          district: request.address.district,
          ward: request.address.ward,
          tel: request.address.phone,
          value: 0,
          weight: this.calculateWeight(request.items) / 1000, // GHTK uses kg
        },
      }),
    });

    const data = await response.json();

    if (data.success) {
      return {
        success: true,
        trackingNumber: data.order.label,
        trackingUrl: this.getTrackingUrl(data.order.label),
        fee: data.order.fee,
      };
    }

    throw new Error(data.message || "GHTK API error");
  }

  protected async doGetTracking(
    trackingNumber: string
  ): Promise<TrackingResponse> {
    // GHTK tracking API implementation
    // For now, return mock
    return this.getMockTracking(trackingNumber);
  }
}

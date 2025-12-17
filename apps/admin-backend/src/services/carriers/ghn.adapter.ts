// src/services/carriers/ghn.adapter.ts
// ✅ GHN (Giao Hàng Nhanh) Adapter

import { BaseCarrierAdapter } from "./base-carrier.adapter.js";
import {
  ShipmentRequest,
  ShipmentResponse,
  TrackingResponse,
} from "../../interfaces/carrier.interface.js";

export class GHNAdapter extends BaseCarrierAdapter {
  readonly carrierId = "ghn";
  readonly carrierName = "Giao Hàng Nhanh";
  protected readonly trackingUrlBase = "https://donhang.ghn.vn/?order_code=";
  protected readonly apiUrl = "https://online-gateway.ghn.vn/shiip/public-api";

  private readonly token: string;
  private readonly shopId: string;

  constructor() {
    super();
    this.token = process.env.GHN_API_TOKEN || "";
    this.shopId = process.env.GHN_SHOP_ID || "";
  }

  isAvailable(): boolean {
    return !!this.token && !!this.shopId;
  }

  protected async doCreateShipment(
    request: ShipmentRequest
  ): Promise<ShipmentResponse> {
    const response = await fetch(`${this.apiUrl}/v2/shipping-order/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Token: this.token,
        ShopId: this.shopId,
      },
      body: JSON.stringify({
        to_name: request.address.fullName,
        to_phone: request.address.phone,
        to_address: request.address.street,
        to_ward_name: request.address.ward,
        to_district_name: request.address.district,
        to_province_name: request.address.city,
        weight: this.calculateWeight(request.items),
        service_type_id: 2,
        payment_type_id: 1,
        required_note: "KHONGCHOXEMHANG",
        items: request.items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          weight: item.weight || 500,
        })),
      }),
    });

    const data = await response.json();

    if (data.code === 200) {
      return {
        success: true,
        trackingNumber: data.data.order_code,
        trackingUrl: this.getTrackingUrl(data.data.order_code),
        fee: data.data.total_fee,
        estimatedDelivery: new Date(data.data.expected_delivery_time),
      };
    }

    throw new Error(data.message || "GHN API error");
  }

  protected async doGetTracking(
    trackingNumber: string
  ): Promise<TrackingResponse> {
    const response = await fetch(`${this.apiUrl}/v2/shipping-order/detail`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Token: this.token,
      },
      body: JSON.stringify({ order_code: trackingNumber }),
    });

    const data = await response.json();

    if (data.code === 200) {
      return {
        success: true,
        status: this.mapStatus(data.data.status),
        events: (data.data.log || []).map((log: any) => ({
          status: log.status,
          description: log.status,
          timestamp: new Date(log.updated_date),
        })),
      };
    }

    return this.getMockTracking(trackingNumber);
  }

  private mapStatus(ghnStatus: string): string {
    const statusMap: Record<string, string> = {
      ready_to_pick: "processing",
      picking: "processing",
      picked: "shipped",
      storing: "shipped",
      transporting: "in_transit",
      sorting: "in_transit",
      delivering: "out_for_delivery",
      delivered: "delivered",
      delivery_fail: "failed",
      return: "failed",
      cancel: "cancelled",
    };
    return statusMap[ghnStatus] || "unknown";
  }
}

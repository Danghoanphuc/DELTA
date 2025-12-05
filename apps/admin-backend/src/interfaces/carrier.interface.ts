// src/interfaces/carrier.interface.ts
// ✅ Carrier Interfaces - Strategy Pattern

export interface ShippingAddress {
  street: string;
  ward: string;
  district: string;
  city: string;
  phone: string;
  fullName: string;
}

export interface ShipmentRequest {
  orderId: string;
  recipientId: string;
  address: ShippingAddress;
  items: Array<{ name: string; quantity: number; weight?: number }>;
  codAmount?: number;
  note?: string;
}

export interface ShipmentResponse {
  success: boolean;
  trackingNumber?: string;
  trackingUrl?: string;
  labelUrl?: string;
  estimatedDelivery?: Date;
  fee?: number;
  error?: string;
}

export interface TrackingEvent {
  status: string;
  description: string;
  timestamp: Date;
  location?: string;
}

export interface TrackingResponse {
  success: boolean;
  status: string;
  events: TrackingEvent[];
  estimatedDelivery?: Date;
  error?: string;
}

export interface CarrierInfo {
  id: string;
  name: string;
  available: boolean;
}

export interface FeeCalculation {
  fee: number;
  estimatedDays: string;
}

/**
 * ICarrierAdapter - Interface cho tất cả carrier adapters
 * Tuân thủ Interface Segregation Principle (ISP)
 */
export interface ICarrierAdapter {
  readonly carrierId: string;
  readonly carrierName: string;

  /** Kiểm tra carrier có available không */
  isAvailable(): boolean;

  /** Tạo shipment */
  createShipment(request: ShipmentRequest): Promise<ShipmentResponse>;

  /** Lấy tracking info */
  getTracking(trackingNumber: string): Promise<TrackingResponse>;

  /** Tính phí ship */
  calculateFee(
    fromDistrict: string,
    toDistrict: string,
    weight: number
  ): Promise<FeeCalculation>;

  /** Generate label */
  generateLabel(trackingNumber: string, shipmentData: any): Promise<string>;

  /** Cancel shipment */
  cancelShipment(trackingNumber: string): Promise<boolean>;

  /** Generate tracking URL */
  getTrackingUrl(trackingNumber: string): string;
}

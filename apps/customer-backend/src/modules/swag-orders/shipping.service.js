// src/modules/swag-orders/shipping.service.js
// ✅ Shipping & Tracking Service - Quản lý vận chuyển và theo dõi

import { SwagOrder, SHIPMENT_STATUS } from "./swag-order.model.js";
import { Logger } from "../../shared/utils/index.js";

// Shipping carriers
const CARRIERS = {
  ghn: {
    name: "Giao Hàng Nhanh",
    trackingUrlTemplate: "https://donhang.ghn.vn/?order_code={trackingNumber}",
  },
  ghtk: {
    name: "Giao Hàng Tiết Kiệm",
    trackingUrlTemplate: "https://i.ghtk.vn/{trackingNumber}",
  },
  viettelpost: {
    name: "Viettel Post",
    trackingUrlTemplate: "https://viettelpost.vn/tra-cuu?code={trackingNumber}",
  },
  jt: {
    name: "J&T Express",
    trackingUrlTemplate:
      "https://jtexpress.vn/vi/tracking?type=track&billcode={trackingNumber}",
  },
  ninja: {
    name: "Ninja Van",
    trackingUrlTemplate:
      "https://www.ninjavan.co/vi-vn/tracking?id={trackingNumber}",
  },
};

export class ShippingService {
  /**
   * Create shipment for order
   */
  async createShipment(orderId, recipientId, shippingData) {
    Logger.debug(
      `[ShippingSvc] Creating shipment for order ${orderId}, recipient ${recipientId}`
    );

    const { carrier, trackingNumber, estimatedDelivery } = shippingData;

    const order = await SwagOrder.findById(orderId);
    if (!order) throw new Error("Order not found");

    const shipmentIndex = order.recipientShipments.findIndex(
      (s) => s.recipient.toString() === recipientId
    );
    if (shipmentIndex === -1) throw new Error("Shipment not found");

    // Update shipment
    order.recipientShipments[shipmentIndex].carrier = carrier;
    order.recipientShipments[shipmentIndex].trackingNumber = trackingNumber;
    order.recipientShipments[shipmentIndex].trackingUrl =
      this._generateTrackingUrl(carrier, trackingNumber);
    order.recipientShipments[shipmentIndex].shipmentStatus =
      SHIPMENT_STATUS.SHIPPED;
    order.recipientShipments[shipmentIndex].shippedAt = new Date();

    if (estimatedDelivery) {
      order.recipientShipments[shipmentIndex].estimatedDelivery = new Date(
        estimatedDelivery
      );
    }

    order.recalculateStats();
    await order.save();

    Logger.success(
      `[ShippingSvc] Created shipment with tracking ${trackingNumber}`
    );

    return order.recipientShipments[shipmentIndex];
  }

  /**
   * Update shipment status
   */
  async updateShipmentStatus(
    orderId,
    recipientId,
    status,
    additionalData = {}
  ) {
    Logger.debug(`[ShippingSvc] Updating shipment status to ${status}`);

    const order = await SwagOrder.findById(orderId);
    if (!order) throw new Error("Order not found");

    const shipmentIndex = order.recipientShipments.findIndex(
      (s) => s.recipient.toString() === recipientId
    );
    if (shipmentIndex === -1) throw new Error("Shipment not found");

    const shipment = order.recipientShipments[shipmentIndex];

    // Update status
    shipment.shipmentStatus = status;

    // Update timestamps based on status
    switch (status) {
      case SHIPMENT_STATUS.SHIPPED:
        shipment.shippedAt = new Date();
        break;
      case SHIPMENT_STATUS.DELIVERED:
        shipment.deliveredAt = new Date();
        if (additionalData.deliveryPhoto) {
          shipment.deliveryPhoto = additionalData.deliveryPhoto;
        }
        if (additionalData.deliverySignature) {
          shipment.deliverySignature = additionalData.deliverySignature;
        }
        break;
      case SHIPMENT_STATUS.FAILED:
        shipment.failureReason = additionalData.reason || "Giao hàng thất bại";
        break;
    }

    order.recalculateStats();

    // Update order status based on shipments
    if (order.stats.delivered === order.totalRecipients) {
      order.status = "delivered";
      order.completedAt = new Date();
    } else if (order.stats.shipped > 0 || order.stats.delivered > 0) {
      order.status = "shipped";
    }

    await order.save();

    return shipment;
  }

  /**
   * Bulk update shipments (for batch processing)
   */
  async bulkUpdateShipments(updates) {
    Logger.debug(`[ShippingSvc] Bulk updating ${updates.length} shipments`);

    const results = [];
    for (const update of updates) {
      try {
        const result = await this.updateShipmentStatus(
          update.orderId,
          update.recipientId,
          update.status,
          update.additionalData
        );
        results.push({ success: true, ...update });
      } catch (error) {
        results.push({ success: false, error: error.message, ...update });
      }
    }

    return {
      total: updates.length,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results,
    };
  }

  /**
   * Get tracking info
   */
  async getTrackingInfo(orderId, recipientId) {
    const order = await SwagOrder.findById(orderId);
    if (!order) throw new Error("Order not found");

    const shipment = order.recipientShipments.find(
      (s) => s.recipient.toString() === recipientId
    );
    if (!shipment) throw new Error("Shipment not found");

    return {
      status: shipment.shipmentStatus,
      carrier: shipment.carrier,
      carrierName: CARRIERS[shipment.carrier]?.name || shipment.carrier,
      trackingNumber: shipment.trackingNumber,
      trackingUrl: shipment.trackingUrl,
      shippedAt: shipment.shippedAt,
      deliveredAt: shipment.deliveredAt,
      estimatedDelivery: shipment.estimatedDelivery,
      // TODO: Fetch real-time tracking from carrier API
      events: this._getMockTrackingEvents(shipment),
    };
  }

  /**
   * Get shipping rates
   */
  getShippingRates(address, items) {
    // Calculate package weight/dimensions
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const estimatedWeight = totalItems * 0.5; // 0.5kg per item average

    // Get rates based on destination
    const city = address.city?.toLowerCase() || "";
    const isMajorCity = ["tp. hồ chí minh", "hà nội", "đà nẵng"].some((c) =>
      city.includes(c)
    );

    return {
      standard: {
        name: "Tiêu chuẩn",
        price: isMajorCity ? 30000 : 50000,
        estimatedDays: isMajorCity ? "2-3" : "3-5",
        carrier: "ghn",
      },
      express: {
        name: "Nhanh",
        price: isMajorCity ? 50000 : 80000,
        estimatedDays: isMajorCity ? "1-2" : "2-3",
        carrier: "ghn",
      },
      overnight: {
        name: "Hỏa tốc",
        price: isMajorCity ? 100000 : 150000,
        estimatedDays: isMajorCity ? "Trong ngày" : "1-2",
        carrier: "ghn",
      },
    };
  }

  /**
   * Get available carriers
   */
  getCarriers() {
    return Object.entries(CARRIERS).map(([id, carrier]) => ({
      id,
      name: carrier.name,
    }));
  }

  // === PRIVATE HELPERS ===

  _generateTrackingUrl(carrier, trackingNumber) {
    const carrierConfig = CARRIERS[carrier];
    if (!carrierConfig) return null;
    return carrierConfig.trackingUrlTemplate.replace(
      "{trackingNumber}",
      trackingNumber
    );
  }

  _getMockTrackingEvents(shipment) {
    const events = [];

    if (shipment.shippedAt) {
      events.push({
        status: "shipped",
        description: "Đơn hàng đã được gửi đi",
        timestamp: shipment.shippedAt,
        location: "Kho Printz",
      });
    }

    if (shipment.shipmentStatus === "in_transit") {
      events.push({
        status: "in_transit",
        description: "Đang vận chuyển",
        timestamp: new Date(),
        location: "Trung tâm phân loại",
      });
    }

    if (shipment.shipmentStatus === "out_for_delivery") {
      events.push({
        status: "out_for_delivery",
        description: "Đang giao hàng",
        timestamp: new Date(),
        location: shipment.shippingAddress?.city || "Địa phương",
      });
    }

    if (shipment.deliveredAt) {
      events.push({
        status: "delivered",
        description: "Đã giao hàng thành công",
        timestamp: shipment.deliveredAt,
        location: shipment.shippingAddress?.city || "Địa chỉ người nhận",
      });
    }

    return events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }
}

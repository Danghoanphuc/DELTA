// src/services/swag-ops/shipment.service.ts
// ✅ Shipment Service - Single Responsibility: Shipment Management

import { Logger } from "../../utils/logger";
import { SwagOrderRepository } from "../../repositories/swag-order.repository";
import { CarrierFactory } from "../carriers/carrier.factory";
import {
  ShipmentUpdate,
  ORDER_STATUS,
  SHIPMENT_STATUS,
} from "../../interfaces/swag-operations.interface";
import { CarrierInfo } from "../../interfaces/carrier.interface";

export class ShipmentService {
  constructor(private readonly orderRepo: SwagOrderRepository) {}

  getCarriers(): CarrierInfo[] {
    return CarrierFactory.getCarriers();
  }

  async updateShipmentStatus(
    orderId: string,
    recipientId: string,
    update: ShipmentUpdate,
    adminId: string
  ) {
    const order = await this.orderRepo.findByIdForUpdate(orderId);
    if (!order) throw new Error("Order not found");

    const shipmentIndex = order.recipientShipments.findIndex(
      (s: any) => s.recipient.toString() === recipientId
    );

    if (shipmentIndex === -1) throw new Error("Shipment not found");

    const shipment = order.recipientShipments[shipmentIndex];
    shipment.shipmentStatus = update.status;

    if (update.trackingNumber) shipment.trackingNumber = update.trackingNumber;
    if (update.trackingUrl) shipment.trackingUrl = update.trackingUrl;
    if (update.carrier) shipment.carrier = update.carrier;

    if (update.status === SHIPMENT_STATUS.SHIPPED) {
      shipment.shippedAt = new Date();
    } else if (update.status === SHIPMENT_STATUS.DELIVERED) {
      shipment.deliveredAt = new Date();
    }

    order.recalculateStats();
    this.updateOrderStatusFromShipments(order);

    if (!order.activityLog) order.activityLog = [];
    order.activityLog.push({
      action: "shipment_updated",
      recipientId,
      status: update.status,
      trackingNumber: update.trackingNumber,
      by: adminId,
      at: new Date(),
    });

    await order.save();
    return order;
  }

  async bulkUpdateShipments(
    orderId: string,
    recipientIds: string[],
    status: string,
    trackingNumbers: Record<string, string>,
    adminId: string,
    carrier?: string
  ) {
    const order = await this.orderRepo.findByIdForUpdate(orderId);
    if (!order) throw new Error("Order not found");

    let updated = 0;
    const carrierAdapter = carrier ? CarrierFactory.getAdapter(carrier) : null;

    for (const recipientId of recipientIds) {
      const shipmentIndex = order.recipientShipments.findIndex(
        (s: any) => s.recipient.toString() === recipientId
      );

      if (shipmentIndex !== -1) {
        const shipment = order.recipientShipments[shipmentIndex];
        shipment.shipmentStatus = status;

        if (trackingNumbers[recipientId]) {
          shipment.trackingNumber = trackingNumbers[recipientId];
          if (carrier) {
            shipment.carrier = carrier;
            shipment.trackingUrl = carrierAdapter
              ? carrierAdapter.getTrackingUrl(trackingNumbers[recipientId])
              : "";
          }
        }

        if (status === SHIPMENT_STATUS.SHIPPED) {
          shipment.shippedAt = new Date();
        } else if (status === SHIPMENT_STATUS.DELIVERED) {
          shipment.deliveredAt = new Date();
        }
        updated++;
      }
    }

    order.recalculateStats();

    if (!order.activityLog) order.activityLog = [];
    order.activityLog.push({
      action: "bulk_shipment_update",
      count: updated,
      status,
      by: adminId,
      at: new Date(),
    });

    await order.save();
    return { updated, order };
  }

  async createShipmentWithCarrier(
    orderId: string,
    recipientId: string,
    carrierId: string,
    adminId: string
  ) {
    const order = await this.orderRepo.findByIdForUpdate(orderId);
    if (!order) throw new Error("Order not found");

    const shipment = order.recipientShipments.find(
      (s: any) => s.recipient.toString() === recipientId
    );
    if (!shipment) throw new Error("Shipment not found");

    const carrier = CarrierFactory.getAdapter(carrierId);
    if (!carrier) throw new Error(`Carrier ${carrierId} not found`);

    const result = await carrier.createShipment({
      orderId,
      recipientId,
      address: {
        street: shipment.shippingAddress?.street || "",
        ward: shipment.shippingAddress?.ward || "",
        district: shipment.shippingAddress?.district || "",
        city: shipment.shippingAddress?.city || "",
        phone: shipment.recipientInfo?.phone || "",
        fullName: `${shipment.recipientInfo?.firstName || ""} ${
          shipment.recipientInfo?.lastName || ""
        }`.trim(),
      },
      items: order.packSnapshot?.items || [],
    });

    if (result.success) {
      shipment.carrier = carrierId;
      shipment.trackingNumber = result.trackingNumber;
      shipment.trackingUrl = result.trackingUrl;
      shipment.shipmentStatus = SHIPMENT_STATUS.SHIPPED;
      shipment.shippedAt = new Date();
      if (result.estimatedDelivery) {
        shipment.estimatedDelivery = result.estimatedDelivery;
      }

      order.recalculateStats();
      await order.save();

      Logger.info(
        `[ShipmentService] Created shipment ${result.trackingNumber} for order ${order.orderNumber}`
      );
    }

    return result;
  }

  async getTrackingInfo(orderId: string, recipientId: string) {
    const order = await this.orderRepo.findById(orderId);
    if (!order) throw new Error("Order not found");

    const shipment = order.recipientShipments.find(
      (s: any) => s.recipient.toString() === recipientId
    );
    if (!shipment) throw new Error("Shipment not found");

    if (!shipment.trackingNumber) {
      return { status: shipment.shipmentStatus, events: [] };
    }

    const carrier = CarrierFactory.getAdapter(shipment.carrier || "ghn");
    if (!carrier) {
      return { status: shipment.shipmentStatus, events: [] };
    }

    return carrier.getTracking(shipment.trackingNumber);
  }

  async generateShippingLabels(
    orderId: string,
    recipientIds: string[],
    _carrier?: string
  ) {
    const order = await this.orderRepo.findById(orderId);
    if (!order) throw new Error("Order not found");

    const labels = await Promise.all(
      recipientIds.map(async (recipientId) => {
        const shipment = order.recipientShipments.find(
          (s: any) => s.recipient.toString() === recipientId
        );

        if (!shipment) return null;

        let labelUrl = `/api/admin/swag-ops/labels/${orderId}/${recipientId}.pdf`;

        if (shipment.trackingNumber && shipment.carrier) {
          const carrier = CarrierFactory.getAdapter(shipment.carrier);
          if (carrier) {
            labelUrl = await carrier.generateLabel(
              shipment.trackingNumber,
              shipment
            );
          }
        }

        return {
          recipientId,
          recipientName: `${shipment?.recipientInfo?.firstName || ""} ${
            shipment?.recipientInfo?.lastName || ""
          }`.trim(),
          address: shipment?.shippingAddress,
          trackingNumber: shipment?.trackingNumber,
          carrier: shipment?.carrier,
          labelUrl,
        };
      })
    );

    return labels.filter(Boolean);
  }

  private updateOrderStatusFromShipments(order: any): void {
    const allShipped = order.recipientShipments.every(
      (s: any) =>
        s.shipmentStatus === SHIPMENT_STATUS.SHIPPED ||
        s.shipmentStatus === SHIPMENT_STATUS.DELIVERED
    );
    const allDelivered = order.recipientShipments.every(
      (s: any) => s.shipmentStatus === SHIPMENT_STATUS.DELIVERED
    );

    if (allDelivered) {
      order.status = ORDER_STATUS.DELIVERED;
      order.completedAt = new Date();
    } else if (allShipped) {
      order.status = ORDER_STATUS.SHIPPED;
    }
  }
}

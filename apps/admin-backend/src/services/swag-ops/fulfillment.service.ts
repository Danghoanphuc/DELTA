// src/services/swag-ops/fulfillment.service.ts
// ✅ Fulfillment Service - Single Responsibility: Fulfillment Queue Management

import { SwagOrderRepository } from "../../repositories/swag-order.repository";
import {
  FulfillmentQueue,
  ORDER_STATUS,
  SHIPMENT_STATUS,
} from "../../interfaces/swag-operations.interface";

export class FulfillmentService {
  constructor(private readonly orderRepo: SwagOrderRepository) {}

  async getQueue(): Promise<FulfillmentQueue> {
    const orders = await this.orderRepo.findByStatus([
      ORDER_STATUS.PAID,
      ORDER_STATUS.PROCESSING,
      ORDER_STATUS.KITTING,
    ]);

    return {
      readyToProcess: orders.filter((o: any) => o.status === ORDER_STATUS.PAID),
      processing: orders.filter(
        (o: any) => o.status === ORDER_STATUS.PROCESSING
      ),
      kitting: orders.filter((o: any) => o.status === ORDER_STATUS.KITTING),
    };
  }

  async startProcessing(orderId: string, adminId: string) {
    const order = await this.orderRepo.findByIdForUpdate(orderId);
    if (!order) throw new Error("Order not found");

    const previousStatus = order.status;
    order.status = ORDER_STATUS.PROCESSING;
    order.processedAt = new Date();

    if (!order.activityLog) order.activityLog = [];
    order.activityLog.push({
      action: "status_changed",
      from: previousStatus,
      to: ORDER_STATUS.PROCESSING,
      by: adminId,
      at: new Date(),
      note: "Started processing",
    });

    await order.save();
    return order;
  }

  async completeKitting(orderId: string, adminId: string) {
    const order = await this.orderRepo.findByIdForUpdate(orderId);
    if (!order) throw new Error("Order not found");

    order.status = ORDER_STATUS.KITTING;

    // Mark all shipments as ready
    order.recipientShipments.forEach((s: any) => {
      if (s.shipmentStatus === SHIPMENT_STATUS.PENDING) {
        s.shipmentStatus = SHIPMENT_STATUS.PROCESSING;
      }
    });

    if (!order.activityLog) order.activityLog = [];
    order.activityLog.push({
      action: "kitting_complete",
      by: adminId,
      at: new Date(),
    });

    await order.save();
    return order;
  }
}

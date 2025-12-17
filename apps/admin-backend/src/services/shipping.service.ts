// @ts-nocheck
// src/services/shipping.service.ts
// ✅ Shipping Service - Quản lý shipments và carrier integration
// Tuân thủ SOLID: SRP, DIP

import { Logger } from "../shared/utils/logger.js";
import { carrierService } from "./carrier-integration.service.js";
import { SwagOrderRepository } from "../repositories/swag-order.repository.js";
import {
  ValidationException,
  NotFoundException,
  ConflictException,
} from "../shared/exceptions/index.js";
import { ShipmentRequest } from "../interfaces/carrier.interface.js";

/**
 * Shipping Service
 * Responsibilities:
 * - Create shipments for order recipients
 * - Track shipment status
 * - Handle carrier webhooks
 * - Generate shipping labels
 */
export class ShippingService {
  private swagOrderRepository: SwagOrderRepository;

  constructor() {
    this.swagOrderRepository = new SwagOrderRepository();
  }

  /**
   * Create shipment for a recipient
   */
  async createShipment(
    orderId: string,
    recipientId: string,
    carrierId: string,
    packageDetails: {
      weight: number;
      dimensions: { length: number; width: number; height: number };
      value: number;
      notes?: string;
    }
  ) {
    Logger.debug(
      `[ShippingSvc] Creating shipment for order ${orderId}, recipient ${recipientId}`
    );

    // 1. Get order and validate
    const order = await this.swagOrderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundException("Swag Order", orderId);
    }

    // 2. Find recipient
    const recipient = order.recipients.find(
      (r: any) => r._id.toString() === recipientId
    );
    if (!recipient) {
      throw new NotFoundException("Recipient", recipientId);
    }

    // 3. Validate order status
    if (!["ready_to_ship", "kitting_completed"].includes(order.status)) {
      throw new ConflictException(
        "Đơn hàng phải ở trạng thái ready_to_ship hoặc kitting_completed"
      );
    }

    // 4. Check if shipment already exists
    if (recipient.shipment?.trackingNumber) {
      throw new ConflictException(
        `Recipient đã có vận đơn: ${recipient.shipment.trackingNumber}`
      );
    }

    // 5. Validate recipient address
    if (!recipient.address || !recipient.address.fullAddress) {
      throw new ValidationException(
        "Recipient chưa có địa chỉ giao hàng đầy đủ"
      );
    }

    // 6. Prepare shipment request
    const shipmentRequest: ShipmentRequest = {
      // Sender info (from organization)
      fromName: order.organization?.businessName || "Delta Swag",
      fromPhone: order.organization?.phone || "0123456789",
      fromAddress: order.organization?.address || "Hà Nội",
      fromWard: "",
      fromDistrict: "",
      fromProvince: "Hà Nội",

      // Receiver info
      toName: recipient.name,
      toPhone: recipient.phone,
      toAddress: recipient.address.fullAddress,
      toWard: recipient.address.ward || "",
      toDistrict: recipient.address.district || "",
      toProvince: recipient.address.city || "",

      // Package info
      weight: packageDetails.weight,
      length: packageDetails.dimensions.length,
      width: packageDetails.dimensions.width,
      height: packageDetails.dimensions.height,
      codAmount: 0, // No COD for swag orders
      insuranceValue: packageDetails.value,

      // Order info
      orderCode: `${order.orderNumber}-${recipient._id}`,
      note: packageDetails.notes || `Swag Pack: ${order.name}`,
      items:
        order.packSnapshot?.items?.map((item: any) => ({
          name: item.product?.name || "Product",
          quantity: item.quantity,
          price: 0,
        })) || [],
    };

    // 7. Create shipment via carrier
    const shipmentResponse = await carrierService.createShipment(
      carrierId,
      shipmentRequest
    );

    if (!shipmentResponse.success) {
      Logger.error(
        `[ShippingSvc] Failed to create shipment:`,
        shipmentResponse.error
      );
      throw new ConflictException(
        `Không thể tạo vận đơn: ${shipmentResponse.error}`
      );
    }

    // 8. Update recipient with shipment info
    recipient.shipment = {
      carrier: carrierId,
      trackingNumber: shipmentResponse.trackingNumber!,
      trackingUrl: carrierService.getTrackingUrl(
        carrierId,
        shipmentResponse.trackingNumber!
      ),
      status: "created",
      createdAt: new Date(),
      estimatedDelivery: shipmentResponse.estimatedDelivery,
      fee: shipmentResponse.fee,
    };

    recipient.status = "shipping";

    await order.save();

    Logger.success(
      `[ShippingSvc] Created shipment ${shipmentResponse.trackingNumber} for recipient ${recipient.name}`
    );

    return {
      shipment: recipient.shipment,
      recipient: {
        _id: recipient._id,
        name: recipient.name,
        phone: recipient.phone,
        address: recipient.address,
      },
    };
  }

  /**
   * Create shipments for multiple recipients (bulk)
   */
  async createBulkShipments(
    orderId: string,
    carrierId: string,
    recipientIds?: string[],
    packageDetails?: {
      weight: number;
      dimensions: { length: number; width: number; height: number };
      value: number;
    }
  ) {
    Logger.debug(`[ShippingSvc] Creating bulk shipments for order ${orderId}`);

    const order = await this.swagOrderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundException("Swag Order", orderId);
    }

    // Default package details
    const defaultPackage = packageDetails || {
      weight: 500, // 500g
      dimensions: { length: 30, width: 20, height: 10 }, // cm
      value: 500000, // 500k VND
    };

    // Filter recipients
    let targetRecipients = order.recipients;
    if (recipientIds && recipientIds.length > 0) {
      targetRecipients = order.recipients.filter((r: any) =>
        recipientIds.includes(r._id.toString())
      );
    }

    // Only create for recipients without shipment
    const recipientsToShip = targetRecipients.filter(
      (r: any) => !r.shipment?.trackingNumber
    );

    if (recipientsToShip.length === 0) {
      throw new ConflictException("Tất cả recipients đã có vận đơn");
    }

    Logger.debug(`[ShippingSvc] Creating ${recipientsToShip.length} shipments`);

    const results = [];
    const errors = [];

    for (const recipient of recipientsToShip) {
      try {
        const result = await this.createShipment(
          orderId,
          recipient._id.toString(),
          carrierId,
          defaultPackage
        );
        results.push(result);
      } catch (error: any) {
        Logger.error(
          `[ShippingSvc] Failed to create shipment for ${recipient.name}:`,
          error
        );
        errors.push({
          recipientId: recipient._id,
          recipientName: recipient.name,
          error: error.message,
        });
      }
    }

    // Update order status if all recipients have shipments
    const allShipped = order.recipients.every(
      (r: any) => r.shipment?.trackingNumber
    );
    if (allShipped) {
      order.status = "shipping";
      await order.save();
    }

    Logger.success(
      `[ShippingSvc] Created ${results.length} shipments, ${errors.length} errors`
    );

    return {
      success: results.length,
      failed: errors.length,
      results,
      errors,
    };
  }

  /**
   * Get tracking info for a shipment
   */
  async getTracking(orderId: string, recipientId: string) {
    Logger.debug(
      `[ShippingSvc] Getting tracking for order ${orderId}, recipient ${recipientId}`
    );

    const order = await this.swagOrderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundException("Swag Order", orderId);
    }

    const recipient = order.recipients.find(
      (r: any) => r._id.toString() === recipientId
    );
    if (!recipient) {
      throw new NotFoundException("Recipient", recipientId);
    }

    if (!recipient.shipment?.trackingNumber) {
      throw new NotFoundException("Shipment", recipientId);
    }

    // Get tracking from carrier
    const tracking = await carrierService.getTracking(
      recipient.shipment.carrier,
      recipient.shipment.trackingNumber
    );

    // Update recipient status based on tracking
    if (tracking.success && tracking.status) {
      recipient.shipment.status = tracking.status;
      recipient.shipment.lastUpdated = new Date();

      // Update recipient status
      if (tracking.status === "delivered") {
        recipient.status = "delivered";
        recipient.deliveredAt = new Date();
      } else if (
        tracking.status === "failed" ||
        tracking.status === "returned"
      ) {
        recipient.status = "failed";
      }

      await order.save();
    }

    return {
      recipient: {
        _id: recipient._id,
        name: recipient.name,
        phone: recipient.phone,
      },
      shipment: recipient.shipment,
      tracking: {
        status: tracking.status,
        events: tracking.events,
        estimatedDelivery: tracking.estimatedDelivery,
      },
    };
  }

  /**
   * Handle carrier webhook
   */
  async handleWebhook(carrier: string, payload: any) {
    Logger.debug(`[ShippingSvc] Handling webhook from ${carrier}`);

    // Extract tracking number from payload (carrier-specific)
    let trackingNumber: string | undefined;
    let status: string | undefined;

    if (carrier === "ghn") {
      trackingNumber = payload.OrderCode;
      status = this.mapGHNStatus(payload.Status);
    } else if (carrier === "viettel-post") {
      trackingNumber = payload.ORDER_NUMBER;
      status = this.mapViettelStatus(payload.ORDER_STATUS);
    } else if (carrier === "ghtk") {
      trackingNumber = payload.partner_id;
      status = this.mapGHTKStatus(payload.status_id);
    }

    if (!trackingNumber) {
      Logger.warn(
        `[ShippingSvc] No tracking number in webhook from ${carrier}`
      );
      return { success: false, message: "No tracking number" };
    }

    // Find order by tracking number
    const order = await this.swagOrderRepository.findOne({
      "recipients.shipment.trackingNumber": trackingNumber,
    });

    if (!order) {
      Logger.warn(
        `[ShippingSvc] Order not found for tracking ${trackingNumber}`
      );
      return { success: false, message: "Order not found" };
    }

    // Update recipient shipment status
    const recipient = order.recipients.find(
      (r: any) => r.shipment?.trackingNumber === trackingNumber
    );

    if (recipient && status) {
      recipient.shipment.status = status;
      recipient.shipment.lastUpdated = new Date();

      // Update recipient status
      if (status === "delivered") {
        recipient.status = "delivered";
        recipient.deliveredAt = new Date();
      } else if (status === "failed" || status === "returned") {
        recipient.status = "failed";
      }

      await order.save();

      Logger.success(
        `[ShippingSvc] Updated shipment ${trackingNumber} to ${status}`
      );
    }

    return { success: true, message: "Webhook processed" };
  }

  /**
   * Cancel shipment
   */
  async cancelShipment(orderId: string, recipientId: string, reason: string) {
    Logger.debug(
      `[ShippingSvc] Cancelling shipment for order ${orderId}, recipient ${recipientId}`
    );

    const order = await this.swagOrderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundException("Swag Order", orderId);
    }

    const recipient = order.recipients.find(
      (r: any) => r._id.toString() === recipientId
    );
    if (!recipient) {
      throw new NotFoundException("Recipient", recipientId);
    }

    if (!recipient.shipment?.trackingNumber) {
      throw new NotFoundException("Shipment", recipientId);
    }

    // Cancel with carrier
    const cancelled = await carrierService.cancelShipment(
      recipient.shipment.carrier,
      recipient.shipment.trackingNumber
    );

    if (!cancelled) {
      throw new ConflictException("Không thể hủy vận đơn với carrier");
    }

    // Update recipient
    recipient.shipment.status = "cancelled";
    recipient.shipment.cancelledAt = new Date();
    recipient.shipment.cancelReason = reason;
    recipient.status = "pending_shipment";

    await order.save();

    Logger.success(
      `[ShippingSvc] Cancelled shipment ${recipient.shipment.trackingNumber}`
    );

    return { success: true, message: "Shipment cancelled" };
  }

  /**
   * Get available carriers
   */
  getCarriers() {
    return carrierService.getCarriers();
  }

  /**
   * Calculate shipping fee
   */
  async calculateFee(
    carrierId: string,
    fromDistrict: string,
    toDistrict: string,
    weight: number
  ) {
    return carrierService.calculateFee(
      carrierId,
      fromDistrict,
      toDistrict,
      weight
    );
  }

  // Helper methods to map carrier-specific statuses
  private mapGHNStatus(status: string): string {
    const statusMap: Record<string, string> = {
      ready_to_pick: "created",
      picking: "picked_up",
      picked: "picked_up",
      storing: "in_transit",
      transporting: "in_transit",
      delivering: "out_for_delivery",
      delivered: "delivered",
      return: "returned",
      returned: "returned",
      cancel: "cancelled",
      exception: "failed",
    };
    return statusMap[status] || "unknown";
  }

  private mapViettelStatus(status: number): string {
    const statusMap: Record<number, string> = {
      100: "created",
      103: "picked_up",
      200: "in_transit",
      300: "out_for_delivery",
      500: "delivered",
      550: "returned",
      600: "cancelled",
    };
    return statusMap[status] || "unknown";
  }

  private mapGHTKStatus(statusId: number): string {
    const statusMap: Record<number, string> = {
      1: "created",
      2: "picked_up",
      3: "in_transit",
      5: "out_for_delivery",
      6: "delivered",
      7: "returned",
      9: "cancelled",
    };
    return statusMap[statusId] || "unknown";
  }
}

export const shippingService = new ShippingService();

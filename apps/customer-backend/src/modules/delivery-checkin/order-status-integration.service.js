// apps/customer-backend/src/modules/delivery-checkin/order-status-integration.service.js

import mongoose from "mongoose";
import { Logger } from "../../shared/utils/index.js";
import {
  NotFoundException,
  ValidationException,
} from "../../shared/exceptions/index.js";

/**
 * Order Status Integration Service
 *
 * Handles order status updates when delivery check-ins are created or deleted.
 * Implements Requirements 10.1-10.5 for order status integration.
 */
export class OrderStatusIntegrationService {
  /**
   * Order status constants for delivery tracking
   */
  static ORDER_STATUS = {
    PROCESSING: "processing",
    SHIPPED: "shipped",
    DELIVERED: "delivered",
    COMPLETED: "completed",
  };

  /**
   * Update order status to "delivered" when a check-in is created
   *
   * **Property 33: Order Status Update on Check-in**
   * For any check-in created for an order, the order status SHALL be updated to "delivered".
   *
   * @param {Object} order - The order document to update
   * @param {Object} checkin - The check-in data
   * @returns {Promise<Object>} Updated order with new status
   *
   * **Validates: Requirements 10.1**
   */
  async updateOrderStatusOnCheckin(order, checkin) {
    if (!order) {
      throw new NotFoundException("Order", "unknown");
    }

    if (!checkin) {
      throw new ValidationException("Check-in data is required");
    }

    Logger.debug(
      `[OrderStatusIntegrationSvc] Updating order ${order._id} status to delivered`
    );

    // Store previous status for audit trail
    const previousStatus = order.status;

    // Update order status to "delivered"
    order.status = OrderStatusIntegrationService.ORDER_STATUS.DELIVERED;
    order.deliveredAt = checkin.checkinAt || new Date();
    order.statusUpdatedAt = new Date();

    // Record status change in history if available
    if (order.statusHistory && Array.isArray(order.statusHistory)) {
      order.statusHistory.push({
        status: OrderStatusIntegrationService.ORDER_STATUS.DELIVERED,
        timestamp: new Date(),
        note: `Delivery check-in created by shipper`,
        checkinId: checkin._id,
      });
    }

    Logger.success(
      `[OrderStatusIntegrationSvc] Order ${order._id} status updated from ${previousStatus} to ${order.status}`
    );

    return order;
  }

  /**
   * Revert order status when a check-in is deleted
   *
   * **Property 37: Check-in Deletion Reverts Status**
   * For any deleted check-in, if it was the only check-in for the order,
   * the order status SHALL be reverted from "delivered".
   *
   * @param {Object} order - The order document to update
   * @param {string} previousStatus - The status to revert to
   * @returns {Promise<Object>} Updated order with reverted status
   *
   * **Validates: Requirements 10.5**
   */
  async revertOrderStatusOnCheckinDeletion(order, previousStatus = "shipped") {
    if (!order) {
      throw new NotFoundException("Order", "unknown");
    }

    Logger.debug(
      `[OrderStatusIntegrationSvc] Reverting order ${order._id} status from delivered`
    );

    // Revert order status
    order.status = previousStatus;
    order.deliveredAt = null;
    order.statusUpdatedAt = new Date();

    // Record status change in history if available
    if (order.statusHistory && Array.isArray(order.statusHistory)) {
      order.statusHistory.push({
        status: previousStatus,
        timestamp: new Date(),
        note: `Delivery check-in deleted, status reverted`,
      });
    }

    Logger.success(
      `[OrderStatusIntegrationSvc] Order ${order._id} status reverted to ${previousStatus}`
    );

    return order;
  }

  /**
   * Check if all recipients have been delivered for multi-recipient orders
   *
   * **Property 36: Order Completion Logic**
   * For any order where all recipients have check-ins, the order status
   * SHALL be marked as "completed".
   *
   * @param {Object} order - The order document
   * @param {Array} checkins - All check-ins for this order
   * @returns {boolean} True if all recipients have been delivered
   *
   * **Validates: Requirements 10.4**
   */
  checkOrderCompletion(order, checkins) {
    if (!order || !checkins) {
      return false;
    }

    // If order has multiple recipients, check if all have check-ins
    const totalRecipients = order.totalRecipients || 1;
    const deliveredCount = checkins.filter((c) => !c.isDeleted).length;

    return deliveredCount >= totalRecipients;
  }

  /**
   * Mark order as completed when all recipients have check-ins
   *
   * @param {Object} order - The order document
   * @returns {Promise<Object>} Updated order with completed status
   *
   * **Validates: Requirements 10.4**
   */
  async markOrderAsCompleted(order) {
    if (!order) {
      throw new NotFoundException("Order", "unknown");
    }

    Logger.debug(
      `[OrderStatusIntegrationSvc] Marking order ${order._id} as completed`
    );

    order.status = OrderStatusIntegrationService.ORDER_STATUS.COMPLETED;
    order.completedAt = new Date();
    order.statusUpdatedAt = new Date();

    if (order.statusHistory && Array.isArray(order.statusHistory)) {
      order.statusHistory.push({
        status: OrderStatusIntegrationService.ORDER_STATUS.COMPLETED,
        timestamp: new Date(),
        note: `All recipients delivered, order completed`,
      });
    }

    Logger.success(
      `[OrderStatusIntegrationSvc] Order ${order._id} marked as completed`
    );

    return order;
  }
}

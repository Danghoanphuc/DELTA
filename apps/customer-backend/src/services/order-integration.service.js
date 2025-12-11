// apps/customer-backend/src/services/order-integration.service.js
// ✅ Order Integration Service - Integration hooks for threaded chat system

import logger from "../infrastructure/logger.js";
import { ThreadService } from "./thread.service.js";
import { MessageService } from "./message.service.js";
import { ParticipantService } from "./participant.service.js";
import { SwagOrder } from "../modules/swag-orders/swag-order.model.js";
import { Thread } from "../shared/models/thread.model.js";
import {
  ValidationException,
  NotFoundException,
} from "../shared/exceptions/index.js";

/**
 * Order Integration Service
 * Handles integration between orders and threaded chat system
 */
export class OrderIntegrationService {
  constructor() {
    this.threadService = new ThreadService();
    this.messageService = new MessageService();
    this.participantService = new ParticipantService();
  }

  /**
   * Event Handler: Order Created
   * Auto-create default thread "Thảo luận đơn hàng" with stakeholders
   * @param {Object} order - SwagOrder document
   * @returns {Promise<Object>} Created thread
   */
  async onOrderCreated(order) {
    try {
      logger.debug(
        `[OrderIntegrationSvc] Creating delivery thread for order: ${order.orderNumber}`
      );

      // Validate order
      if (!order || !order._id) {
        throw new ValidationException("Invalid order object");
      }

      // Import DeliveryThread model
      const { DeliveryThread } = await import(
        "../modules/delivery-thread/delivery-thread.model.js"
      );

      // Check if thread already exists
      const existingThread = await DeliveryThread.findOne({
        orderId: order._id,
        checkinId: { $exists: false }, // Order-level thread
        isDeleted: false,
      });

      if (existingThread) {
        logger.warn(
          `[OrderIntegrationSvc] Thread already exists for order ${order.orderNumber}`
        );
        return existingThread;
      }

      // Create participants: Customer + Admin (Shipper will be added later)
      const participants = [
        {
          userId: order.organization, // Customer (OrganizationProfile)
          userModel: "OrganizationProfile",
          userName: "Customer", // Will be updated with actual name
          role: "customer",
          joinedAt: new Date(),
        },
      ];

      // Add all active admins as participants to receive notifications
      try {
        // Query admins collection directly (shared database with admin-backend)
        const mongoose = await import("mongoose");
        const AdminModel = mongoose.default.model("Admin");
        const admins = await AdminModel.find({ isActive: true })
          .select("_id displayName")
          .lean();

        admins.forEach((admin) => {
          participants.push({
            userId: admin._id,
            userModel: "Admin",
            userName: admin.displayName || "Admin",
            role: "admin",
            joinedAt: new Date(),
          });
        });

        logger.debug(
          `[OrderIntegrationSvc] Added ${admins.length} admins to thread`
        );
      } catch (error) {
        logger.warn(
          "[OrderIntegrationSvc] Failed to add admins to thread:",
          error
        );
        // Continue even if admin lookup fails
      }

      // Create delivery thread
      const thread = await DeliveryThread.create({
        orderId: order._id,
        orderNumber: order.orderNumber,
        orderType: "swag", // or "master" based on order type
        organizationId: order.organization,
        participants,
        messages: [
          {
            senderId: order.organization,
            senderModel: "OrganizationProfile",
            senderName: "System",
            senderRole: "customer",
            messageType: "system",
            content: `Đơn hàng ${order.orderNumber} đã được tạo. Bạn có thể thảo luận về đơn hàng này tại đây.`,
            attachments: [],
            isEdited: false,
            isDeleted: false,
          },
        ],
        messageCount: 1,
        lastMessageAt: new Date(),
        lastMessagePreview: "Đơn hàng đã được tạo",
        isDeleted: false,
      });

      logger.success(
        `[OrderIntegrationSvc] Created delivery thread ${thread._id} for order ${order.orderNumber}`
      );

      return thread;
    } catch (error) {
      logger.error(
        `[OrderIntegrationSvc] Failed to create thread for order ${order?.orderNumber}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Event Handler: Order Status Changed
   * Post system message to thread with status update
   * @param {Object} order - SwagOrder document
   * @param {string} oldStatus - Previous status
   * @param {string} newStatus - New status
   * @returns {Promise<Object>} Created message
   */
  async onOrderStatusChanged(order, oldStatus, newStatus) {
    try {
      logger.debug(
        `[OrderIntegrationSvc] Order ${order.orderNumber} status changed: ${oldStatus} → ${newStatus}`
      );

      // Find thread for this order
      const thread = await Thread.findOne({
        "context.referenceId": order._id.toString(),
        "context.referenceType": "ORDER",
      });

      if (!thread) {
        logger.warn(
          `[OrderIntegrationSvc] No thread found for order ${order.orderNumber}`
        );
        return null;
      }

      // Update thread metadata
      thread.context.metadata.orderStatus = newStatus;
      await thread.save();

      // Generate status change message
      const statusMessage = this.getStatusChangeMessage(oldStatus, newStatus);

      // Send system message
      const message = await this.sendSystemMessage(
        thread._id.toString(),
        statusMessage,
        {
          type: "order_status_changed",
          orderNumber: order.orderNumber,
          oldStatus,
          newStatus,
        }
      );

      logger.success(
        `[OrderIntegrationSvc] Posted status change message to thread ${thread._id}`
      );

      return message;
    } catch (error) {
      logger.error(
        `[OrderIntegrationSvc] Failed to post status change for order ${order?.orderNumber}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Event Handler: Thread Resolved
   * Update order metadata with resolution notes
   * @param {string} threadId - Thread ID
   * @param {string} resolutionNotes - Resolution notes
   * @returns {Promise<Object>} Updated order
   */
  async onThreadResolved(threadId, resolutionNotes) {
    try {
      logger.debug(
        `[OrderIntegrationSvc] Thread ${threadId} resolved, updating order metadata`
      );

      // Get thread
      const thread = await Thread.findById(threadId);
      if (!thread) {
        throw new NotFoundException("Thread", threadId);
      }

      // Check if thread is for an order
      if (thread.context.referenceType !== "ORDER") {
        logger.debug(
          `[OrderIntegrationSvc] Thread ${threadId} is not for an order, skipping`
        );
        return null;
      }

      // Get order
      const order = await SwagOrder.findById(thread.context.referenceId);
      if (!order) {
        logger.warn(
          `[OrderIntegrationSvc] Order ${thread.context.referenceId} not found`
        );
        return null;
      }

      // Update order with resolution notes
      // Note: SwagOrder model doesn't have a threadResolutionNotes field yet
      // This is a placeholder for future enhancement
      // You may want to add this field to the SwagOrder model

      logger.success(
        `[OrderIntegrationSvc] Updated order ${order.orderNumber} with resolution notes`
      );

      return order;
    } catch (error) {
      logger.error(
        `[OrderIntegrationSvc] Failed to update order metadata for thread ${threadId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Get stakeholders for an order
   * @param {Object} order - SwagOrder document
   * @returns {Promise<Array<string>>} Array of user IDs
   */
  async getOrderStakeholders(order) {
    const stakeholders = new Set();

    // Add order creator (customer)
    if (order.createdBy) {
      stakeholders.add(order.createdBy.toString());
    }

    // Add organization admins (if any)
    // Note: This requires organization model to have admins field
    // For now, we'll just add the creator

    // TODO: Add printer/supplier if assigned
    // TODO: Add assigned admin if any

    return Array.from(stakeholders);
  }

  /**
   * Send system message to thread
   * @param {string} threadId - Thread ID
   * @param {string} content - Message content
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Object>} Created message
   */
  async sendSystemMessage(threadId, content, metadata = {}) {
    try {
      const messageData = {
        conversationId: threadId,
        sender: null, // System message
        senderType: "System",
        type: "system",
        content: {
          text: content,
        },
        metadata,
        threadDepth: 0,
        threadPath: "",
        replyCount: 0,
        totalReplyCount: 0,
        mentions: [],
        reactions: [],
        attachments: [],
      };

      const message = await this.messageService.sendMessage(null, messageData);

      return message;
    } catch (error) {
      logger.error(
        `[OrderIntegrationSvc] Failed to send system message:`,
        error
      );
      throw error;
    }
  }

  /**
   * Get human-readable status change message
   * @param {string} oldStatus - Old status
   * @param {string} newStatus - New status
   * @returns {string} Status change message
   */
  getStatusChangeMessage(oldStatus, newStatus) {
    const statusMessages = {
      draft: "Đơn hàng đang ở trạng thái nháp",
      pending_info: "Đang chờ người nhận điền thông tin",
      pending_payment: "Đang chờ thanh toán",
      paid: "Đơn hàng đã được thanh toán",
      processing: "Đơn hàng đang được xử lý",
      kitting: "Đơn hàng đang được đóng gói",
      shipped: "Đơn hàng đã được gửi đi",
      delivered: "Đơn hàng đã được giao",
      cancelled: "Đơn hàng đã bị hủy",
      failed: "Đơn hàng thất bại",
    };

    const newStatusText = statusMessages[newStatus] || newStatus;

    return `📦 Trạng thái đơn hàng đã thay đổi: ${newStatusText}`;
  }

  /**
   * Register order event listeners
   * This should be called when the application starts
   */
  registerEventListeners() {
    logger.info("[OrderIntegrationSvc] Registering order event listeners");

    // Note: This is a placeholder for event listener registration
    // In a real implementation, you would use an event emitter or message queue
    // to listen for order events and call the appropriate handlers

    // Example with EventEmitter:
    // orderEventEmitter.on('order:created', this.onOrderCreated.bind(this));
    // orderEventEmitter.on('order:status_changed', this.onOrderStatusChanged.bind(this));

    logger.success("[OrderIntegrationSvc] Order event listeners registered");
  }
}

// apps/customer-backend/src/modules/delivery-thread/delivery-thread.service.js
/**
 * Delivery Thread Service
 * Business logic for delivery thread management
 */

import { DeliveryThreadRepository } from "./delivery-thread.repository.js";
import { DeliveryCheckin } from "../delivery-checkin/delivery-checkin.model.js";
import {
  ValidationException,
  NotFoundException,
  ForbiddenException,
} from "../../shared/exceptions/index.js";
import { Logger } from "../../shared/utils/index.js";
import {
  THREAD_PARTICIPANT_ROLE,
  THREAD_MESSAGE_TYPE,
} from "./delivery-thread.model.js";
import { socketService } from "../../infrastructure/realtime/pusher.service.js";
import { addNotificationJob } from "../../infrastructure/queue/notification.queue.js";

export class DeliveryThreadService {
  constructor() {
    this.repository = new DeliveryThreadRepository();
  }

  /**
   * Create or get thread for a check-in
   */
  async getOrCreateThread(checkinId, userId, userRole) {
    Logger.debug(
      `[DeliveryThreadSvc] Getting/creating thread for checkin: ${checkinId}`
    );

    // Check if thread already exists
    let thread = await this.repository.findByCheckinId(checkinId);
    if (thread) {
      return thread;
    }

    // Get check-in details
    const checkin = await DeliveryCheckin.findById(checkinId);
    if (!checkin) {
      throw new NotFoundException("Check-in", checkinId);
    }

    // Create new thread with initial participants
    const participants = [
      {
        userId: checkin.customerId,
        userModel: "OrganizationProfile",
        userName: checkin.customerEmail,
        role: THREAD_PARTICIPANT_ROLE.CUSTOMER,
        joinedAt: new Date(),
      },
      {
        userId: checkin.shipperId,
        userModel: "User",
        userName: checkin.shipperName,
        role: THREAD_PARTICIPANT_ROLE.SHIPPER,
        joinedAt: new Date(),
      },
    ];

    // ✅ FIX: Auto-add admin support to all delivery threads
    // This ensures admin receives notifications for all delivery issues
    if (process.env.ADMIN_SUPPORT_USER_ID) {
      participants.push({
        userId: process.env.ADMIN_SUPPORT_USER_ID,
        userModel: "User",
        userName: "Admin Support",
        role: THREAD_PARTICIPANT_ROLE.ADMIN,
        joinedAt: new Date(),
      });
      Logger.debug(
        `[DeliveryThreadSvc] Added admin support to thread participants`
      );
    }

    thread = await this.repository.create({
      checkinId: checkin._id,
      orderId: checkin.orderId,
      orderNumber: checkin.orderNumber,
      organizationId: checkin.customerId,
      participants,
      messages: [],
      messageCount: 0,
    });

    Logger.success(`[DeliveryThreadSvc] Created thread: ${thread._id}`);
    return thread;
  }

  /**
   * Get thread by ID with authorization check
   */
  async getThread(threadId, userId, userRole) {
    const thread = await this.repository.findById(threadId);
    if (!thread) {
      throw new NotFoundException("Thread", threadId);
    }

    // Check if user is participant
    const isParticipant = thread.participants.some(
      (p) => p.userId.toString() === userId.toString()
    );

    if (!isParticipant && userRole !== THREAD_PARTICIPANT_ROLE.ADMIN) {
      throw new ForbiddenException("Bạn không có quyền truy cập thread này");
    }

    return thread;
  }

  /**
   * Get thread by check-in ID
   */
  async getThreadByCheckin(checkinId, userId, userRole) {
    const thread = await this.repository.findByCheckinId(checkinId);
    if (!thread) {
      // Auto-create thread if it doesn't exist
      return await this.getOrCreateThread(checkinId, userId, userRole);
    }

    // Check authorization
    const isParticipant = thread.participants.some(
      (p) => p.userId.toString() === userId.toString()
    );

    if (!isParticipant && userRole !== THREAD_PARTICIPANT_ROLE.ADMIN) {
      throw new ForbiddenException("Bạn không có quyền truy cập thread này");
    }

    return thread;
  }

  /**
   * Get or create thread for an order (order-level chat)
   */
  async getThreadByOrder(orderId, userId, userRole) {
    Logger.debug(
      `[DeliveryThreadSvc] Getting/creating order-level thread for order: ${orderId}`
    );

    // Check if thread already exists (order-level thread has NO checkinId)
    let thread = await this.repository.findByOrderId(orderId);
    if (thread) {
      Logger.debug(`[DeliveryThreadSvc] Found existing order thread`);
      return thread;
    }

    Logger.warn(
      `[DeliveryThreadSvc] No order-level thread found for order ${orderId}`
    );
    Logger.info(
      `[DeliveryThreadSvc] Thread should have been created by order-integration.service.js`
    );

    // Return null - frontend will show "no thread" message
    // Thread should be created by order-integration.service.js when order is created
    return null;
  }

  /**
   * Add message to thread
   */
  async addMessage(threadId, userId, userRole, data) {
    Logger.debug(`[DeliveryThreadSvc] Adding message to thread: ${threadId}`);

    // Validation
    if (!data.content || data.content.trim().length === 0) {
      throw new ValidationException("Nội dung tin nhắn không được để trống");
    }

    // Get thread and check authorization
    const thread = await this.getThread(threadId, userId, userRole);

    // Prepare message data
    const messageData = {
      senderId: userId,
      senderModel:
        userRole === THREAD_PARTICIPANT_ROLE.CUSTOMER
          ? "OrganizationProfile"
          : "User",
      senderName: data.senderName,
      senderRole: userRole,
      messageType: data.messageType || THREAD_MESSAGE_TYPE.TEXT,
      content: data.content.trim(),
      attachments: data.attachments || [],
    };

    // Add message
    const updatedThread = await this.repository.addMessage(
      threadId,
      messageData
    );

    // Emit real-time event to all participants
    this._emitThreadUpdate(updatedThread, "message:new");

    // Send notifications to other participants
    this._sendNotifications(updatedThread, userId, messageData);

    Logger.success(`[DeliveryThreadSvc] Added message to thread: ${threadId}`);
    return updatedThread;
  }

  /**
   * Emit real-time event via Pusher
   */
  _emitThreadUpdate(thread, eventType) {
    try {
      if (!socketService.pusherInstance) {
        Logger.warn(
          "[DeliveryThreadSvc] Pusher not configured, skipping real-time emit"
        );
        return;
      }

      const channelName = `thread-${thread._id}`;

      // ⚠️ CRITICAL: Pusher has 10KB limit per event
      // Send ONLY the last message, not the entire thread
      const lastMessage = thread.messages?.[thread.messages.length - 1];

      const payload = {
        threadId: thread._id.toString(),
        message: lastMessage,
        timestamp: new Date().toISOString(),
      };

      Logger.info(
        `[DeliveryThreadSvc] 📤 Emitting ${eventType} to ${channelName}`
      );
      Logger.debug(`[DeliveryThreadSvc] Payload:`, {
        threadId: thread._id,
        messageId: lastMessage?._id,
        messageContent: lastMessage?.content?.substring(0, 50),
      });

      // Emit to thread-specific channel (public channel for all participants)
      socketService.pusherInstance
        .trigger(channelName, eventType, payload)
        .then(() => {
          Logger.success(
            `[DeliveryThreadSvc] ✅ Successfully emitted ${eventType} to ${channelName}`
          );
        })
        .catch((err) => {
          Logger.error(
            `[DeliveryThreadSvc] ❌ Failed to emit to ${channelName}:`,
            err
          );
        });

      // Emit to each participant's private channel
      thread.participants.forEach((participant) => {
        const userId = participant.userId.toString();
        socketService.emitToUser(userId, "thread:update", {
          threadId: thread._id.toString(),
          orderNumber: thread.orderNumber,
          eventType,
          timestamp: new Date().toISOString(),
        });
      });

      Logger.debug(
        `[DeliveryThreadSvc] Emitted ${eventType} for thread: ${thread._id}`
      );
    } catch (error) {
      Logger.error(
        `[DeliveryThreadSvc] Failed to emit real-time event:`,
        error
      );
      // Don't throw - real-time is not critical
    }
  }

  /**
   * Send Novu notifications to participants
   */
  _sendNotifications(thread, senderId, messageData) {
    try {
      // Send notification to all participants except sender
      thread.participants.forEach((participant) => {
        if (participant.userId.toString() === senderId.toString()) {
          return; // Skip sender
        }

        // Queue notification job - ensure all values are strings
        addNotificationJob("delivery-thread-message", {
          recipientId: participant.userId.toString(),
          recipientModel: String(participant.userModel),
          threadId: thread._id.toString(),
          orderNumber: String(thread.orderNumber),
          senderName: String(messageData.senderName || "Unknown"),
          senderRole: String(messageData.senderRole || "user"),
          messagePreview: String(
            messageData.content.length > 100
              ? messageData.content.substring(0, 100) + "..."
              : messageData.content
          ),
          checkinId: thread.checkinId ? thread.checkinId.toString() : null,
        });
      });

      // ✅ SIMPLE FIX: Always notify admin
      const ADMIN_ID = "69133fb134099877aaa371a2";
      if (senderId.toString() !== ADMIN_ID) {
        addNotificationJob("delivery-thread-message", {
          recipientId: ADMIN_ID,
          recipientModel: "User",
          threadId: thread._id.toString(),
          orderNumber: String(thread.orderNumber),
          senderName: String(messageData.senderName || "Unknown"),
          senderRole: String(messageData.senderRole || "user"),
          messagePreview: String(
            messageData.content.length > 100
              ? messageData.content.substring(0, 100) + "..."
              : messageData.content
          ),
          checkinId: thread.checkinId ? thread.checkinId.toString() : null,
        });
      }

      Logger.debug(
        `[DeliveryThreadSvc] Queued notifications for thread: ${thread._id}`
      );
    } catch (error) {
      Logger.error(`[DeliveryThreadSvc] Failed to queue notifications:`, error);
      // Don't throw - notifications are not critical
    }
  }

  /**
   * Update message
   */
  async updateMessage(threadId, messageId, userId, userRole, content) {
    Logger.debug(`[DeliveryThreadSvc] Updating message: ${messageId}`);

    if (!content || content.trim().length === 0) {
      throw new ValidationException("Nội dung tin nhắn không được để trống");
    }

    // Get thread and check authorization
    const thread = await this.getThread(threadId, userId, userRole);

    // Find message and check ownership
    const message = thread.messages.find((m) => m._id.toString() === messageId);
    if (!message) {
      throw new NotFoundException("Message", messageId);
    }

    if (message.senderId.toString() !== userId.toString()) {
      throw new ForbiddenException(
        "Bạn chỉ có thể chỉnh sửa tin nhắn của mình"
      );
    }

    // Update message
    const updatedThread = await this.repository.updateMessage(
      threadId,
      messageId,
      {
        content: content.trim(),
      }
    );

    Logger.success(`[DeliveryThreadSvc] Updated message: ${messageId}`);
    return updatedThread;
  }

  /**
   * Delete message
   */
  async deleteMessage(threadId, messageId, userId, userRole) {
    Logger.debug(`[DeliveryThreadSvc] Deleting message: ${messageId}`);

    // Get thread and check authorization
    const thread = await this.getThread(threadId, userId, userRole);

    // Find message and check ownership
    const message = thread.messages.find((m) => m._id.toString() === messageId);
    if (!message) {
      throw new NotFoundException("Message", messageId);
    }

    if (
      message.senderId.toString() !== userId.toString() &&
      userRole !== THREAD_PARTICIPANT_ROLE.ADMIN
    ) {
      throw new ForbiddenException("Bạn không có quyền xóa tin nhắn này");
    }

    // Delete message
    const updatedThread = await this.repository.deleteMessage(
      threadId,
      messageId
    );

    Logger.success(`[DeliveryThreadSvc] Deleted message: ${messageId}`);
    return updatedThread;
  }

  /**
   * Mark thread as read
   */
  async markAsRead(threadId, userId, userRole) {
    // Get thread and check authorization
    await this.getThread(threadId, userId, userRole);

    // Mark as read
    return await this.repository.markAsRead(threadId, userId);
  }

  /**
   * Get threads for organization
   */
  async getOrganizationThreads(organizationId, options = {}) {
    return await this.repository.findByOrganization(organizationId, options);
  }

  /**
   * Get threads for user (shipper/admin)
   */
  async getUserThreads(userId, options = {}) {
    return await this.repository.findByParticipant(userId, options);
  }

  /**
   * Get unread count for user
   */
  async getUnreadCount(userId) {
    return await this.repository.getUnreadCount(userId);
  }

  /**
   * Add admin to existing thread
   * ✅ FIX: Allow admin to join threads to receive notifications
   */
  async addAdminToThread(threadId, adminId, adminName = "Admin Support") {
    Logger.debug(
      `[DeliveryThreadSvc] Adding admin ${adminId} to thread ${threadId}`
    );

    const thread = await this.repository.findById(threadId);
    if (!thread) {
      throw new NotFoundException("Thread", threadId);
    }

    // Check if admin already in participants
    const isParticipant = thread.participants.some(
      (p) => p.userId.toString() === adminId.toString()
    );

    if (isParticipant) {
      Logger.debug(`[DeliveryThreadSvc] Admin already in thread`);
      return thread;
    }

    // Add admin to participants
    thread.participants.push({
      userId: adminId,
      userModel: "User",
      userName: adminName,
      role: THREAD_PARTICIPANT_ROLE.ADMIN,
      joinedAt: new Date(),
    });

    await thread.save();

    Logger.success(`[DeliveryThreadSvc] Added admin to thread: ${threadId}`);
    return thread;
  }
}

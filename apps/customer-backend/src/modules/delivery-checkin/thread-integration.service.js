// apps/customer-backend/src/modules/delivery-checkin/thread-integration.service.js
// Thread Integration Service - Integrates delivery check-ins with threaded chat system

import { threadService } from "../../services/thread.service.js";
import { ThreadedMessage } from "../../shared/models/threaded-message.model.js";
import { Logger } from "../../shared/utils/logger.util.js";
import { ValidationException } from "../../shared/exceptions/index.js";

/**
 * Thread Integration Service
 * Handles integration between delivery check-ins and threaded chat system
 */
export class ThreadIntegrationService {
  /**
   * Prepare thread data for check-in
   * @param {Object} checkin - Check-in data
   * @returns {Object} Thread data
   */
  prepareThreadData(checkin) {
    // Validation
    if (!checkin.orderId) {
      throw new ValidationException("Check-in must have an orderId");
    }

    if (!checkin.shipperId) {
      throw new ValidationException("Check-in must have a shipperId");
    }

    if (!checkin.customerId) {
      throw new ValidationException("Check-in must have a customerId");
    }

    // Format thread message
    const message = this.formatThreadMessage(checkin);

    // Prepare thread data
    const threadData = {
      type: "group",
      title: `Giao hàng - ${checkin.orderNumber}`,
      description: message,
      context: {
        referenceId: checkin.orderId.toString(),
        referenceType: "ORDER",
        metadata: {
          checkinId: checkin._id.toString(),
          location: {
            type: "Point",
            coordinates: checkin.location.coordinates,
          },
          address: checkin.address.formatted,
          checkinAt: checkin.checkinAt,
        },
      },
      participants: [
        {
          userId: checkin.shipperId,
          role: "member",
          isVisible: true,
          joinedAt: new Date(),
        },
        {
          userId: checkin.customerId,
          role: "member",
          isVisible: true,
          joinedAt: new Date(),
        },
      ],
      tags: ["delivery_checkin", "order", checkin.orderNumber],
      permissions: {
        canReply: "all",
        canInvite: "participants",
        canPin: "moderators",
        canResolve: "moderators",
        canArchive: "moderators",
      },
    };

    return threadData;
  }

  /**
   * Create delivery thread for check-in
   * @param {Object} checkin - Check-in data
   * @returns {Promise<Object>} Created thread
   */
  async createDeliveryThread(checkin) {
    Logger.debug(
      `[ThreadIntegrationSvc] Creating delivery thread for check-in: ${checkin._id}`
    );

    try {
      // Prepare thread data
      const threadData = this.prepareThreadData(checkin);

      // Create thread via ThreadService
      const thread = await threadService.createThread(
        checkin.shipperId,
        threadData
      );

      Logger.success(
        `[ThreadIntegrationSvc] Created thread: ${thread._id} for check-in: ${checkin._id}`
      );

      // Attach photos to thread if available
      if (checkin.photos && checkin.photos.length > 0) {
        await this.attachPhotosToThread(thread._id, checkin.photos);
      }

      return thread;
    } catch (error) {
      Logger.error(
        `[ThreadIntegrationSvc] Failed to create delivery thread for check-in ${checkin._id}:`,
        error
      );
      // Re-throw the original error for proper handling upstream
      throw error;
    }
  }

  /**
   * Format thread message for check-in
   * @param {Object} checkin - Check-in data
   * @returns {string} Formatted message
   */
  formatThreadMessage(checkin) {
    // Format: "Shipper [Name] đã check-in tại [Address] - Giao hàng cho đơn [OrderNumber]"
    const shipperName = checkin.shipperName || "Shipper";
    const address = checkin.address?.formatted || "địa điểm giao hàng";
    const orderNumber = checkin.orderNumber || "N/A";

    let message = `Shipper ${shipperName} đã check-in tại ${address} - Giao hàng cho đơn ${orderNumber}`;

    // Add timestamp
    const checkinTime = new Date(checkin.checkinAt).toLocaleString("vi-VN", {
      dateStyle: "short",
      timeStyle: "short",
    });
    message += `\n\nThời gian: ${checkinTime}`;

    // Add notes if available
    if (checkin.notes && checkin.notes.trim().length > 0) {
      message += `\n\nGhi chú: ${checkin.notes}`;
    }

    // Add GPS accuracy info if available
    if (
      checkin.gpsMetadata?.accuracy !== undefined &&
      checkin.gpsMetadata?.accuracy !== null
    ) {
      message += `\n\nĐộ chính xác GPS: ${Math.round(
        checkin.gpsMetadata.accuracy
      )}m`;
    }

    return message;
  }

  /**
   * Attach photos to thread
   * @param {ObjectId} threadId - Thread ID
   * @param {Array} photos - Photo URLs
   * @returns {Promise<void>}
   */
  async attachPhotosToThread(threadId, photos) {
    Logger.debug(
      `[ThreadIntegrationSvc] Attaching ${photos.length} photos to thread: ${threadId}`
    );

    try {
      // Prepare attachments
      const attachments = photos.map((photo) => ({
        type: "image",
        url: photo.url,
        thumbnailUrl: photo.thumbnailUrl,
        fileName: photo.filename || "delivery-photo.jpg",
        fileSize: photo.size,
        mimeType: photo.mimeType || "image/jpeg",
        metadata: {
          width: photo.width,
          height: photo.height,
          uploadedAt: photo.uploadedAt,
        },
      }));

      // Create message with photo attachments
      const messageData = {
        conversationId: threadId,
        sender: null, // System message
        senderType: "System",
        type: "image",
        content: {
          text: `${photos.length} ảnh giao hàng`,
        },
        attachments,
        metadata: {
          isDeliveryPhoto: true,
        },
      };

      const message = new ThreadedMessage(messageData);
      await message.save();

      Logger.success(
        `[ThreadIntegrationSvc] Attached ${photos.length} photos to thread: ${threadId}`
      );
    } catch (error) {
      Logger.error(
        `[ThreadIntegrationSvc] Failed to attach photos to thread ${threadId}:`,
        error
      );
      // Don't throw - photo attachment failure shouldn't fail the entire check-in
      // The thread is already created, photos are just supplementary
    }
  }

  /**
   * Update thread with additional check-in info
   * @param {ObjectId} threadId - Thread ID
   * @param {Object} updateData - Update data
   * @returns {Promise<void>}
   */
  async updateThreadMetadata(threadId, updateData) {
    Logger.debug(
      `[ThreadIntegrationSvc] Updating thread metadata: ${threadId}`
    );

    try {
      const Thread = (await import("../../shared/models/thread.model.js"))
        .Thread;

      const thread = await Thread.findById(threadId);
      if (!thread) {
        Logger.warn(
          `[ThreadIntegrationSvc] Thread not found for update: ${threadId}`
        );
        return;
      }

      // Update metadata
      if (updateData.location) {
        thread.context.metadata.location = updateData.location;
      }

      if (updateData.address) {
        thread.context.metadata.address = updateData.address;
      }

      if (updateData.status) {
        thread.context.metadata.deliveryStatus = updateData.status;
      }

      await thread.save();

      Logger.success(
        `[ThreadIntegrationSvc] Updated thread metadata: ${threadId}`
      );
    } catch (error) {
      Logger.error(
        `[ThreadIntegrationSvc] Failed to update thread metadata ${threadId}:`,
        error
      );
      // Don't throw - metadata update failure shouldn't fail operations
    }
  }

  /**
   * Archive thread when check-in is deleted
   * @param {ObjectId} threadId - Thread ID
   * @returns {Promise<void>}
   */
  async archiveThread(threadId) {
    Logger.debug(`[ThreadIntegrationSvc] Archiving thread: ${threadId}`);

    try {
      const Thread = (await import("../../shared/models/thread.model.js"))
        .Thread;

      const thread = await Thread.findById(threadId);
      if (!thread) {
        Logger.warn(
          `[ThreadIntegrationSvc] Thread not found for archiving: ${threadId}`
        );
        return;
      }

      thread.status = "archived";
      await thread.save();

      Logger.success(`[ThreadIntegrationSvc] Archived thread: ${threadId}`);
    } catch (error) {
      Logger.error(
        `[ThreadIntegrationSvc] Failed to archive thread ${threadId}:`,
        error
      );
      // Don't throw - archiving failure shouldn't fail check-in deletion
    }
  }
}

// Export singleton instance
export const threadIntegrationService = new ThreadIntegrationService();

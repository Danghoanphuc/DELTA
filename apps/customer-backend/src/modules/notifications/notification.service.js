// apps/customer-backend/src/modules/notifications/notification.service.js
import { notificationRepository } from "./notification.repository.js";
import { Logger } from "../../shared/utils/index.js";
import {
  NotFoundException,
  ForbiddenException,
} from "../../shared/exceptions/index.js";

class NotificationService {
  /**
   * Create a notification
   * @param {object} data - Notification data
   * @returns {Promise<object>}
   */
  async createNotification(data) {
    try {
      const notification = await notificationRepository.create(data);
      Logger.info(
        `[Notification] Created notification for user ${data.userId}: ${data.title}`
      );
      return notification;
    } catch (error) {
      Logger.error("[Notification] Error creating notification:", error);
      throw error;
    }
  }

  /**
   * Get notifications for a user with pagination
   * @param {string} userId
   * @param {object} options - { page, limit, isRead }
   * @returns {Promise<object>}
   */
  async getUserNotifications(userId, options = {}) {
    const { page = 1, limit = 20, isRead } = options;

    const [notifications, total, unreadCount] = await Promise.all([
      notificationRepository.findByUser(userId, { page, limit, isRead }),
      notificationRepository.count(userId, isRead),
      notificationRepository.getUnreadCount(userId),
    ]);

    return {
      data: notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
      unreadCount,
    };
  }

  /**
   * Get unread count for a user
   * @param {string} userId
   * @returns {Promise<number>}
   */
  async getUnreadCount(userId) {
    return await notificationRepository.getUnreadCount(userId);
  }

  /**
   * Mark a notification as read
   * @param {string} notificationId
   * @param {string} userId - For authorization
   * @returns {Promise<object>}
   */
  async markAsRead(notificationId, userId) {
    const notification = await notificationRepository.findById(notificationId);

    if (!notification) {
      throw new NotFoundException("Thông báo", notificationId);
    }

    // Check ownership
    if (notification.userId.toString() !== userId.toString()) {
      throw new ForbiddenException(
        "Bạn không có quyền thao tác với thông báo này."
      );
    }

    // Already read
    if (notification.isRead) {
      return notification;
    }

    return await notificationRepository.markAsRead(notificationId);
  }

  /**
   * Mark all notifications as read for a user
   * @param {string} userId
   * @returns {Promise<object>}
   */
  async markAllAsRead(userId) {
    const result = await notificationRepository.markAllAsRead(userId);
    Logger.info(
      `[Notification] Marked ${result.modifiedCount} notifications as read for user ${userId}`
    );
    return {
      success: true,
      modifiedCount: result.modifiedCount,
    };
  }

  /**
   * Helper: Create notification for order events
   * @param {string} userId
   * @param {string} type
   * @param {string} title
   * @param {string} message
   * @param {object} data
   */
  async createOrderNotification(userId, type, title, message, data = {}) {
    return await this.createNotification({
      userId,
      type,
      title,
      message,
      data,
    });
  }
}

export const notificationService = new NotificationService();


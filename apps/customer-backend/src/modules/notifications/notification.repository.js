// apps/customer-backend/src/modules/notifications/notification.repository.js
import { Notification } from "../../shared/models/notification.model.js";

class NotificationRepository {
  /**
   * Create a new notification
   */
  async create(data) {
    return await Notification.create(data);
  }

  /**
   * Find notifications by user ID with pagination
   */
  async findByUser(userId, options = {}) {
    const { page = 1, limit = 20, isRead } = options;
    const skip = (page - 1) * limit;

    const query = { userId };
    if (typeof isRead === "boolean") {
      query.isRead = isRead;
    }

    return await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  }

  /**
   * Get unread count for a user
   */
  async getUnreadCount(userId) {
    return await Notification.countDocuments({ userId, isRead: false });
  }

  /**
   * Find notification by ID
   */
  async findById(id) {
    return await Notification.findById(id);
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(id) {
    return await Notification.findByIdAndUpdate(
      id,
      {
        isRead: true,
        readAt: new Date(),
      },
      { new: true }
    );
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId) {
    return await Notification.updateMany(
      { userId, isRead: false },
      {
        isRead: true,
        readAt: new Date(),
      }
    );
  }

  /**
   * Count total notifications for a user
   */
  async count(userId, isRead) {
    const query = { userId };
    if (typeof isRead === "boolean") {
      query.isRead = isRead;
    }
    return await Notification.countDocuments(query);
  }

  /**
   * Delete old notifications (for maintenance)
   */
  async deleteOlderThan(days) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    
    return await Notification.deleteMany({
      createdAt: { $lt: date },
    });
  }
}

export const notificationRepository = new NotificationRepository();


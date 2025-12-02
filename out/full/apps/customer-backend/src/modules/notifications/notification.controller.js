// apps/customer-backend/src/modules/notifications/notification.controller.js
import { notificationService } from "./notification.service.js";
// ❌ Đã gỡ bỏ import asyncHandler

export class NotificationController {
  /**
   * @route   GET /api/notifications
   * @desc    Get user's notifications with pagination
   * @access  Private
   */
  getNotifications = async (req, res, next) => {
    try {
      const userId = req.user._id;
      const { page = 1, limit = 20, isRead } = req.query;

      // Convert isRead to boolean if provided
      let isReadFilter;
      if (isRead === "true") isReadFilter = true;
      else if (isRead === "false") isReadFilter = false;

      const result = await notificationService.getUserNotifications(userId, {
        page,
        limit,
        isRead: isReadFilter,
      });

      return res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
        unreadCount: result.unreadCount,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @route   GET /api/notifications/unread-count
   * @desc    Get unread notification count
   * @access  Private
   */
  getUnreadCount = async (req, res, next) => {
    try {
      const userId = req.user._id;
      const count = await notificationService.getUnreadCount(userId);

      return res.status(200).json({
        success: true,
        data: { count },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @route   PUT /api/notifications/:id/read
   * @desc    Mark a notification as read
   * @access  Private
   */
  markAsRead = async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user._id;

      const notification = await notificationService.markAsRead(id, userId);

      return res.status(200).json({
        success: true,
        message: "Đã đánh dấu thông báo là đã đọc",
        data: notification,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @route   PUT /api/notifications/read-all
   * @desc    Mark all notifications as read
   * @access  Private
   */
  markAllAsRead = async (req, res, next) => {
    try {
      const userId = req.user._id;

      const result = await notificationService.markAllAsRead(userId);

      return res.status(200).json({
        success: true,
        message: "Đã đánh dấu tất cả thông báo là đã đọc",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}


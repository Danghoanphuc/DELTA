// apps/customer-backend/src/modules/notifications/notification.routes.js
import { Router } from "express";
import { NotificationController } from "./notification.controller.js";
import { protect } from "../../shared/middleware/index.js";

const router = Router();
const notificationController = new NotificationController();

// All routes require authentication
router.use(protect);

/**
 * @route   GET /api/notifications
 * @desc    Get user's notifications with pagination
 * @query   page, limit, isRead (true|false)
 * @access  Private
 */
router.get("/", notificationController.getNotifications);

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Get unread notification count
 * @access  Private
 */
router.get("/unread-count", notificationController.getUnreadCount);

/**
 * @route   PUT /api/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.put("/read-all", notificationController.markAllAsRead);

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Mark a notification as read
 * @access  Private
 */
router.put("/:id/read", notificationController.markAsRead);

export default router;


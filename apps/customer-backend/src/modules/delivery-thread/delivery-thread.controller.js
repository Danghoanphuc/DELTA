// apps/customer-backend/src/modules/delivery-thread/delivery-thread.controller.js
/**
 * Delivery Thread Controller
 * HTTP handlers for delivery thread endpoints
 */

import { DeliveryThreadService } from "./delivery-thread.service.js";
import { ApiResponse } from "../../shared/utils/index.js";
import { API_CODES } from "../../shared/constants/index.js";
import { THREAD_PARTICIPANT_ROLE } from "./delivery-thread.model.js";

export class DeliveryThreadController {
  constructor() {
    this.service = new DeliveryThreadService();
  }

  /**
   * Get or create thread for a check-in
   * @route GET /api/delivery-threads/checkin/:checkinId
   */
  getThreadByCheckin = async (req, res, next) => {
    try {
      const { checkinId } = req.params;
      const userId = req.user._id;
      const userRole = this.getUserRole(req.user);

      const thread = await this.service.getThreadByCheckin(
        checkinId,
        userId,
        userRole
      );

      // ✅ FIX: Auto-add admin to thread when they access it
      if (userRole === THREAD_PARTICIPANT_ROLE.ADMIN) {
        await this.service.addAdminToThread(
          thread._id,
          userId,
          req.user.displayName || "Admin Support"
        );
      }

      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ thread }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get or create thread for an order (order-level chat)
   * @route GET /api/order-threads/:orderId
   */
  getThreadByOrder = async (req, res, next) => {
    try {
      const { orderId } = req.params;
      const userId = req.user._id;
      const userRole = this.getUserRole(req.user);

      const thread = await this.service.getThreadByOrder(
        orderId,
        userId,
        userRole
      );

      // ✅ Auto-add admin to thread when they access it
      if (userRole === THREAD_PARTICIPANT_ROLE.ADMIN) {
        await this.service.addAdminToThread(
          thread._id,
          userId,
          req.user.displayName || "Admin Support"
        );
      }

      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ thread }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get thread by ID
   * @route GET /api/delivery-threads/:threadId
   */
  getThread = async (req, res, next) => {
    try {
      const { threadId } = req.params;
      const userId = req.user._id;
      const userRole = this.getUserRole(req.user);

      // ✅ FIX: Auto-add admin to thread when they access it
      if (userRole === THREAD_PARTICIPANT_ROLE.ADMIN) {
        await this.service.addAdminToThread(
          threadId,
          userId,
          req.user.displayName || "Admin Support"
        );
      }

      const thread = await this.service.getThread(threadId, userId, userRole);

      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ thread }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Add message to thread
   * @route POST /api/delivery-threads/:threadId/messages
   */
  addMessage = async (req, res, next) => {
    try {
      const { threadId } = req.params;
      const userId = req.user._id;
      const userRole = this.getUserRole(req.user);

      const messageData = {
        ...req.body,
        senderName: req.user.displayName || req.user.email,
      };

      const thread = await this.service.addMessage(
        threadId,
        userId,
        userRole,
        messageData
      );

      res
        .status(API_CODES.CREATED)
        .json(ApiResponse.success({ thread }, "Đã gửi tin nhắn"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update message
   * @route PUT /api/delivery-threads/:threadId/messages/:messageId
   */
  updateMessage = async (req, res, next) => {
    try {
      const { threadId, messageId } = req.params;
      const { content } = req.body;
      const userId = req.user._id;
      const userRole = this.getUserRole(req.user);

      const thread = await this.service.updateMessage(
        threadId,
        messageId,
        userId,
        userRole,
        content
      );

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ thread }, "Đã cập nhật tin nhắn"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete message
   * @route DELETE /api/delivery-threads/:threadId/messages/:messageId
   */
  deleteMessage = async (req, res, next) => {
    try {
      const { threadId, messageId } = req.params;
      const userId = req.user._id;
      const userRole = this.getUserRole(req.user);

      const thread = await this.service.deleteMessage(
        threadId,
        messageId,
        userId,
        userRole
      );

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ thread }, "Đã xóa tin nhắn"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Mark thread as read
   * @route POST /api/delivery-threads/:threadId/read
   */
  markAsRead = async (req, res, next) => {
    try {
      const { threadId } = req.params;
      const userId = req.user._id;
      const userRole = this.getUserRole(req.user);

      const thread = await this.service.markAsRead(threadId, userId, userRole);

      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ thread }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get threads for current user
   * @route GET /api/delivery-threads
   */
  getThreads = async (req, res, next) => {
    try {
      const userId = req.user._id;
      const userRole = this.getUserRole(req.user);
      const { page, limit } = req.query;

      const options = {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
      };

      let result;
      if (userRole === THREAD_PARTICIPANT_ROLE.CUSTOMER) {
        // For organization, get by organization ID
        result = await this.service.getOrganizationThreads(userId, options);
      } else {
        // For shipper/admin, get by participant
        result = await this.service.getUserThreads(userId, options);
      }

      res.status(API_CODES.SUCCESS).json(ApiResponse.success(result));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get unread count
   * @route GET /api/delivery-threads/unread-count
   */
  getUnreadCount = async (req, res, next) => {
    try {
      const userId = req.user._id;

      const count = await this.service.getUnreadCount(userId);

      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ count }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Helper: Determine user role from request
   */
  getUserRole(user) {
    if (user.organizationProfileId) {
      return THREAD_PARTICIPANT_ROLE.CUSTOMER;
    }
    if (user.role === "admin") {
      return THREAD_PARTICIPANT_ROLE.ADMIN;
    }
    return THREAD_PARTICIPANT_ROLE.SHIPPER;
  }
}

// apps/customer-backend/src/controllers/message.controller.js
// Message Controller - HTTP Request Handlers

import { MessageService } from "../services/message.service.js";
import { ApiResponse } from "../shared/utils/api-response.util.js";
import { API_CODES } from "../shared/constants/api-codes.constants.js";

/**
 * Message Controller
 * Handles HTTP requests for threaded messages
 */
export class MessageController {
  constructor() {
    this.messageService = new MessageService();
  }

  /**
   * Send a new message in a thread
   * @route POST /api/threads/:threadId/messages
   */
  sendMessage = async (req, res, next) => {
    try {
      const userId = req.user._id;
      const { threadId } = req.params;
      const data = req.body;

      const message = await this.messageService.sendMessage(
        userId,
        threadId,
        data
      );

      res
        .status(API_CODES.CREATED)
        .json(ApiResponse.success({ message }, "Đã gửi tin nhắn!"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Send a reply to a message
   * @route POST /api/messages/:messageId/reply
   */
  sendReply = async (req, res, next) => {
    try {
      const userId = req.user._id;
      const { messageId } = req.params;
      const data = req.body;

      const message = await this.messageService.sendReply(
        userId,
        messageId,
        data
      );

      res
        .status(API_CODES.CREATED)
        .json(ApiResponse.success({ message }, "Đã gửi reply!"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Edit a message
   * @route PUT /api/messages/:messageId
   */
  editMessage = async (req, res, next) => {
    try {
      const userId = req.user._id;
      const { messageId } = req.params;
      const { content } = req.body;

      const message = await this.messageService.editMessage(
        userId,
        messageId,
        content
      );

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ message }, "Đã chỉnh sửa tin nhắn!"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete a message
   * @route DELETE /api/messages/:messageId
   */
  deleteMessage = async (req, res, next) => {
    try {
      const userId = req.user._id;
      const { messageId } = req.params;

      await this.messageService.deleteMessage(userId, messageId);

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success(null, "Đã xóa tin nhắn!"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get messages in a thread
   * @route GET /api/threads/:threadId/messages
   */
  getMessages = async (req, res, next) => {
    try {
      const userId = req.user._id;
      const { threadId } = req.params;
      const { page, limit, sortBy } = req.query;

      const result = await this.messageService.getMessages(userId, threadId, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 50,
        sortBy: sortBy || "createdAt",
      });

      res.status(API_CODES.SUCCESS).json(ApiResponse.success(result));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get replies to a message
   * @route GET /api/messages/:messageId/replies
   */
  getReplies = async (req, res, next) => {
    try {
      const userId = req.user._id;
      const { messageId } = req.params;
      const { page, limit } = req.query;

      const result = await this.messageService.getReplies(userId, messageId, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
      });

      res.status(API_CODES.SUCCESS).json(ApiResponse.success(result));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Mark message as read
   * @route POST /api/messages/:messageId/read
   */
  markAsRead = async (req, res, next) => {
    try {
      const userId = req.user._id;
      const { messageId } = req.params;

      await this.messageService.markAsRead(userId, messageId);

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success(null, "Đã đánh dấu đã đọc!"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Mark all messages in thread as read
   * @route POST /api/threads/:threadId/messages/read-all
   */
  markThreadAsRead = async (req, res, next) => {
    try {
      const userId = req.user._id;
      const { threadId } = req.params;

      const result = await this.messageService.markThreadAsRead(
        userId,
        threadId
      );

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success(result, "Đã đánh dấu tất cả đã đọc!"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get unread count for thread
   * @route GET /api/threads/:threadId/unread-count
   */
  getUnreadCount = async (req, res, next) => {
    try {
      const userId = req.user._id;
      const { threadId } = req.params;

      const count = await this.messageService.getUnreadCount(userId, threadId);

      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ count }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Upload attachment
   * @route POST /api/threads/:threadId/attachments
   */
  uploadAttachment = async (req, res, next) => {
    try {
      const userId = req.user._id;
      const { threadId } = req.params;
      const file = req.file; // Assuming multer middleware

      if (!file) {
        return res
          .status(API_CODES.BAD_REQUEST)
          .json(ApiResponse.error("Vui lòng chọn file để upload"));
      }

      const attachment = await this.messageService.uploadAttachment(
        file,
        threadId,
        userId
      );

      res
        .status(API_CODES.CREATED)
        .json(ApiResponse.success({ attachment }, "Đã upload file!"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Generate link preview
   * @route POST /api/messages/link-preview
   */
  generateLinkPreview = async (req, res, next) => {
    try {
      const { url } = req.body;

      if (!url) {
        return res
          .status(API_CODES.BAD_REQUEST)
          .json(ApiResponse.error("Vui lòng cung cấp URL"));
      }

      const preview = await this.messageService.generateLinkPreview(url);

      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ preview }));
    } catch (error) {
      next(error);
    }
  };
}

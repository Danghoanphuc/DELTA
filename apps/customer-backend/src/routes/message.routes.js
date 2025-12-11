// apps/customer-backend/src/routes/message.routes.js
// Message Routes

import { Router } from "express";
import { MessageController } from "../controllers/message.controller.js";
import { authenticate } from "../shared/middleware/index.js";

const router = Router();
const controller = new MessageController();

// All routes require authentication
router.use(authenticate);

// ===== Thread Messages =====

/**
 * @route   POST /api/threads/:threadId/messages
 * @desc    Send a new message in a thread
 * @access  Private (Participants only)
 */
router.post("/threads/:threadId/messages", controller.sendMessage);

/**
 * @route   GET /api/threads/:threadId/messages
 * @desc    Get messages in a thread
 * @access  Private (Participants only)
 */
router.get("/threads/:threadId/messages", controller.getMessages);

/**
 * @route   POST /api/threads/:threadId/messages/read-all
 * @desc    Mark all messages in thread as read
 * @access  Private (Participants only)
 */
router.post(
  "/threads/:threadId/messages/read-all",
  controller.markThreadAsRead
);

/**
 * @route   GET /api/threads/:threadId/unread-count
 * @desc    Get unread message count for thread
 * @access  Private (Participants only)
 */
router.get("/threads/:threadId/unread-count", controller.getUnreadCount);

/**
 * @route   POST /api/threads/:threadId/attachments
 * @desc    Upload attachment to thread
 * @access  Private (Participants only)
 */
router.post("/threads/:threadId/attachments", controller.uploadAttachment);

// ===== Individual Messages =====

/**
 * @route   POST /api/messages/:messageId/reply
 * @desc    Send a reply to a message
 * @access  Private (Participants only)
 */
router.post("/messages/:messageId/reply", controller.sendReply);

/**
 * @route   PUT /api/messages/:messageId
 * @desc    Edit a message
 * @access  Private (Message owner only)
 */
router.put("/messages/:messageId", controller.editMessage);

/**
 * @route   DELETE /api/messages/:messageId
 * @desc    Delete a message
 * @access  Private (Message owner only)
 */
router.delete("/messages/:messageId", controller.deleteMessage);

/**
 * @route   GET /api/messages/:messageId/replies
 * @desc    Get replies to a message
 * @access  Private (Participants only)
 */
router.get("/messages/:messageId/replies", controller.getReplies);

/**
 * @route   POST /api/messages/:messageId/read
 * @desc    Mark message as read
 * @access  Private (Participants only)
 */
router.post("/messages/:messageId/read", controller.markAsRead);

// ===== Utilities =====

/**
 * @route   POST /api/messages/link-preview
 * @desc    Generate link preview
 * @access  Private
 */
router.post("/messages/link-preview", controller.generateLinkPreview);

export default router;

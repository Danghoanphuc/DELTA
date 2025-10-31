// src/modules/chat/chat.routes.js (✅ UPDATED - UPLOAD SUPPORT)
import { Router } from "express";
import { ChatController } from "./chat.controller.js";
import { protect, optionalAuth } from "../../shared/middleware/index.js";

const router = Router();
const chatController = new ChatController();

/**
 * @route   POST /api/chat/message
 * @desc    Send a text message (or slash command)
 * @access  Public with optionalAuth
 */
router.post("/message", optionalAuth, chatController.handleChatMessage);

/**
 * ✅ MỚI: Route cho "Drag-and-Drop AI" (Ý tưởng 3)
 * @route   POST /api/chat/upload
 * @desc    Upload a file to chat (image, pdf)
 * @access  Private (yêu cầu đăng nhập để upload)
 */
router.post(
  "/upload",
  protect, // Yêu cầu user đăng nhập để upload
  chatController.handleChatUpload
);

/**
 * @route   GET /api/chat/history
 * @desc    Get chat history
 * @access  Private (requires authentication)
 */
router.get("/history", protect, chatController.getChatHistory);

export default router;

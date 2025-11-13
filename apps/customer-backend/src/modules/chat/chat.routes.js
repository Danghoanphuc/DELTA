// src/modules/chat/chat.routes.js (✅ REFACTORED - MULTI-CONVERSATION)
import { Router } from "express";
import { ChatController } from "./chat.controller.js";
import {
  protect,
  optionalAuth,
  handleUploadError,
} from "../../shared/middleware/index.js";
import { uploadMixed } from "../../infrastructure/storage/multer.config.js";

const router = Router();
const chatController = new ChatController();

/**
 * @route   POST /api/chat/message
 * @desc    Gửi tin nhắn (text, file)
 * @access  Public with optionalAuth (Controller sẽ xử lý guest/auth)
 */
router.post("/message", optionalAuth, chatController.handleChatMessage);

/**
 * @route   POST /api/chat/upload
 * @desc    Tải file lên cho chat (dùng cho frontend)
 * @access  Private (Yêu cầu đăng nhập)
 */
router.post(
  "/upload",
  protect, // Yêu cầu đăng nhập để upload
  uploadMixed.single("file"), // Sử dụng multer config
  handleUploadError,
  chatController.handleChatUpload // Dùng controller handler riêng
);

/**
 * @route   GET /api/chat/conversations
 * @desc    Lấy danh sách (metadata) của tất cả cuộc trò chuyện
 * @access  Private
 */
router.get("/conversations", protect, chatController.getConversations);

/**
 * @route   GET /api/chat/history/:conversationId
 * @desc    Lấy lịch sử tin nhắn của MỘT cuộc trò chuyện
 * @access  Private
 */
router.get(
  "/history/:conversationId",
  protect,
  chatController.getMessagesForConversation
);

/**
 * @route   GET /api/chat/history (DEPRECATED by /conversations)
 * @desc    (Route cũ - không còn dùng)
 */
// router.get("/history", optionalAuth, chatController.getChatHistory);

export default router;

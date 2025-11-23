// apps/customer-backend/src/modules/chat/chat.routes.js
// ✅ FIXED: Added /conversations/group route

import { Router } from "express";
import { ChatController } from "./chat.controller.js";
import { ChatConversationController } from "./chat-conversation.controller.js";
import {
  protect,
  optionalAuth,
  handleUploadError,
} from "../../shared/middleware/index.js";
import { uploadMixed } from "../../infrastructure/storage/multer.config.js";
import { chatRateLimiter } from "../../shared/middleware/rate-limit.middleware.js";

const router = Router();
const chatController = new ChatController();
const conversationController = new ChatConversationController();

// --- MIDDLEWARE PHỤ TRỢ ---
// ✅ Middleware phiên bản "Soi Kính Hiển Vi"
const allowQueryToken = (req, res, next) => {
  // 1. In ra xem server nhận được gì từ trình duyệt
  console.log("🔍 [DEBUG DOWNLOAD] Query received:", req.query);

  // 2. Xử lý token
  if (req.query.t) {
    // Nếu có token t, nhét vào Header
    req.headers.authorization = `Bearer ${req.query.t}`;
    console.log("✅ [DEBUG DOWNLOAD] Đã inject Token vào Header thành công!");
  } else {
    console.log("❌ [DEBUG DOWNLOAD] Không tìm thấy token 't' trong URL!");
  }

  next();
};

// --- MESSAGING ROUTES ---
router.post(
  "/message",
  chatRateLimiter,
  optionalAuth,
  chatController.handleChatMessage
);
router.post(
  "/upload",
  optionalAuth,
  uploadMixed.single("file"),
  handleUploadError,
  chatController.handleChatUpload
);

// --- CONVERSATION MANAGEMENT ---
router.get("/conversations", protect, chatController.getConversations);

router.get(
  "/conversations/:conversationId",
  protect,
  chatController.getConversationById
);

// ✅ ROUTE MỚI: Tạo nhóm (với hỗ trợ avatar upload)
router.post(
  "/conversations/group",
  protect,
  uploadMixed.single("avatar"), // Key 'avatar' phải khớp với FormData từ FE
  handleUploadError,
  chatController.createGroup
);

// ✅ ROUTE MỚI: Cập nhật nhóm (Avatar, Title, Members)
router.patch(
  "/conversations/group/:conversationId",
  protect,
  uploadMixed.single("avatar"), // Key 'avatar' phải khớp với FormData từ FE
  handleUploadError,
  chatController.updateGroup
);

// Social Chat Creators (Single)
router.post(
  "/conversations/printer/:printerId",
  protect,
  conversationController.createOrGetPrinterConversation
);
router.post(
  "/conversations/peer/:userId",
  protect,
  conversationController.createOrGetPeerConversation
);

// ✅ NEW: Đánh dấu tất cả conversations là đã đọc
router.post(
  "/conversations/mark-all-read",
  protect,
  conversationController.markAllConversationsAsRead
);

// --- UTILS ---
router.get(
  "/history/:conversationId",
  protect,
  chatController.getMessagesForConversation
);

// ✅ PROXY DOWNLOAD: Tải file qua server để tránh CORS và lỗi trình duyệt
router.get(
  "/download",
  allowQueryToken, // <--- THÊM CÁI NÀY: Chuyển token từ query string sang header
  protect,
  chatController.proxyDownload
);

// ✅ NEW: Lấy media và files của conversation
router.get(
  "/conversations/:conversationId/media",
  protect,
  chatController.getConversationMedia
);
router.get(
  "/conversations/:conversationId/files",
  protect,
  chatController.getConversationFiles
);
router.get(
  "/conversations/:conversationId/search",
  protect,
  chatController.searchMessages
);
router.patch(
  "/conversations/:conversationId/mute",
  protect,
  chatController.muteConversation
);
router.patch(
  "/conversations/:conversationId",
  protect,
  chatController.renameConversation
);
router.delete(
  "/conversations/:conversationId",
  protect,
  chatController.deleteConversation
);

// ✅ DEAL CLOSER: Business Context & Quote
router.get(
  "/conversations/:conversationId/business-context",
  protect,
  chatController.getBusinessContext
);

router.post(
  "/conversations/:conversationId/quote",
  protect,
  chatController.createQuote
);

// Merge Guest History
router.post("/conversations/merge", protect, async (req, res, next) => {
  try {
    const { guestConversationId } = req.body;
    await chatController.botService.mergeGuestConversation(
      guestConversationId,
      req.user._id
    );
    res.json({ success: true, message: "Merged successfully" });
  } catch (error) {
    next(error);
  }
});

export default router;
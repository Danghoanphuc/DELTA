// apps/customer-backend/src/modules/chat/chat.routes.js
import { Router } from "express";
import { Logger } from "../../shared/utils/index.js";
import {
  protect,
  optionalAuth,
  handleUploadError,
} from "../../shared/middleware/index.js";
import { uploadMixed, uploadMemory } from "../../infrastructure/storage/multer.config.js";
import { chatRateLimiter } from "../../shared/middleware/rate-limit.middleware.js";

// ✅ FIX: IMPORT THẲNG (Bỏ Lazy Load)
import { ChatController } from "./chat.controller.js";
import { ChatConversationController } from "./chat-conversation.controller.js";

const router = Router();

// ✅ TEST ROUTE: Kiểm tra route có hoạt động không
router.get("/test", (req, res) => {
  Logger.info("[ChatRoutes] Test route called");
  res.json({ success: true, message: "Chat routes are working" });
});

// ✅ FIX: KHỞI TẠO LUÔN (Không dùng lazy load)
Logger.info("[ChatRoutes] Initializing ChatController and ChatConversationController...");
const chatController = new ChatController();
const conversationController = new ChatConversationController();
Logger.info("[ChatRoutes] Controllers initialized successfully");

// --- MESSAGING ROUTES ---
router.post(
  "/message",
  chatRateLimiter,
  optionalAuth,
  chatController.handleChatMessage // ✅ FIX: Gọi thẳng
);
router.post(
  "/upload",
  optionalAuth,
  uploadMixed.single("file"),
  handleUploadError,
  chatController.handleChatUpload // ✅ FIX: Gọi thẳng
);

// --- CONVERSATION MANAGEMENT ---
router.get("/conversations", protect, chatController.getConversations); // ✅ FIX: Gọi thẳng

router.get(
  "/conversations/:conversationId",
  protect,
  chatController.getConversationById // ✅ FIX: Gọi thẳng
);

// ✅ ROUTE MỚI: Tạo nhóm (với hỗ trợ avatar upload)
router.post(
  "/conversations/group",
  protect,
  uploadMixed.single("avatar"), // Key 'avatar' phải khớp với FormData từ FE
  handleUploadError,
  conversationController.createGroupConversation // ✅ FIX: Gọi thẳng
);

// ✅ ROUTE MỚI: Cập nhật nhóm (Avatar, Title, Members)
router.patch(
  "/conversations/group/:conversationId",
  protect,
  uploadMixed.single("avatar"), // Key 'avatar' phải khớp với FormData từ FE
  handleUploadError,
  chatController.updateGroup // ✅ FIX: Gọi thẳng (cần kiểm tra method name)
);

// Social Chat Creators (Single)
router.post(
  "/conversations/printer/:printerId",
  protect,
  conversationController.createOrGetPrinterConversation // ✅ FIX: Gọi thẳng
);
router.post(
  "/conversations/peer/:userId",
  protect,
  conversationController.createOrGetPeerConversation // ✅ FIX: Gọi thẳng
);

// ✅ NEW: Đánh dấu tất cả conversations là đã đọc
router.post(
  "/conversations/mark-all-read",
  protect,
  conversationController.markAllConversationsAsRead // ✅ FIX: Gọi thẳng
);

// --- UTILS ---
router.get(
  "/history/:conversationId",
  protect,
  chatController.getMessagesForConversation // ✅ FIX: Gọi thẳng
);

// ✅ PROXY DOWNLOAD: Tải file qua server để tránh CORS và lỗi trình duyệt
router.get(
  "/download",
  protect, // ✅ FIX: CHỈ GIỮ LẠI PROTECT - Token được đọc từ Header
  chatController.proxyDownload // ✅ FIX: Gọi thẳng
);

// ✅ R2 ROUTES (Hybrid Cloud Storage)
router.post(
  "/r2/upload-url",
  protect,
  chatController.getUploadUrl // ✅ FIX: Gọi thẳng
);

router.post(
  "/r2/upload",
  protect,
  uploadMemory.single("file"), // Dùng memory storage để lấy buffer
  handleUploadError,
  chatController.uploadToR2 // ✅ FIX: Gọi thẳng
);

router.get(
  "/r2/download",
  protect, // Vẫn bảo vệ bằng Token của App
  chatController.getR2DownloadUrl // ✅ FIX: Gọi thẳng
);

// ✅ NEW: Lấy media và files của conversation
router.get(
  "/conversations/:conversationId/media",
  protect,
  chatController.getConversationMedia // ✅ FIX: Gọi thẳng
);
router.get(
  "/conversations/:conversationId/files",
  protect,
  chatController.getConversationFiles // ✅ FIX: Gọi thẳng
);
router.get(
  "/conversations/:conversationId/search",
  protect,
  chatController.searchMessages // ✅ FIX: Gọi thẳng
);
router.patch(
  "/conversations/:conversationId/mute",
  protect,
  chatController.muteConversation // ✅ FIX: Gọi thẳng
);
router.patch(
  "/conversations/:conversationId",
  protect,
  chatController.renameConversation // ✅ FIX: Gọi thẳng
);
router.delete(
  "/conversations/:conversationId",
  protect,
  chatController.deleteConversation // ✅ FIX: Gọi thẳng
);

// ✅ DEAL CLOSER: Business Context & Quote
router.get(
  "/conversations/:conversationId/business-context",
  protect,
  chatController.getBusinessContext // ✅ FIX: Gọi thẳng
);

router.post(
  "/conversations/:conversationId/quote",
  protect,
  chatController.createQuote // ✅ FIX: Gọi thẳng
);

// Merge Guest History - TODO: Implement mergeGuestConversation method
// router.post("/conversations/merge", protect, async (req, res, next) => {
//   try {
//     const { guestConversationId } = req.body;
//     const controller = await getChatController();
//     const botService = await controller.getBotService();
//     await botService.mergeGuestConversation(
//       guestConversationId,
//       req.user._id
//     );
//     res.json({ success: true, message: "Merged successfully" });
//   } catch (error) {
//     next(error);
//   }
// });

export default router;
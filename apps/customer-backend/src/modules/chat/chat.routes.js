import { Router } from "express";
import { uploadMixed, uploadMemory } from "../../infrastructure/storage/multer.config.js";
import { protect, optionalAuth, handleUploadError } from "../../shared/middleware/index.js";
import { chatRateLimiter } from "../../shared/middleware/rate-limit.middleware.js";

// ✅ Static Import
import { ChatController } from "./chat.controller.js";
import { ChatConversationController } from "./chat-conversation.controller.js";

const router = Router();

// ✅ Instantiate Controllers
const chatController = new ChatController();
const convController = new ChatConversationController();

// --- Messaging ---
router.post("/message", chatRateLimiter, optionalAuth, chatController.handleChatMessage);
router.post("/stream", chatRateLimiter, optionalAuth, chatController.handleChatStream); // 🚀 NEW: Vercel AI SDK stream endpoint
router.post("/upload", optionalAuth, uploadMixed.single("file"), handleUploadError, chatController.handleChatUpload);

// --- Conversations ---
router.get("/conversations", protect, chatController.getConversations);
router.get("/conversations/:conversationId", protect, chatController.getConversationById);
router.delete("/conversations/:conversationId", protect, chatController.deleteConversation);
router.patch("/conversations/:conversationId", protect, chatController.renameConversation);

// --- Group Chat ---
router.post("/conversations/group", protect, uploadMixed.single("avatar"), handleUploadError, convController.createGroupConversation);
router.patch("/conversations/group/:conversationId", protect, uploadMixed.single("avatar"), handleUploadError, chatController.updateGroup);

// --- Social & Biz Context ---
router.post("/conversations/printer/:printerId", protect, convController.createOrGetPrinterConversation);
router.post("/conversations/peer/:userId", protect, convController.createOrGetPeerConversation);
router.get("/conversations/:conversationId/business-context", protect, chatController.getBusinessContext);
router.post("/conversations/:conversationId/quote", protect, chatController.createQuote);

// --- Utils ---
router.get("/history/:conversationId", protect, chatController.getMessagesForConversation);
router.post("/conversations/mark-all-read", protect, convController.markAllConversationsAsRead);

// --- R2 Storage ---
router.post("/r2/upload-url", protect, chatController.getUploadUrl);
router.post("/r2/upload", protect, uploadMemory.single("file"), handleUploadError, chatController.uploadToR2); // Proxy upload
router.get("/r2/download", protect, chatController.getR2DownloadUrl); // Secure download link

export default router;
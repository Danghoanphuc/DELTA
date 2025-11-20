// apps/customer-backend/src/modules/chat/chat.routes.js
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

// ✅ ROUTE MỚI: Lấy chi tiết 1 conversation (Quan trọng cho F5 Recovery)
router.get(
  "/conversations/:conversationId",
  protect,
  chatController.getConversationById
);

// Social Chat Creators
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

// --- UTILS ---
router.get(
  "/history/:conversationId",
  protect,
  chatController.getMessagesForConversation
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

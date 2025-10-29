// src/modules/chat/chat.routes.js (✅ UPDATED - GUEST CHAT SUPPORT)
import { Router } from "express";
import { ChatController } from "./chat.controller.js";
import { protect, optionalAuth } from "../../shared/middleware/index.js";

const router = Router();
const chatController = new ChatController();

/**
 * Chat Routes
 *
 * ✅ UPDATED Strategy:
 * - POST /message → optionalAuth (guests can chat, but messages won't be saved)
 * - GET /history → protect (only auth users can see history)
 */

/**
 * @route   POST /api/chat/message
 * @desc    Send a message to AI chatbot
 * @access  Public with optionalAuth
 *          - Authenticated users: Messages are saved to database
 *          - Guest users: Get AI response without saving history
 */
router.post("/message", optionalAuth, chatController.handleChatMessage);

/**
 * @route   GET /api/chat/history
 * @desc    Get chat history
 * @access  Private (requires authentication)
 *          Only authenticated users can retrieve saved conversations
 */
router.get("/history", protect, chatController.getChatHistory);

export default router;

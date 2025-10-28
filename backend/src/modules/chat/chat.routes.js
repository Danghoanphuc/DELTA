// src/modules/chat/chat.routes.js
import { Router } from "express";
import { ChatController } from "./chat.controller.js";
import { protect } from "../../shared/middleware/index.js";

const router = Router();
const chatController = new ChatController();

router.use(protect);

router.post("/message", chatController.handleChatMessage);
router.get("/history", chatController.getChatHistory);

export default router;

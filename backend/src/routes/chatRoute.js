// backend/src/routes/chatRoute.js
import express from "express";
import {
  handleChatMessage,
  getChatHistory,
} from "../controllers/chatController.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();

// Cho phép chat không cần đăng nhập (sau sẽ thêm auth)
router.post("/message", protect, handleChatMessage);
router.get("/history", protect, getChatHistory);

export default router;

// backend/src/routes/chatRoute.js
import express from "express";
import {
  handleChatMessage,
  getChatHistory,
} from "../controllers/chatController.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";
const router = express.Router();

// Cho phép chat không cần đăng nhập (sau sẽ thêm auth)
router.post("/message", isAuthenticated, handleChatMessage);
router.get("/history", isAuthenticated, getChatHistory);

export default router;

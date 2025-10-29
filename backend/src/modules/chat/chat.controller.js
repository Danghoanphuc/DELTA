// src/modules/chat/chat.controller.js (✅ UPDATED - GUEST SUPPORT)
import { ChatService } from "./chat.service.js";
import { ApiResponse } from "../../shared/utils/index.js";
import { API_CODES } from "../../shared/constants/index.js";

export class ChatController {
  constructor() {
    this.chatService = new ChatService();
  }

  /**
   * ✅ UPDATED: Handle chat message from both guests and authenticated users
   */
  handleChatMessage = async (req, res, next) => {
    try {
      const isGuest = !req.user;
      const userId = req.user?._id || null;

      console.log(
        `💬 Chat message from ${isGuest ? "GUEST" : "USER " + userId}`
      );

      const response = await this.chatService.handleMessage(
        userId,
        req.body,
        isGuest
      );

      res.status(API_CODES.SUCCESS).json(
        ApiResponse.success({
          ...response,
          isGuest,
          savedToHistory: !isGuest,
          message: isGuest ? "Đăng nhập để lưu lịch sử trò chuyện" : undefined,
        })
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get chat history (only for authenticated users)
   */
  getChatHistory = async (req, res, next) => {
    try {
      const messages = await this.chatService.getHistory(req.user._id);
      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ messages }));
    } catch (error) {
      next(error);
    }
  };
}

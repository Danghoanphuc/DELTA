// src/modules/chat/chat.controller.js (✅ UPDATED - UPLOAD SUPPORT)
import { ChatService } from "./chat.service.js";
import { ApiResponse } from "../../shared/utils/index.js";
import { API_CODES } from "../../shared/constants/index.js";
import { Logger } from "../../shared/utils/index.js"; // ✅ MỚI

export class ChatController {
  constructor() {
    this.chatService = new ChatService();
  }

  /**
   * ✅ UPDATED: Handle text message (standard or slash command)
   */
  handleChatMessage = async (req, res, next) => {
    try {
      const isGuest = !req.user;
      const userId = req.user?._id || null;

      Logger.debug(
        `[ChatCtrl] 💬 Message from ${isGuest ? "GUEST" : "USER " + userId}`
      );

      // 🔥 THAY ĐỔI: Chuyển toàn bộ req.body cho service
      const response = await this.chatService.handleMessage(
        userId,
        req.body, // Gửi cả body (có thể chứa message, latitude, longitude...)
        isGuest
      );

      res.status(API_CODES.SUCCESS).json(
        ApiResponse.success({
          ...response, // Trả về response có cấu trúc (text, cards, quick replies)
          isGuest,
          savedToHistory: !isGuest,
        })
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * ✅ MỚI: Handle file upload (Ý tưởng 3)
   */
  handleChatUpload = async (req, res, next) => {
    try {
      // User đã được xác thực bởi 'protect' middleware
      const userId = req.user._id;

      if (!req.file) {
        return res
          .status(API_CODES.BAD_REQUEST)
          .json(ApiResponse.error("Không có file nào được tải lên."));
      }

      Logger.debug(
        `[ChatCtrl] 📁 File upload from USER ${userId}: ${req.file.path}`
      );

      // Tạo payload đặc biệt cho service
      const body = {
        fileUrl: req.file.path,
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
      };

      const response = await this.chatService.handleMessage(
        userId,
        body,
        false // Không phải guest
      );

      res.status(API_CODES.SUCCESS).json(
        ApiResponse.success({
          ...response,
          isGuest: false,
          savedToHistory: true,
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

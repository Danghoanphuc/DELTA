// src/modules/chat/chat.controller.js (✅ REFACTORED - MULTI-CONVERSATION)
import { ChatService } from "./chat.service.js";
import { ApiResponse } from "../../shared/utils/index.js";
import { API_CODES } from "../../shared/constants/index.js";
import { Logger } from "../../shared/utils/index.js";

export class ChatController {
  constructor() {
    this.chatService = new ChatService();
  }

  /**
   * Xử lý tin nhắn (text)
   */
  handleChatMessage = async (req, res, next) => {
    try {
      const isGuest = !req.user;
      Logger.debug(
        `[ChatCtrl] 💬 Message from ${
          isGuest ? "GUEST" : "USER " + req.user?._id
        }`
      );

      const response = await this.chatService.handleMessage(
        req.user,
        req.body, // body giờ chứa { message, conversationId, latitude, longitude }
        isGuest
      );

      res.status(API_CODES.SUCCESS).json(
        ApiResponse.success({
          ...response,
          isGuest,
        })
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Xử lý tin nhắn (file upload)
   */
  handleChatUpload = async (req, res, next) => {
    try {
      if (!req.file) {
        return res
          .status(API_CODES.BAD_REQUEST)
          .json(ApiResponse.error("Không có file nào được tải lên."));
      }

      Logger.debug(
        `[ChatCtrl] 📁 File upload from USER ${req.user._id}: ${req.file.path}`
      );

      // Tạo payload đặc biệt cho service
      const body = {
        fileUrl: req.file.path,
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
        conversationId: req.body.conversationId || null, // Lấy conversationId từ form-data
      };

      const response = await this.chatService.handleMessage(
        req.user,
        body,
        false // Không phải guest
      );

      res.status(API_CODES.SUCCESS).json(
        ApiResponse.success({
          ...response,
          isGuest: false,
        })
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Lấy danh sách metadata các cuộc trò chuyện
   */
  getConversations = async (req, res, next) => {
    try {
      const conversations = await this.chatService.getConversations(
        req.user._id
      );
      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ conversations }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Lấy tin nhắn của một cuộc trò chuyện cụ thể
   */
  getMessagesForConversation = async (req, res, next) => {
    try {
      const messages = await this.chatService.getMessages(
        req.params.conversationId,
        req.user._id
      );
      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ messages }));
    } catch (error) {
      next(error);
    }
  };
}

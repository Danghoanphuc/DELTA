// src/modules/chat/chat.controller.js
import { ChatService } from "./chat.service.js";
import { ApiResponse } from "../../shared/utils/index.js";
import { API_CODES } from "../../shared/constants/index.js";

export class ChatController {
  constructor() {
    this.chatService = new ChatService();
  }

  handleChatMessage = async (req, res, next) => {
    try {
      const response = await this.chatService.handleMessage(
        req.user._id,
        req.body
      );
      res.status(API_CODES.SUCCESS).json(ApiResponse.success(response));
    } catch (error) {
      next(error);
    }
  };

  getChatHistory = async (req, res, next) => {
    try {
      const messages = await this.chatService.getHistory(req.user._id);
      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ messages }));
    } catch (error) {
      next(error);
    }
  };
}

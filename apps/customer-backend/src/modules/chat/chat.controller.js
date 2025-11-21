import { ChatService } from "./chat.service.js";
import { SocialChatService } from "./social-chat.service.js";
import { Conversation } from "../../shared/models/conversation.model.js";
import { ApiResponse } from "../../shared/utils/index.js";
import { API_CODES } from "../../shared/constants/index.js";
import { NotFoundException } from "../../shared/exceptions/index.js";

export class ChatController {
  constructor() {
    this.botService = new ChatService();
    this.socialService = new SocialChatService();
  }

  handleChatMessage = async (req, res, next) => {
    try {
      const { conversationId } = req.body;
      const isGuest = !req.user;

      // Parse Metadata
      let body = { ...req.body };
      if (body.metadata && typeof body.metadata === "string") {
        try {
          body.metadata = JSON.parse(body.metadata);
        } catch (e) {}
      }

      let isSocialChat = false;

      // ✅ LOGIC PHÂN LUỒNG CHẶT CHẼ HƠN
      if (conversationId) {
        const conversation = await Conversation.findById(conversationId).select(
          "type"
        );
        if (conversation) {
          if (
            ["peer-to-peer", "customer-printer", "group"].includes(
              conversation.type
            )
          ) {
            isSocialChat = true;
          }
        } else {
          // Nếu có ID mà không tìm thấy -> Có thể là lỗi FE gửi ID rác -> Ném lỗi
          throw new NotFoundException("Cuộc trò chuyện không tồn tại");
        }
      }

      let response;
      if (isSocialChat) {
        if (isGuest) throw new Error("Bạn phải đăng nhập để chat Social.");
        // Social Chat Service xử lý
        response = await this.socialService.handleSocialMessage(req.user, body);
      } else {
        // Bot Chat Service xử lý (Bao gồm cả tạo mới nếu không có conversationId)
        response = await this.botService.handleBotMessage(
          req.user,
          body,
          isGuest
        );
      }

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ ...response, isGuest }));
    } catch (error) {
      next(error);
    }
  };

  // ... Giữ nguyên các hàm handleChatUpload, getConversations, getConversationById ...
  handleChatUpload = async (req, res, next) => {
    try {
      if (!req.file)
        return res
          .status(API_CODES.BAD_REQUEST)
          .json(ApiResponse.error("Thiếu file"));
      req.body = {
        ...req.body,
        fileUrl: req.file.path,
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
      };
      return this.handleChatMessage(req, res, next);
    } catch (error) {
      next(error);
    }
  };

  getConversations = async (req, res, next) => {
    try {
      const conversations =
        await this.botService.chatRepository.findConversationsByUserId(
          req.user._id
        );
      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ conversations }));
    } catch (e) {
      next(e);
    }
  };

  getConversationById = async (req, res, next) => {
    try {
      const conversation =
        await this.botService.chatRepository.getConversationMetadata(
          req.params.conversationId,
          req.user._id
        );
      if (!conversation) throw new NotFoundException("Không tìm thấy");
      await conversation.populate(
        "participants.userId",
        "username displayName avatarUrl"
      );
      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ conversation }));
    } catch (e) {
      next(e);
    }
  };

  getMessagesForConversation = async (req, res, next) => {
    try {
      const data = await this.botService.getMessages(
        req.params.conversationId,
        req.user._id,
        req.query
      );
      res.status(API_CODES.SUCCESS).json(ApiResponse.success(data));
    } catch (e) {
      next(e);
    }
  };

  renameConversation = async (req, res, next) => {
    try {
      await this.botService.renameConversation(
        req.params.conversationId,
        req.user._id,
        req.body.title
      );
      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ message: "Ok" }));
    } catch (e) {
      next(e);
    }
  };

  deleteConversation = async (req, res, next) => {
    try {
      await this.botService.deleteConversation(
        req.params.conversationId,
        req.user._id
      );
      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ message: "Deleted" }));
    } catch (e) {
      next(e);
    }
  };
}

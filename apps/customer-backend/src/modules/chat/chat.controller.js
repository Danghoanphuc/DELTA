// apps/customer-backend/src/modules/chat/chat.controller.js
import { ChatService } from "./chat.service.js";
import { SocialChatService } from "./social-chat.service.js";
import { Conversation } from "../../shared/models/conversation.model.js";
import { ApiResponse } from "../../shared/utils/index.js";
import { API_CODES } from "../../shared/constants/index.js";
import { NotFoundException, ForbiddenException } from "../../shared/exceptions/index.js";

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
          throw new NotFoundException("Cuộc trò chuyện không tồn tại");
        }
      }

      let response;
      if (isSocialChat) {
        if (isGuest) throw new Error("Bạn phải đăng nhập để chat Social.");
        response = await this.socialService.handleSocialMessage(req.user, body);
      } else {
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

  // ✅ FIXED: Cho phép lấy TẤT CẢ loại conversation (hoặc filter theo query)
  // Thay vì hardcode "customer-bot"
  getConversations = async (req, res, next) => {
    try {
      // Lấy type từ query param (nếu frontend muốn filter)
      // Nếu không gửi type -> Lấy hết (để hiển thị cả Social lẫn Bot)
      const type = req.query.type || null; 

      const conversations =
        await this.botService.chatRepository.findConversationsByUserId(
          req.user._id,
          type 
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
      // Hàm deleteConversation trong service đã được update thành Soft Delete
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

  getConversationMedia = async (req, res, next) => {
    try {
      const conversation = await Conversation.findById(req.params.conversationId).select("type participants");
      if (!conversation) throw new NotFoundException("Không tìm thấy cuộc trò chuyện");

      const isParticipant = conversation.participants.some(
        (p) => p.userId.toString() === req.user._id.toString()
      );
      if (!isParticipant) throw new NotFoundException("Không có quyền truy cập");

      const media = await this.botService.chatRepository.getMediaFiles(req.params.conversationId);
      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ media }));
    } catch (e) {
      next(e);
    }
  };

  getConversationFiles = async (req, res, next) => {
    try {
      const conversation = await Conversation.findById(req.params.conversationId).select("type participants");
      if (!conversation) throw new NotFoundException("Không tìm thấy cuộc trò chuyện");

      const isParticipant = conversation.participants.some(
        (p) => p.userId.toString() === req.user._id.toString()
      );
      if (!isParticipant) throw new NotFoundException("Không có quyền truy cập");

      const files = await this.botService.chatRepository.getSharedFiles(req.params.conversationId);
      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ files }));
    } catch (e) {
      next(e);
    }
  };

  searchMessages = async (req, res, next) => {
    try {
      const { conversationId } = req.params;
      const { q } = req.query;

      if (!q || q.trim().length === 0) {
        return res.status(API_CODES.SUCCESS).json(ApiResponse.success({ messages: [] }));
      }

      const conversation = await Conversation.findById(conversationId).select("type participants");
      if (!conversation) throw new NotFoundException("Không tìm thấy cuộc trò chuyện");

      const isParticipant = conversation.participants.some(
        (p) => p.userId.toString() === req.user._id.toString()
      );
      if (!isParticipant) throw new NotFoundException("Không có quyền truy cập");

      const messages = await this.botService.chatRepository.searchMessages(conversationId, q.trim());
      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ messages }));
    } catch (e) {
      next(e);
    }
  };

  muteConversation = async (req, res, next) => {
    try {
      const { conversationId } = req.params;
      const { isMuted } = req.body;

      const conversation = await Conversation.findById(conversationId).select("participants");
      if (!conversation) throw new NotFoundException("Không tìm thấy cuộc trò chuyện");

      const isParticipant = conversation.participants.some(
        (p) => p.userId.toString() === req.user._id.toString()
      );
      if (!isParticipant) throw new NotFoundException("Không có quyền truy cập");

      const participant = conversation.participants.find(
        (p) => p.userId.toString() === req.user._id.toString()
      );
      if (participant) {
        participant.isMuted = isMuted;
        await conversation.save();
      }

      res.status(API_CODES.SUCCESS).json(
        ApiResponse.success({ message: isMuted ? "Đã tắt thông báo" : "Đã bật thông báo" })
      );
    } catch (e) {
      next(e);
    }
  };
}
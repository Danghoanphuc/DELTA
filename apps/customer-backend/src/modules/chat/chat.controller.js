// apps/customer-backend/src/modules/chat/chat.controller.js
import { ChatService } from "./chat.service.js";
import { SocialChatService } from "./social-chat.service.js";
import { Conversation } from "../../shared/models/conversation.model.js";
import { ApiResponse, Logger } from "../../shared/utils/index.js";
import { API_CODES } from "../../shared/constants/index.js";
import { NotFoundException } from "../../shared/exceptions/index.js";

export class ChatController {
  constructor() {
    this.botService = new ChatService();
    this.socialService = new SocialChatService();
  }

  /**
   * ✅ ROUTER THÔNG MINH: Điều phối tin nhắn (Bot hoặc Social)
   */
  handleChatMessage = async (req, res, next) => {
    try {
      const { conversationId } = req.body;
      const isGuest = !req.user;

      // 1. Parse Metadata (JSON string fix)
      let body = { ...req.body };
      if (body.metadata && typeof body.metadata === "string") {
        try {
          body.metadata = JSON.parse(body.metadata);
        } catch (e) {
          /* Ignore */
        }
      }

      // 2. Xác định loại hội thoại để chọn Service
      let isSocialChat = false;

      if (conversationId) {
        const conversation = await Conversation.findById(conversationId).select(
          "type"
        );
        // Nếu là P2P hoặc Chat với Nhà in -> Dùng Social Service
        if (
          conversation &&
          (conversation.type === "peer-to-peer" ||
            conversation.type === "customer-printer")
        ) {
          isSocialChat = true;
        }
      }

      // 3. Gọi Service tương ứng
      let response;
      if (isSocialChat) {
        if (isGuest) throw new Error("Bạn phải đăng nhập để chat P2P.");
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

  /**
   * Xử lý upload file (Router tương tự)
   */
  handleChatUpload = async (req, res, next) => {
    try {
      if (!req.file) {
        return res
          .status(API_CODES.BAD_REQUEST)
          .json(ApiResponse.error("Không có file nào được tải lên."));
      }

      // Giả lập body để tái sử dụng logic router
      const body = {
        fileUrl: req.file.path,
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
        conversationId: req.body.conversationId || null,
      };

      // Gán lại body cho request và gọi handleChatMessage
      req.body = body;
      return this.handleChatMessage(req, res, next);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Lấy danh sách conversations
   */
  getConversations = async (req, res, next) => {
    try {
      // Dùng chung repo của botService (vì repo này lấy chung bảng Conversation)
      const conversations =
        await this.botService.chatRepository.findConversationsByUserId(
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
   * ✅ API MỚI: Lấy chi tiết 1 cuộc hội thoại (Để fix lỗi F5 mất chat)
   */
  getConversationById = async (req, res, next) => {
    try {
      const { conversationId } = req.params;
      const userId = req.user._id;

      // Sử dụng hàm có sẵn trong Repo để lấy metadata và check quyền
      const conversation =
        await this.botService.chatRepository.getConversationMetadata(
          conversationId,
          userId
        );

      if (!conversation) {
        throw new NotFoundException(
          "Không tìm thấy cuộc trò chuyện hoặc bạn không có quyền."
        );
      }

      // Populate thông tin user để hiển thị Avatar/Tên
      await conversation.populate(
        "participants.userId",
        "username displayName avatarUrl"
      );

      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ conversation }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Lấy tin nhắn (phân trang)
   */
  getMessagesForConversation = async (req, res, next) => {
    try {
      const messagesData = await this.botService.getMessages(
        req.params.conversationId,
        req.user._id,
        req.query
      );
      res.status(API_CODES.SUCCESS).json(ApiResponse.success(messagesData));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Đổi tên conversation
   */
  renameConversation = async (req, res, next) => {
    try {
      const { conversationId } = req.params;
      const { title } = req.body;

      if (!title || title.trim().length === 0) {
        return res
          .status(API_CODES.BAD_REQUEST)
          .json(ApiResponse.error("Tiêu đề không hợp lệ."));
      }

      await this.botService.renameConversation(
        conversationId,
        req.user._id,
        title.trim()
      );
      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ message: "Đổi tên thành công" }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Xóa conversation
   */
  deleteConversation = async (req, res, next) => {
    try {
      const { conversationId } = req.params;
      await this.botService.deleteConversation(conversationId, req.user._id);
      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ message: "Xóa thành công" }));
    } catch (error) {
      next(error);
    }
  };
}

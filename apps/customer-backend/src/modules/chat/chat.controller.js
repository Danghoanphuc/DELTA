// apps/customer-backend/src/modules/chat/chat.controller.js
import axios from "axios";
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
        "username displayName avatarUrl isOnline" // ✅ THÊM isOnline
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
      const userId = req.user._id;
      const conversationId = req.params.conversationId;

      // 1. Gọi service để Soft Delete trong DB
      await this.socialService.deleteConversation(
        conversationId,
        userId
      );

      // 2. ⚡ FIX CRITICAL: Buộc xóa Cache Redis của user này ngay tại Controller
      // Để đảm bảo dù Service có quên thì Controller vẫn chặn hậu.
      await this.botService.chatRepository.invalidateUserCache(userId);

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ message: "Deleted successfully" }));
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

  createGroup = async (req, res, next) => {
    try {
      const { title, description, members, context } = req.body;
      const creatorId = req.user._id;

      // ✅ FIX: Lấy URL từ Cloudinary storage (path trong req.file khi dùng multer-storage-cloudinary)
      // req.file.path đã chứa URL của file đã upload lên Cloudinary
      const avatarUrl = req.file ? req.file.path : null;

      // Parse members và context nếu gửi dưới dạng JSON string (do FormData)
      let parsedMembers = members;
      if (typeof members === "string") {
        try {
          parsedMembers = JSON.parse(members);
        } catch (e) {
          parsedMembers = [];
        }
      }

      let parsedContext = context;
      if (typeof context === "string") {
        try {
          parsedContext = JSON.parse(context);
        } catch (e) {
          parsedContext = null;
        }
      }

      const conversation = await this.socialService.createGroupConversation({
        title,
        description,
        members: parsedMembers,
        avatarUrl, // ✅ Truyền string URL, không truyền object File
        context: parsedContext,
        creatorId,
      });

      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ conversation }));
    } catch (e) {
      next(e);
    }
  };

  updateGroup = async (req, res, next) => {
    try {
      const { conversationId } = req.params;
      const { title, membersToRemove, membersToAdd } = req.body; // ✅ Nhận membersToAdd
      const avatarFile = req.file; // ✅ Truyền avatarFile object, service sẽ tự xử lý URL

      // Parse JSON arrays từ FormData
      let parsedMembersToRemove = [];
      if (typeof membersToRemove === "string") {
        try {
          parsedMembersToRemove = JSON.parse(membersToRemove);
        } catch (e) {}
      } else if (Array.isArray(membersToRemove)) {
        parsedMembersToRemove = membersToRemove;
      }

      // ✅ Parse membersToAdd
      let parsedMembersToAdd = [];
      if (typeof membersToAdd === "string") {
        try {
          parsedMembersToAdd = JSON.parse(membersToAdd);
        } catch (e) {}
      } else if (Array.isArray(membersToAdd)) {
        parsedMembersToAdd = membersToAdd;
      }

      const updatedConversation = await this.socialService.updateGroupConversation(
        conversationId,
        req.user._id,
        {
          title,
          avatarFile, // ✅ Truyền avatarFile object, service sẽ tự xử lý URL từ multer-storage-cloudinary
          membersToRemove: parsedMembersToRemove,
          membersToAdd: parsedMembersToAdd, // ✅ Truyền xuống service
        }
      );

      // ✅ FIX: Kiểm tra nếu response đã được gửi (tránh lỗi "Cannot set headers after they are sent")
      if (res.headersSent) {
        return;
      }

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ conversation: updatedConversation }));
    } catch (e) {
      // ✅ FIX: Bỏ qua lỗi nếu request đã bị abort hoặc response đã được gửi
      if (e.code === 'ECONNABORTED' || e.message?.includes('aborted') || res.headersSent) {
        return; // Request đã bị hủy, không cần xử lý
      }
      next(e);
    }
  };

  /**
   * ✅ DEAL CLOSER: Lấy Business Context (activeOrders + designFiles)
   */
  getBusinessContext = async (req, res, next) => {
    try {
      const { conversationId } = req.params;
      const userId = req.user._id;

      const context = await this.socialService.getBusinessContext(conversationId, userId);

      res.status(API_CODES.SUCCESS).json(ApiResponse.success(context));
    } catch (e) {
      next(e);
    }
  };

  /**
   * ✅ DEAL CLOSER: Tạo Quick Quote message
   */
  createQuote = async (req, res, next) => {
    try {
      const { conversationId } = req.params;
      const userId = req.user._id;
      const { items, total, note } = req.body;

      const quoteMessage = await this.socialService.createQuoteMessage(
        conversationId,
        userId,
        { items, total, note }
      );

      res.status(API_CODES.SUCCESS).json(
        ApiResponse.success({ message: quoteMessage })
      );
    } catch (e) {
      next(e);
    }
  };

  /**
   * ✅ PROXY DOWNLOAD: Giải pháp tối thượng cho file in ấn
   * Server tải stream từ Cloudinary -> Pipe thẳng về Client
   * Khắc phục: Lỗi CORS, Lỗi Chrome PDF Viewer, Lỗi 401 (nếu cấu hình sign)
   */
  proxyDownload = async (req, res, next) => {
    try {
      const { url, filename } = req.query;

      if (!url) {
        return res.status(400).send("Missing URL");
      }

      // Gọi sang Cloudinary lấy luồng dữ liệu (Stream)
      const response = await axios({
        method: "GET",
        url: url,
        responseType: "stream",
        // Nếu file private, axios server vẫn tải được nếu URL là public
        // Nếu URL private 401, ta cần xử lý ở Preset (Bước 3 bên dưới)
      });

      // Thiết lập Header để ép trình duyệt hiện hộp thoại Save As
      res.setHeader(
        "Content-Disposition",
        `attachment; filename*=UTF-8''${encodeURIComponent(filename || "download.bin")}`
      );
      res.setHeader("Content-Type", response.headers["content-type"] || "application/octet-stream");

      // Nối ống dẫn: Cloudinary -> Server -> Client
      response.data.pipe(res);
    } catch (error) {
      console.error("[Proxy] Download failed:", error.message);
      // Nếu Cloudinary trả về 401/404, báo lỗi rõ ràng
      if (error.response && error.response.status === 401) {
        return res.status(401).json({ message: "File này đã bị khóa hoặc hết hạn." });
      }
      res.status(500).send("Không thể tải file. Vui lòng thử lại.");
    }
  };
}
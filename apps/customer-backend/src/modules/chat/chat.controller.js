// apps/customer-backend/src/modules/chat/chat.controller.js
import axios from "axios";
import { ChatService } from "./chat.service.js";
import { SocialChatService } from "./social-chat.service.js";
import { Conversation } from "../../shared/models/conversation.model.js";
import { ApiResponse } from "../../shared/utils/index.js";
import { API_CODES } from "../../shared/constants/index.js";
import { NotFoundException, ForbiddenException } from "../../shared/exceptions/index.js";
import { Logger } from "../../shared/utils/index.js";
import { r2Service } from "./r2.service.js";

// Import Cloudinary để hỗ trợ tạo Signed URL khi cần
import * as cloudinaryModule from "../../infrastructure/storage/multer.config.js"; 
// Đảm bảo lấy đúng instance v2
const cloudinary = cloudinaryModule.cloudinary || cloudinaryModule.default || cloudinaryModule;

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
   * ✅ API MỚI: Lấy link upload lên R2 (cho file nặng)
   */
  getUploadUrl = async (req, res, next) => {
    try {
      const { fileName, fileType } = req.body;
      
      if (!fileName || !fileType) {
        return res.status(API_CODES.BAD_REQUEST).json(
          ApiResponse.error("Thiếu fileName hoặc fileType")
        );
      }

      const data = await r2Service.getPresignedUploadUrl(fileName, fileType);
      res.status(API_CODES.SUCCESS).json(ApiResponse.success(data));
    } catch (e) {
      next(e);
    }
  };

  /**
   * ✅ API MỚI: Lấy link download/preview từ R2 (Bảo mật)
   * @param {string} key - File key trên R2
   * @param {string} filename - Tên file gốc
   * @param {string} mode - 'inline' (preview) hoặc 'attachment' (download), mặc định 'inline'
   */
  getR2DownloadUrl = async (req, res, next) => {
    try {
      const { key, filename, mode } = req.query;

      if (!key) {
        return res.status(API_CODES.BAD_REQUEST).json(
          ApiResponse.error("Missing file key")
        );
      }

      // Mặc định dùng 'inline' để preview được, nếu muốn download thì truyền mode='attachment'
      const downloadUrl = await r2Service.getPresignedDownloadUrl(
        key,
        filename || "file",
        mode || 'inline'
      );

      // Trả về JSON chứa URL để Frontend dễ xử lý
      res.status(API_CODES.SUCCESS).json(
        ApiResponse.success({ downloadUrl })
      );
    } catch (e) {
      next(e);
    }
  };

  /**
   * ✅ API MỚI: Proxy upload file lên R2 (Tránh CORS)
   */
  uploadToR2 = async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(API_CODES.BAD_REQUEST).json(
          ApiResponse.error("Thiếu file")
        );
      }

      const { fileKey } = req.body;
      if (!fileKey) {
        return res.status(API_CODES.BAD_REQUEST).json(
          ApiResponse.error("Thiếu fileKey")
        );
      }

      // Upload file lên R2 từ buffer
      await r2Service.uploadFile(
        req.file.buffer,
        fileKey,
        req.file.mimetype
      );

      res.status(API_CODES.SUCCESS).json(
        ApiResponse.success({ message: "Upload thành công", fileKey })
      );
    } catch (e) {
      next(e);
    }
  };

  /**
   * ✅ PROXY DOWNLOAD (FINAL FIX):
   * Giữ nguyên Delivery Type (upload/private) khi tạo Signed URL
   * Tải stream từ Cloudinary -> Pipe về Client
   */
  proxyDownload = async (req, res, next) => {
    try {
      const { url, filename } = req.query;

      if (!url) {
        return res.status(400).json(ApiResponse.error("Missing URL"));
      }
      
      // Helper stream file
      const streamFile = async (targetUrl) => {
        Logger.info(`[Proxy Download] Streaming from: ${targetUrl}`);
        
        const response = await axios({
          method: "GET",
          url: targetUrl,
          responseType: "stream",
          headers: { Authorization: undefined } // Bỏ header auth app
        });

        let finalFilename = filename || targetUrl.split('/').pop();
        finalFilename = finalFilename.split('?')[0]; 
        const encodedFilename = encodeURIComponent(finalFilename).replace(/['()]/g, escape).replace(/\*/g, '%2A');

        res.setHeader("Content-Disposition", `attachment; filename*=UTF-8''${encodedFilename}`);
        res.setHeader("Content-Type", response.headers["content-type"] || "application/octet-stream");
        
        if (response.headers["content-length"]) {
          res.setHeader("Content-Length", response.headers["content-length"]);
        }

        response.data.pipe(res);
        
        return new Promise((resolve, reject) => {
          response.data.on('end', resolve);
          response.data.on('error', reject);
        });
      };

      try {
        // Thử tải trực tiếp
        await streamFile(url);
      } catch (error) {
        const isAuthError = error.response && (error.response.status === 401 || error.response.status === 403);
        
        if (isAuthError) {
          Logger.warn(`[Proxy Download] 401 Access Denied. Generating Signed URL for original path...`);

          // 1. Phân tích URL để lấy đúng type gốc
          // Regex match: /resource_type/type/vVersion/public_id
          const regex = /\/(image|video|raw)\/(upload|authenticated|private|fetch)\/(?:v(\d+)\/)?(.+)$/;
          const match = url.match(regex);

          if (match) {
            const resourceType = match[1]; // ví dụ: 'raw'
            const deliveryType = match[2]; // 🔥 QUAN TRỌNG: Lấy đúng type gốc (ví dụ: 'upload')
            const version = match[3];      // ví dụ: '1764050403'
            const publicId = match[4];     // ví dụ: 'printz/design-files/abc.pdf'

            Logger.info(`[Proxy Download] Detected - Resource: ${resourceType}, Type: ${deliveryType}, Ver: ${version}`);

            // 2. Tạo Signed URL giữ nguyên type gốc
            const signedUrl = cloudinary.url(publicId, {
              resource_type: resourceType,
              type: deliveryType, // ✅ Dùng lại type gốc (upload), không ép sang authenticated
              sign_url: true,     // Tự động thêm s--signature--
              auth_token: undefined,
              version: version,
              secure: true
            });

            Logger.info(`[Proxy Download] Retrying with Signed URL: ${signedUrl}`);
            await streamFile(signedUrl);
            return; 
          } else {
            Logger.error(`[Proxy Download] Cannot parse Cloudinary URL: ${url}`);
          }
        }
        
        throw error;
      }

    } catch (error) {
      Logger.error(`[Proxy Download] Final Failure: ${error.message}`);
      
      if (!res.headersSent) {
        // Trả về lỗi 404 chuẩn nếu Cloudinary báo 404
        const status = error.response ? error.response.status : 500;
        const msg = status === 404 ? "File không tồn tại." : "Không thể tải file (Lỗi quyền truy cập).";
        res.status(status).json(ApiResponse.error(msg));
      }
    }
  };
}
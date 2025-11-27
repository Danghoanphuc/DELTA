import { ChatService } from "./chat.service.js";
import { SocialChatService } from "./social-chat.service.js";
import { r2Service } from "./r2.service.js"; // Singleton export
import { ApiResponse, Logger } from "../../shared/utils/index.js";
import { API_CODES } from "../../shared/constants/index.js";
import { Conversation } from "../../shared/models/conversation.model.js";
import { NotFoundException } from "../../shared/exceptions/index.js";
// ✅ STATIC IMPORT: Chuyển từ dynamic import sang static để tránh conflict với Sentry
import { streamText, tool } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod"; // ✅ Dùng zod 3.23.8 (tương thích với Vercel AI SDK v4.x)
import { config } from "../../config/env.config.js";

// ✅ INSTANTIATE ONCE (Singleton)
const chatService = new ChatService();
const socialService = new SocialChatService();

export class ChatController {
  
  handleChatMessage = async (req, res, next) => {
    try {
      const { conversationId } = req.body;
      const isGuest = !req.user;
      
      // Parse metadata if needed
      if (req.body.metadata && typeof req.body.metadata === 'string') {
        try { req.body.metadata = JSON.parse(req.body.metadata); } catch(e){}
      }

      // Check Conversation Type
      let isSocialChat = false;
      if (conversationId) {
        const conv = await Conversation.findById(conversationId).select("type");
        if (conv && ["peer-to-peer", "customer-printer", "group"].includes(conv.type)) {
          isSocialChat = true;
        }
      }

      const response = isSocialChat 
        ? await socialService.handleSocialMessage(req.user, req.body)
        : await chatService.handleBotMessage(req.user, req.body, isGuest);

      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ ...response, isGuest }));
    } catch (error) {
      next(error);
    }
  };

  handleChatUpload = async (req, res, next) => {
    try {
      if (!req.file) return res.status(API_CODES.BAD_REQUEST).json(ApiResponse.error("Thiếu file"));
      
      // ✅ LOG: File upload info (chỉ log thông tin quan trọng)
      Logger.info(`[ChatController] 📎 File upload: ${req.file.originalname}, size=${req.file.size}, type=${req.file.mimetype}`);
      
      req.body = { ...req.body, fileUrl: req.file.path, fileName: req.file.originalname, fileType: req.file.mimetype };
      
      return this.handleChatMessage(req, res, next);
    } catch (error) { 
      Logger.error(`[ChatController] 📎 File upload error:`, error);
      next(error); 
    }
  };

  getConversations = async (req, res, next) => {
    try {
      const type = req.query.type || null;
      const conversations = await chatService.chatRepository.findConversationsByUserId(req.user._id, type);
      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ conversations }));
    } catch (e) { next(e); }
  };

  getConversationById = async (req, res, next) => {
    try {
      const { conversationId } = req.params;
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        throw new NotFoundException("Conversation not found");
      }
      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ conversation }));
    } catch (e) { next(e); }
  };

  deleteConversation = async (req, res, next) => {
    try {
      const { conversationId } = req.params;
      await socialService.deleteConversation(conversationId, req.user._id);
      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ message: "Conversation deleted" }));
    } catch (e) { next(e); }
  };

  renameConversation = async (req, res, next) => {
    try {
      const { conversationId } = req.params;
      const { title } = req.body;
      await socialService.updateGroupConversation(conversationId, req.user._id, { title });
      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ message: "Conversation renamed" }));
    } catch (e) { next(e); }
  };

  updateGroup = async (req, res, next) => {
    try {
      const { conversationId } = req.params;
      const { title, membersToRemove, membersToAdd } = req.body;
      const avatarFile = req.file;
      await socialService.updateGroupConversation(conversationId, req.user._id, {
        title,
        avatarFile,
        membersToRemove,
        membersToAdd,
      });
      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ message: "Group updated" }));
    } catch (e) { next(e); }
  };

  getBusinessContext = async (req, res, next) => {
    try {
      const { conversationId } = req.params;
      const context = await socialService.getBusinessContext(conversationId, req.user._id);
      res.status(API_CODES.SUCCESS).json(ApiResponse.success(context));
    } catch (e) { next(e); }
  };

  createQuote = async (req, res, next) => {
    try {
      const { conversationId } = req.params;
      const quoteData = req.body;
      await socialService.createQuoteMessage(conversationId, req.user._id, quoteData);
      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ message: "Quote created" }));
    } catch (e) { next(e); }
  };

  getMessagesForConversation = async (req, res, next) => {
    try {
      const { conversationId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      
      // ✅ FIX: Dùng getPaginatedMessages thay vì findMessagesByConversationId (không tồn tại)
      const result = await chatService.chatRepository.getPaginatedMessages(conversationId, page, limit);
      res.status(API_CODES.SUCCESS).json(ApiResponse.success(result));
    } catch (e) { next(e); }
  };

  getUploadUrl = async (req, res, next) => {
    try {
      const { fileName, fileType } = req.body;
      const data = await r2Service.getPresignedUploadUrl(fileName, fileType);
      res.status(API_CODES.SUCCESS).json(ApiResponse.success(data));
    } catch (e) { next(e); }
  };

  uploadToR2 = async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(API_CODES.BAD_REQUEST).json(ApiResponse.error("No file provided"));
      }
      
      // ✅ FIX: Dùng fileKey từ formData (từ presigned upload URL) để đảm bảo key khớp
      const fileKeyFromForm = req.body?.fileKey;
      
      if (!fileKeyFromForm) {
        Logger.warn(`[ChatController] R2 upload: No fileKey provided, creating new key`);
        // Fallback: Tạo key mới nếu không có (legacy support)
        const newFileKey = await r2Service.uploadFile(req.file.buffer, req.file.originalname, req.file.mimetype);
        return res.status(API_CODES.SUCCESS).json(ApiResponse.success({ 
          fileKey: newFileKey,
          url: `${req.protocol}://${req.get('host')}/api/chat/r2/download?key=${encodeURIComponent(newFileKey)}&filename=${encodeURIComponent(req.file.originalname)}`
        }));
      }
      
      // ✅ FIX: Upload với fileKey đã có (từ presigned URL) - đảm bảo key khớp với DB
      const fileKey = await r2Service.uploadFileWithKey(
        req.file.buffer, 
        fileKeyFromForm, 
        req.file.mimetype
      );
      
      Logger.info(`[ChatController] R2 upload: fileKey=${fileKey}, fileName=${req.file.originalname}`);
      
      // ✅ FIX: Trả về fileKey để frontend lưu vào DB
      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ 
        fileKey: fileKey,
        url: `${req.protocol}://${req.get('host')}/api/chat/r2/download?key=${encodeURIComponent(fileKey)}&filename=${encodeURIComponent(req.file.originalname)}`
      }));
    } catch (e) { 
      Logger.error(`[ChatController] R2 upload error:`, e.message);
      next(e); 
    }
  };

  getR2DownloadUrl = async (req, res, next) => {
    try {
      const { key, filename, mode } = req.query;
      
      if (!key) {
        Logger.warn(`[ChatController] R2 download: missing key param`);
        return res.status(API_CODES.BAD_REQUEST).json(ApiResponse.error("key parameter is required"));
      }
      
      // ✅ Decode URL-encoded key (giữ nguyên toàn bộ key, không cắt)
      const fileKey = decodeURIComponent(key);
      const finalFileName = filename ? decodeURIComponent(filename) : fileKey.split('/').pop() || 'file';
      const finalMode = mode || 'inline';
      
      Logger.info(`[ChatController] R2 download: key=${fileKey}, filename=${finalFileName}, mode=${finalMode}`);
      
      // ✅ FIX: Truyền filename và mode vào getPresignedDownloadUrl
      const presignedUrl = await r2Service.getPresignedDownloadUrl(fileKey, finalFileName, finalMode);
      
      Logger.info(`[ChatController] R2 download: Generated presigned URL for key=${fileKey.substring(0, 50)}...`);
      
      // ✅ FIX: Trả về JSON với downloadUrl (thay vì redirect) để frontend có thể xử lý
      // Frontend có thể dùng URL này để preview (inline) hoặc download (attachment)
      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ 
        downloadUrl: presignedUrl,
        fileKey,
        filename: finalFileName,
        mode: finalMode
      }));
    } catch (e) { 
      Logger.error(`[ChatController] R2 download error:`, e.message);
      if (e.message?.includes('NoSuchKey') || e.message?.includes('does not exist')) {
        Logger.error(`[ChatController] R2 download: File key does not exist in bucket. Key=${req.query.key}`);
        return res.status(API_CODES.NOT_FOUND).json(ApiResponse.error("File not found in storage"));
      }
      res.status(API_CODES.INTERNAL_ERROR).json(ApiResponse.error("Failed to generate download URL: " + e.message));
    }
  };

  /**
   * 🚀 NÂNG CẤP: Stream thông minh với Tools support
   * POST /chat/stream
   * Sử dụng Vercel AI SDK để tự động xử lý Function Calling
   */
  handleChatStream = async (req, res, next) => {
    try {
      // ✅ STATIC IMPORT: Đã import ở đầu file, không cần dynamic import nữa
      const { messages, conversationId } = req.body;
      const user = req.user;
      const isGuest = !user;

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(API_CODES.BAD_REQUEST).json(ApiResponse.error("Messages array is required"));
      }

      // Lấy tin nhắn cuối cùng (user message)
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role !== "user") {
        return res.status(API_CODES.BAD_REQUEST).json(ApiResponse.error("Last message must be from user"));
      }

      // 1. Setup Context & Conversation như cũ
      let conversation = conversationId
        ? await chatService.chatRepository.findConversationById(conversationId, user?._id)
        : null;

      let isNewConversation = false;
      if (!conversation) {
        conversation = await chatService.chatRepository.createConversation(user?._id);
        isNewConversation = true;
        
        // 🔥 WOW FIX: Bắn Socket conversation_created NGAY LẬP TỨC
        if (user?._id) {
          try {
            const { socketService } = await import("../../infrastructure/realtime/pusher.service.js");
            await conversation.populate("participants.userId", "username displayName avatarUrl isOnline");
            const conversationToEmit = conversation.toObject ? conversation.toObject() : conversation;
            const formattedConversation = {
              ...conversationToEmit,
              _id: conversationToEmit._id?.toString() || conversationToEmit._id,
              title: conversationToEmit.title || "Đoạn chat mới",
              type: conversationToEmit.type || "customer-bot",
              createdAt: conversationToEmit.createdAt || new Date().toISOString(),
              updatedAt: conversationToEmit.updatedAt || new Date().toISOString(),
              lastMessageAt: conversationToEmit.lastMessageAt || null,
              isActive: conversationToEmit.isActive !== undefined ? conversationToEmit.isActive : true
            };
            Logger.info(`[ChatController] 🔥 Emitting conversation_created to user ${user._id}, conversationId: ${formattedConversation._id}`);
            socketService.emitToUser(user._id.toString(), 'conversation_created', formattedConversation);
          } catch (emitError) {
            Logger.error("[ChatController] Failed to emit conversation_created:", emitError);
          }
        }
      }

      // 2. Lưu tin nhắn User
      await chatService.chatRepository.createMessage({
        conversationId: conversation._id,
        senderType: "User",
        sender: user?._id || null,
        content: { text: lastMessage.content },
        type: "text",
      });

      // 3. Setup context cho tools
      const context = {
        user,
        actorId: user?._id || null,
        actorType: isGuest ? "Guest" : "User",
        conversationId: conversation._id.toString(),
      };

      // 4. Định nghĩa Tools bằng Zod (Chuẩn nhất với Vercel AI SDK)
      const tools = {
        find_products: tool({
          description: "Tìm kiếm sản phẩm in ấn (áo thun, card visit, tờ rơi...).",
          parameters: z.object({
            search_query: z.string().describe("Tên sản phẩm cần tìm"),
          }),
          execute: async ({ search_query }) => {
            Logger.info(`[ChatController] 🔧 Tool: find_products - ${search_query}`);
            const result = await chatService.agent.toolService._find_products({ search_query });
            return typeof result === "string" ? result : JSON.stringify(result);
          },
        }),

        find_printers: tool({
          description: "Tìm kiếm nhà in, tiệm in theo tên hoặc địa điểm.",
          parameters: z.object({
            search_query: z.string().describe("Từ khóa (tên nhà in, địa điểm)"),
          }),
          execute: async ({ search_query }) => {
            Logger.info(`[ChatController] 🔧 Tool: find_printers - ${search_query}`);
            const result = await chatService.agent.toolService._find_printers({ search_query }, context);
            return typeof result === "string" ? result : JSON.stringify(result);
          },
        }),

        get_recent_orders: tool({
          description: "Lấy danh sách đơn hàng gần đây của user.",
          parameters: z.object({}), // Object rỗng cho hàm không tham số
          execute: async () => {
            Logger.info(`[ChatController] 🔧 Tool: get_recent_orders`);
            const result = await chatService.agent.toolService._get_recent_orders(context);
            return typeof result === "string" ? result : JSON.stringify(result);
          },
        }),

        suggest_value_added_services: tool({
          description: "Gợi ý dịch vụ gia tăng (VAS).",
          parameters: z.object({
            role: z.enum(["designer", "business_owner", "customer"]).describe("Vai trò của user"),
          }),
          execute: async ({ role }) => {
            Logger.info(`[ChatController] 🔧 Tool: suggest_value_added_services - ${role}`);
            const result = await chatService.agent.toolService._suggest_value_added_services({ role });
            return typeof result === "string" ? result : JSON.stringify(result);
          },
        }),
      };

      // 5. Kiểm tra OpenAI API key
      if (!config.apiKeys?.openai) {
        Logger.error("[ChatController] OpenAI API key is not configured");
        res.status(API_CODES.INTERNAL_ERROR).json(ApiResponse.error("AI service is not available"));
        return;
      }

      // 6. Khởi tạo OpenAI provider với API key
      const openaiProvider = createOpenAI({
        apiKey: config.apiKeys.openai,
      });

      // 7. Gọi AI Stream với Tools (v4.x cần await)
      const result = await streamText({
        model: openaiProvider("gpt-4o-mini"), // Dùng model nhẹ cho nhanh
        system: "Bạn là Zin, trợ lý AI của Printz.vn. Bạn giúp user tìm sản phẩm, nhà in. Trước khi trả lời, hãy suy nghĩ trong thẻ <think>...</think> nếu cần thiết.",
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        tools, // 👈 Inject Tools vào đây
        maxSteps: 5, // Cho phép AI gọi tool tối đa 5 bước (VD: Tìm sp -> Không thấy -> Tìm lại)
        async onFinish({ text, toolCalls, toolResults }) {
          // 8. Lưu kết quả AI vào DB khi stream xong
          try {
            // Detect message type dựa trên tool calls
            let messageType = "text";
            if (toolCalls && toolCalls.length > 0) {
              const toolNames = toolCalls.map((tc) => tc.toolName);
              if (toolNames.includes("find_products")) {
                messageType = "product_selection";
              } else if (toolNames.includes("find_printers")) {
                messageType = "printer_selection";
              } else if (toolNames.includes("get_recent_orders")) {
                messageType = "order_selection";
              }
            }

            await chatService.chatRepository.createMessage({
              conversationId: conversation._id,
              senderType: "AI",
              sender: null,
              content: { text: text || "" },
              type: messageType,
            });

            Logger.info(`[ChatController] Stream completed for conversation: ${conversation._id}, toolCalls: ${toolCalls?.length || 0}`);

            // 🔥 WOW FIX: Emit conversation_updated sau khi lưu message xong
            if (user?._id) {
              try {
                const { socketService } = await import("../../infrastructure/realtime/pusher.service.js");
                
                // Reload conversation để lấy lastMessageAt mới nhất
                const updatedConversation = await chatService.chatRepository.findConversationById(conversation._id, user._id);
                if (updatedConversation) {
                  await updatedConversation.populate("participants.userId", "username displayName avatarUrl isOnline");
                  const conversationToEmit = updatedConversation.toObject ? updatedConversation.toObject() : updatedConversation;
                  const formattedConversation = {
                    ...conversationToEmit,
                    _id: conversationToEmit._id?.toString() || conversationToEmit._id,
                    title: conversationToEmit.title || "Đoạn chat mới",
                    type: conversationToEmit.type || "customer-bot",
                    createdAt: conversationToEmit.createdAt || new Date().toISOString(),
                    updatedAt: conversationToEmit.updatedAt || new Date().toISOString(),
                    lastMessageAt: conversationToEmit.lastMessageAt || null,
                    isActive: conversationToEmit.isActive !== undefined ? conversationToEmit.isActive : true
                  };
                  
                  // Emit conversation_updated để frontend update sidebar
                  socketService.emitToUser(user._id.toString(), 'conversation_updated', formattedConversation);
                  
                  // 🔥 WOW FIX: Trigger Auto-Naming chạy ngầm (Fire & Forget)
                  // Chỉ chạy nếu là đoạn chat mới hoặc chưa có tên custom
                  if (isNewConversation || !updatedConversation.title || updatedConversation.title === "Đoạn chat mới") {
                    const userMessage = lastMessage.content || "";
                    // Gọi private method qua reflection (hoặc tạo public method)
                    if (typeof chatService._generateWowTitle === 'function') {
                      chatService._generateWowTitle(conversation._id, user._id, userMessage, text).catch((e) => {
                        Logger.error("[ChatController] Auto-title failed silently", e);
                      });
                    }
                  }
                }
              } catch (emitError) {
                Logger.error("[ChatController] Failed to emit conversation_updated:", emitError);
              }
            }
          } catch (error) {
            Logger.error("[ChatController] Error saving AI message:", error);
          }
        },
      });

      // 9. Pipe stream thẳng về client (Vercel AI SDK v4.x dùng pipeDataStreamToResponse)
      result.pipeDataStreamToResponse(res, {
        headers: {
          // ✅ Dùng text/plain cho v4 để tránh buffering
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      });
    } catch (error) {
      Logger.error("[ChatController] Stream error:", error);
      if (!res.headersSent) {
        res.status(API_CODES.INTERNAL_ERROR).json(ApiResponse.error(error.message));
      } else {
        res.end();
      }
    }
  };
}
import { ChatService } from "./chat.service.js";
import { SocialChatService } from "./social-chat.service.js";
import { r2Service } from "./r2.service.js";
import { ApiResponse, Logger } from "../../shared/utils/index.js";
import { API_CODES } from "../../shared/constants/index.js";
import { Conversation } from "../../shared/models/conversation.model.js";
import { NotFoundException } from "../../shared/exceptions/index.js";

// ✅ AI SDK Imports
import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { config } from "../../config/env.config.js";

// ✅ Instantiate Services (Singleton)
const chatService = new ChatService();
const socialService = new SocialChatService();

export class ChatController {
  // =========================================================================
  // 1. STANDARD CHAT HANDLERS (Giữ nguyên logic cũ)
  // =========================================================================

  handleChatMessage = async (req, res, next) => {
    try {
      const { conversationId } = req.body;
      const isGuest = !req.user;

      // Parse metadata nếu là string (do formData gửi lên)
      if (req.body.metadata && typeof req.body.metadata === "string") {
        try {
          req.body.metadata = JSON.parse(req.body.metadata);
        } catch (e) {}
      }

      // Check Conversation Type để route sang Social hoặc Bot
      let isSocialChat = false;
      if (conversationId) {
        const conv = await Conversation.findById(conversationId).select("type");
        if (
          conv &&
          ["peer-to-peer", "customer-printer", "group"].includes(conv.type)
        ) {
          isSocialChat = true;
        }
      }

      const response = isSocialChat
        ? await socialService.handleSocialMessage(req.user, req.body)
        : await chatService.handleBotMessage(req.user, req.body, isGuest);

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

      Logger.info(
        `[ChatController] 📎 File upload: ${req.file.originalname}, size=${req.file.size}, type=${req.file.mimetype}`
      );

      req.body = {
        ...req.body,
        fileUrl: req.file.path,
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
      };

      return this.handleChatMessage(req, res, next);
    } catch (error) {
      Logger.error(`[ChatController] 📎 File upload error:`, error);
      next(error);
    }
  };

  getConversations = async (req, res, next) => {
    try {
      const type = req.query.type || null;
      const conversations =
        await chatService.chatRepository.findConversationsByUserId(
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
      const { conversationId } = req.params;
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        throw new NotFoundException("Conversation not found");
      }
      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ conversation }));
    } catch (e) {
      next(e);
    }
  };

  deleteConversation = async (req, res, next) => {
    try {
      const { conversationId } = req.params;
      await socialService.deleteConversation(conversationId, req.user._id);
      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ message: "Conversation deleted" }));
    } catch (e) {
      next(e);
    }
  };

  renameConversation = async (req, res, next) => {
    try {
      const { conversationId } = req.params;
      const { title } = req.body;
      await socialService.updateGroupConversation(
        conversationId,
        req.user._id,
        { title }
      );
      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ message: "Conversation renamed" }));
    } catch (e) {
      next(e);
    }
  };

  updateGroup = async (req, res, next) => {
    try {
      const { conversationId } = req.params;
      const { title, membersToRemove, membersToAdd } = req.body;
      const avatarFile = req.file;
      await socialService.updateGroupConversation(
        conversationId,
        req.user._id,
        {
          title,
          avatarFile,
          membersToRemove,
          membersToAdd,
        }
      );
      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ message: "Group updated" }));
    } catch (e) {
      next(e);
    }
  };

  getBusinessContext = async (req, res, next) => {
    try {
      const { conversationId } = req.params;
      const context = await socialService.getBusinessContext(
        conversationId,
        req.user._id
      );
      res.status(API_CODES.SUCCESS).json(ApiResponse.success(context));
    } catch (e) {
      next(e);
    }
  };

  createQuote = async (req, res, next) => {
    try {
      const { conversationId } = req.params;
      const quoteData = req.body;
      await socialService.createQuoteMessage(
        conversationId,
        req.user._id,
        quoteData
      );
      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ message: "Quote created" }));
    } catch (e) {
      next(e);
    }
  };

  getMessagesForConversation = async (req, res, next) => {
    try {
      const { conversationId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;

      const result = await chatService.chatRepository.getPaginatedMessages(
        conversationId,
        page,
        limit
      );
      res.status(API_CODES.SUCCESS).json(ApiResponse.success(result));
    } catch (e) {
      next(e);
    }
  };

  // =========================================================================
  // 2. R2 STORAGE HANDLERS (Giữ nguyên)
  // =========================================================================

  getUploadUrl = async (req, res, next) => {
    try {
      const { fileName, fileType } = req.body;
      const data = await r2Service.getPresignedUploadUrl(fileName, fileType);
      res.status(API_CODES.SUCCESS).json(ApiResponse.success(data));
    } catch (e) {
      next(e);
    }
  };

  uploadToR2 = async (req, res, next) => {
    try {
      if (!req.file) {
        return res
          .status(API_CODES.BAD_REQUEST)
          .json(ApiResponse.error("No file provided"));
      }

      // Dùng fileKey từ formData (từ presigned upload URL) để đảm bảo key khớp
      const fileKeyFromForm = req.body?.fileKey;

      if (!fileKeyFromForm) {
        // Fallback legacy
        const newFileKey = await r2Service.uploadFile(
          req.file.buffer,
          req.file.originalname,
          req.file.mimetype
        );
        return res.status(API_CODES.SUCCESS).json(
          ApiResponse.success({
            fileKey: newFileKey,
            url: `${req.protocol}://${req.get(
              "host"
            )}/api/chat/r2/download?key=${encodeURIComponent(
              newFileKey
            )}&filename=${encodeURIComponent(req.file.originalname)}`,
          })
        );
      }

      // Upload với fileKey đã có
      const fileKey = await r2Service.uploadFileWithKey(
        req.file.buffer,
        fileKeyFromForm,
        req.file.mimetype
      );

      res.status(API_CODES.SUCCESS).json(
        ApiResponse.success({
          fileKey: fileKey,
          url: `${req.protocol}://${req.get(
            "host"
          )}/api/chat/r2/download?key=${encodeURIComponent(
            fileKey
          )}&filename=${encodeURIComponent(req.file.originalname)}`,
        })
      );
    } catch (e) {
      Logger.error(`[ChatController] R2 upload error:`, e.message);
      next(e);
    }
  };

  getR2DownloadUrl = async (req, res, next) => {
    try {
      const { key, filename, mode } = req.query;

      if (!key) {
        return res
          .status(API_CODES.BAD_REQUEST)
          .json(ApiResponse.error("key parameter is required"));
      }

      const fileKey = decodeURIComponent(key);
      const finalFileName = filename
        ? decodeURIComponent(filename)
        : fileKey.split("/").pop() || "file";
      const finalMode = mode || "inline";

      const presignedUrl = await r2Service.getPresignedDownloadUrl(
        fileKey,
        finalFileName,
        finalMode
      );

      res.status(API_CODES.SUCCESS).json(
        ApiResponse.success({
          downloadUrl: presignedUrl,
          fileKey,
          filename: finalFileName,
          mode: finalMode,
        })
      );
    } catch (e) {
      Logger.error(`[ChatController] R2 download error:`, e.message);
      if (
        e.message?.includes("NoSuchKey") ||
        e.message?.includes("does not exist")
      ) {
        return res
          .status(API_CODES.NOT_FOUND)
          .json(ApiResponse.error("File not found in storage"));
      }
      res
        .status(API_CODES.INTERNAL_ERROR)
        .json(
          ApiResponse.error("Failed to generate download URL: " + e.message)
        );
    }
  };

  // =========================================================================
  // 3. AI STREAM HANDLER (🌟 REFACTORED VERSION)
  // Sử dụng Vercel AI SDK + Tools từ ChatToolService
  // =========================================================================

  handleChatStream = async (req, res, next) => {
    try {
      const { messages, conversationId } = req.body;
      const user = req.user;
      const isGuest = !user;

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res
          .status(API_CODES.BAD_REQUEST)
          .json(ApiResponse.error("Messages array is required"));
      }

      // Lấy tin nhắn cuối cùng (user message)
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role !== "user") {
        return res
          .status(API_CODES.BAD_REQUEST)
          .json(ApiResponse.error("Last message must be from user"));
      }

      // --- 1. Setup Context & Conversation ---
      // ✅ FIX: Yêu cầu đăng nhập để chat với AI
      if (isGuest) {
        return res
          .status(API_CODES.UNAUTHORIZED)
          .json(ApiResponse.error("Vui lòng đăng nhập để chat với AI"));
      }

      let conversation = conversationId
        ? await chatService.chatRepository.findConversationById(
            conversationId,
            user._id
          )
        : null;

      let isNewConversation = false;
      if (!conversation) {
        conversation = await chatService.chatRepository.createConversation(
          user._id
        );
        isNewConversation = true;

        // 🔥 Socket báo tạo mới NGAY LẬP TỨC
        try {
          const { socketService } = await import(
            "../../infrastructure/realtime/pusher.service.js"
          );
          await conversation.populate(
            "participants.userId",
            "username displayName avatarUrl isOnline"
          );
          const conversationToEmit = conversation.toObject
            ? conversation.toObject()
            : conversation;
          const formattedConversation = {
            ...conversationToEmit,
            _id: conversationToEmit._id?.toString() || conversationToEmit._id,
            title: conversationToEmit.title || "Đoạn chat mới",
            type: conversationToEmit.type || "customer-bot",
            createdAt: conversationToEmit.createdAt || new Date().toISOString(),
            updatedAt: conversationToEmit.updatedAt || new Date().toISOString(),
            lastMessageAt: conversationToEmit.lastMessageAt || null,
            isActive:
              conversationToEmit.isActive !== undefined
                ? conversationToEmit.isActive
                : true,
          };
          socketService.emitToUser(
            user._id.toString(),
            "conversation_created",
            formattedConversation
          );
        } catch (emitError) {
          Logger.error(
            "[ChatController] Failed to emit conversation_created:",
            emitError
          );
        }
      }

      // --- 2. Lưu tin nhắn User vào DB ---
      await chatService.chatRepository.createMessage({
        conversationId: conversation._id,
        senderType: "User",
        sender: user._id,
        content: { text: lastMessage.content },
        type: "text",
      });

      // --- 3. Setup context cho tools ---
      const context = {
        user,
        actorId: user._id,
        actorType: "User",
        conversationId: conversation._id.toString(),
      };

      // ✅ GET TOOLS TỪ SERVICE (CODE SIÊU GỌN)
      // Inject chatRepository vào để browse_page tool dùng
      const tools = chatService.agent.toolService.getVercelTools(context, {
        chatRepository: chatService.chatRepository,
      });

      // Check API Key
      if (!config.apiKeys?.openai) {
        return res
          .status(API_CODES.INTERNAL_ERROR)
          .json(ApiResponse.error("AI service is not available"));
      }

      const openaiProvider = createOpenAI({
        apiKey: config.apiKeys.openai,
      });

      // --- 4. STREAMING ---
      const result = await streamText({
        model: openaiProvider("gpt-4o-mini"),
        // ✅ ĐÃ CẬP NHẬT: Loại bỏ chỉ dẫn suy nghĩ trong thẻ <think>
        system:
          "Bạn là Zin, trợ lý AI của Printz.vn. Bạn giúp user tìm sản phẩm, nhà in. Nếu user gửi link, hãy dùng tool 'browse_page'.",
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        tools, // 👈 Inject Tools gọn gàng
        maxSteps: 5,

        async onFinish({ text, toolCalls, toolResults }) {
          // --- 5. Lưu kết quả AI vào DB khi stream xong ---
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

            // 🔥 Socket Update & Auto-Naming (Fire & Forget)
            try {
              const { socketService } = await import(
                "../../infrastructure/realtime/pusher.service.js"
              );
              const updatedConversation =
                await chatService.chatRepository.findConversationById(
                  conversation._id,
                  user._id
                );

              if (updatedConversation) {
                // Emit update sidebar
                await updatedConversation.populate(
                  "participants.userId",
                  "username displayName avatarUrl isOnline"
                );
                // Format chuẩn JSON
                const conversationObj = updatedConversation.toObject
                  ? updatedConversation.toObject()
                  : updatedConversation;

                socketService.emitToUser(
                  user._id.toString(),
                  "conversation_updated",
                  {
                    ...conversationObj,
                    _id: conversationObj._id.toString(),
                    createdAt: conversationObj.createdAt.toISOString(),
                    updatedAt: conversationObj.updatedAt.toISOString(),
                  }
                );

                // Auto-title trigger
                if (
                  isNewConversation ||
                  !updatedConversation.title ||
                  updatedConversation.title === "Đoạn chat mới"
                ) {
                  const userMessage = lastMessage.content || "";
                  if (typeof chatService._generateWowTitle === "function") {
                    chatService
                      ._generateWowTitle(
                        conversation._id,
                        user._id,
                        userMessage,
                        text
                      )
                      .catch((e) => {
                        Logger.error(
                          "[ChatController] Auto-title failed silently",
                          e
                        );
                      });
                  }
                }
              }
            } catch (emitError) {
              Logger.error(
                "[ChatController] Failed to emit conversation_updated:",
                emitError
              );
            }
          } catch (error) {
            Logger.error("[ChatController] Error saving AI message:", error);
          }
        },
      });

      // --- 6. PIPE RESPONSE ---
      result.pipeDataStreamToResponse(res, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    } catch (error) {
      Logger.error("[ChatController] Stream error:", error);
      if (!res.headersSent) {
        res
          .status(API_CODES.INTERNAL_ERROR)
          .json(ApiResponse.error(error.message));
      } else {
        res.end();
      }
    }
  };
}

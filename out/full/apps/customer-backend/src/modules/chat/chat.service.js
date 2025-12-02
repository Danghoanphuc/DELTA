// apps/customer-backend/src/modules/chat/chat.service.js
import mongoose from "mongoose";
import { ChatRepository } from "./chat.repository.js";
import { ChatAgent } from "./chat.agent.js";
import { ChatAiService } from "./chat.ai.service.js";
import { productRepository } from "../products/product.repository.js";
import { socketService } from "../../infrastructure/realtime/pusher.service.js";
import { novuService } from "../../infrastructure/notifications/novu.service.js";
import { Logger } from "../../shared/utils/index.js";
import { ChatResponseUtil } from "./chat.response.util.js";
import { getUrlPreviewQueue } from "../../infrastructure/queue/url-preview.queue.js";

export class ChatService {
  constructor() {
    this.chatRepository = new ChatRepository();
    this.agent = new ChatAgent();
    this.aiService = new ChatAiService();
  }

  async handleBotMessage(user, body, isGuest = false) {
    const {
      message,
      displayText,
      fileUrl,
      conversationId,
      type,
      metadata,
      clientSideId,
    } = body;
    const userId = user ? user._id : null;

    const textToShow = displayText || message;
    const textToProcess = message;

    // 1. Tìm hoặc Tạo hội thoại
    let conversation = conversationId
      ? await this.chatRepository.findConversationById(conversationId, userId)
      : null;

    let isNewConversation = false;
    if (!conversation) {
      conversation = await this.chatRepository.createConversation(userId);
      isNewConversation = true;
      if (userId) this._emitConversationCreated(userId, conversation);
    }

    const context = {
      user,
      actorId: userId,
      actorType: isGuest ? "Guest" : "User",
      conversationId: conversation._id,
      fileUrl,
    };

    // 2. SAVE USER MESSAGE
    let userMsg = null;
    let aiMessageId = new mongoose.Types.ObjectId();

    if (textToShow || fileUrl) {
      userMsg = await this.chatRepository.createMessage({
        conversationId: conversation._id,
        sender: userId,
        senderType: userId ? "User" : "Guest",
        content: { text: textToShow, fileUrl },
        metadata: metadata || {},
        clientSideId: clientSideId,
      });

      if (userId) {
        // Force Inject ID để chống duplicate ở Frontend
        const msgToEmit = userMsg.toObject
          ? userMsg.toObject()
          : { ...userMsg };
        if (!msgToEmit.metadata) msgToEmit.metadata = {};
        if (clientSideId) {
          msgToEmit.clientSideId = clientSideId;
          msgToEmit.metadata.clientSideId = clientSideId;
        }
        socketService.emitToUser(
          userId.toString(),
          "chat:message:new",
          msgToEmit
        );
      }
    }

    // 3. Xử lý URL Preview (Async)
    const urlRegex = /https?:\/\/[^\s]+(?<![.,;!?])/g;
    const detectedUrls = textToProcess ? textToProcess.match(urlRegex) : [];
    if (detectedUrls?.length > 0 && !fileUrl) {
      // ✅ KHÔNG emit ai:stream:start cho URL vì worker tự quản lý message
      this._handleUrlPreview(
        userId,
        conversation,
        detectedUrls[0],
        textToShow,
        isNewConversation
      ).catch(console.error);
      return {
        conversationId: conversation._id,
        userMessage: userMsg,
        aiMessageId,
      };
    }

    // 4. Chuẩn bị AI Stream (chỉ cho non-URL messages)
    if (userId) {
      socketService.emitToUser(userId.toString(), "ai:stream:start", {
        messageId: aiMessageId.toString(),
        conversationId: conversation._id.toString(),
        senderType: "AI",
        replyToId: clientSideId,
      });
    }

    const onStream = (text) => {
      if (!userId || !text) return;

      socketService.emitToUser(userId.toString(), "ai:stream:chunk", {
        conversationId: conversation._id.toString(),
        messageId: aiMessageId.toString(),
        text: text,
      });
    };

    // 5. Chạy AI (Async background)
    (async () => {
      try {
        Logger.info(
          `[ChatService] Starting AI processing for conversation ${conversation._id}`
        );

        const historyData = await this.chatRepository.getPaginatedMessages(
          conversation._id,
          1,
          10
        );
        const history = historyData.messages || [];
        Logger.info(`[ChatService] Loaded ${history.length} history messages`);

        let responsePayload;
        if (fileUrl) {
          const analysis = await this.aiService.getVisionCompletion(
            fileUrl,
            "Phân tích ảnh này và gợi ý in ấn.",
            context
          );
          const visionPrompt = `[SYSTEM] User gửi ảnh. AI Vision đã thấy: "${analysis}". Hãy tư vấn dựa trên đó.`;
          responsePayload = await this.agent.run(
            context,
            history,
            textToProcess || "Gửi ảnh",
            visionPrompt,
            onStream
          );
        } else if (type === "product" && metadata?.productId) {
          responsePayload = await this._handleProductContext(
            metadata.productId
          );
        } else {
          Logger.info(
            `[ChatService] Running agent with message: ${textToProcess?.substring(
              0,
              50
            )}...`
          );
          responsePayload = await this.agent.run(
            context,
            history,
            textToProcess,
            null,
            onStream
          );
          Logger.info(
            `[ChatService] Agent completed, response type: ${responsePayload?.type}`
          );
        }

        if (!responsePayload) {
          throw new Error("Agent returned null response");
        }

        // 6. Lưu & Gửi kết quả cuối cùng
        Logger.info(`[ChatService] Saving AI message ${aiMessageId}`);

        const savedAiMsg = await this.chatRepository.createMessage({
          _id: aiMessageId,
          conversationId: conversation._id,
          senderType: "AI",
          type: responsePayload.type || "ai_response",
          content: responsePayload.content,
          metadata: {
            ...responsePayload._messageMetadata,
            status: "sent",
          },
        });

        if (userId) {
          const finalPayload = savedAiMsg.toObject
            ? savedAiMsg.toObject()
            : { ...savedAiMsg };
          finalPayload.isFinished = true;

          socketService.emitToUser(
            userId.toString(),
            "chat:message:new",
            finalPayload
          );
        }

        // 7. Auto Title & Notification
        if (
          userId &&
          (isNewConversation ||
            !conversation.title ||
            conversation.title === "Đoạn chat mới")
        ) {
          this._generateWowTitle(
            conversation._id,
            userId,
            textToShow,
            responsePayload?.content?.text
          ).catch((e) => Logger.error("Auto-title error", e));
        }

        if (userId) {
          const messageText =
            responsePayload.content?.text || "Tin nhắn mới từ Zin";
          await novuService.triggerChatNotification(
            userId.toString(),
            messageText.substring(0, 100),
            conversation._id.toString()
          );
        }
      } catch (error) {
        Logger.error("[ChatService] Async AI Error:", error);
        Logger.error("[ChatService] Error stack:", error.stack);

        if (userId) {
          Logger.info(`[ChatService] Emitting error message to user ${userId}`);
          socketService.emitToUser(userId.toString(), "chat:message:new", {
            _id: aiMessageId.toString(),
            conversationId: conversation._id,
            senderType: "AI",
            type: "error",
            content: { text: "⚠️ Hệ thống đang bận, vui lòng thử lại sau." },
            metadata: { status: "error" },
            isFinished: true,
          });
        }
      }
    })();

    const response = {
      success: true,
      conversationId: conversation._id,
      userMessage: userMsg,
      aiMessageId: aiMessageId,
    };

    if (isNewConversation) {
      response.newConversation = {
        _id: conversation._id.toString(),
        title: conversation.title || "Cuộc trò chuyện mới",
        type: conversation.type || "customer-bot",
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
      };
    }

    return response;
  }

  // --- Helpers ---
  async _generateWowTitle(conversationId, userId, userMessage, aiMessage) {
    try {
      if (!userMessage && !aiMessage) return;
      const prompt = `User: "${userMessage?.substring(
        0,
        100
      )}"\nAI: "${aiMessage?.substring(
        0,
        100
      )}"\nĐặt tiêu đề ngắn gọn (tối đa 50 ký tự), không markdown, không ngoặc kép, không ký tự đặc biệt.`;
      const titleRes = await this.aiService.getCompletionWithCustomPrompt(
        [],
        prompt
      );
      let newTitle =
        titleRes.choices[0]?.message?.content
          ?.trim()
          .replace(/^["']|["']$/g, "")
          .replace(/[#*_`~]/g, "")
          .substring(0, 50) || "Đoạn chat mới";

      if (newTitle.length > 50) {
        newTitle = newTitle.substring(0, 47) + "...";
      }

      await this.chatRepository.updateConversationTitle(
        conversationId,
        newTitle
      );
      socketService.emitToUser(userId.toString(), "conversation_updated", {
        _id: conversationId.toString(),
        conversationId: conversationId.toString(),
        title: newTitle,
      });
    } catch (e) {
      Logger.error("Auto-title failed", e);
    }
  }

  async _handleUrlPreview(
    userId,
    conversation,
    url,
    textToShow,
    isNewConversation
  ) {
    const queue = await getUrlPreviewQueue();
    if (queue) {
      await queue.add("url-preview", {
        url,
        conversationId: conversation._id.toString(),
        userId: userId.toString(),
      });
      // ❌ Đã xóa emit thinking update ở đây
    }
  }

  async _handleProductContext(productId) {
    try {
      const product = await productRepository.findById(productId);
      if (!product)
        return ChatResponseUtil.createTextResponse("Sản phẩm không tồn tại.");
      return {
        type: "product",
        content: { text: `Tôi quan tâm đến sản phẩm ${product.name}` },
        _messageMetadata: {
          productId: product._id,
          productName: product.name,
          price: product.pricing?.[0]?.pricePerUnit,
          image: product.images?.[0]?.url,
          category: product.category,
        },
      };
    } catch (e) {
      return ChatResponseUtil.createTextResponse(
        "Lỗi khi lấy thông tin sản phẩm."
      );
    }
  }

  async _emitConversationCreated(userId, conversation) {
    try {
      const conversationToEmit = conversation.toObject
        ? conversation.toObject()
        : { ...conversation };

      const formatted = {
        _id: conversationToEmit._id.toString(),
        title: conversationToEmit.title || "Cuộc trò chuyện mới",
        type: conversationToEmit.type || "customer-bot",
        createdAt: conversationToEmit.createdAt,
        updatedAt: conversationToEmit.updatedAt,
        isActive: true,
      };

      socketService.emitToUser(
        userId.toString(),
        "conversation_created",
        formatted
      );
    } catch (e) {
      Logger.error("Emit created failed", e);
    }
  }
}

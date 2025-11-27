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

export class ChatService {
  constructor() {
    this.chatRepository = new ChatRepository();
    this.agent = new ChatAgent();
    this.aiService = new ChatAiService();
  }

  async handleBotMessage(user, body, isGuest = false) {
    const { message, displayText, fileUrl, conversationId, type, metadata } = body;
    const userId = user ? user._id : null;
    
    const textToShow = displayText || message;
    const textToProcess = message;

    let conversation = conversationId 
      ? await this.chatRepository.findConversationById(conversationId, userId)
      : null;

    let isNewConversation = false;
    if (!conversation) {
      conversation = await this.chatRepository.createConversation(userId);
      isNewConversation = true;
      
      // 🔥 WOW FIX 1: Bắn Socket báo tạo mới NGAY LẬP TỨC
      if (userId) {
        try {
          // Populate participants để format giống API response
          await conversation.populate("participants.userId", "username displayName avatarUrl isOnline");
          
          // Convert sang plain object với format giống API response
          const conversationToEmit = conversation.toObject ? conversation.toObject() : conversation;
          
          // Đảm bảo có đầy đủ fields cần thiết
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
          
          Logger.info(`[ChatService] 🔥 Emitting conversation_created to user ${userId}, conversationId: ${formattedConversation._id}`);
          socketService.emitToUser(userId.toString(), 'conversation_created', formattedConversation);
        } catch (emitError) {
          Logger.error("[ChatService] Failed to emit conversation_created:", emitError);
        }
      }
    }

    const urlRegex = /https?:\/\/[^\s]+(?<![.,;!?])/g;
    const detectedUrls = textToProcess ? textToProcess.match(urlRegex) : [];

    if (detectedUrls?.length > 0 && !fileUrl) {
       return this._handleUrlPreview(userId, conversation, detectedUrls[0], textToShow, isNewConversation);
    }

    const context = {
      user,
      actorId: userId,
      actorType: isGuest ? "Guest" : "User",
      conversationId: conversation._id,
      fileUrl
    };

    const aiMessageId = new mongoose.Types.ObjectId(); 
    
    if (userId) {
        socketService.emitToUser(userId.toString(), 'ai:stream:start', {
            messageId: aiMessageId.toString(),
            conversationId: conversation._id.toString(),
            senderType: 'AI'
        });
    }

    const onStream = (payload) => {
        if (!userId) return;

        if (payload.type === 'text_stream') {
            socketService.emitToUser(userId.toString(), 'ai:stream:chunk', {
                conversationId: conversation._id.toString(),
                text: payload.text
            });
        } else {
            socketService.emitToUser(userId.toString(), 'ai:thinking:update', {
                conversationId: conversation._id.toString(),
                icon: payload.icon,
                text: payload.text
            });
        }
    };

    let responsePayload;
    try {
      const historyData = await this.chatRepository.getPaginatedMessages(conversation._id, 1, 10);
      const history = historyData.messages || [];

      if (fileUrl) {
         const analysis = await this.aiService.getVisionCompletion(fileUrl, "Phân tích ảnh này và gợi ý in ấn.", context);
         const visionPrompt = `[SYSTEM] User gửi ảnh. AI Vision đã thấy: "${analysis}". Hãy tư vấn dựa trên đó.`;
         responsePayload = await this.agent.run(context, history, textToProcess || "Gửi ảnh", visionPrompt, onStream);
      } else if (type === "product" && metadata?.productId) {
         responsePayload = await this._handleProductContext(metadata.productId);
      } else {
         responsePayload = await this.agent.run(context, history, textToProcess, null, onStream);
      }
    } catch (error) {
      Logger.error("[ChatService] Agent Error:", error);
      responsePayload = ChatResponseUtil.createTextResponse("Xin lỗi, hệ thống đang bận.");
    }

    await this._saveChatHistory(
        conversation._id, 
        userId, 
        { text: textToShow, fileUrl }, 
        responsePayload, 
        aiMessageId,
        metadata
    );

    // 🔥 WOW FIX 2: Trigger Auto-Naming chạy ngầm (Fire & Forget)
    // Chỉ chạy nếu là đoạn chat mới hoặc chưa có tên custom
    if (userId && (isNewConversation || !conversation.title || conversation.title === "Đoạn chat mới")) {
      this._generateWowTitle(conversation._id, userId, textToShow, responsePayload?.content?.text).catch((e) => {
        Logger.error("[ChatService] Auto-title failed silently", e);
      });
    }

    if (userId) {
      try {
        // ✅ FIX: Removed 'as any' TypeScript syntax
        const messageText = responsePayload.content?.text || textToShow;
        await novuService.triggerChatNotification(
          userId.toString(),
          messageText.substring(0, 100),
          conversation._id.toString()
        );
      } catch (error) {
        Logger.error("[ChatService] Novu trigger failed:", error);
      }
    }

    return {
      ...responsePayload,
      _id: aiMessageId,
      conversationId: conversation._id,
      newConversation: isNewConversation ? conversation : null,
    };
  }

  async _handleUrlPreview(userId, conversation, url, userText, isNew) {
    await this.chatRepository.createMessage({
        conversationId: conversation._id,
        sender: userId,
        senderType: userId ? "User" : "Guest",
        content: { text: userText },
        type: "text",
        metadata: { urlPreview: url }
    });

    const aiMsg = await this.chatRepository.createMessage({
        conversationId: conversation._id,
        senderType: "AI",
        content: { text: `Đang phân tích liên kết... \n<think>Đang truy cập ${url}...</think>` },
        metadata: { source: "url-preview", status: "thinking", originalUrl: url }
    });

    const { getUrlPreviewQueue } = await import("../../infrastructure/queue/url-preview.queue.js");
    const urlPreviewQueue = getUrlPreviewQueue();
    await urlPreviewQueue.add({
        url,
        conversationId: conversation._id.toString(),
        userId: userId?.toString(),
        thinkingMessageId: aiMsg._id.toString()
    });

    return { ...aiMsg.toObject(), conversationId: conversation._id, newConversation: isNew ? conversation : null };
  }

  async _handleProductContext(productId) {
    const product = await productRepository.findById(productId);
    if (!product) return ChatResponseUtil.createTextResponse("Sản phẩm không tồn tại.");
    
    return {
        type: "product",
        content: { text: `Tôi có thể giúp gì về sản phẩm "${product.name}"?` },
        _messageMetadata: {
            productId: product._id,
            productName: product.name,
            price: product.pricing?.[0]?.price || 0,
            image: product.images?.[0]
        }
    };
  }

  async _saveChatHistory(conversationId, userId, userContent, aiResponse, aiMsgId, userMetadata) {
    if (userContent.text || userContent.fileUrl) {
        await this.chatRepository.createMessage({
            conversationId,
            sender: userId,
            senderType: userId ? "User" : "Guest",
            content: userContent,
            metadata: userMetadata
        });
    }

    await this.chatRepository.createMessage({
        _id: aiMsgId,
        conversationId,
        senderType: "AI",
        type: aiResponse.type || "ai_response",
        content: aiResponse.content,
        metadata: aiResponse._messageMetadata
    });
  }

  // ✅ HÀM MỚI: Tự động đặt tên "Giật tít"
  async _generateWowTitle(conversationId, userId, userMessage, aiMessage) {
    try {
      // Prompt "thần thánh" để tạo title hay
      const prompt = `
Dựa trên cuộc hội thoại này:

User: "${userMessage}"

AI: "${aiMessage}"

Hãy đặt một tiêu đề cực ngắn (dưới 6 từ), thú vị, trendy, có tính gợi mở. 
Không dùng dấu ngoặc kép. Ví dụ: "Ý tưởng in áo thun", "Thiết kế logo coffee".
`;

      const titleRes = await this.aiService.getCompletionWithCustomPrompt([], prompt);
      const newTitle = titleRes.choices[0]?.message?.content?.trim().replace(/^["']|["']$/g, '') || "Đoạn chat mới";

      // Cập nhật DB
      await this.chatRepository.updateConversationTitle(conversationId, newTitle);

      // 🔥 Bắn Socket: Hiệu ứng đổi tên Realtime
      socketService.emitToUser(userId.toString(), 'conversation_updated', {
        _id: conversationId.toString(),
        title: newTitle,
        isAutoGenerated: true // Cờ này để Frontend làm hiệu ứng lấp lánh
      });

    } catch (e) {
      Logger.error("[ChatService] Auto-title failed", e);
    }
  }
}
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
import { getUrlPreviewQueue } from "../../infrastructure/queue/url-preview.queue.js"; // ✅ Thêm import này

export class ChatService {
  constructor() {
    this.chatRepository = new ChatRepository();
    this.agent = new ChatAgent();
    this.aiService = new ChatAiService();
  }

  // ✅ REFACTOR: Tách logic save User Message ra xử lý trước
  async handleBotMessage(user, body, isGuest = false) {
    // 🔥 Hứng clientSideId từ Frontend gửi lên
    const { message, displayText, fileUrl, conversationId, type, metadata, clientSideId } = body;
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
      fileUrl
    };

    // 2. 🔥 SAVE USER MESSAGE VỚI CLIENT_SIDE_ID
    let userMsg = null;
    if (textToShow || fileUrl) {
       userMsg = await this.chatRepository.createMessage({
          conversationId: conversation._id,
          sender: userId,
          senderType: userId ? "User" : "Guest",
          content: { text: textToShow, fileUrl },
          metadata: metadata || {},
          clientSideId: clientSideId // <-- LƯU VÀO DB
      });

      // Emit lại message vừa tạo (Frontend sẽ dùng clientSideId để khớp và xóa trạng thái pending)
      if (userId) {
         socketService.emitToUser(userId.toString(), 'chat:message:new', userMsg);
      }
    }

    // 3. Xử lý URL Preview (nếu có) - Chạy async, không block
    const urlRegex = /https?:\/\/[^\s]+(?<![.,;!?])/g;
    const detectedUrls = textToProcess ? textToProcess.match(urlRegex) : [];
    if (detectedUrls?.length > 0 && !fileUrl) {
       // Fire & Forget logic URL Preview
       this._handleUrlPreview(userId, conversation, detectedUrls[0], textToShow, isNewConversation).catch(console.error);
       return { conversationId: conversation._id, userMessage: userMsg };
    }

    // 4. Chuẩn bị AI Stream
    const aiMessageId = new mongoose.Types.ObjectId(); 
    
    // Emit event báo hiệu AI bắt đầu nghĩ (để UI hiện bubble rỗng hoặc loading)
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
                messageId: aiMessageId.toString(), // Quan trọng để UI biết đang stream cho message nào
                text: payload.text
            });
        } else {
            // Thinking process
            socketService.emitToUser(userId.toString(), 'ai:thinking:update', {
                conversationId: conversation._id.toString(),
                messageId: aiMessageId.toString(),
                icon: payload.icon,
                text: payload.text,
                isThinking: true
            });
        }
    };

    // 5. Chạy AI (Async background)
    // Chúng ta KHÔNG dùng await để block response HTTP.
    // HTTP trả về ngay sau khi lưu User Message. AI chạy ngầm.
    (async () => {
      try {
        const historyData = await this.chatRepository.getPaginatedMessages(conversation._id, 1, 10);
        const history = historyData.messages || [];

        let responsePayload;
        if (fileUrl) {
           const analysis = await this.aiService.getVisionCompletion(fileUrl, "Phân tích ảnh này và gợi ý in ấn.", context);
           const visionPrompt = `[SYSTEM] User gửi ảnh. AI Vision đã thấy: "${analysis}". Hãy tư vấn dựa trên đó.`;
           responsePayload = await this.agent.run(context, history, textToProcess || "Gửi ảnh", visionPrompt, onStream);
        } else if (type === "product" && metadata?.productId) {
           responsePayload = await this._handleProductContext(metadata.productId);
        } else {
           responsePayload = await this.agent.run(context, history, textToProcess, null, onStream);
        }

        // 6. Lưu AI Message & Emit Final Socket
        const savedAiMsg = await this.chatRepository.createMessage({
            _id: aiMessageId,
            conversationId: conversation._id,
            senderType: "AI",
            type: responsePayload.type || "ai_response",
            content: responsePayload.content,
            metadata: { 
              ...responsePayload._messageMetadata,
              status: "sent" // Đánh dấu đã xong
            }
        });

        if (userId) {
           // Emit bản final để UI replace cái streaming text bằng nội dung đầy đủ
           socketService.emitToUser(userId.toString(), 'chat:message:updated', savedAiMsg);
        }

        // 7. Auto Title & Notification (ĐÃ CÓ HÀM _generateWowTitle Ở DƯỚI)
        if (userId && (isNewConversation || !conversation.title || conversation.title === "Đoạn chat mới")) {
          this._generateWowTitle(conversation._id, userId, textToShow, responsePayload?.content?.text).catch(e => Logger.error("Auto-title error", e));
        }

        if (userId) {
           const messageText = responsePayload.content?.text || "Tin nhắn mới từ Zin";
           await novuService.triggerChatNotification(userId.toString(), messageText.substring(0, 100), conversation._id.toString());
        }

      } catch (error) {
        Logger.error("[ChatService] Async AI Error:", error);
        if (userId) {
             socketService.emitToUser(userId.toString(), 'chat:message:updated', {
                 _id: aiMessageId.toString(),
                 conversationId: conversation._id,
                 senderType: "AI",
                 type: "error",
                 content: { text: "Hệ thống đang bận, vui lòng thử lại sau." },
                 metadata: { status: "error" }
             });
        }
      }
    })();

    // ✅ Return ngay lập tức thông tin cơ bản
    return {
      success: true,
      conversationId: conversation._id,
      userMessage: userMsg, // Trả về để Client map tempId
      aiMessageId: aiMessageId // Trả về để Client biết trước ID của câu trả lời sắp tới
    };
  }

  // ✅ HÀM MỚI 1: Tự động đặt tên "Giật tít"
  async _generateWowTitle(conversationId, userId, userMessage, aiMessage) {
    try {
      if (!userMessage && !aiMessage) return;
      
      const prompt = `
Dựa trên cuộc hội thoại này:
User: "${userMessage?.substring(0, 100)}"
AI: "${aiMessage?.substring(0, 100)}"

Hãy đặt một tiêu đề cực ngắn (dưới 6 từ), thú vị, trendy, có tính gợi mở. 
Không dùng dấu ngoặc kép. Ví dụ: "Ý tưởng in áo thun", "Thiết kế logo coffee".`;

      const titleRes = await this.aiService.getCompletionWithCustomPrompt([], prompt);
      const newTitle = titleRes.choices[0]?.message?.content?.trim().replace(/^["']|["']$/g, '') || "Đoạn chat mới";

      // Cập nhật DB
      await this.chatRepository.updateConversationTitle(conversationId, newTitle);

      // 🔥 Bắn Socket: Hiệu ứng đổi tên Realtime
      socketService.emitToUser(userId.toString(), 'conversation_updated', {
        conversationId: conversationId.toString(),
        title: newTitle,
      });
    } catch (e) {
      Logger.error("[ChatService] _generateWowTitle failed", e);
    }
  }

  // ✅ HÀM MỚI 2: Xử lý URL Preview
  async _handleUrlPreview(userId, conversation, url, textToShow, isNewConversation) {
    const queue = await getUrlPreviewQueue();
    if (queue) {
        await queue.add('url-preview', {
            url,
            conversationId: conversation._id.toString(),
            userId: userId.toString(),
        });
        
        // Emit thinking state giả lập
        socketService.emitToUser(userId.toString(), 'ai:thinking:update', {
            conversationId: conversation._id.toString(),
            icon: '📸',
            text: `Đang chụp ảnh ${url}...`,
            isThinking: true
        });
    }
  }

  // ✅ HÀM MỚI 3: Xử lý Product Context
  async _handleProductContext(productId) {
    try {
        const product = await productRepository.findById(productId);
        if (!product) return ChatResponseUtil.createTextResponse("Sản phẩm không tồn tại.");
        
        // Trả về dạng Product Card
        return {
            type: "product",
            content: { text: `Tôi quan tâm đến sản phẩm ${product.name}` },
            _messageMetadata: { 
                productId: product._id,
                productName: product.name,
                price: product.pricing?.[0]?.pricePerUnit,
                image: product.images?.[0]?.url,
                category: product.category
            }
        };
    } catch (e) {
        return ChatResponseUtil.createTextResponse("Lỗi khi lấy thông tin sản phẩm.");
    }
  }

  // Helper emit conversation created (giữ nguyên)
  async _emitConversationCreated(userId, conversation) {
     try {
        await conversation.populate("participants.userId", "username displayName avatarUrl isOnline");
        const conversationToEmit = conversation.toObject ? conversation.toObject() : conversation;
        const formatted = { ...conversationToEmit, _id: conversationToEmit._id.toString(), isActive: true };
        socketService.emitToUser(userId.toString(), 'conversation_created', formatted);
     } catch (e) { Logger.error("Emit created failed", e); }
  }
}
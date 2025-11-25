import mongoose from "mongoose";
import { ChatRepository } from "./chat.repository.js";
import { ChatAgent } from "./chat.agent.js";
import { ChatAiService } from "./chat.ai.service.js";
import { ValidationException } from "../../shared/exceptions/index.js";
import { Logger } from "../../shared/utils/index.js";
import { ChatResponseUtil } from "./chat.response.util.js";
import { Conversation } from "../../shared/models/conversation.model.js";
import { Message } from "../../shared/models/message.model.js";
import { Product } from "../../shared/models/product.model.js";
import { config } from "../../config/env.config.js";
import { productRepository } from "../products/product.repository.js";
// ✅ IMPORT SERVICES MỚI
// import { CanvaService } from "./canva.service.js"; // ✅ TẠM TẮT: Comment để test xem có phải Puppeteer gây treo không
import { r2Service } from "./r2.service.js";
// ✅ IMPORT URL PREVIEW QUEUE
import { urlPreviewQueue } from "../../infrastructure/queue/url-preview.queue.js"; 

export class ChatService {
  constructor() {
    this.chatRepository = new ChatRepository();
    this.agent = new ChatAgent();
    this.aiService = new ChatAiService();
    // this.canvaService = new CanvaService(); // ✅ TẠM TẮT: Comment để test xem có phải Puppeteer gây treo không
  }

  /**
   * ✅ Xử lý tin nhắn BOT AI (Có tích hợp Canva & Vision)
   */
  async handleBotMessage(user, body, isGuest = false) {
    let {
      message,
      fileUrl,
      fileName,
      fileType,
      latitude,
      longitude,
      conversationId,
      type,
      metadata,
    } = body;
    const userId = user ? user._id : null;

    // 1. Lấy hoặc tạo Conversation
    let conversation = null;
    let isNewConversation = false;

    if (conversationId) {
      conversation = await this.chatRepository.findConversationById(conversationId, userId);
    }
    if (!conversation) {
      conversation = await this.chatRepository.createConversation(userId);
      isNewConversation = true;
    }

    // --- 🚀 LOGIC MỚI: XỬ LÝ URL PREVIEW (Queue-based) ---
    // ✅ Detect URL trong message (hỗ trợ cả Canva và các website khác)
    // Regex loại bỏ các dấu câu thường gặp ở cuối URL
    const urlRegex = /https?:\/\/[^\s]+(?<![.,;!?])/g;
    const detectedUrls = message ? message.match(urlRegex) : [];
    let systemNote = "";

    // ✅ Nếu có URL -> Đẩy vào Queue để xử lý bất đồng bộ
    if (detectedUrls && detectedUrls.length > 0 && !fileUrl) {
      // Lấy URL đầu tiên (có thể mở rộng để xử lý nhiều URL)
      const urlToProcess = detectedUrls[0];
      
      try {
        Logger.info(`[ChatService] 🔗 Phát hiện URL trong message: ${urlToProcess}. Đẩy vào Queue...`);
        
        // ✅ Lưu tin nhắn user trước (để user thấy mình đã gửi)
        // Đảm bảo conversationId là ObjectId
        const userMessage = await this.chatRepository.createMessage({
          conversationId: conversation._id,
          sender: userId || null,
          senderType: userId ? "User" : "Guest",
          type: "text",
          content: {
            text: message || urlToProcess,
          },
          metadata: {
            urlPreview: urlToProcess,
            status: "processing",
          },
        });
        
        Logger.info(`[ChatService] ✅ Đã lưu message user (messageId: ${userMessage._id})`);

        // ✅ Đẩy job vào Queue (không chờ kết quả)
        const job = await urlPreviewQueue.add({
          url: urlToProcess,
          conversationId: conversation._id.toString(),
          userId: userId ? userId.toString() : null,
          message: message || urlToProcess,
        }, {
          // ✅ Priority: URL preview có priority thấp hơn các job khác
          priority: 5,
        });

        Logger.info(`[ChatService] ✅ Đã đẩy job ${job.id} vào Queue`);

        // ✅ Trả về response ngay lập tức (không chờ queue xử lý)
        // Worker sẽ xử lý bất đồng bộ và gửi kết quả qua Socket khi hoàn thành
        return {
          type: "text",
          content: {
            text: "Đang xem website của bạn... Tôi sẽ phân tích và tư vấn in ấn phù hợp trong giây lát! 🎨",
          },
          conversationId: conversation._id,
          newConversation: isNewConversation ? conversation : null,
          _urlPreviewJobId: job.id, // Trả về job ID để client có thể track (optional)
        };

      } catch (queueError) {
        Logger.error(`[ChatService] ❌ Lỗi khi đẩy vào Queue: ${queueError.message}`);
        // ✅ Fallback: Xử lý như tin nhắn text bình thường
        systemNote = `[SYSTEM ERROR] Không thể xử lý link này lúc này. Hãy thử lại sau.`;
      }
    }
    // --- KẾT THÚC LOGIC URL PREVIEW ---

    // 2. Chuẩn bị Context
    const context = {
      user: user,
      actorId: userId,
      actorType: isGuest ? "Guest" : "User",
      latitude: latitude,
      longitude: longitude,
      conversationId: conversation._id,
      fileUrl: fileUrl // Quan trọng: URL này giờ có thể là ảnh từ Canva
    };

    // 3. Lấy lịch sử chat
    const historyData = await this.chatRepository.getPaginatedMessages(conversation._id, 1, 20);
    const history = historyData.messages || [];

    let responsePayload;
    let visionContext = null;

    try {
      if (fileUrl) {
        // Có file (Upload trực tiếp HOẶC từ Canva) -> Dùng Vision AI
        const analysis = await this.handleFileAnalysis(fileUrl, fileType || 'image/jpeg', context);
        visionContext = analysis;
        
        const visionPrompt = systemNote 
            ? `${systemNote}. Kết quả Vision AI: "${analysis}".` 
            : `[SYSTEM] User vừa upload file. Kết quả Vision AI: "${analysis}". Nhiệm vụ: Xác nhận và gợi ý in ấn.`;

        responsePayload = await this.agent.run(
          context,
          history,
          message || "Tôi vừa gửi một file.",
          visionPrompt
        );
      } else if (type === "product" && metadata?.productId) {
         // (Logic xử lý Product cũ giữ nguyên...)
         responsePayload = await this.handleProductMessage(context, metadata.productId, message);
         responsePayload._messageMetadata = metadata;
         responsePayload._messageType = "product";
      } else if (message) {
         // (Logic xử lý Text cũ giữ nguyên...)
         const detectedProductId = this.detectProductLink(message);
         if (detectedProductId) {
            // ...
            responsePayload = await this.handleProductMessage(context, detectedProductId, message);
         } else {
            responsePayload = await this.agent.run(context, history, message);
         }
      } else {
        throw new ValidationException("Nội dung tin nhắn không hợp lệ.");
      }

      // 4. Lưu vào DB
      await this.saveChatHistoryTransactional(
        userId,
        conversation,
        {
          text: message || `Đã gửi file: ${fileName || 'Canva Design'}`,
          fileUrl: fileUrl,
          visionNote: visionContext,
        },
        responsePayload,
        {
          type: responsePayload._messageType || type || "text",
          metadata: responsePayload._messageMetadata || metadata,
        }
      );

      return {
        ...responsePayload,
        conversationId: conversation._id,
        newConversation: isNewConversation ? conversation : null,
      };

    } catch (error) {
      Logger.error("[ChatBotSvc] Fatal error:", error);
      return ChatResponseUtil.createTextResponse(
        "Xin lỗi, hệ thống đang bận. Vui lòng thử lại sau."
      );
    }
  }

  // ... (Giữ nguyên các hàm helper khác: handleFileAnalysis, saveChatHistoryTransactional, v.v.)
  // Lưu ý: handleFileAnalysis đã đủ tốt để xử lý cả ảnh Canva vì nó dùng AI Vision.
  async handleFileAnalysis(fileUrl, fileType, context) {
    // Ép kiểu image nếu đến từ Canva (vì ta chụp ảnh jpeg)
    const isImage = (fileType && fileType.startsWith("image/")) || (fileUrl && fileUrl.includes("canva-capture"));
    const isPdf = fileType === "application/pdf";
    
    if (!isImage && !isPdf) return `File tài liệu (${fileType})`;
    
    const prompt = "Hãy đóng vai chuyên gia in ấn. Mô tả ngắn gọn thiết kế này (màu sắc chủ đạo, bố cục, nội dung) và gợi ý 3 sản phẩm in ấn phù hợp nhất.";
    try {
      return await this.aiService.getVisionCompletion(fileUrl, prompt, context);
    } catch (e) {
      Logger.warn("[ChatSvc] Vision Analysis failed:", e);
      return "Không thể phân tích nội dung ảnh.";
    }
  }

  /**
   * ✅ FIX: Detect product ID từ message text
   * Tìm product link hoặc ObjectId trong message
   */
  detectProductLink(message) {
    if (!message || typeof message !== "string") return null;

    // Tìm pattern: /products/[productId] hoặc /product/[productId]
    const productUrlRegex = /\/products?\/([a-zA-Z0-9_-]+)/;
    const urlMatch = message.match(productUrlRegex);
    if (urlMatch && urlMatch[1]) {
      return urlMatch[1];
    }

    // Tìm MongoDB ObjectId pattern (24 hex characters)
    const objectIdRegex = /([0-9a-fA-F]{24})/;
    const idMatch = message.match(objectIdRegex);
    if (idMatch && mongoose.Types.ObjectId.isValid(idMatch[1])) {
      return idMatch[1];
    }

    return null;
  }

  /**
   * ✅ FIX: Handle message về product
   * Lấy product và tạo response phù hợp
   */
  async handleProductMessage(context, productId, message) {
    try {
      // Lấy product từ database
      const product = await productRepository.findById(productId);
      
      if (!product) {
        return ChatResponseUtil.createTextResponse(
          "Xin lỗi, tôi không tìm thấy sản phẩm này. Bạn có thể mô tả lại sản phẩm bạn muốn tìm không?"
        );
      }

      // Populate printerProfileId nếu có
      if (product.printerProfileId) {
        await product.populate("printerProfileId", "businessName avatarUrl");
      }

      // Convert to object để dễ xử lý
      const productObj = product.toObject ? product.toObject() : product;

      // Tạo product response
      return {
        type: "product",
        content: {
          text: `Đây là sản phẩm "${productObj.name}":`,
        },
        _messageType: "product",
        _messageMetadata: {
          productId: productObj._id.toString(),
          productName: productObj.name,
          productSlug: productObj.slug,
          price: productObj.pricing?.basePrice || productObj.basePrice || null,
          image: productObj.images?.[0] || null,
          category: productObj.category,
          printerName: productObj.printerProfileId?.businessName || null,
        },
      };
    } catch (error) {
      Logger.error("[ChatSvc] Error handling product message:", error);
      return ChatResponseUtil.createTextResponse(
        "Xin lỗi, có lỗi xảy ra khi xử lý thông tin sản phẩm."
      );
    }
  }

  /**
   * ✅ FIX: Lưu chat history vào database (user message + bot response)
   */
  async saveChatHistoryTransactional(userId, conversation, userMessageData, responsePayload, metadata) {
    try {
      // 1. Lưu tin nhắn của user
      if (userId || userMessageData.text || userMessageData.fileUrl) {
        await this.chatRepository.createMessage({
          conversationId: conversation._id,
          sender: userId || null,
          senderType: userId ? "User" : "Guest",
          type: metadata?.type || "text",
          content: {
            text: userMessageData.text || "",
            fileUrl: userMessageData.fileUrl || null,
          },
          metadata: metadata?.metadata || null,
        });
      }

      // 2. Lưu response của bot
      const botResponseType = responsePayload.type || "ai_response";
      const botContent = responsePayload.content || { text: "" };

      await this.chatRepository.createMessage({
        conversationId: conversation._id,
        sender: null, // Bot không có user ID
        senderType: "AI",
        type: botResponseType === "text" ? "ai_response" : botResponseType,
        content: botContent,
        metadata: responsePayload._messageMetadata || metadata?.metadata || null,
      });

      Logger.debug("[ChatSvc] Chat history saved successfully");
    } catch (error) {
      Logger.error("[ChatSvc] Error saving chat history:", error);
      // Không throw error để không làm gián đoạn flow chính
    }
  }
}
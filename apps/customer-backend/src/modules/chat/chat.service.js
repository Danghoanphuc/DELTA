import mongoose from "mongoose";
import { ChatRepository } from "./chat.repository.js";
import { ChatAgent } from "./chat.agent.js";
import { ChatAiService } from "./chat.ai.service.js";
import {
  ValidationException,
  NotFoundException,
} from "../../shared/exceptions/index.js";
import { Logger } from "../../shared/utils/index.js";
import { ChatResponseUtil } from "./chat.response.util.js";
import { Conversation } from "../../shared/models/conversation.model.js";
import { Message } from "../../shared/models/message.model.js";
import { Product } from "../../shared/models/product.model.js";
import { config } from "../../config/env.config.js";
import { socketService } from "../../infrastructure/realtime/socket.service.js";

export class ChatService {
  constructor() {
    this.chatRepository = new ChatRepository();
    this.agent = new ChatAgent();
    this.aiService = new ChatAiService();
  }

  /**
   * ✅ Xử lý tin nhắn BOT AI (Thông minh, Agent, Vision, Tools)
   */
  async handleBotMessage(user, body, isGuest = false) {
    const {
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

    // 1. Lấy hoặc tạo Conversation với Bot
    let conversation = null;
    let isNewConversation = false;

    if (conversationId) {
      conversation = await this.chatRepository.findConversationById(
        conversationId,
        userId
      );
    }

    if (!conversation) {
      conversation = await this.chatRepository.createConversation(userId);
      isNewConversation = true;
    }

    // 2. Chuẩn bị Context
    const context = {
      user: user,
      actorId: userId,
      actorType: isGuest ? "Guest" : "User",
      latitude: latitude,
      longitude: longitude,
      conversationId: conversation._id,
    };

    // 3. Lấy lịch sử chat
    const historyData = await this.chatRepository.getPaginatedMessages(
      conversation._id,
      1,
      20
    );
    const history = historyData.messages || [];

    let responsePayload;
    let visionContext = null;

    try {
      if (fileUrl) {
        const analysis = await this.handleFileAnalysis(
          fileUrl,
          fileType,
          context
        );
        visionContext = analysis;
        const systemMsg = `[SYSTEM] User vừa upload file: ${fileName}. Kết quả Vision AI: "${analysis}". Nhiệm vụ: Xác nhận đã thấy file và đưa ra gợi ý sản phẩm in ấn phù hợp.`;
        responsePayload = await this.agent.run(
          context,
          history,
          "Tôi vừa gửi một file.",
          systemMsg
        );
      } else if (type === "product" && metadata?.productId) {
        responsePayload = await this.handleProductMessage(
          context,
          metadata.productId,
          message
        );
        responsePayload._messageMetadata = metadata;
        responsePayload._messageType = "product";
      } else if (message) {
        const detectedProductId = this.detectProductLink(message);
        if (detectedProductId) {
          responsePayload = await this.handleProductMessage(
            context,
            detectedProductId,
            message
          );
          const extractedMetadata = await this.extractProductMetadata(
            detectedProductId
          );
          if (extractedMetadata) {
            responsePayload._messageMetadata = extractedMetadata;
            responsePayload._messageType = "product";
          }
        } else {
          responsePayload = await this.agent.run(context, history, message);
        }
      } else {
        throw new ValidationException("Nội dung tin nhắn không hợp lệ.");
      }

      await this.saveChatHistoryTransactional(
        userId,
        conversation,
        {
          text: message || `Đã gửi file: ${fileName}`,
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

  // --- CÁC HÀM HELPER ---
  async handleFileAnalysis(fileUrl, fileType, context) {
    const isImage = fileType && fileType.startsWith("image/");
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

  async saveChatHistoryTransactional(userId, conversation, userContent, aiResponse, options = {}) {
    const session = await mongoose.startSession();
    session.startTransaction();
    let transactionCommitted = false;
    try {
      const userMsg = new Message({
        conversationId: conversation._id,
        sender: userId,
        senderType: userId ? "User" : "Guest",
        content: { text: userContent.text, fileUrl: userContent.fileUrl },
        type: options.type || "text",
        metadata: options.metadata,
        internalNote: userContent.visionNote,
      });
      await userMsg.save({ session });

      const aiText = aiResponse.content.text || "Tôi đã nhận được yêu cầu.";
      const aiMetadata = aiResponse.content.product ? { product: aiResponse.content.product } : null;

      const aiMsg = new Message({
        conversationId: conversation._id,
        sender: null,
        senderType: "AI",
        content: { text: aiText },
        type: aiResponse.type === "product_card" ? "product" : "text",
        metadata: aiMetadata,
      });
      await aiMsg.save({ session });

      const messageCount = await Message.countDocuments({ conversationId: conversation._id }).session(session);
      let updateOps = { lastMessageAt: new Date() };

      if (messageCount <= 2 && userContent.text && (!conversation.title || conversation.title === "Cuộc trò chuyện mới")) {
        try {
          const smartTitle = await this.generateConversationTitle(userContent.text);
          updateOps.title = smartTitle;
        } catch (err) {
          updateOps.title = userContent.text.substring(0, 30) + "...";
        }
      }

      await Conversation.findByIdAndUpdate(conversation._id, updateOps).session(session);
      await session.commitTransaction();
      transactionCommitted = true;

      // ✅ REDIS: Bot chat có tin nhắn mới -> Danh sách thay đổi thứ tự -> Xóa cache
      if (userId) {
        try {
          await this.chatRepository.invalidateUserCache(userId);
        } catch (cacheError) {
          Logger.warn("[ChatSvc] Cache invalidation failed (non-critical):", cacheError);
        }

        try {
          socketService.emitToUser(userId.toString(), "new_message", {
            ...aiMsg.toObject(),
            conversationId: conversation._id,
          });
        } catch (socketError) {
          Logger.warn("[ChatSvc] Socket emit failed (non-critical):", socketError);
        }
      }
    } catch (error) {
      if (!transactionCommitted && session.inTransaction()) {
        await session.abortTransaction();
      }
      Logger.error("[ChatSvc] Transaction failed:", error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  detectProductLink(message) {
    if (!message) return null;
    try {
      const clientUrls = config.clientUrls || [];
      const patterns = [
        ...clientUrls.map((url) => new RegExp(`${url.replace(/\//g, "\\/")}\\/products\\/([a-zA-Z0-9-]+)`, "i")),
        /\/products\/([a-zA-Z0-9-]+)/i,
        /product[/:=]([a-zA-Z0-9-]+)/i,
      ];
      for (const pattern of patterns) {
        const match = message.match(pattern);
        if (match && match[1]) return match[1];
      }
      return null;
    } catch (error) { return null; }
  }

  async extractProductMetadata(productIdOrSlug) {
    try {
      const product = await Product.findOne({
        $or: [{ _id: mongoose.isValidObjectId(productIdOrSlug) ? productIdOrSlug : null }, { slug: productIdOrSlug }],
        isActive: true, isPublished: true,
      }).populate("printerProfileId", "businessName").lean();
      if (!product) return null;
      return {
        productId: product._id.toString(),
        productName: product.name,
        productSlug: product.slug,
        price: product.basePrice,
        image: product.images?.[0]?.url || null,
        category: product.category,
        printerName: product.printerProfileId?.businessName || "Unknown",
      };
    } catch (error) { return null; }
  }

  async handleProductMessage(context, productId, originalMessage) {
    const metadata = await this.extractProductMetadata(productId);
    if (!metadata) return ChatResponseUtil.createTextResponse("Xin lỗi, tôi không tìm thấy sản phẩm này.");
    return {
      type: "product_card",
      content: { text: originalMessage || `Thông tin sản phẩm: ${metadata.productName}`, product: metadata },
      quickReplies: [{ text: "Thêm vào giỏ", payload: `/add-to-cart:${metadata.productId}` }, { text: "Xem chi tiết", payload: `/view-product:${metadata.productId}` }],
    };
  }

  async generateConversationTitle(userMessage) {
    try {
      const prompt = `Tạo tiêu đề ngắn (dưới 6 từ) cho tin nhắn: "${userMessage}". Chỉ trả về text.`;
      const response = await this.aiService.getCompletion([{ role: "user", content: prompt }], [], {});
      let title = response.choices[0].message.content.trim().replace(/^["']|["']$/g, "");
      return title.length > 50 ? title.substring(0, 47) + "..." : title;
    } catch (err) { return "Cuộc trò chuyện mới"; }
  }

  async mergeGuestConversation(guestConversationId, userId) {
    if (!guestConversationId || !userId) return;
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const guestConv = await Conversation.findById(guestConversationId).session(session);
      if (!guestConv) throw new NotFoundException("Không tìm thấy cuộc hội thoại khách.");
      guestConv.participants = [{ userId: userId, role: "customer" }];
      guestConv.type = "customer-bot";
      await guestConv.save({ session });
      await Message.updateMany(
        { conversationId: guestConversationId, sender: null, senderType: "Guest" },
        { $set: { sender: userId, senderType: "User" } }
      ).session(session);
      await session.commitTransaction();
      return guestConv;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally { session.endSession(); }
  }

  async getConversations(userId) {
    return this.chatRepository.findConversationsByUserId(userId);
  }
  
  async getMessages(conversationId, userId, query) {
    const conversation = await this.chatRepository.getConversationMetadata(conversationId, userId);
    if (!conversation) throw new NotFoundException("Không tìm thấy cuộc trò chuyện");
    return this.chatRepository.getPaginatedMessages(conversationId, query.page, query.limit);
  }
  
  async renameConversation(id, uid, title) {
    const conv = await this.chatRepository.getConversationMetadata(id, uid);
    if (!conv) throw new NotFoundException("Không tìm thấy");
    await this.chatRepository.updateConversationTitle(id, title);
  }

}
// src/modules/chat/chat.repository.js (✅ REFACTORED - FIX PRINTERS + MULTI-CONVO)
import { Conversation } from "../../shared/models/conversation.model.js";
import { Message } from "../../shared/models/message.model.js";
// ❌ KHÔNG DÙNG USER NỮA
// import { User } from "../../shared/models/user.model.js";
// ✅ DÙNG PRINTERPROFILE
import { PrinterProfile } from "../../shared/models/printer-profile.model.js";

export class ChatRepository {
  // === LOGIC CONVERSATION MỚI ===

  /**
   * Tìm 1 conversation bằng ID và xác thực chủ sở hữu
   */
  async findConversationById(conversationId, userId) {
    return await Conversation.findOne({
      _id: conversationId,
      "participants.userId": userId,
    });
  }

  /**
   * Lấy danh sách (metadata) các cuộc trò chuyện
   */
  async findConversationsByUserId(userId) {
    return await Conversation.find({
      "participants.userId": userId,
    })
      .sort({ lastMessageAt: -1 })
      .select("_id title lastMessageAt createdAt"); // Chỉ lấy metadata
  }

  /**
   * Tạo một cuộc trò chuyện mới
   */
  async createConversation(userId) {
    return await Conversation.create({
      type: "customer-bot",
      title: "Cuộc trò chuyện mới", // Title tạm thời
      participants: [{ userId: userId, role: "customer" }],
      messages: [],
    });
  }

  async createMessage(messageData) {
    return await Message.create(messageData);
  }

  async saveConversation(conversation) {
    return await conversation.save();
  }

  /**
   * Lấy tin nhắn của 1 cuộc trò chuyện (và xác thực)
   */
  async getMessagesByConversationId(conversationId, userId) {
    return await Conversation.findOne({
      _id: conversationId,
      "participants.userId": userId, // Xác thực
    })
      .sort({ createdAt: -1 })
      .populate({
        path: "messages",
        options: { sort: { createdAt: 1 } },
      });
  }

  /**
   * (Hàm getHistory(userId) cũ đã bị thay thế)
   */

  // === SỬA LỖI A: FIND PRINTERS ===
  /**
   * Sửa lỗi: Query trên PrinterProfile thay vì User
   */
  async findPrinters(searchContext) {
    const { entities, coordinates } = searchContext;
    let printers = [];
    let baseQuery = { isActive: true };

    // Xây dựng bộ lọc thuộc tính
    if (entities.product_type)
      baseQuery.specialties = { $in: [entities.product_type] };
    if (entities.criteria.includes("cheap")) baseQuery.priceTier = "cheap";
    if (entities.criteria.includes("fast")) baseQuery.productionSpeed = "fast";

    if (entities.criteria.includes("nearby") && coordinates) {
      // Logic tìm kiếm GeoJSON
      printers = await PrinterProfile.find({
        ...baseQuery,
        "shopAddress.location": {
          $nearSphere: {
            $geometry: { type: "Point", coordinates: coordinates }, // [long, lat]
            $maxDistance: 10000, // 10km
          },
        },
      })
        .limit(5)
        .populate("userId", "displayName avatarUrl"); // Populate thông tin User
    } else {
      // Logic tìm kiếm $text
      if (entities.location) {
        baseQuery.$text = { $search: entities.location };
      }

      printers = await PrinterProfile.find(baseQuery)
        .limit(5)
        .populate("userId", "displayName avatarUrl"); // Populate thông tin User
    }
    return printers;
  }
}

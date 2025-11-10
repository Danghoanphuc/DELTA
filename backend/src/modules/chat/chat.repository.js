// src/modules/chat/chat.repository.js
// ✅ BÀN GIAO: Triển khai Pagination, bỏ populate

import { Conversation } from "../../shared/models/conversation.model.js";
import { Message } from "../../shared/models/message.model.js"; // ✅ Import Message
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

  // ============================================
  // ✅ THAY ĐỔI LOGIC LẤY TIN NHẮN
  // ============================================

  /**
   * ✅ MỚI: Chỉ lấy thông tin (metadata) của Conversation
   * Xác thực user có quyền xem convo này không
   */
  async getConversationMetadata(conversationId, userId) {
    return await Conversation.findOne({
      _id: conversationId,
      "participants.userId": userId,
    }).select("-messages"); // QUAN TRỌNG: Loại bỏ mảng 'messages'
  }

  /**
   * ✅ MỚI: Lấy tin nhắn phân trang (Sắp xếp MỚI NHẤT lên đầu)
   * Client sẽ nhận (page 1) là các tin nhắn mới nhất
   */
  async getPaginatedMessages(conversationId, page = 1, limit = 30) {
    const skip = (page - 1) * limit;

    // Lấy tổng số tin nhắn (để client biết tổng số trang)
    const totalMessages = await Message.countDocuments({ conversationId });

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: -1 }) // Sắp xếp MỚI NHẤT lên đầu
      .skip(skip)
      .limit(limit);

    return {
      messages: messages.reverse(), // Đảo ngược lại để client hiển thị (Cũ -> Mới)
      totalMessages,
      currentPage: page,
      totalPages: Math.ceil(totalMessages / limit),
    };
  }

  /**
   * ❌ BỎ HÀM CŨ: getMessagesByConversationId (hàm gây lỗi populate)
   */
  // async getMessagesByConversationId(conversationId, userId) { ... }

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

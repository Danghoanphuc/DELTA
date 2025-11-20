// apps/customer-backend/src/modules/chat/chat.repository.js
// ✅ FIXED: Lấy đủ Type và Participants để Frontend hiển thị

import { Conversation } from "../../shared/models/conversation.model.js";
import { Message } from "../../shared/models/message.model.js";
import { PrinterProfile } from "../../shared/models/printer-profile.model.js";

export class ChatRepository {
  // ... (Giữ nguyên các hàm findConversationById...)
  async findConversationById(conversationId, userId) {
    return await Conversation.findOne({
      _id: conversationId,
      "participants.userId": userId,
    });
  }

  /**
   * ✅ FIXED: Lấy danh sách cuộc trò chuyện ĐẦY ĐỦ thông tin
   * - Thêm 'type', 'participants', 'updatedAt'
   * - Populate user để hiển thị Avatar/Tên ở danh sách
   */
  async findConversationsByUserId(userId) {
    return await Conversation.find({
      "participants.userId": userId,
      isActive: true, // Chỉ lấy cuộc trò chuyện còn hoạt động (chưa bị xóa)
    })
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      // ✅ Quan trọng: Select đủ field
      .select("_id title lastMessageAt createdAt updatedAt type participants")
      // ✅ Populate để lấy Avatar/Tên người chat cùng
      .populate("participants.userId", "username displayName avatarUrl role");
  }

  // ... (Các hàm createConversation, createMessage giữ nguyên logic cũ) ...
  async createConversation(userId) {
    return await Conversation.create({
      type: "customer-bot",
      title: "Cuộc trò chuyện mới",
      participants: [{ userId: userId, role: "customer" }],
    });
  }

  async createMessage(messageData) {
    const message = await Message.create(messageData);
    await Conversation.findByIdAndUpdate(messageData.conversationId, {
      lastMessageAt: new Date(),
    });
    return message;
  }

  async saveConversation(conversation) {
    return await conversation.save();
  }

  // ... (Giữ nguyên getConversationMetadata, getPaginatedMessages...) ...
  async getConversationMetadata(conversationId, userId) {
    return await Conversation.findOne({
      _id: conversationId,
      "participants.userId": userId,
    });
  }

  async getPaginatedMessages(conversationId, page = 1, limit = 30) {
    const skip = (page - 1) * limit;
    const totalMessages = await Message.countDocuments({ conversationId });
    const messages = await Message.find({ conversationId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return {
      messages: messages.reverse(),
      totalMessages,
      currentPage: page,
      totalPages: Math.ceil(totalMessages / limit),
    };
  }

  // ... (Giữ nguyên findPrinters, updateConversationTitle, deleteConversation...) ...
  async findPrinters(searchContext) {
    const { entities, coordinates } = searchContext;
    let baseQuery = { isActive: true };
    if (entities.product_type)
      baseQuery.specialties = { $in: [entities.product_type] };
    if (entities.criteria.includes("cheap")) baseQuery.priceTier = "cheap";
    if (entities.criteria.includes("fast")) baseQuery.productionSpeed = "fast";

    if (entities.criteria.includes("nearby") && coordinates) {
      return await PrinterProfile.find({
        ...baseQuery,
        "shopAddress.location": {
          $nearSphere: {
            $geometry: { type: "Point", coordinates: coordinates },
            $maxDistance: 10000,
          },
        },
      })
        .limit(5)
        .populate("userId", "displayName avatarUrl");
    } else {
      if (entities.location) baseQuery.$text = { $search: entities.location };
      return await PrinterProfile.find(baseQuery)
        .limit(5)
        .populate("userId", "displayName avatarUrl");
    }
  }

  async updateConversationTitle(conversationId, newTitle) {
    return await Conversation.findByIdAndUpdate(
      conversationId,
      { title: newTitle },
      { new: true }
    );
  }

  async deleteConversation(conversationId) {
    await Message.deleteMany({ conversationId });
    return await Conversation.findByIdAndDelete(conversationId);
  }
}

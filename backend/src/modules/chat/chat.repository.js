// src/modules/chat/chat.repository.js
import { Conversation } from "../../shared/models/conversation.model.js";
import { Message } from "../../shared/models/message.model.js";
import { User } from "../../shared/models/user.model.js"; // Cần User để tìm nhà in

export class ChatRepository {
  async findConversation(userId) {
    return await Conversation.findOne({
      type: "customer-bot",
      "participants.userId": userId,
    });
  }

  async createConversation(userId) {
    return await Conversation.create({
      type: "customer-bot",
      participants: [{ userId: userId, role: "customer" }],
      messages: [],
    });
  }

  async findOrCreateConversation(userId) {
    let conversation = await this.findConversation(userId);
    if (!conversation) {
      conversation = await this.createConversation(userId);
    }
    return conversation;
  }

  async createMessage(messageData) {
    return await Message.create(messageData);
  }

  async saveConversation(conversation) {
    return await conversation.save();
  }

  async getHistory(userId) {
    return await Conversation.findOne({
      "participants.userId": userId,
      type: "customer-bot",
    })
      .sort({ createdAt: -1 })
      .populate({
        path: "messages",
        options: { sort: { createdAt: 1 } },
      });
  }

  async findPrinters(searchContext) {
    const { entities, coordinates } = searchContext;
    let printers = [];

    if (entities.criteria.includes("nearby") && coordinates) {
      // Logic tìm kiếm GeoJSON
      let geoFilter = { role: "printer", isActive: true };
      if (entities.product_type)
        geoFilter.specialties = { $in: [entities.product_type] };
      if (entities.criteria.includes("cheap")) geoFilter.priceTier = "cheap";
      if (entities.criteria.includes("fast"))
        geoFilter.productionSpeed = "fast";

      printers = await User.find({
        "address.location": {
          $nearSphere: {
            $geometry: { type: "Point", coordinates: coordinates }, // [long, lat]
            $maxDistance: 10000, // 10km
          },
        },
        ...geoFilter,
      })
        .limit(5)
        .select("displayName rating address specialties priceTier");
    } else {
      // Logic tìm kiếm $text
      let queryConditions = [{ role: "printer" }, { isActive: true }];
      if (entities.product_type)
        queryConditions.push({ specialties: { $in: [entities.product_type] } });
      if (entities.location)
        queryConditions.push({ $text: { $search: entities.location } });
      if (entities.criteria.includes("cheap"))
        queryConditions.push({ priceTier: "cheap" });
      if (entities.criteria.includes("fast"))
        queryConditions.push({ productionSpeed: "fast" });

      printers = await User.find({ $and: queryConditions })
        .limit(5)
        .select("displayName rating address specialties priceTier");
    }
    return printers;
  }
}

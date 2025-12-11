// apps/customer-backend/src/modules/delivery-thread/delivery-thread.repository.js
/**
 * Delivery Thread Repository
 * Data access layer for delivery threads
 */

import { DeliveryThread } from "./delivery-thread.model.js";
import { Logger } from "../../shared/utils/index.js";

export class DeliveryThreadRepository {
  async create(data) {
    const thread = new DeliveryThread(data);
    return await thread.save();
  }

  async findById(id) {
    return await DeliveryThread.findById(id).lean();
  }

  async findByCheckinId(checkinId) {
    return await DeliveryThread.findOne({ checkinId, isDeleted: false }).lean();
  }

  async findByOrderId(orderId) {
    // Find order-level thread (has orderId but NO checkinId)
    return await DeliveryThread.findOne({
      orderId,
      checkinId: { $exists: false },
      isDeleted: false,
    }).lean();
  }

  async findByOrganization(organizationId, options = {}) {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const query = { organizationId, isDeleted: false };

    const [threads, total] = await Promise.all([
      DeliveryThread.find(query)
        .sort({ lastMessageAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      DeliveryThread.countDocuments(query),
    ]);

    return {
      threads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByParticipant(userId, options = {}) {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const query = {
      "participants.userId": userId,
      isDeleted: false,
    };

    const [threads, total] = await Promise.all([
      DeliveryThread.find(query)
        .sort({ lastMessageAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      DeliveryThread.countDocuments(query),
    ]);

    return {
      threads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async addMessage(threadId, messageData) {
    const thread = await DeliveryThread.findById(threadId);
    if (!thread) return null;

    return await thread.addMessage(messageData);
  }

  async updateMessage(threadId, messageId, updates) {
    return await DeliveryThread.findOneAndUpdate(
      { _id: threadId, "messages._id": messageId },
      {
        $set: {
          "messages.$.content": updates.content,
          "messages.$.isEdited": true,
          "messages.$.editedAt": new Date(),
        },
      },
      { new: true }
    ).lean();
  }

  async deleteMessage(threadId, messageId) {
    return await DeliveryThread.findOneAndUpdate(
      { _id: threadId, "messages._id": messageId },
      {
        $set: {
          "messages.$.isDeleted": true,
          "messages.$.deletedAt": new Date(),
        },
      },
      { new: true }
    ).lean();
  }

  async markAsRead(threadId, userId) {
    const thread = await DeliveryThread.findById(threadId);
    if (!thread) return null;

    return await thread.markAsRead(userId);
  }

  async getUnreadCount(userId) {
    const threads = await DeliveryThread.find({
      "participants.userId": userId,
      isDeleted: false,
    }).lean();

    let unreadCount = 0;
    threads.forEach((thread) => {
      const participant = thread.participants.find(
        (p) => p.userId.toString() === userId.toString()
      );
      if (participant) {
        const lastReadAt = participant.lastReadAt || participant.joinedAt;
        const unreadMessages = thread.messages.filter(
          (m) =>
            !m.isDeleted &&
            m.senderId.toString() !== userId.toString() &&
            new Date(m.createdAt) > new Date(lastReadAt)
        );
        unreadCount += unreadMessages.length;
      }
    });

    return unreadCount;
  }
}

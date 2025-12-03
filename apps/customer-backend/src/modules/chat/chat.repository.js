import mongoose from "mongoose";
import { Conversation } from "../../shared/models/conversation.model.js";
import { Message } from "../../shared/models/message.model.js";
import { User } from "../../shared/models/user.model.js";
import { getRedisClient } from "../../infrastructure/cache/redis.js";
import { Logger } from "../../shared/utils/index.js";

const CACHE_TTL = 3600; // 1 giờ

export class ChatRepository {
  // Xóa cache (giữ nguyên vì cần thiết)
  async invalidateUserCache(userId) {
    const redis = getRedisClient();
    if (!redis) return;
    // Invalidate pattern match might be needed if exact keys are hard to track,
    // but for now deleting the specific keys we know is safer.
    // Since we added type to cache key, we should ideally delete all variants.
    // For simplicity/performance in this context, we assume TTL will handle old keys
    // or exact key invalidation is done where specific types are known.
    // A scan-and-delete approach is better for production but heavier.
    const keys = [
      `chat:user:${userId}:conversations:all`,
      `chat:user:${userId}:conversations:customer-bot`,
      `chat:user:${userId}:conversations:peer-to-peer`,
      `chat:user:${userId}:conversations:group`,
    ];
    await redis.del(...keys).catch((e) => Logger.warn("[Redis] Del failed", e));
  }

  async invalidateParticipantsCache(userIds) {
    const redis = getRedisClient();
    if (!redis || !userIds.length) return;

    // Tạo list keys cần xóa cho mỗi user
    const keys = [];
    userIds.forEach((id) => {
      keys.push(
        `chat:user:${id}:conversations:all`,
        `chat:user:${id}:conversations:customer-bot`,
        `chat:user:${id}:conversations:peer-to-peer`,
        `chat:user:${id}:conversations:group`
      );
    });

    if (keys.length > 0) {
      await redis
        .del(...keys)
        .catch((e) => Logger.warn("[Redis] Bulk Del failed", e));
    }
  }

  // ✅ CẬP NHẬT: Hỗ trợ lọc theo type ngay tại DB
  async findConversationsByUserId(userId, type = null) {
    // 🔥 Cache Key riêng biệt cho từng loại query để tránh lẫn lộn
    const cacheKey = `chat:user:${userId}:conversations:${type || "all"}`;
    const redis = getRedisClient();

    // 1. Try Cache
    if (redis) {
      const cached = await redis.get(cacheKey).catch(() => null);
      if (cached) {
        return JSON.parse(cached);
      }
    }

    // 2. Query DB (Tối ưu hóa Query)
    const query = {
      participants: {
        $elemMatch: { userId: userId, isVisible: true },
      },
      isActive: true,
    };

    // 🔥 LỌC NGAY TẠI DB: Nếu có type, thêm vào query luôn
    if (type) {
      query.type = type;
    }

    const conversations = await Conversation.find(query)
      .sort({ lastMessageAt: -1 })
      .populate(
        "participants.userId",
        "username displayName avatarUrl isOnline"
      )
      .lean();

    // 3. Set Cache
    if (redis) {
      await redis
        .set(cacheKey, JSON.stringify(conversations), "EX", CACHE_TTL)
        .catch(() => {});
    }

    return conversations;
  }

  async createMessage(data) {
    const msg = await Message.create(data);

    // Auto un-hide conversation & update last message
    await Conversation.updateOne(
      { _id: data.conversationId },
      {
        $set: {
          lastMessageAt: new Date(),
          lastMessagePreview:
            typeof data.content.text === "string"
              ? data.content.text.substring(0, 50)
              : "Tin nhắn mới",
          "participants.$[].isVisible": true,
        },
      }
    );

    // Invalidate Cache
    const conv = await Conversation.findById(data.conversationId)
      .select("participants")
      .lean();
    if (conv) {
      const ids = conv.participants.map((p) => p.userId);
      await this.invalidateParticipantsCache(ids);
    }

    return msg;
  }

  async getPaginatedMessages(conversationId, page = 1, limit = 30) {
    const skip = (page - 1) * limit;
    const [messages, total] = await Promise.all([
      Message.find({ conversationId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
          path: "replyTo",
          select: "content sender createdAt type",
          populate: {
            path: "sender",
            select: "username displayName avatarUrl",
          },
        })
        .lean(),
      Message.countDocuments({ conversationId }),
    ]);
    return {
      messages: messages.reverse(),
      totalMessages: total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findConversationById(id, userId) {
    return Conversation.findOne({ _id: id, "participants.userId": userId });
  }

  async createConversation(userId) {
    // ✅ FIX: Không cho phép tạo conversation nếu không có userId
    if (!userId) {
      throw new Error(
        "Cannot create conversation without userId. Guest users must login first."
      );
    }
    return Conversation.create({
      type: "customer-bot",
      participants: [{ userId, role: "customer", isVisible: true }],
    });
  }

  async updateConversationTitle(conversationId, newTitle) {
    const updated = await Conversation.findByIdAndUpdate(
      conversationId,
      { $set: { title: newTitle } },
      { new: true }
    ).lean();

    // Invalidate cache
    if (updated) {
      const ids = updated.participants.map((p) => p.userId);
      await this.invalidateParticipantsCache(ids);
    }

    return updated;
  }

  // Hàm này dùng cho UrlProcessorWorker cập nhật message
  async updateMessage(messageId, updates) {
    return Message.findByIdAndUpdate(
      messageId,
      { $set: updates },
      { new: true }
    );
  }
}

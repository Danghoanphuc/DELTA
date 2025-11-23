// apps/customer-backend/src/modules/chat/chat.repository.js
import mongoose from "mongoose";
import { Conversation } from "../../shared/models/conversation.model.js";
import { Message } from "../../shared/models/message.model.js";
import { PrinterProfile } from "../../shared/models/printer-profile.model.js";
import { User } from "../../shared/models/user.model.js"; // ✅ Import User model
import { getRedisClient } from "../../infrastructure/cache/redis.js";
import { Logger } from "../../shared/utils/index.js";

const CACHE_TTL = 60 * 60; // Cache tồn tại 1 tiếng (tự refresh khi có update)

export class ChatRepository {
  /**
   * ✅ HELPER: Xóa cache của 1 user (dùng khi có update)
   */
  async invalidateUserCache(userId) {
    try {
      const redisClient = getRedisClient();
      if (!redisClient) return; // Redis không khả dụng, bỏ qua

      // Xóa cả cache với type và không có type
      const keys = [
        `chat:user:${userId.toString()}:conversations:all`,
        `chat:user:${userId.toString()}:conversations:peer-to-peer`,
        `chat:user:${userId.toString()}:conversations:group`,
        `chat:user:${userId.toString()}:conversations:customer-printer`,
      ];
      await redisClient.del(...keys);
    } catch (error) {
      Logger.warn(`[Redis] Failed to invalidate cache for user ${userId}`, error);
    }
  }

  /**
   * ✅ HELPER: Xóa cache của NHIỀU user (dùng cho group chat)
   */
  async invalidateParticipantsCache(participantIds) {
    try {
      const redisClient = getRedisClient();
      if (!redisClient) return; // Redis không khả dụng, bỏ qua

      const keys = [];
      participantIds.forEach((id) => {
        const userId = id.toString();
        keys.push(
          `chat:user:${userId}:conversations:all`,
          `chat:user:${userId}:conversations:peer-to-peer`,
          `chat:user:${userId}:conversations:group`
        );
      });

      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
    } catch (error) {
      Logger.warn(`[Redis] Failed to bulk invalidate cache`, error);
    }
  }

  async findConversationById(conversationId, userId) {
    return await Conversation.findOne({
      _id: conversationId,
      "participants.userId": userId,
    });
  }

  /**
   * ✅ FIXED CRITICAL BUG: "Xóa xong hiện lại" (Ghost Conversation)
   * ✅ UPGRADE: Thêm Redis Caching Layer (Cache-Aside Pattern)
   * ✅ HYBRID HYDRATION: Làm tươi trạng thái Online từ Cache
   * 
   * Nguyên nhân: Query MongoDB sai kiểu dữ liệu (String vs ObjectId) nên không lọc được các nhóm đã ẩn.
   * Giải pháp: 
   * 1. Ép kiểu userId sang ObjectId để đảm bảo so sánh đúng
   * 2. Dùng $elemMatch để check đúng object của user đó phải có isVisible: true
   * 3. Cache-Aside: Check Redis trước, nếu miss thì query MongoDB và cache lại
   * 4. Hybrid Hydration: Khi lấy từ cache, query lại isOnline từ DB để làm tươi dữ liệu
   */
  async findConversationsByUserId(userId, type = null) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const cacheKey = `chat:user:${userId.toString()}:conversations:${type || 'all'}`;

    let conversations = null;
    let isFromCache = false; // ✅ Flag đánh dấu nguồn dữ liệu

    // 1. Lấy từ Redis (Cache Strategy)
    try {
      const redisClient = getRedisClient();
      if (redisClient) {
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
          conversations = JSON.parse(cachedData);
          isFromCache = true; // ✅ Đánh dấu là lấy từ cache
        }
      }
    } catch (error) {
      Logger.warn("[Redis] Get cache failed, falling back to DB", error);
    }

    // 2. Nếu Cache Miss -> Query Full DB (Nặng)
    if (!conversations) {
      const query = {
        participants: {
          $elemMatch: {
            userId: userObjectId,
            isVisible: true 
          }
        },
        isActive: true,
      };
      
      if (type) query.type = type;
      
      conversations = await Conversation.find(query)
        .sort({ lastMessageAt: -1, updatedAt: -1 })
        .select("_id title lastMessageAt createdAt updatedAt type participants avatarUrl description lastMessagePreview") // ✅ Thêm lastMessagePreview
        .populate("participants.userId", "username displayName avatarUrl role isOnline") 
        .lean();

      // Lưu vào Cache để lần sau load nhanh hơn
      try {
        const redisClient = getRedisClient();
        if (redisClient && conversations) {
          await redisClient.set(cacheKey, JSON.stringify(conversations), 'EX', CACHE_TTL);
        }
      } catch (error) {
        Logger.warn("[Redis] Set cache failed", error);
      }
    }

    // 3. ✅ HYBRID HYDRATION: Làm tươi trạng thái Online
    // Chỉ chạy khi lấy dữ liệu từ Cache (vì dữ liệu DB vừa query thì chắc chắn mới rồi)
    if (isFromCache && conversations && conversations.length > 0) {
        try {
            // a. Lấy danh sách ID của các partner (để query 1 lần cho nhanh)
            const partnerIds = new Set();
            conversations.forEach(conv => {
                if (conv.participants) {
                    conv.participants.forEach(p => {
                        // Trong Cache, p.userId đã là object (do populate trước đó)
                        const pId = p.userId?._id || p.userId;
                        if (pId && pId.toString() !== userId.toString()) {
                            partnerIds.add(pId);
                        }
                    });
                }
            });

            if (partnerIds.size > 0) {
                // b. Query siêu nhẹ chỉ lấy field isOnline (Index Scan)
                const freshStatuses = await User.find({
                    _id: { $in: Array.from(partnerIds) }
                }).select('_id isOnline').lean();

                // c. Tạo Map để tra cứu O(1)
                const statusMap = {};
                freshStatuses.forEach(u => {
                    statusMap[u._id.toString()] = u.isOnline;
                });

                // d. Merge trạng thái mới vào dữ liệu cũ
                conversations.forEach(conv => {
                    if (conv.participants) {
                        conv.participants.forEach(p => {
                            const pId = (p.userId?._id || p.userId).toString();
                            // Nếu tìm thấy status mới -> Ghi đè
                            if (statusMap[pId] !== undefined && p.userId) {
                                p.userId.isOnline = statusMap[pId];
                            }
                        });
                    }
                });
            }
        } catch (error) {
            Logger.warn("[ChatRepo] Failed to refresh online status", error);
            // Nếu bước này lỗi, chấp nhận trả về data cũ từ cache còn hơn làm crash app
        }
    }

    return conversations;
  }

  async createConversation(userId) {
    return await Conversation.create({
      type: "customer-bot",
      title: "Cuộc trò chuyện mới",
      participants: [{ userId: userId, role: "customer", isVisible: true }],
    });
  }

  /**
   * ✅ AUTO UN-HIDE: Khi có tin nhắn mới, phải hiện lại cuộc trò chuyện với mọi người
   * ✅ UPGRADE: Invalidate Cache khi có tin nhắn mới (thứ tự danh sách thay đổi)
   * Ví dụ: A xóa chat với B. B nhắn tin tới -> A phải thấy lại chat này.
   */
  async createMessage(messageData) {
    const message = await Message.create(messageData);
    
    // ✅ CRITICAL FIX: Un-hide tất cả participants khi có tin nhắn mới
    // Sử dụng $[] để update tất cả elements trong array
    await Conversation.updateOne(
      { _id: messageData.conversationId },
      {
        $set: {
          lastMessageAt: new Date(),
          "participants.$[].isVisible": true // ✅ Un-hide tất cả thành viên khi có tin nhắn mới
        }
      }
    );

    // ⚠️ QUAN TRỌNG: Message mới -> List thay đổi thứ tự -> Xóa cache
    // Cần lấy danh sách participants để xóa cache của họ
    try {
      const conversation = await Conversation.findById(messageData.conversationId).select('participants').lean();
      if (conversation && conversation.participants) {
        const userIds = conversation.participants.map(p => p.userId);
        await this.invalidateParticipantsCache(userIds);
      }
    } catch (error) {
      Logger.warn("[ChatRepo] Failed to invalidate cache after message creation", error);
    }
    
    return message;
  }

  async saveConversation(conversation) {
    return await conversation.save();
  }

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

  /**
   * ⚠️ CẢNH BÁO: Đây là Hard Delete (Xóa vĩnh viễn khỏi DB)
   * Chỉ dùng cho Admin hoặc Cron Job dọn dẹp hệ thống.
   * User bình thường KHÔNG dùng hàm này để tránh mất chat của đối phương.
   */
  async hardDeleteConversationAdminOnly(conversationId) {
    await Message.deleteMany({ conversationId });
    return await Conversation.findByIdAndDelete(conversationId);
  }
  
  // Giữ lại hàm cũ nhưng đổi tên hoặc comment để tránh gọi nhầm
  // async deleteConversation(conversationId) { ... } -> Đã bỏ để dùng Soft Delete bên Service

  async getMediaFiles(conversationId, limit = 50) {
    return await Message.find({
      conversationId,
      $and: [
        {
          $or: [
            { type: "image" },
            { 
              type: "file", 
              "content.fileType": { $regex: /^image\//i } 
            },
          ],
        },
        {
          $or: [
            { "content.fileUrl": { $exists: true, $ne: null } },
            { "content.imageUrl": { $exists: true, $ne: null } },
          ],
        },
      ],
    })
      .select("_id content.fileUrl content.imageUrl content.fileName createdAt type metadata")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  async getSharedFiles(conversationId, limit = 50) {
    return await Message.find({
      conversationId,
      type: "file",
      "content.fileUrl": { $exists: true, $ne: null },
      $or: [
        { "content.fileType": { $not: { $regex: /^image\//i } } },
        { "content.fileType": { $exists: false } },
      ],
    })
      .select("_id content.fileUrl content.fileName content.fileSize createdAt sender senderType")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  async searchMessages(conversationId, query, limit = 50) {
    const searchRegex = new RegExp(query, "i");
    return await Message.find({
      conversationId,
      $or: [
        { "content.text": { $regex: searchRegex } },
        { "content.description": { $regex: searchRegex } },
      ],
    })
      .select("_id content type sender senderType createdAt")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }
}
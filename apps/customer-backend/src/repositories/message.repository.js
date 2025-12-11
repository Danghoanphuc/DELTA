// apps/customer-backend/src/repositories/message.repository.js
// Message Repository - Data Access Layer for Threaded Messages

import { ThreadedMessage } from "../shared/models/threaded-message.model.js";
import { Logger } from "../shared/utils/logger.util.js";

/**
 * Message Repository
 * Handles all database operations for threaded messages
 */
export class MessageRepository {
  /**
   * Create a new message
   */
  async create(data) {
    try {
      const message = new ThreadedMessage(data);
      return await message.save();
    } catch (error) {
      Logger.error("[MessageRepo] Error creating message:", error);
      throw error;
    }
  }

  /**
   * Find message by ID
   */
  async findById(id) {
    return await ThreadedMessage.findById(id)
      .populate("sender", "displayName email username avatarUrl")
      .populate("replyTo", "content sender createdAt")
      .populate("mentions.userId", "displayName username avatarUrl")
      .lean();
  }

  /**
   * Find message by ID (without populate, for updates)
   */
  async findByIdForUpdate(id) {
    return await ThreadedMessage.findById(id);
  }

  /**
   * Find messages by conversation/thread
   */
  async findByConversation(conversationId, options = {}) {
    const { page = 1, limit = 50, sortBy = "createdAt" } = options;

    const query = {
      conversationId,
      threadDepth: 0, // Only root messages
    };

    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      ThreadedMessage.find(query)
        .populate("sender", "displayName email username avatarUrl")
        .populate("mentions.userId", "displayName username avatarUrl")
        .sort({ [sortBy]: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ThreadedMessage.countDocuments(query),
    ]);

    return {
      messages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get direct replies to a message
   */
  async getReplies(messageId, options = {}) {
    const { page = 1, limit = 20 } = options;

    const query = { replyTo: messageId };
    const skip = (page - 1) * limit;

    const [replies, total] = await Promise.all([
      ThreadedMessage.find(query)
        .populate("sender", "displayName email username avatarUrl")
        .populate("mentions.userId", "displayName username avatarUrl")
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ThreadedMessage.countDocuments(query),
    ]);

    return {
      replies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get thread path (all parent messages)
   */
  async getThreadPath(messageId) {
    const message = await ThreadedMessage.findById(messageId).lean();
    if (!message || !message.threadPath) return [];

    const pathIds = message.threadPath.split("/").filter(Boolean);

    const messages = await ThreadedMessage.find({ _id: { $in: pathIds } })
      .populate("sender", "displayName email username avatarUrl")
      .sort({ threadDepth: 1 })
      .lean();

    return messages;
  }

  /**
   * Get nested replies with depth limit
   */
  async getNestedReplies(messageId, maxDepth = 3) {
    const rootMessage = await ThreadedMessage.findById(messageId).lean();
    if (!rootMessage) return [];

    const rootId = rootMessage.rootMessageId || messageId;

    const replies = await ThreadedMessage.find({
      rootMessageId: rootId,
      threadDepth: { $lte: maxDepth, $gt: 0 },
    })
      .populate("sender", "displayName email username avatarUrl")
      .populate("mentions.userId", "displayName username avatarUrl")
      .sort({ threadDepth: 1, createdAt: 1 })
      .lean();

    return replies;
  }

  /**
   * Find messages by mention
   */
  async findByMention(userId, options = {}) {
    const { page = 1, limit = 20 } = options;

    const query = { "mentions.userId": userId };
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      ThreadedMessage.find(query)
        .populate("sender", "displayName email username avatarUrl")
        .populate("conversationId", "title context")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ThreadedMessage.countDocuments(query),
    ]);

    return {
      messages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find messages with attachments
   */
  async findByAttachment(conversationId, attachmentType = null) {
    const query = {
      conversationId,
      "attachments.0": { $exists: true },
    };

    if (attachmentType) {
      query["attachments.type"] = attachmentType;
    }

    return await ThreadedMessage.find(query)
      .populate("sender", "displayName email username avatarUrl")
      .sort({ createdAt: -1 })
      .lean();
  }

  /**
   * Update message
   */
  async update(id, data) {
    return await ThreadedMessage.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    })
      .populate("sender", "displayName email username avatarUrl")
      .populate("mentions.userId", "displayName username avatarUrl")
      .lean();
  }

  /**
   * Delete message (soft delete - add to deletedFor array)
   */
  async softDelete(messageId, userId) {
    return await ThreadedMessage.findByIdAndUpdate(
      messageId,
      { $addToSet: { deletedFor: userId } },
      { new: true }
    );
  }

  /**
   * Mark message as read
   */
  async markAsRead(messageId, userId) {
    return await ThreadedMessage.findByIdAndUpdate(
      messageId,
      { $addToSet: { readBy: userId } },
      { new: true }
    );
  }

  /**
   * Mark multiple messages as read
   */
  async markMultipleAsRead(messageIds, userId) {
    return await ThreadedMessage.updateMany(
      { _id: { $in: messageIds } },
      { $addToSet: { readBy: userId } }
    );
  }

  /**
   * Get unread message count for user in conversation
   */
  async getUnreadCount(conversationId, userId) {
    return await ThreadedMessage.countDocuments({
      conversationId,
      readBy: { $ne: userId },
      sender: { $ne: userId }, // Don't count own messages
      deletedFor: { $ne: userId },
    });
  }

  /**
   * Update reply counts for a message
   */
  async updateReplyCounts(messageId) {
    const message = await ThreadedMessage.findById(messageId);
    if (!message) return null;

    const directReplies = await ThreadedMessage.countDocuments({
      replyTo: messageId,
    });

    const rootId = message.rootMessageId || messageId;
    const allReplies = await ThreadedMessage.countDocuments({
      rootMessageId: rootId,
      _id: { $ne: messageId },
    });

    message.replyCount = directReplies;
    message.totalReplyCount = allReplies;

    return await message.save();
  }

  /**
   * Flatten deep replies (when depth > 3)
   */
  async flattenDeepReplies(rootMessageId) {
    const deepReplies = await ThreadedMessage.find({
      rootMessageId,
      threadDepth: { $gt: 3 },
    });

    let flattenedCount = 0;

    for (const reply of deepReplies) {
      reply.threadDepth = 3;
      reply.threadPath = reply.threadPath.split("/").slice(0, 4).join("/");
      await reply.save();
      flattenedCount++;
    }

    return flattenedCount;
  }

  /**
   * Add reaction to message
   */
  async addReaction(messageId, emoji, userId) {
    const message = await ThreadedMessage.findById(messageId);
    if (!message) return null;

    const existingReaction = message.reactions.find((r) => r.emoji === emoji);

    if (existingReaction) {
      if (!existingReaction.users.includes(userId)) {
        existingReaction.users.push(userId);
        existingReaction.count++;
      }
    } else {
      message.reactions.push({
        emoji,
        users: [userId],
        count: 1,
      });
    }

    return await message.save();
  }

  /**
   * Remove reaction from message
   */
  async removeReaction(messageId, emoji, userId) {
    const message = await ThreadedMessage.findById(messageId);
    if (!message) return null;

    const reaction = message.reactions.find((r) => r.emoji === emoji);

    if (reaction) {
      reaction.users = reaction.users.filter(
        (id) => id.toString() !== userId.toString()
      );
      reaction.count = reaction.users.length;

      if (reaction.count === 0) {
        message.reactions = message.reactions.filter((r) => r.emoji !== emoji);
      }
    }

    return await message.save();
  }

  /**
   * Search messages by text
   */
  async search(searchText, filters = {}) {
    const { conversationId, userId, page = 1, limit = 20 } = filters;

    const query = {
      $text: { $search: searchText },
    };

    if (conversationId) {
      query.conversationId = conversationId;
    }

    if (userId) {
      query.deletedFor = { $ne: userId };
    }

    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      ThreadedMessage.find(query, { score: { $meta: "textScore" } })
        .populate("sender", "displayName email username avatarUrl")
        .populate("conversationId", "title context")
        .sort({ score: { $meta: "textScore" }, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ThreadedMessage.countDocuments(query),
    ]);

    return {
      messages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Count messages by query
   */
  async count(query = {}) {
    return await ThreadedMessage.countDocuments(query);
  }

  /**
   * Get latest message in conversation
   */
  async getLatestMessage(conversationId) {
    return await ThreadedMessage.findOne({ conversationId })
      .sort({ createdAt: -1 })
      .populate("sender", "displayName email username avatarUrl")
      .lean();
  }

  /**
   * Bulk update messages
   */
  async bulkUpdate(filter, update) {
    return await ThreadedMessage.updateMany(filter, update);
  }
}

// apps/customer-backend/src/services/search.service.js
// Search Service - Full-text Search and Filtering for Threads and Messages

import { ThreadRepository } from "../repositories/thread.repository.js";
import { MessageRepository } from "../repositories/message.repository.js";
import { Thread } from "../shared/models/thread.model.js";
import { ThreadedMessage } from "../shared/models/threaded-message.model.js";
import {
  ValidationException,
  ForbiddenException,
} from "../shared/exceptions/index.js";
import { Logger } from "../shared/utils/logger.util.js";

/**
 * Search Service
 * Handles full-text search and filtering for threads and messages
 */
export class SearchService {
  constructor() {
    this.threadRepository = new ThreadRepository();
    this.messageRepository = new MessageRepository();
  }

  // ===== 6.1.1: Full-text Search =====

  /**
   * Search threads by text
   * Searches in title, description, and metadata
   */
  async searchThreads(userId, query, options = {}) {
    Logger.debug(`[SearchSvc] Searching threads for query: "${query}"`);

    // Validate input
    if (!query || query.trim().length === 0) {
      throw new ValidationException("Từ khóa tìm kiếm không được để trống");
    }

    const { status, page = 1, limit = 20 } = options;

    // Use repository search method
    const result = await this.threadRepository.search(query, {
      userId,
      status,
      page,
      limit,
    });

    Logger.success(
      `[SearchSvc] Found ${result.total} threads matching "${query}"`
    );

    return result;
  }

  /**
   * Search messages by text
   * Searches in message content
   */
  async searchMessages(userId, query, options = {}) {
    Logger.debug(`[SearchSvc] Searching messages for query: "${query}"`);

    // Validate input
    if (!query || query.trim().length === 0) {
      throw new ValidationException("Từ khóa tìm kiếm không được để trống");
    }

    const { conversationId, page = 1, limit = 20 } = options;

    // Use repository search method
    const result = await this.messageRepository.search(query, {
      conversationId,
      userId,
      page,
      limit,
    });

    // Filter out messages from threads user doesn't have access to
    const accessibleMessages = await this.filterMessagesByThreadAccess(
      userId,
      result.messages
    );

    Logger.success(
      `[SearchSvc] Found ${accessibleMessages.length} messages matching "${query}"`
    );

    return {
      messages: accessibleMessages,
      pagination: {
        ...result.pagination,
        total: accessibleMessages.length,
      },
    };
  }

  // ===== 6.1.2: Filters =====

  /**
   * Filter threads by event
   */
  async filterThreadsByEvent(userId, eventId, eventType, options = {}) {
    Logger.debug(
      `[SearchSvc] Filtering threads by event: ${eventType}/${eventId}`
    );

    // Validate event type
    const validEventTypes = ["ORDER", "DESIGN", "PRODUCT", "NONE"];
    if (!validEventTypes.includes(eventType)) {
      throw new ValidationException(
        `Loại sự kiện không hợp lệ. Chỉ chấp nhận: ${validEventTypes.join(
          ", "
        )}`
      );
    }

    // Check user has access to event
    await this.validateEventAccess(userId, eventId, eventType);

    // Get threads by event
    const result = await this.threadRepository.findByEvent(
      eventId,
      eventType,
      options
    );

    Logger.success(
      `[SearchSvc] Found ${result.total} threads for event ${eventType}/${eventId}`
    );

    return result;
  }

  /**
   * Filter threads by participant
   */
  async filterThreadsByParticipant(userId, participantUserId, options = {}) {
    Logger.debug(
      `[SearchSvc] Filtering threads by participant: ${participantUserId}`
    );

    // If filtering by self, use repository method
    if (userId.toString() === participantUserId.toString()) {
      const result = await this.threadRepository.findByParticipant(
        userId,
        options
      );

      Logger.success(
        `[SearchSvc] Found ${result.total} threads for user ${userId}`
      );

      return result;
    }

    // If filtering by another user, check if current user has permission
    // For now, allow all authenticated users to search by participant
    // TODO: Add proper permission checking based on business rules

    const result = await this.threadRepository.findByParticipant(
      participantUserId,
      options
    );

    // Filter out threads current user doesn't have access to
    const accessibleThreads = result.threads.filter((thread) =>
      this.canViewThread(userId, thread)
    );

    Logger.success(
      `[SearchSvc] Found ${accessibleThreads.length} accessible threads for participant ${participantUserId}`
    );

    return {
      threads: accessibleThreads,
      pagination: {
        ...result.pagination,
        total: accessibleThreads.length,
      },
    };
  }

  /**
   * Filter threads by status
   */
  async filterThreadsByStatus(userId, status, options = {}) {
    Logger.debug(`[SearchSvc] Filtering threads by status: ${status}`);

    // Validate status
    const validStatuses = ["active", "resolved", "archived", "all"];
    if (!validStatuses.includes(status)) {
      throw new ValidationException(
        `Trạng thái không hợp lệ. Chỉ chấp nhận: ${validStatuses.join(", ")}`
      );
    }

    // Get user's threads with status filter
    const result = await this.threadRepository.findByParticipant(userId, {
      ...options,
      status: status === "all" ? undefined : status,
    });

    Logger.success(
      `[SearchSvc] Found ${result.total} threads with status "${status}"`
    );

    return result;
  }

  /**
   * Filter threads by tags
   */
  async filterThreadsByTags(userId, tags, options = {}) {
    Logger.debug(`[SearchSvc] Filtering threads by tags: ${tags.join(", ")}`);

    // Validate tags
    if (!Array.isArray(tags) || tags.length === 0) {
      throw new ValidationException("Tags phải là một mảng không rỗng");
    }

    // Get user's threads with tag filter
    const result = await this.threadRepository.findByParticipant(userId, {
      ...options,
      tags,
    });

    Logger.success(
      `[SearchSvc] Found ${result.total} threads with tags: ${tags.join(", ")}`
    );

    return result;
  }

  /**
   * Filter threads by date range
   */
  async filterThreadsByDateRange(userId, startDate, endDate, options = {}) {
    Logger.debug(
      `[SearchSvc] Filtering threads by date range: ${startDate} to ${endDate}`
    );

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime())) {
      throw new ValidationException("Ngày bắt đầu không hợp lệ");
    }

    if (isNaN(end.getTime())) {
      throw new ValidationException("Ngày kết thúc không hợp lệ");
    }

    if (start > end) {
      throw new ValidationException("Ngày bắt đầu phải nhỏ hơn ngày kết thúc");
    }

    const { page = 1, limit = 20, status } = options;

    // Build query
    const query = {
      "participants.userId": userId,
      "participants.isVisible": true,
      isActive: true,
      createdAt: {
        $gte: start,
        $lte: end,
      },
    };

    if (status && status !== "all") {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const [threads, total] = await Promise.all([
      Thread.find(query)
        .populate("participants.userId", "displayName email username avatarUrl")
        .populate("creatorId", "displayName email username")
        .sort({ isPinned: -1, lastMessageAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Thread.countDocuments(query),
    ]);

    Logger.success(
      `[SearchSvc] Found ${total} threads in date range ${startDate} to ${endDate}`
    );

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

  /**
   * Advanced search with multiple filters
   */
  async advancedSearch(userId, filters = {}) {
    Logger.debug(`[SearchSvc] Performing advanced search with filters`);

    const {
      query,
      eventId,
      eventType,
      status,
      tags,
      startDate,
      endDate,
      participantUserId,
      page = 1,
      limit = 20,
    } = filters;

    // Build MongoDB query
    const mongoQuery = {
      "participants.userId": userId,
      "participants.isVisible": true,
      isActive: true,
    };

    // Text search
    if (query && query.trim().length > 0) {
      mongoQuery.$text = { $search: query };
    }

    // Event filter
    if (eventId && eventType) {
      mongoQuery["context.referenceId"] = eventId;
      mongoQuery["context.referenceType"] = eventType;
    }

    // Status filter
    if (status && status !== "all") {
      mongoQuery.status = status;
    }

    // Tags filter
    if (tags && Array.isArray(tags) && tags.length > 0) {
      mongoQuery.tags = { $in: tags };
    }

    // Date range filter
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        mongoQuery.createdAt = {
          $gte: start,
          $lte: end,
        };
      }
    }

    // Participant filter
    if (participantUserId && participantUserId !== userId.toString()) {
      // Find threads where both users are participants
      mongoQuery["participants.userId"] = { $all: [userId, participantUserId] };
    }

    const skip = (page - 1) * limit;

    // Execute query
    const queryBuilder = Thread.find(mongoQuery)
      .populate("participants.userId", "displayName email username avatarUrl")
      .populate("creatorId", "displayName email username")
      .skip(skip)
      .limit(limit);

    // Sort by text score if text search is used
    if (query && query.trim().length > 0) {
      queryBuilder.sort({ score: { $meta: "textScore" }, lastMessageAt: -1 });
    } else {
      queryBuilder.sort({ isPinned: -1, lastMessageAt: -1 });
    }

    const [threads, total] = await Promise.all([
      queryBuilder.lean(),
      Thread.countDocuments(mongoQuery),
    ]);

    Logger.success(
      `[SearchSvc] Advanced search found ${total} threads matching filters`
    );

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

  // ===== Helper Methods =====

  /**
   * Check if user can view thread
   */
  canViewThread(userId, thread) {
    // Check if user is participant
    return thread.participants.some(
      (p) =>
        p.userId._id?.toString() === userId.toString() ||
        p.userId.toString() === userId.toString()
    );
  }

  /**
   * Filter messages by thread access
   */
  async filterMessagesByThreadAccess(userId, messages) {
    const threadIds = [...new Set(messages.map((m) => m.conversationId._id))];

    const accessibleThreadIds = new Set();

    for (const threadId of threadIds) {
      const thread = await Thread.findById(threadId).lean();
      if (thread && this.canViewThread(userId, thread)) {
        accessibleThreadIds.add(threadId.toString());
      }
    }

    return messages.filter((m) =>
      accessibleThreadIds.has(m.conversationId._id.toString())
    );
  }

  /**
   * Validate user has access to event
   */
  async validateEventAccess(userId, eventId, eventType) {
    // TODO: Implement actual event access validation
    // For now, return true
    // This should check if user has access to the ORDER/DESIGN/PRODUCT
    return true;
  }
}

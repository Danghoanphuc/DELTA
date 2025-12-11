// apps/customer-backend/src/repositories/thread.repository.js
// Thread Repository - Data Access Layer

import { Thread } from "../shared/models/thread.model.js";
import logger from "../infrastructure/logger.js";

/**
 * Thread Repository
 * Handles all database operations for threads
 */
export class ThreadRepository {
  /**
   * Create a new thread
   */
  async create(data) {
    try {
      const thread = new Thread(data);
      return await thread.save();
    } catch (error) {
      logger.error("[ThreadRepo] Error creating thread:", error);
      throw error;
    }
  }

  /**
   * Find thread by ID
   */
  async findById(id) {
    return await Thread.findById(id)
      .populate("participants.userId", "displayName email username avatarUrl")
      .populate("creatorId", "displayName email username")
      .populate("resolvedBy", "displayName email username")
      .populate("pinnedBy", "displayName email username")
      .lean();
  }

  /**
   * Find thread by ID (without populate, for updates)
   */
  async findByIdForUpdate(id) {
    return await Thread.findById(id);
  }

  /**
   * Find threads by event
   */
  async findByEvent(referenceId, referenceType, options = {}) {
    const { status, page = 1, limit = 20, sortBy = "lastMessageAt" } = options;

    const query = {
      "context.referenceId": referenceId,
      "context.referenceType": referenceType,
      isActive: true,
    };

    if (status && status !== "all") {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const [threads, total] = await Promise.all([
      Thread.find(query)
        .populate("participants.userId", "displayName email username avatarUrl")
        .populate("creatorId", "displayName email username")
        .sort({ isPinned: -1, [sortBy]: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Thread.countDocuments(query),
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

  /**
   * Find threads by participant
   */
  async findByParticipant(userId, filters = {}) {
    const { status, tags, page = 1, limit = 20 } = filters;

    const query = {
      "participants.userId": userId,
      "participants.isVisible": true,
      isActive: true,
    };

    if (status && status !== "all") {
      query.status = status;
    }

    if (tags && tags.length > 0) {
      query.tags = { $in: tags };
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
   * Find one thread by query
   */
  async findOne(query) {
    return await Thread.findOne(query)
      .populate("participants.userId", "displayName email username avatarUrl")
      .populate("creatorId", "displayName email username")
      .lean();
  }

  /**
   * Update thread
   */
  async update(id, data) {
    return await Thread.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    })
      .populate("participants.userId", "displayName email username avatarUrl")
      .populate("creatorId", "displayName email username")
      .lean();
  }

  /**
   * Delete thread (soft delete)
   */
  async delete(id) {
    return await Thread.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
  }

  /**
   * Add participant to thread
   */
  async addParticipant(threadId, participantData) {
    const thread = await Thread.findById(threadId);
    if (!thread) return null;

    // Check if participant already exists
    const existingIndex = thread.participants.findIndex(
      (p) => p.userId.toString() === participantData.userId.toString()
    );

    if (existingIndex >= 0) {
      // Update existing participant
      thread.participants[existingIndex] = {
        ...thread.participants[existingIndex],
        ...participantData,
        isVisible: true,
      };
    } else {
      // Add new participant
      thread.participants.push(participantData);
    }

    // Update participant count
    thread.stats.participantCount = thread.participants.filter(
      (p) => p.isVisible
    ).length;

    return await thread.save();
  }

  /**
   * Remove participant from thread
   */
  async removeParticipant(threadId, userId) {
    const thread = await Thread.findById(threadId);
    if (!thread) return null;

    const participantIndex = thread.participants.findIndex(
      (p) => p.userId.toString() === userId.toString()
    );

    if (participantIndex >= 0) {
      thread.participants.splice(participantIndex, 1);
      thread.stats.participantCount = thread.participants.filter(
        (p) => p.isVisible
      ).length;
      return await thread.save();
    }

    return thread;
  }

  /**
   * Hide thread for participant (leave thread)
   */
  async hideForParticipant(threadId, userId) {
    const thread = await Thread.findById(threadId);
    if (!thread) return null;

    const participant = thread.participants.find(
      (p) => p.userId.toString() === userId.toString()
    );

    if (participant) {
      participant.isVisible = false;
      thread.stats.participantCount = thread.participants.filter(
        (p) => p.isVisible
      ).length;
      return await thread.save();
    }

    return thread;
  }

  /**
   * Update thread statistics
   */
  async updateStats(threadId, stats) {
    return await Thread.findByIdAndUpdate(
      threadId,
      { $set: { stats } },
      { new: true }
    );
  }

  /**
   * Find inactive threads for auto-archive
   */
  async findInactiveThreads(daysInactive = 7) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysInactive);

    return await Thread.find({
      status: "active",
      "stats.lastActivityAt": { $lt: cutoffDate },
      isActive: true,
    }).lean();
  }

  /**
   * Bulk update threads
   */
  async bulkUpdate(filter, update) {
    return await Thread.updateMany(filter, update);
  }

  /**
   * Count threads by query
   */
  async count(query = {}) {
    return await Thread.countDocuments(query);
  }

  /**
   * Search threads by text
   */
  async search(searchText, filters = {}) {
    const { userId, status, page = 1, limit = 20 } = filters;

    const query = {
      $text: { $search: searchText },
      isActive: true,
    };

    if (userId) {
      query["participants.userId"] = userId;
      query["participants.isVisible"] = true;
    }

    if (status && status !== "all") {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const [threads, total] = await Promise.all([
      Thread.find(query, { score: { $meta: "textScore" } })
        .populate("participants.userId", "displayName email username avatarUrl")
        .populate("creatorId", "displayName email username")
        .sort({ score: { $meta: "textScore" }, lastMessageAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Thread.countDocuments(query),
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
}

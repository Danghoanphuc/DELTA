// apps/customer-backend/src/repositories/participant.repository.js
// Participant Repository - Data Access Layer

import { Thread } from "../shared/models/thread.model.js";
import { Logger } from "../shared/utils/logger.util.js";

/**
 * Participant Repository
 * Handles database operations for thread participants
 */
export class ParticipantRepository {
  /**
   * Get all participants for a thread
   */
  async getParticipants(threadId) {
    const thread = await Thread.findById(threadId)
      .select("participants")
      .populate("participants.userId", "displayName email avatarUrl")
      .lean();

    return thread?.participants || [];
  }

  /**
   * Get participant by userId
   */
  async getParticipant(threadId, userId) {
    const thread = await Thread.findById(threadId).select("participants");

    if (!thread) return null;

    return thread.participants.find(
      (p) => p.userId.toString() === userId.toString()
    );
  }

  /**
   * Check if user is participant
   */
  async isParticipant(threadId, userId) {
    const count = await Thread.countDocuments({
      _id: threadId,
      "participants.userId": userId,
      "participants.isVisible": true,
    });

    return count > 0;
  }

  /**
   * Get threads by participant
   */
  async getThreadsByParticipant(userId, filters = {}) {
    const query = {
      "participants.userId": userId,
      "participants.isVisible": true,
      isActive: true,
    };

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.referenceType) {
      query["context.referenceType"] = filters.referenceType;
    }

    if (filters.tags && filters.tags.length > 0) {
      query.tags = { $in: filters.tags };
    }

    const threads = await Thread.find(query)
      .sort({ isPinned: -1, lastMessageAt: -1 })
      .limit(filters.limit || 50)
      .skip(filters.skip || 0)
      .lean();

    const total = await Thread.countDocuments(query);

    return { threads, total };
  }

  /**
   * Count participants in thread
   */
  async countParticipants(threadId) {
    const thread = await Thread.findById(threadId).select("participants");

    if (!thread) return 0;

    return thread.participants.filter((p) => p.isVisible).length;
  }

  /**
   * Get participant role
   */
  async getParticipantRole(threadId, userId) {
    const participant = await this.getParticipant(threadId, userId);
    return participant?.role || null;
  }

  /**
   * Update participant visibility
   */
  async updateVisibility(threadId, userId, isVisible) {
    const result = await Thread.updateOne(
      {
        _id: threadId,
        "participants.userId": userId,
      },
      {
        $set: {
          "participants.$.isVisible": isVisible,
        },
      }
    );

    return result.modifiedCount > 0;
  }
}

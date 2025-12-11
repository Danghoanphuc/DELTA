// apps/customer-backend/src/services/participant.service.js
// Participant Service - Manage thread participants

import { ThreadRepository } from "../repositories/thread.repository.js";
import { Thread } from "../shared/models/thread.model.js";
import {
  ValidationException,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from "../shared/exceptions/index.js";
import { Logger } from "../shared/utils/logger.util.js";

/**
 * Participant Service
 * Handles participant management, auto-add stakeholders, mentions, activity tracking
 */
export class ParticipantService {
  constructor() {
    this.threadRepository = new ThreadRepository();
  }

  // ===== PARTICIPANT MANAGEMENT =====

  /**
   * Add participants to thread
   * @param {string} threadId - Thread ID
   * @param {string[]} userIds - Array of user IDs to add
   * @param {string} role - Role to assign (default: 'member')
   */
  async addParticipants(threadId, userIds, role = "member") {
    Logger.debug(
      `[ParticipantSvc] Adding ${userIds.length} participants to thread ${threadId}`
    );

    if (!userIds || userIds.length === 0) {
      throw new ValidationException("Vui lòng chọn ít nhất 1 người để thêm");
    }

    const thread = await this.threadRepository.findByIdForUpdate(threadId);
    if (!thread) {
      throw new NotFoundException("Thread", threadId);
    }

    const addedUsers = [];
    const skippedUsers = [];

    for (const userId of userIds) {
      try {
        // Check if already participant
        if (thread.isParticipant(userId)) {
          skippedUsers.push(userId);
          continue;
        }

        // Validate event access
        const hasAccess = await this.checkEventAccess(
          userId,
          thread.context.referenceId,
          thread.context.referenceType
        );

        if (!hasAccess) {
          Logger.warn(
            `[ParticipantSvc] User ${userId} doesn't have access to event ${thread.context.referenceId}`
          );
          skippedUsers.push(userId);
          continue;
        }

        // Add participant
        const participantData = {
          userId,
          role,
          isVisible: true,
          joinedAt: new Date(),
        };

        await this.threadRepository.addParticipant(threadId, participantData);
        addedUsers.push(userId);

        Logger.success(
          `[ParticipantSvc] Added user ${userId} to thread ${threadId}`
        );
      } catch (error) {
        Logger.error(
          `[ParticipantSvc] Error adding user ${userId} to thread:`,
          error
        );
        skippedUsers.push(userId);
      }
    }

    return {
      added: addedUsers,
      skipped: skippedUsers,
      total: userIds.length,
    };
  }

  /**
   * Remove participant from thread
   */
  async removeParticipant(threadId, userId) {
    Logger.debug(
      `[ParticipantSvc] Removing user ${userId} from thread ${threadId}`
    );

    const thread = await this.threadRepository.findByIdForUpdate(threadId);
    if (!thread) {
      throw new NotFoundException("Thread", threadId);
    }

    // Cannot remove creator
    if (thread.isCreator(userId)) {
      throw new ConflictException("Không thể xóa người tạo thread");
    }

    // Check if user is participant
    if (!thread.isParticipant(userId)) {
      throw new ConflictException("Người dùng không phải là thành viên");
    }

    await this.threadRepository.removeParticipant(threadId, userId);

    Logger.success(
      `[ParticipantSvc] Removed user ${userId} from thread ${threadId}`
    );
  }

  /**
   * Update participant role
   */
  async updateParticipantRole(threadId, userId, newRole) {
    Logger.debug(
      `[ParticipantSvc] Updating role for user ${userId} in thread ${threadId} to ${newRole}`
    );

    const validRoles = ["customer", "printer", "admin", "member", "moderator"];
    if (!validRoles.includes(newRole)) {
      throw new ValidationException(`Role không hợp lệ: ${newRole}`);
    }

    const thread = await this.threadRepository.findByIdForUpdate(threadId);
    if (!thread) {
      throw new NotFoundException("Thread", threadId);
    }

    // Find participant
    const participant = thread.participants.find(
      (p) => p.userId.toString() === userId.toString()
    );

    if (!participant) {
      throw new NotFoundException("Participant", userId);
    }

    // Update role
    participant.role = newRole;
    await thread.save();

    Logger.success(
      `[ParticipantSvc] Updated role for user ${userId} to ${newRole}`
    );

    return await this.threadRepository.findById(threadId);
  }

  // ===== AUTO-ADD STAKEHOLDERS =====

  /**
   * Get event stakeholders based on event type
   */
  async getEventStakeholders(referenceId, referenceType) {
    Logger.debug(
      `[ParticipantSvc] Getting stakeholders for ${referenceType}:${referenceId}`
    );

    const stakeholders = [];

    try {
      switch (referenceType) {
        case "ORDER":
          stakeholders.push(...(await this.getOrderStakeholders(referenceId)));
          break;

        case "DESIGN":
          stakeholders.push(...(await this.getDesignStakeholders(referenceId)));
          break;

        case "PRODUCT":
          stakeholders.push(
            ...(await this.getProductStakeholders(referenceId))
          );
          break;

        default:
          Logger.warn(
            `[ParticipantSvc] Unknown reference type: ${referenceType}`
          );
      }
    } catch (error) {
      Logger.error(
        `[ParticipantSvc] Error getting stakeholders for ${referenceType}:${referenceId}:`,
        error
      );
    }

    Logger.debug(`[ParticipantSvc] Found ${stakeholders.length} stakeholders`);
    return stakeholders;
  }

  /**
   * Get ORDER stakeholders (customer, printer, admin)
   */
  async getOrderStakeholders(orderId) {
    // TODO: Implement actual order stakeholder fetching
    // This should query the Order model and get:
    // - customerId
    // - printerId
    // - assignedAdmin
    Logger.debug(`[ParticipantSvc] Getting ORDER stakeholders for ${orderId}`);

    // Placeholder implementation
    return [];
  }

  /**
   * Get DESIGN stakeholders (creator, reviewers)
   */
  async getDesignStakeholders(designId) {
    // TODO: Implement actual design stakeholder fetching
    // This should query the Design model and get:
    // - createdBy
    // - reviewers
    Logger.debug(
      `[ParticipantSvc] Getting DESIGN stakeholders for ${designId}`
    );

    // Placeholder implementation
    return [];
  }

  /**
   * Get PRODUCT stakeholders (public - no specific stakeholders)
   */
  async getProductStakeholders(productId) {
    // Products are public, no specific stakeholders
    Logger.debug(
      `[ParticipantSvc] Getting PRODUCT stakeholders for ${productId}`
    );
    return [];
  }

  /**
   * Auto-add stakeholders to thread
   */
  async autoAddStakeholders(threadId, referenceId, referenceType) {
    Logger.debug(
      `[ParticipantSvc] Auto-adding stakeholders to thread ${threadId}`
    );

    const stakeholders = await this.getEventStakeholders(
      referenceId,
      referenceType
    );

    if (stakeholders.length === 0) {
      Logger.debug(`[ParticipantSvc] No stakeholders to add`);
      return { added: [], skipped: [], total: 0 };
    }

    // Determine roles based on stakeholder type
    const participantsToAdd = stakeholders.map((stakeholder) => ({
      userId: stakeholder.userId,
      role: this.determineRoleFromStakeholder(stakeholder),
    }));

    // Add participants
    const userIds = participantsToAdd.map((p) => p.userId);
    return await this.addParticipants(threadId, userIds, "member");
  }

  /**
   * Determine role from stakeholder type
   */
  determineRoleFromStakeholder(stakeholder) {
    if (stakeholder.type === "admin") return "admin";
    if (stakeholder.type === "printer") return "printer";
    if (stakeholder.type === "customer") return "customer";
    return "member";
  }

  // ===== MENTIONS =====

  /**
   * Handle mention - add mentioned user to thread if they have access
   */
  async handleMention(threadId, mentionedUserId) {
    Logger.debug(
      `[ParticipantSvc] Handling mention for user ${mentionedUserId} in thread ${threadId}`
    );

    const thread = await this.threadRepository.findById(threadId);
    if (!thread) {
      throw new NotFoundException("Thread", threadId);
    }

    // Check if already participant
    if (thread.isParticipant(mentionedUserId)) {
      Logger.debug(
        `[ParticipantSvc] User ${mentionedUserId} is already a participant`
      );
      return { added: false, reason: "already_participant" };
    }

    // Check mention permission
    const hasPermission = await this.checkMentionPermission(
      threadId,
      mentionedUserId
    );

    if (!hasPermission) {
      Logger.warn(
        `[ParticipantSvc] User ${mentionedUserId} doesn't have permission to be mentioned`
      );
      return { added: false, reason: "no_permission" };
    }

    // Add as participant
    const participantData = {
      userId: mentionedUserId,
      role: "member",
      isVisible: true,
      joinedAt: new Date(),
    };

    await this.threadRepository.addParticipant(threadId, participantData);

    Logger.success(
      `[ParticipantSvc] Added mentioned user ${mentionedUserId} to thread ${threadId}`
    );

    return { added: true, reason: "mention" };
  }

  /**
   * Check if user can be mentioned (must have event access)
   */
  async checkMentionPermission(threadId, mentionedUserId) {
    const thread = await this.threadRepository.findById(threadId);
    if (!thread) {
      return false;
    }

    // Check event access
    return await this.checkEventAccess(
      mentionedUserId,
      thread.context.referenceId,
      thread.context.referenceType
    );
  }

  // ===== ACTIVITY TRACKING =====

  /**
   * Update last seen timestamp for participant
   */
  async updateLastSeen(threadId, userId) {
    // TODO: Implement last seen tracking
    // This could be stored in a separate collection or in Redis
    Logger.debug(
      `[ParticipantSvc] Updating last seen for user ${userId} in thread ${threadId}`
    );

    // Placeholder implementation
    return true;
  }

  /**
   * Get active participants (recently active)
   */
  async getActiveParticipants(threadId, minutesThreshold = 5) {
    // TODO: Implement active participants tracking
    // This should query last seen data and return users active within threshold
    Logger.debug(
      `[ParticipantSvc] Getting active participants for thread ${threadId}`
    );

    // Placeholder implementation
    return [];
  }

  // ===== HELPER METHODS =====

  /**
   * Check if user has access to event
   */
  async checkEventAccess(userId, referenceId, referenceType) {
    // TODO: Implement actual event access checking
    // This should check if user has permission to access the ORDER/DESIGN/PRODUCT

    Logger.debug(
      `[ParticipantSvc] Checking event access for user ${userId} to ${referenceType}:${referenceId}`
    );

    // Placeholder implementation - always return true for now
    return true;
  }
}

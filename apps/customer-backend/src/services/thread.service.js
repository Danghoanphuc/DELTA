// apps/customer-backend/src/services/thread.service.js
// Thread Service - Business Logic Layer

import { ThreadRepository } from "../repositories/thread.repository.js";
import { threadNotificationService } from "./thread-notification.service.js";
import {
  Thread,
  THREAD_STATUS,
  THREAD_PRIORITY,
} from "../shared/models/thread.model.js";
import {
  ValidationException,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from "../shared/exceptions/index.js";
import { Logger } from "../shared/utils/logger.util.js";

/**
 * Thread Service
 * Handles business logic for threads
 */
export class ThreadService {
  constructor() {
    this.threadRepository = new ThreadRepository();
  }

  /**
   * Create a new thread
   */
  async createThread(userId, data) {
    Logger.debug(`[ThreadSvc] Creating thread for user: ${userId}`);

    // Validation
    if (!data.title || data.title.trim().length === 0) {
      throw new ValidationException("Tiêu đề thread không được để trống");
    }

    if (!data.context?.referenceId || !data.context?.referenceType) {
      throw new ValidationException(
        "Thread phải được gắn với một sự kiện (ORDER, DESIGN, hoặc PRODUCT)"
      );
    }

    // Validate event access
    await this.validateEventAccess(
      userId,
      data.context.referenceId,
      data.context.referenceType
    );

    // Prepare thread data
    const threadData = {
      type: data.type || "group",
      title: data.title,
      description: data.description || "",
      avatarUrl: data.avatarUrl,
      context: data.context,
      participants: data.participants || [],
      creatorId: userId,
      status: THREAD_STATUS.ACTIVE,
      priority: data.priority || THREAD_PRIORITY.NORMAL,
      tags: data.tags || [],
      templateId: data.templateId,
      templateName: data.templateName,
      permissions: data.permissions || {
        canReply: "all",
        canInvite: "participants",
        canPin: "moderators",
        canResolve: "moderators",
        canArchive: "moderators",
      },
      stats: {
        messageCount: 0,
        replyCount: 0,
        participantCount: 0,
        unreadCount: 0,
        lastActivityAt: new Date(),
      },
    };

    // Ensure creator is a participant
    const creatorParticipant = {
      userId,
      role: "moderator",
      isVisible: true,
      joinedAt: new Date(),
    };

    if (
      !threadData.participants.some(
        (p) => p.userId.toString() === userId.toString()
      )
    ) {
      threadData.participants.push(creatorParticipant);
    }

    threadData.stats.participantCount = threadData.participants.length;

    const thread = await this.threadRepository.create(threadData);

    Logger.success(`[ThreadSvc] Created thread: ${thread._id}`);
    return thread;
  }

  /**
   * Get thread by ID
   */
  async getThread(userId, threadId) {
    const thread = await this.threadRepository.findById(threadId);

    if (!thread) {
      throw new NotFoundException("Thread", threadId);
    }

    // Check access permission
    if (!this.canViewThread(userId, thread)) {
      throw new ForbiddenException("Bạn không có quyền xem thread này");
    }

    return thread;
  }

  /**
   * Get threads by event
   */
  async getThreadsByEvent(userId, referenceId, referenceType, options = {}) {
    // Validate event access
    await this.validateEventAccess(userId, referenceId, referenceType);

    const result = await this.threadRepository.findByEvent(
      referenceId,
      referenceType,
      options
    );

    return result;
  }

  /**
   * Get threads by participant
   */
  async getThreadsByParticipant(userId, filters = {}) {
    return await this.threadRepository.findByParticipant(userId, filters);
  }

  /**
   * Update thread
   */
  async updateThread(userId, threadId, data) {
    const thread = await this.threadRepository.findByIdForUpdate(threadId);

    if (!thread) {
      throw new NotFoundException("Thread", threadId);
    }

    // Check permission
    if (!this.canEditThread(userId, thread)) {
      throw new ForbiddenException("Bạn không có quyền chỉnh sửa thread này");
    }

    // Validate updates
    if (data.title !== undefined && data.title.trim().length === 0) {
      throw new ValidationException("Tiêu đề thread không được để trống");
    }

    // Update allowed fields
    const allowedFields = [
      "title",
      "description",
      "avatarUrl",
      "priority",
      "tags",
      "permissions",
    ];

    allowedFields.forEach((field) => {
      if (data[field] !== undefined) {
        thread[field] = data[field];
      }
    });

    thread.updatedAt = new Date();
    await thread.save();

    Logger.success(`[ThreadSvc] Updated thread: ${threadId}`);
    return await this.threadRepository.findById(threadId);
  }

  /**
   * Delete thread (soft delete)
   */
  async deleteThread(userId, threadId) {
    const thread = await this.threadRepository.findByIdForUpdate(threadId);

    if (!thread) {
      throw new NotFoundException("Thread", threadId);
    }

    // Only creator or admin can delete
    if (!thread.isCreator(userId) && !this.isAdmin(userId)) {
      throw new ForbiddenException(
        "Chỉ người tạo hoặc admin mới có thể xóa thread"
      );
    }

    await this.threadRepository.delete(threadId);

    Logger.success(`[ThreadSvc] Deleted thread: ${threadId}`);
  }

  /**
   * Resolve thread
   */
  async resolveThread(userId, threadId, resolutionNotes = "") {
    const thread = await this.threadRepository.findByIdForUpdate(threadId);

    if (!thread) {
      throw new NotFoundException("Thread", threadId);
    }

    // Check permission
    if (!this.canResolveThread(userId, thread)) {
      throw new ForbiddenException(
        "Bạn không có quyền đánh dấu thread là đã giải quyết"
      );
    }

    // Check current status
    if (thread.status === THREAD_STATUS.RESOLVED) {
      throw new ConflictException("Thread đã được đánh dấu là đã giải quyết");
    }

    thread.status = THREAD_STATUS.RESOLVED;
    thread.resolvedAt = new Date();
    thread.resolvedBy = userId;
    thread.resolutionNotes = resolutionNotes;

    await thread.save();

    // Send notifications (non-blocking)
    threadNotificationService
      .notifyThreadResolved(threadId, userId.toString(), resolutionNotes)
      .catch((error) => {
        Logger.error(
          "[ThreadSvc] Failed to send resolved notifications:",
          error
        );
      });

    Logger.success(`[ThreadSvc] Resolved thread: ${threadId}`);
    return await this.threadRepository.findById(threadId);
  }

  /**
   * Reopen thread
   */
  async reopenThread(userId, threadId) {
    const thread = await this.threadRepository.findByIdForUpdate(threadId);

    if (!thread) {
      throw new NotFoundException("Thread", threadId);
    }

    // Check permission
    if (!this.canResolveThread(userId, thread)) {
      throw new ForbiddenException("Bạn không có quyền mở lại thread");
    }

    // Check current status
    if (thread.status !== THREAD_STATUS.RESOLVED) {
      throw new ConflictException(
        "Chỉ có thể mở lại thread đã được đánh dấu là đã giải quyết"
      );
    }

    thread.status = THREAD_STATUS.ACTIVE;
    thread.resolvedAt = null;
    thread.resolvedBy = null;

    await thread.save();

    Logger.success(`[ThreadSvc] Reopened thread: ${threadId}`);
    return await this.threadRepository.findById(threadId);
  }

  /**
   * Archive thread
   */
  async archiveThread(userId, threadId) {
    const thread = await this.threadRepository.findByIdForUpdate(threadId);

    if (!thread) {
      throw new NotFoundException("Thread", threadId);
    }

    // Check permission
    if (!this.canArchiveThread(userId, thread)) {
      throw new ForbiddenException("Bạn không có quyền archive thread");
    }

    // Check current status
    if (thread.status === THREAD_STATUS.ACTIVE) {
      throw new ConflictException(
        "Không thể archive thread đang active. Vui lòng đánh dấu là đã giải quyết trước."
      );
    }

    thread.status = THREAD_STATUS.ARCHIVED;
    await thread.save();

    // Send notifications (non-blocking)
    threadNotificationService.notifyThreadArchived(threadId).catch((error) => {
      Logger.error("[ThreadSvc] Failed to send archived notifications:", error);
    });

    Logger.success(`[ThreadSvc] Archived thread: ${threadId}`);
    return await this.threadRepository.findById(threadId);
  }

  /**
   * Pin thread
   */
  async pinThread(userId, threadId) {
    const thread = await this.threadRepository.findByIdForUpdate(threadId);

    if (!thread) {
      throw new NotFoundException("Thread", threadId);
    }

    // Check permission
    if (!this.canPinThread(userId, thread)) {
      throw new ForbiddenException("Bạn không có quyền pin thread");
    }

    if (thread.isPinned) {
      throw new ConflictException("Thread đã được pin");
    }

    thread.isPinned = true;
    thread.pinnedAt = new Date();
    thread.pinnedBy = userId;

    await thread.save();

    Logger.success(`[ThreadSvc] Pinned thread: ${threadId}`);
    return await this.threadRepository.findById(threadId);
  }

  /**
   * Unpin thread
   */
  async unpinThread(userId, threadId) {
    const thread = await this.threadRepository.findByIdForUpdate(threadId);

    if (!thread) {
      throw new NotFoundException("Thread", threadId);
    }

    // Check permission
    if (!this.canPinThread(userId, thread)) {
      throw new ForbiddenException("Bạn không có quyền unpin thread");
    }

    if (!thread.isPinned) {
      throw new ConflictException("Thread chưa được pin");
    }

    thread.isPinned = false;
    thread.pinnedAt = null;
    thread.pinnedBy = null;

    await thread.save();

    Logger.success(`[ThreadSvc] Unpinned thread: ${threadId}`);
    return await this.threadRepository.findById(threadId);
  }

  /**
   * Add participant to thread
   */
  async addParticipant(userId, threadId, participantUserId, role = "member") {
    const thread = await this.threadRepository.findByIdForUpdate(threadId);

    if (!thread) {
      throw new NotFoundException("Thread", threadId);
    }

    // Check permission
    if (!this.canInviteParticipant(userId, thread)) {
      throw new ForbiddenException("Bạn không có quyền thêm người vào thread");
    }

    // Validate event access for new participant
    await this.validateEventAccess(
      participantUserId,
      thread.context.referenceId,
      thread.context.referenceType
    );

    // Check if already participant
    if (thread.isParticipant(participantUserId)) {
      throw new ConflictException("Người dùng đã là thành viên của thread");
    }

    const participantData = {
      userId: participantUserId,
      role,
      isVisible: true,
      joinedAt: new Date(),
    };

    await this.threadRepository.addParticipant(threadId, participantData);

    Logger.success(
      `[ThreadSvc] Added participant ${participantUserId} to thread ${threadId}`
    );
    return await this.threadRepository.findById(threadId);
  }

  /**
   * Remove participant from thread
   */
  async removeParticipant(userId, threadId, participantUserId) {
    const thread = await this.threadRepository.findByIdForUpdate(threadId);

    if (!thread) {
      throw new NotFoundException("Thread", threadId);
    }

    // Check permission (only moderators/admins or self)
    if (
      userId.toString() !== participantUserId.toString() &&
      !this.canInviteParticipant(userId, thread)
    ) {
      throw new ForbiddenException("Bạn không có quyền xóa người khỏi thread");
    }

    // Cannot remove creator
    if (thread.isCreator(participantUserId)) {
      throw new ConflictException("Không thể xóa người tạo thread");
    }

    await this.threadRepository.removeParticipant(threadId, participantUserId);

    Logger.success(
      `[ThreadSvc] Removed participant ${participantUserId} from thread ${threadId}`
    );
    return await this.threadRepository.findById(threadId);
  }

  /**
   * Leave thread (hide for user)
   */
  async leaveThread(userId, threadId) {
    const thread = await this.threadRepository.findByIdForUpdate(threadId);

    if (!thread) {
      throw new NotFoundException("Thread", threadId);
    }

    // Cannot leave if creator
    if (thread.isCreator(userId)) {
      throw new ConflictException("Người tạo thread không thể rời khỏi thread");
    }

    await this.threadRepository.hideForParticipant(threadId, userId);

    Logger.success(`[ThreadSvc] User ${userId} left thread ${threadId}`);
  }

  /**
   * Auto-archive inactive threads
   */
  async autoArchiveInactiveThreads() {
    Logger.info("[ThreadSvc] Running auto-archive job...");

    const inactiveThreads = await this.threadRepository.findInactiveThreads(7);

    let archivedCount = 0;

    for (const thread of inactiveThreads) {
      try {
        await this.threadRepository.update(thread._id, {
          status: THREAD_STATUS.ARCHIVED,
        });

        // Send notification to participants (non-blocking)
        threadNotificationService
          .notifyThreadArchived(thread._id.toString())
          .catch((error) => {
            Logger.error(
              `[ThreadSvc] Failed to send archived notification for thread ${thread._id}:`,
              error
            );
          });

        archivedCount++;
      } catch (error) {
        Logger.error(
          `[ThreadSvc] Error archiving thread ${thread._id}:`,
          error
        );
      }
    }

    Logger.success(`[ThreadSvc] Auto-archived ${archivedCount} threads`);
    return archivedCount;
  }

  // ===== PERMISSION HELPERS =====

  /**
   * Check if user can view thread
   */
  canViewThread(userId, thread) {
    // Admin can view all
    if (this.isAdmin(userId)) return true;

    // Participant can view
    return thread.participants.some(
      (p) => p.userId.toString() === userId.toString() && p.isVisible
    );
  }

  /**
   * Check if user can edit thread
   */
  canEditThread(userId, thread) {
    // Admin can edit all
    if (this.isAdmin(userId)) return true;

    // Creator can edit
    if (thread.isCreator(userId)) return true;

    // Moderator can edit
    return thread.hasRole(userId, "moderator");
  }

  /**
   * Check if user can resolve thread
   */
  canResolveThread(userId, thread) {
    const permission = thread.permissions.canResolve;

    if (permission === "admins") {
      return this.isAdmin(userId);
    }

    if (permission === "moderators") {
      return this.isAdmin(userId) || thread.hasRole(userId, "moderator");
    }

    if (permission === "creator") {
      return thread.isCreator(userId);
    }

    return false;
  }

  /**
   * Check if user can archive thread
   */
  canArchiveThread(userId, thread) {
    const permission = thread.permissions.canArchive;

    if (permission === "admins") {
      return this.isAdmin(userId);
    }

    if (permission === "moderators") {
      return this.isAdmin(userId) || thread.hasRole(userId, "moderator");
    }

    if (permission === "creator") {
      return thread.isCreator(userId);
    }

    return false;
  }

  /**
   * Check if user can pin thread
   */
  canPinThread(userId, thread) {
    const permission = thread.permissions.canPin;

    if (permission === "admins") {
      return this.isAdmin(userId);
    }

    if (permission === "moderators") {
      return this.isAdmin(userId) || thread.hasRole(userId, "moderator");
    }

    return false;
  }

  /**
   * Check if user can invite participants
   */
  canInviteParticipant(userId, thread) {
    const permission = thread.permissions.canInvite;

    if (permission === "admins") {
      return this.isAdmin(userId);
    }

    if (permission === "moderators") {
      return this.isAdmin(userId) || thread.hasRole(userId, "moderator");
    }

    if (permission === "participants") {
      return thread.isParticipant(userId);
    }

    return permission === "all";
  }

  /**
   * Check if user is admin
   */
  isAdmin(userId) {
    // TODO: Implement actual admin check
    // For now, return false
    return false;
  }

  /**
   * Validate event access
   */
  async validateEventAccess(userId, referenceId, referenceType) {
    // TODO: Implement actual event access validation
    // For now, return true
    // This should check if user has access to the ORDER/DESIGN/PRODUCT
    return true;
  }
}

// Export singleton instance
export const threadService = new ThreadService();

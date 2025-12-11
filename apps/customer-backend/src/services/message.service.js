// apps/customer-backend/src/services/message.service.js
// Message Service - Business Logic for Threaded Messages

import { MessageRepository } from "../repositories/message.repository.js";
import { ThreadRepository } from "../repositories/thread.repository.js";
import { ParticipantService } from "./participant.service.js";
import { threadNotificationService } from "./thread-notification.service.js";
import { User } from "../shared/models/user.model.js";
import { MasterOrder } from "../shared/models/master-order.model.js";
import {
  ValidationException,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from "../shared/exceptions/index.js";
import { Logger } from "../shared/utils/logger.util.js";

/**
 * Message Service
 * Handles business logic for threaded messages
 */
export class MessageService {
  constructor() {
    this.messageRepository = new MessageRepository();
    this.threadRepository = new ThreadRepository();
    this.participantService = new ParticipantService();
  }

  // ===== 3.2.1: Send & Reply =====

  /**
   * Send a new message in a thread
   */
  async sendMessage(userId, threadId, data) {
    Logger.debug(`[MessageSvc] Sending message in thread: ${threadId}`);

    // Validate input
    if (
      !data.content ||
      (typeof data.content === "string" && data.content.trim().length === 0)
    ) {
      throw new ValidationException("Nội dung tin nhắn không được để trống");
    }

    // Check thread exists and user has access
    const thread = await this.threadRepository.findById(threadId);
    if (!thread) {
      throw new NotFoundException("Thread", threadId);
    }

    // Check if user is participant
    const isParticipant = thread.participants.some(
      (p) => p.userId._id.toString() === userId.toString() && p.isVisible
    );

    if (!isParticipant) {
      throw new ForbiddenException(
        "Bạn không có quyền gửi tin nhắn trong thread này"
      );
    }

    // Check thread permissions
    if (thread.permissions.canReply === "moderators") {
      const participant = thread.participants.find(
        (p) => p.userId._id.toString() === userId.toString()
      );
      if (!participant || !["moderator", "admin"].includes(participant.role)) {
        throw new ForbiddenException(
          "Chỉ moderators mới có thể gửi tin nhắn trong thread này"
        );
      }
    }

    // Parse mentions from content
    const mentions = await this.parseMentions(data.content);

    // Create message
    const messageData = {
      conversationId: threadId,
      sender: userId,
      senderType: data.senderType || "User",
      type: data.type || "text",
      content: data.content,
      metadata: data.metadata || null,
      mentions,
      attachments: data.attachments || [],
      threadDepth: 0, // Root message
      threadPath: "",
      rootMessageId: null,
      replyCount: 0,
      totalReplyCount: 0,
    };

    const message = await this.messageRepository.create(messageData);

    // Update thread stats
    await this.updateThreadStats(threadId);

    // Auto-add mentioned users to participants
    if (mentions.length > 0) {
      await this.handleMentions(threadId, mentions, userId);
    }

    // Send notifications (non-blocking)
    threadNotificationService
      .notifyNewMessage(threadId, message._id.toString(), userId.toString())
      .catch((error) => {
        Logger.error("[MessageSvc] Failed to send notifications:", error);
      });

    // Send mention notifications
    if (mentions.length > 0) {
      mentions.forEach((mention) => {
        threadNotificationService
          .notifyMention(
            threadId,
            message._id.toString(),
            mention.userId.toString(),
            userId.toString()
          )
          .catch((error) => {
            Logger.error(
              "[MessageSvc] Failed to send mention notification:",
              error
            );
          });
      });
    }

    Logger.success(`[MessageSvc] Message sent: ${message._id}`);

    return message;
  }

  /**
   * Send a reply to a message
   */
  async sendReply(userId, parentMessageId, data) {
    Logger.debug(`[MessageSvc] Sending reply to message: ${parentMessageId}`);

    // Validate input
    if (
      !data.content ||
      (typeof data.content === "string" && data.content.trim().length === 0)
    ) {
      throw new ValidationException("Nội dung tin nhắn không được để trống");
    }

    // Get parent message
    const parentMessage = await this.messageRepository.findById(
      parentMessageId
    );
    if (!parentMessage) {
      throw new NotFoundException("Message", parentMessageId);
    }

    // Check depth limit (max 3)
    if (parentMessage.threadDepth >= 3) {
      throw new ValidationException(
        "Không thể reply quá 3 cấp độ. Vui lòng reply vào tin nhắn cha."
      );
    }

    // Check thread access
    const thread = await this.threadRepository.findById(
      parentMessage.conversationId
    );
    if (!thread) {
      throw new NotFoundException("Thread", parentMessage.conversationId);
    }

    const isParticipant = thread.participants.some(
      (p) => p.userId._id.toString() === userId.toString() && p.isVisible
    );

    if (!isParticipant) {
      throw new ForbiddenException(
        "Bạn không có quyền gửi tin nhắn trong thread này"
      );
    }

    // Parse mentions
    const mentions = await this.parseMentions(data.content);

    // Calculate thread depth and path
    const threadDepth = Math.min(parentMessage.threadDepth + 1, 3);
    const rootMessageId = parentMessage.rootMessageId || parentMessage._id;
    const threadPath = parentMessage.threadPath
      ? `${parentMessage.threadPath}/${parentMessage._id}`
      : `${parentMessage._id}`;

    // Create reply message
    const messageData = {
      conversationId: parentMessage.conversationId,
      sender: userId,
      senderType: data.senderType || "User",
      type: data.type || "text",
      content: data.content,
      metadata: data.metadata || null,
      replyTo: parentMessageId,
      mentions,
      attachments: data.attachments || [],
      threadDepth,
      threadPath,
      rootMessageId,
      replyCount: 0,
      totalReplyCount: 0,
    };

    const message = await this.messageRepository.create(messageData);

    // Update parent message reply counts
    await this.messageRepository.updateReplyCounts(parentMessageId);

    // Update thread stats
    await this.updateThreadStats(parentMessage.conversationId);

    // Auto-add mentioned users to participants
    if (mentions.length > 0) {
      await this.handleMentions(parentMessage.conversationId, mentions, userId);
    }

    // Send notifications (non-blocking)
    threadNotificationService
      .notifyNewMessage(
        parentMessage.conversationId.toString(),
        message._id.toString(),
        userId.toString()
      )
      .catch((error) => {
        Logger.error("[MessageSvc] Failed to send notifications:", error);
      });

    // Send mention notifications
    if (mentions.length > 0) {
      mentions.forEach((mention) => {
        threadNotificationService
          .notifyMention(
            parentMessage.conversationId.toString(),
            message._id.toString(),
            mention.userId.toString(),
            userId.toString()
          )
          .catch((error) => {
            Logger.error(
              "[MessageSvc] Failed to send mention notification:",
              error
            );
          });
      });
    }

    Logger.success(`[MessageSvc] Reply sent: ${message._id}`);

    return message;
  }

  /**
   * Edit a message
   */
  async editMessage(userId, messageId, newContent) {
    Logger.debug(`[MessageSvc] Editing message: ${messageId}`);

    // Validate input
    if (
      !newContent ||
      (typeof newContent === "string" && newContent.trim().length === 0)
    ) {
      throw new ValidationException("Nội dung tin nhắn không được để trống");
    }

    // Get message
    const message = await this.messageRepository.findByIdForUpdate(messageId);
    if (!message) {
      throw new NotFoundException("Message", messageId);
    }

    // Check ownership
    if (message.sender.toString() !== userId.toString()) {
      throw new ForbiddenException(
        "Bạn chỉ có thể chỉnh sửa tin nhắn của mình"
      );
    }

    // Save to edit history
    message.editHistory.push({
      content: message.content,
      editedAt: new Date(),
      editedBy: userId,
    });

    // Update content
    message.content = newContent;
    message.isEdited = true;
    message.editedAt = new Date();

    // Parse new mentions
    const mentions = await this.parseMentions(newContent);
    message.mentions = mentions;

    await message.save();

    // Auto-add new mentioned users
    if (mentions.length > 0) {
      await this.handleMentions(message.conversationId, mentions, userId);
    }

    Logger.success(`[MessageSvc] Message edited: ${messageId}`);

    return message;
  }

  /**
   * Delete a message (soft delete)
   */
  async deleteMessage(userId, messageId) {
    Logger.debug(`[MessageSvc] Deleting message: ${messageId}`);

    // Get message
    const message = await this.messageRepository.findById(messageId);
    if (!message) {
      throw new NotFoundException("Message", messageId);
    }

    // Check ownership or admin
    if (message.sender._id.toString() !== userId.toString()) {
      // Check if user is admin
      const user = await User.findById(userId);
      if (!user || !user.isAdmin) {
        throw new ForbiddenException("Bạn chỉ có thể xóa tin nhắn của mình");
      }
      Logger.info(`[MessageSvc] Admin ${userId} deleting message ${messageId}`);
    }

    // Soft delete
    await this.messageRepository.softDelete(messageId, userId);

    Logger.success(`[MessageSvc] Message deleted: ${messageId}`);

    return { success: true };
  }

  // ===== 3.2.2: Mentions =====

  /**
   * Parse mentions from message content
   * Supports formats: @username, @[User Name](userId)
   */
  async parseMentions(content) {
    if (typeof content !== "string") return [];

    const mentions = [];
    const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)|@(\w+)/g;
    let match;

    while ((match = mentionRegex.exec(content)) !== null) {
      if (match[2]) {
        // Format: @[Display Name](userId)
        mentions.push({
          userId: match[2],
          displayName: match[1],
          username: match[1].toLowerCase().replace(/\s+/g, "_"),
        });
      } else if (match[3]) {
        // Format: @username
        // Look up user by username
        try {
          const user = await User.findOne({ username: match[3].toLowerCase() });
          if (user) {
            mentions.push({
              userId: user._id,
              username: user.username,
              displayName: user.displayName,
            });
          } else {
            Logger.warn(
              `[MessageSvc] User not found for mention: @${match[3]}`
            );
          }
        } catch (error) {
          Logger.error(
            `[MessageSvc] Error looking up user @${match[3]}:`,
            error
          );
        }
      }
    }

    return mentions;
  }

  /**
   * Handle mentions - auto-add mentioned users to thread participants
   * Delegates to ParticipantService for proper handling
   */
  async handleMentions(threadId, mentions, mentionedBy) {
    Logger.debug(
      `[MessageSvc] Handling ${mentions.length} mentions in thread: ${threadId}`
    );

    for (const mention of mentions) {
      if (!mention.userId) continue;

      try {
        // Delegate to ParticipantService to handle mention
        const result = await this.participantService.handleMention(
          threadId,
          mention.userId
        );

        if (result.added) {
          Logger.success(
            `[MessageSvc] Auto-added mentioned user ${mention.userId} to thread via ParticipantService`
          );

          // Send high-priority notification to mentioned user
          // TODO: Integrate with NotificationService when available
          Logger.info(
            `[MessageSvc] TODO: Send high-priority mention notification to user ${mention.userId}`
          );
        } else {
          Logger.debug(
            `[MessageSvc] User ${mention.userId} not added: ${result.reason}`
          );
        }
      } catch (error) {
        Logger.warn(
          `[MessageSvc] Failed to handle mention for user ${mention.userId}:`,
          error
        );
      }
    }
  }

  // ===== 3.2.3: Attachments =====

  /**
   * Upload attachment
   * NOTE: S3 upload integration needed
   * Currently returns mock data for development
   */
  async uploadAttachment(file, threadId, userId) {
    Logger.debug(`[MessageSvc] Uploading attachment for thread: ${threadId}`);

    // Validate file
    this.validateFile(file);

    // Check thread access
    const thread = await this.threadRepository.findById(threadId);
    if (!thread) {
      throw new NotFoundException("Thread", threadId);
    }

    const isParticipant = thread.participants.some(
      (p) => p.userId._id.toString() === userId.toString() && p.isVisible
    );

    if (!isParticipant) {
      throw new ForbiddenException(
        "Bạn không có quyền upload file trong thread này"
      );
    }

    // TODO: Integrate with S3 upload service
    // Example integration:
    // const s3Service = new S3Service();
    // const uploadResult = await s3Service.uploadFile(file, `threads/${threadId}`);
    // const thumbnailUrl = file.mimetype.startsWith("image/")
    //   ? await s3Service.generateThumbnail(uploadResult.url)
    //   : null;

    // For now, return mock data for development
    const attachment = {
      type: this.getAttachmentType(file.mimetype),
      url: `https://cdn.example.com/${file.filename}`,
      thumbnailUrl: file.mimetype.startsWith("image/")
        ? `https://cdn.example.com/thumbnails/${file.filename}`
        : null,
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      metadata: {
        uploadedBy: userId,
        uploadedAt: new Date(),
      },
    };

    Logger.success(
      `[MessageSvc] Attachment uploaded (mock): ${attachment.url}`
    );
    Logger.warn(`[MessageSvc] TODO: Replace with actual S3 upload`);

    return attachment;
  }

  /**
   * Validate file upload
   */
  validateFile(file) {
    const ALLOWED_TYPES = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/gif",
      "image/webp",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      throw new ValidationException(
        `Loại file không được hỗ trợ. Chỉ chấp nhận: ${ALLOWED_TYPES.join(
          ", "
        )}`
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new ValidationException("Kích thước file vượt quá 10MB");
    }
  }

  /**
   * Get attachment type from mimetype
   */
  getAttachmentType(mimetype) {
    if (mimetype.startsWith("image/")) return "image";
    if (mimetype === "application/pdf") return "file";
    if (mimetype.includes("word") || mimetype.includes("document"))
      return "file";
    if (mimetype.includes("excel") || mimetype.includes("spreadsheet"))
      return "file";
    return "file";
  }

  // ===== 3.2.4: Link Previews =====

  /**
   * Generate link preview
   * NOTE: Metadata fetching integration needed
   * Currently returns mock data for development
   */
  async generateLinkPreview(url) {
    Logger.debug(`[MessageSvc] Generating link preview for: ${url}`);

    // Validate URL
    try {
      new URL(url);
    } catch (error) {
      throw new ValidationException("URL không hợp lệ");
    }

    // TODO: Integrate with link preview service
    // Example integration:
    // const linkPreviewService = new LinkPreviewService();
    // const metadata = await linkPreviewService.fetchMetadata(url);
    // Cache the result in Redis for 24 hours
    // await redis.setex(`link_preview:${url}`, 86400, JSON.stringify(metadata));

    // For now, return mock data for development
    const preview = {
      url,
      title: "Link Preview Title",
      description: "Link preview description",
      image: "https://via.placeholder.com/300x200",
      siteName: new URL(url).hostname,
    };

    Logger.success(`[MessageSvc] Link preview generated (mock) for: ${url}`);
    Logger.warn(`[MessageSvc] TODO: Replace with actual metadata fetching`);

    return preview;
  }

  // ===== 3.2.5: Read Tracking =====

  /**
   * Mark message as read
   */
  async markAsRead(userId, messageId) {
    Logger.debug(`[MessageSvc] Marking message as read: ${messageId}`);

    const message = await this.messageRepository.findById(messageId);
    if (!message) {
      throw new NotFoundException("Message", messageId);
    }

    // Check thread access
    const thread = await this.threadRepository.findById(message.conversationId);
    if (!thread) {
      throw new NotFoundException("Thread", message.conversationId);
    }

    const isParticipant = thread.participants.some(
      (p) => p.userId._id.toString() === userId.toString() && p.isVisible
    );

    if (!isParticipant) {
      throw new ForbiddenException("Bạn không có quyền truy cập thread này");
    }

    // Mark as read
    await this.messageRepository.markAsRead(messageId, userId);

    Logger.success(`[MessageSvc] Message marked as read: ${messageId}`);

    return { success: true };
  }

  /**
   * Mark all messages in thread as read
   */
  async markThreadAsRead(userId, threadId) {
    Logger.debug(
      `[MessageSvc] Marking all messages as read in thread: ${threadId}`
    );

    // Check thread access
    const thread = await this.threadRepository.findById(threadId);
    if (!thread) {
      throw new NotFoundException("Thread", threadId);
    }

    const isParticipant = thread.participants.some(
      (p) => p.userId._id.toString() === userId.toString() && p.isVisible
    );

    if (!isParticipant) {
      throw new ForbiddenException("Bạn không có quyền truy cập thread này");
    }

    // Get all unread messages
    const { messages } = await this.messageRepository.findByConversation(
      threadId,
      {
        limit: 1000,
      }
    );

    const unreadMessageIds = messages
      .filter(
        (m) =>
          !m.readBy.includes(userId) &&
          m.sender._id.toString() !== userId.toString()
      )
      .map((m) => m._id);

    if (unreadMessageIds.length > 0) {
      await this.messageRepository.markMultipleAsRead(unreadMessageIds, userId);
    }

    Logger.success(
      `[MessageSvc] Marked ${unreadMessageIds.length} messages as read`
    );

    return { success: true, count: unreadMessageIds.length };
  }

  /**
   * Get unread count for user in thread
   */
  async getUnreadCount(userId, threadId) {
    // Check thread access
    const thread = await this.threadRepository.findById(threadId);
    if (!thread) {
      throw new NotFoundException("Thread", threadId);
    }

    const isParticipant = thread.participants.some(
      (p) => p.userId._id.toString() === userId.toString() && p.isVisible
    );

    if (!isParticipant) {
      return 0;
    }

    const count = await this.messageRepository.getUnreadCount(threadId, userId);

    return count;
  }

  // ===== Helper Methods =====

  /**
   * Validate user has access to event
   */
  async validateEventAccess(userId, eventId, eventType) {
    try {
      switch (eventType) {
        case "ORDER":
          const order = await MasterOrder.findById(eventId);
          if (!order) return false;

          // Check if user is customer, printer, or admin
          if (order.customerId.toString() === userId.toString()) {
            return true;
          }

          // Check if user is one of the printers
          const isPrinter = order.printerOrders.some(
            (po) => po.printerProfileId.toString() === userId.toString()
          );
          if (isPrinter) return true;

          // Check if user is admin
          const user = await User.findById(userId);
          if (user && user.isAdmin) return true;

          return false;

        case "DESIGN":
          // TODO: Implement design access validation
          // For now, allow all authenticated users
          Logger.warn(
            `[MessageSvc] DESIGN event access validation not implemented yet`
          );
          return true;

        case "PRODUCT":
          // Products are public
          return true;

        case "NONE":
          // No event context - allow all participants
          return true;

        default:
          Logger.warn(`[MessageSvc] Unknown event type: ${eventType}`);
          return false;
      }
    } catch (error) {
      Logger.error(`[MessageSvc] Error validating event access:`, error);
      return false;
    }
  }

  /**
   * Update thread statistics
   */
  async updateThreadStats(threadId) {
    const thread = await this.threadRepository.findByIdForUpdate(threadId);
    if (!thread) return;

    // Count messages
    const messageCount = await this.messageRepository.count({
      conversationId: threadId,
      threadDepth: 0,
    });

    const replyCount = await this.messageRepository.count({
      conversationId: threadId,
      threadDepth: { $gt: 0 },
    });

    // Get latest message
    const latestMessage = await this.messageRepository.getLatestMessage(
      threadId
    );

    // Update stats
    thread.stats.messageCount = messageCount;
    thread.stats.replyCount = replyCount;
    thread.stats.lastActivityAt = latestMessage
      ? latestMessage.createdAt
      : new Date();
    thread.lastMessageAt = latestMessage ? latestMessage.createdAt : new Date();

    await thread.save();
  }

  /**
   * Get messages in thread
   */
  async getMessages(userId, threadId, options = {}) {
    Logger.debug(`[MessageSvc] Getting messages for thread: ${threadId}`);

    // Check thread access
    const thread = await this.threadRepository.findById(threadId);
    if (!thread) {
      throw new NotFoundException("Thread", threadId);
    }

    const isParticipant = thread.participants.some(
      (p) => p.userId._id.toString() === userId.toString() && p.isVisible
    );

    if (!isParticipant) {
      throw new ForbiddenException("Bạn không có quyền truy cập thread này");
    }

    // Get messages
    const result = await this.messageRepository.findByConversation(
      threadId,
      options
    );

    return result;
  }

  /**
   * Get replies to a message
   */
  async getReplies(userId, messageId, options = {}) {
    Logger.debug(`[MessageSvc] Getting replies for message: ${messageId}`);

    // Get message
    const message = await this.messageRepository.findById(messageId);
    if (!message) {
      throw new NotFoundException("Message", messageId);
    }

    // Check thread access
    const thread = await this.threadRepository.findById(message.conversationId);
    if (!thread) {
      throw new NotFoundException("Thread", message.conversationId);
    }

    const isParticipant = thread.participants.some(
      (p) => p.userId._id.toString() === userId.toString() && p.isVisible
    );

    if (!isParticipant) {
      throw new ForbiddenException("Bạn không có quyền truy cập thread này");
    }

    // Get replies
    const result = await this.messageRepository.getReplies(messageId, options);

    return result;
  }
}

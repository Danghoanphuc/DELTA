// apps/customer-backend/src/services/thread-notification.service.js
// ✅ Thread Notification Service - Handle notifications for threaded chat system

import { Logger } from "../shared/utils/index.js";
import { notificationService } from "../modules/notifications/notification.service.js";
import { novuService } from "../infrastructure/notifications/novu.service.ts";
import { zaloService } from "../modules/notifications/zalo.service.js";
import { Thread } from "../shared/models/thread.model.js";
import { ThreadedMessage } from "../shared/models/threaded-message.model.js";
import { User } from "../shared/models/user.model.js";

/**
 * Thread Notification Service
 * Handles all notification logic for threaded chat system
 *
 * Requirements:
 * - 5.1: Send notifications to all participants (exclude sender)
 * - 5.2: High-priority notifications for mentions
 * - 4.5: Notifications when thread is archived
 */
class ThreadNotificationService {
  constructor() {
    // Debounce map to prevent notification spam
    // Key: `${threadId}:${userId}`, Value: timestamp
    this.notificationDebounce = new Map();
    this.DEBOUNCE_INTERVAL = 3000; // 3 seconds
  }

  /**
   * Notify all participants about new message (exclude sender)
   * @param {string} threadId
   * @param {string} messageId
   * @param {string} senderUserId - User who sent the message
   * @returns {Promise<void>}
   *
   * Requirements: 5.1
   * Property 12: Notification Exclusion
   */
  async notifyNewMessage(threadId, messageId, senderUserId) {
    try {
      Logger.debug(
        `[ThreadNotifSvc] Notifying new message in thread ${threadId}`
      );

      // Get thread with participants
      const thread = await Thread.findById(threadId)
        .populate("participants.userId", "displayName email phone")
        .lean();

      if (!thread) {
        Logger.warn(`[ThreadNotifSvc] Thread ${threadId} not found`);
        return;
      }

      // Get message details
      const message = await ThreadedMessage.findById(messageId)
        .populate("sender", "displayName")
        .lean();

      if (!message) {
        Logger.warn(`[ThreadNotifSvc] Message ${messageId} not found`);
        return;
      }

      // Get sender info
      const sender = await User.findById(senderUserId)
        .select("displayName")
        .lean();
      const senderName = sender?.displayName || "Ai đó";

      // Filter participants (exclude sender)
      const recipients = thread.participants
        .filter((p) => p.userId._id.toString() !== senderUserId.toString())
        .map((p) => p.userId);

      if (recipients.length === 0) {
        Logger.debug(`[ThreadNotifSvc] No recipients to notify`);
        return;
      }

      // Prepare notification data
      const notificationData = {
        threadId: thread._id.toString(),
        threadTitle: thread.title,
        messageId: message._id.toString(),
        messageContent: this._truncateContent(message.content),
        senderName,
        eventType: thread.context?.referenceType,
        eventId: thread.context?.referenceId,
      };

      // Send notifications to all recipients
      const notificationPromises = recipients.map((recipient) =>
        this._sendNewMessageNotification(recipient, notificationData)
      );

      await Promise.allSettled(notificationPromises);

      Logger.success(
        `[ThreadNotifSvc] Sent new message notifications to ${recipients.length} participants`
      );
    } catch (error) {
      Logger.error("[ThreadNotifSvc] Error notifying new message:", error);
      // Don't throw - notifications are non-critical
    }
  }

  /**
   * Send high-priority notification for mentions
   * @param {string} threadId
   * @param {string} messageId
   * @param {string} mentionedUserId
   * @param {string} senderUserId
   * @returns {Promise<void>}
   *
   * Requirements: 5.2
   * Property 13: Mention Notification Priority
   */
  async notifyMention(threadId, messageId, mentionedUserId, senderUserId) {
    try {
      Logger.debug(
        `[ThreadNotifSvc] Notifying mention for user ${mentionedUserId} in thread ${threadId}`
      );

      // Check debounce
      if (this._shouldDebounce(threadId, mentionedUserId)) {
        Logger.debug(`[ThreadNotifSvc] Mention notification debounced`);
        return;
      }

      // Get thread and message
      const [thread, message, sender, mentionedUser] = await Promise.all([
        Thread.findById(threadId).lean(),
        ThreadedMessage.findById(messageId).lean(),
        User.findById(senderUserId).select("displayName").lean(),
        User.findById(mentionedUserId).select("displayName email phone").lean(),
      ]);

      if (!thread || !message || !mentionedUser) {
        Logger.warn(`[ThreadNotifSvc] Missing data for mention notification`);
        return;
      }

      const senderName = sender?.displayName || "Ai đó";

      // Create in-app notification (high priority)
      await notificationService.createNotification({
        userId: mentionedUserId,
        type: "thread_mention",
        title: `${senderName} đã nhắc đến bạn`,
        message: `Trong "${thread.title}": ${this._truncateContent(
          message.content
        )}`,
        data: {
          threadId: thread._id.toString(),
          messageId: message._id.toString(),
          priority: "high",
          eventType: thread.context?.referenceType,
          eventId: thread.context?.referenceId,
        },
      });

      // Send push notification via Novu (high priority)
      await novuService.trigger("thread-mention", mentionedUserId, {
        senderName,
        threadTitle: thread.title,
        messageContent: this._truncateContent(message.content),
        threadId: thread._id.toString(),
        url: `/threads/${thread._id}`,
      });

      // Send Zalo notification if phone available
      if (mentionedUser.phone) {
        await zaloService.sendTextMessage(
          mentionedUser.phone,
          `${senderName} đã nhắc đến bạn trong "${
            thread.title
          }": ${this._truncateContent(message.content)}`
        );
      }

      // Update debounce map
      this._updateDebounce(threadId, mentionedUserId);

      Logger.success(
        `[ThreadNotifSvc] Sent mention notification to user ${mentionedUserId}`
      );
    } catch (error) {
      Logger.error("[ThreadNotifSvc] Error notifying mention:", error);
      // Don't throw - notifications are non-critical
    }
  }

  /**
   * Notify participants when thread is resolved
   * @param {string} threadId
   * @param {string} resolvedByUserId
   * @param {string} resolutionNotes
   * @returns {Promise<void>}
   *
   * Requirements: 4.2
   */
  async notifyThreadResolved(threadId, resolvedByUserId, resolutionNotes) {
    try {
      Logger.debug(`[ThreadNotifSvc] Notifying thread resolved: ${threadId}`);

      const thread = await Thread.findById(threadId)
        .populate("participants.userId", "displayName email phone")
        .lean();

      if (!thread) {
        Logger.warn(`[ThreadNotifSvc] Thread ${threadId} not found`);
        return;
      }

      const resolvedBy = await User.findById(resolvedByUserId)
        .select("displayName")
        .lean();
      const resolverName = resolvedBy?.displayName || "Ai đó";

      // Notify all participants (exclude resolver)
      const recipients = thread.participants
        .filter((p) => p.userId._id.toString() !== resolvedByUserId.toString())
        .map((p) => p.userId);

      const notificationPromises = recipients.map((recipient) =>
        notificationService.createNotification({
          userId: recipient._id,
          type: "thread_resolved",
          title: "Cuộc trò chuyện đã được giải quyết",
          message: `${resolverName} đã đánh dấu "${
            thread.title
          }" là đã giải quyết${resolutionNotes ? `: ${resolutionNotes}` : ""}`,
          data: {
            threadId: thread._id.toString(),
            resolvedBy: resolvedByUserId,
            resolutionNotes,
            eventType: thread.context?.referenceType,
            eventId: thread.context?.referenceId,
          },
        })
      );

      await Promise.allSettled(notificationPromises);

      Logger.success(
        `[ThreadNotifSvc] Sent thread resolved notifications to ${recipients.length} participants`
      );
    } catch (error) {
      Logger.error("[ThreadNotifSvc] Error notifying thread resolved:", error);
    }
  }

  /**
   * Notify participants when thread is archived
   * @param {string} threadId
   * @returns {Promise<void>}
   *
   * Requirements: 4.5
   * Property 11: Auto-archive Inactive Threads
   */
  async notifyThreadArchived(threadId) {
    try {
      Logger.debug(`[ThreadNotifSvc] Notifying thread archived: ${threadId}`);

      const thread = await Thread.findById(threadId)
        .populate("participants.userId", "displayName email phone")
        .lean();

      if (!thread) {
        Logger.warn(`[ThreadNotifSvc] Thread ${threadId} not found`);
        return;
      }

      // Notify all participants
      const recipients = thread.participants.map((p) => p.userId);

      const notificationPromises = recipients.map((recipient) =>
        notificationService.createNotification({
          userId: recipient._id,
          type: "thread_archived",
          title: "Cuộc trò chuyện đã được lưu trữ",
          message: `"${thread.title}" đã được lưu trữ do không có hoạt động trong 7 ngày`,
          data: {
            threadId: thread._id.toString(),
            eventType: thread.context?.referenceType,
            eventId: thread.context?.referenceId,
          },
        })
      );

      await Promise.allSettled(notificationPromises);

      Logger.success(
        `[ThreadNotifSvc] Sent thread archived notifications to ${recipients.length} participants`
      );
    } catch (error) {
      Logger.error("[ThreadNotifSvc] Error notifying thread archived:", error);
    }
  }

  /**
   * Batch send notifications to avoid spam
   * @param {Array} notifications - Array of notification objects
   * @returns {Promise<void>}
   *
   * Requirements: 5.1
   */
  async batchNotifications(notifications) {
    try {
      Logger.debug(
        `[ThreadNotifSvc] Batch sending ${notifications.length} notifications`
      );

      // Group notifications by user
      const groupedByUser = notifications.reduce((acc, notif) => {
        const userId = notif.userId.toString();
        if (!acc[userId]) {
          acc[userId] = [];
        }
        acc[userId].push(notif);
        return acc;
      }, {});

      // Send batched notifications
      const batchPromises = Object.entries(groupedByUser).map(
        async ([userId, userNotifications]) => {
          // If multiple notifications for same user, combine them
          if (userNotifications.length > 1) {
            return notificationService.createNotification({
              userId,
              type: "thread_batch",
              title: `${userNotifications.length} tin nhắn mới`,
              message: `Bạn có ${userNotifications.length} tin nhắn mới trong các cuộc trò chuyện`,
              data: {
                notifications: userNotifications.map((n) => n.data),
              },
            });
          } else {
            return notificationService.createNotification(userNotifications[0]);
          }
        }
      );

      await Promise.allSettled(batchPromises);

      Logger.success(
        `[ThreadNotifSvc] Batch sent notifications to ${
          Object.keys(groupedByUser).length
        } users`
      );
    } catch (error) {
      Logger.error(
        "[ThreadNotifSvc] Error batch sending notifications:",
        error
      );
    }
  }

  // ===== PRIVATE HELPERS =====

  /**
   * Send new message notification to a single recipient
   * @private
   */
  async _sendNewMessageNotification(recipient, data) {
    try {
      // Check debounce
      if (this._shouldDebounce(data.threadId, recipient._id.toString())) {
        Logger.debug(
          `[ThreadNotifSvc] Notification debounced for user ${recipient._id}`
        );
        return;
      }

      // Create in-app notification
      await notificationService.createNotification({
        userId: recipient._id,
        type: "thread_new_message",
        title: `${data.senderName} đã gửi tin nhắn`,
        message: `Trong "${data.threadTitle}": ${data.messageContent}`,
        data: {
          threadId: data.threadId,
          messageId: data.messageId,
          eventType: data.eventType,
          eventId: data.eventId,
        },
      });

      // Send push notification via Novu
      await novuService.triggerChatNotification(
        recipient._id,
        data.messageContent,
        data.threadId,
        data.senderName
      );

      // Send Zalo notification if phone available
      if (recipient.phone) {
        await zaloService.sendTextMessage(
          recipient.phone,
          `${data.senderName} trong "${data.threadTitle}": ${data.messageContent}`
        );
      }

      // Update debounce map
      this._updateDebounce(data.threadId, recipient._id.toString());
    } catch (error) {
      Logger.error(
        `[ThreadNotifSvc] Error sending notification to user ${recipient._id}:`,
        error
      );
    }
  }

  /**
   * Check if notification should be debounced
   * @private
   */
  _shouldDebounce(threadId, userId) {
    const key = `${threadId}:${userId}`;
    const lastNotification = this.notificationDebounce.get(key);

    if (!lastNotification) {
      return false;
    }

    const timeSinceLastNotification = Date.now() - lastNotification;
    return timeSinceLastNotification < this.DEBOUNCE_INTERVAL;
  }

  /**
   * Update debounce timestamp
   * @private
   */
  _updateDebounce(threadId, userId) {
    const key = `${threadId}:${userId}`;
    this.notificationDebounce.set(key, Date.now());

    // Clean up old entries (older than 1 hour)
    setTimeout(() => {
      this.notificationDebounce.delete(key);
    }, 3600000); // 1 hour
  }

  /**
   * Truncate message content for notifications
   * @private
   */
  _truncateContent(content, maxLength = 100) {
    if (!content) return "";

    let text = "";
    if (typeof content === "string") {
      text = content;
    } else if (content.text) {
      text = content.text;
    } else if (content.message) {
      text = content.message;
    } else {
      text = JSON.stringify(content);
    }

    if (text.length <= maxLength) {
      return text;
    }

    return text.substring(0, maxLength) + "...";
  }
}

export const threadNotificationService = new ThreadNotificationService();

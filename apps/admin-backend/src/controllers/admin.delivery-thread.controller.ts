// apps/admin-backend/src/controllers/admin.delivery-thread.controller.ts
/**
 * Admin Delivery Thread Controller
 * Handles delivery thread operations for admin portal
 */

import { Request, Response, NextFunction } from "express";
import { DeliveryThread } from "../models/delivery-thread.model.js";
import mongoose from "mongoose";
import { pusherService } from "../infrastructure/realtime/pusher.service.js";
import { addNotificationJob } from "../infrastructure/queue/notification.queue.js";

// DeliveryCheckin model should already be registered
const DeliveryCheckin = mongoose.model("DeliveryCheckin");

export class AdminDeliveryThreadController {
  /**
   * Get thread by checkin ID
   * @route GET /api/admin/delivery-threads/checkin/:checkinId
   */
  async getThreadByCheckin(req: Request, res: Response, next: NextFunction) {
    try {
      const { checkinId } = req.params;
      const adminUser = req.admin;

      if (!adminUser) {
        return res.status(401).json({
          success: false,
          error: { message: "Unauthorized" },
        });
      }

      // Find or create thread
      let thread = await DeliveryThread.findOne({
        checkinId,
        isDeleted: false,
      }).lean();

      if (!thread) {
        // Get checkin info
        const checkin = await DeliveryCheckin.findById(checkinId).lean();
        if (!checkin) {
          return res.status(404).json({
            success: false,
            error: { message: "Check-in không tồn tại" },
          });
        }

        // Create new thread
        thread = await DeliveryThread.create({
          checkinId,
          orderId: (checkin as any).orderId,
          orderNumber: (checkin as any).orderNumber,
          orderType: (checkin as any).orderType,
          organizationId: (checkin as any).organizationId,
          participants: [
            {
              userId: adminUser._id,
              userModel: "User",
              userName: adminUser.displayName || adminUser.email,
              role: "admin",
              joinedAt: new Date(),
            },
          ],
          messages: [],
          messageCount: 0,
        });
      } else {
        // Add admin as participant if not already
        const isParticipant = thread.participants.some(
          (p: any) => p.userId.toString() === adminUser._id.toString()
        );

        if (!isParticipant) {
          await DeliveryThread.findByIdAndUpdate(thread._id, {
            $push: {
              participants: {
                userId: adminUser._id,
                userModel: "User",
                userName: adminUser.displayName || adminUser.email,
                role: "admin",
                joinedAt: new Date(),
              },
            },
          });

          // Refresh thread
          thread = await DeliveryThread.findById(thread._id).lean();
        }
      }

      res.status(200).json({
        success: true,
        data: { thread },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add message to thread
   * @route POST /api/admin/delivery-threads/:threadId/messages
   */
  async addMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const { threadId } = req.params;
      const { content } = req.body;
      const adminUser = req.admin;

      if (!adminUser) {
        return res.status(401).json({
          success: false,
          error: { message: "Unauthorized" },
        });
      }

      if (!content || content.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: { message: "Nội dung tin nhắn không được để trống" },
        });
      }

      // Check if thread exists
      const existingThread = await DeliveryThread.findById(threadId).lean();
      if (!existingThread) {
        return res.status(404).json({
          success: false,
          error: { message: "Thread không tồn tại" },
        });
      }

      // Add message using findByIdAndUpdate to avoid validation issues
      const message = {
        senderId: adminUser._id,
        senderModel: "User",
        senderName: adminUser.displayName || adminUser.email,
        senderRole: "admin",
        messageType: "text",
        content: content.trim(),
        attachments: [],
        isEdited: false,
        isDeleted: false,
      };

      const updatedThread = await DeliveryThread.findByIdAndUpdate(
        threadId,
        {
          $push: { messages: message },
          $set: {
            lastMessageAt: new Date(),
            lastMessagePreview: content.substring(0, 100),
          },
          $inc: { messageCount: 1 },
        },
        { new: true, runValidators: false }
      ).lean();

      // Emit real-time events via Pusher
      this.emitThreadUpdate(updatedThread, "message:new");

      // Send notifications to other participants
      this.sendNotifications(updatedThread, adminUser._id.toString(), message);

      res.status(201).json({
        success: true,
        data: { thread: updatedThread },
        message: "Đã gửi tin nhắn",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Emit real-time event via Pusher
   */
  private emitThreadUpdate(thread: any, eventType: string) {
    try {
      if (!pusherService.pusherInstance) {
        console.warn(
          "[AdminDeliveryThread] Pusher not configured, skipping real-time emit"
        );
        return;
      }

      const channelName = `thread-${thread._id}`;

      // ⚠️ CRITICAL: Pusher has 10KB limit per event
      // Send ONLY the last message, not the entire thread
      const lastMessage = thread.messages?.[thread.messages.length - 1];

      const payload = {
        threadId: thread._id.toString(),
        message: lastMessage,
        timestamp: new Date().toISOString(),
      };

      console.log(
        `[AdminDeliveryThread] 📤 Emitting ${eventType} to ${channelName}`
      );
      console.log(`[AdminDeliveryThread] Payload:`, {
        threadId: thread._id,
        messageId: lastMessage?._id,
        messageContent: lastMessage?.content?.substring(0, 50),
      });

      // Emit to thread-specific channel
      pusherService.trigger(channelName, eventType, payload);

      // Emit to each participant's private channel
      thread.participants.forEach((participant: any) => {
        const userId = participant.userId.toString();
        pusherService.emitToUser(userId, "thread:update", {
          threadId: thread._id.toString(),
          orderNumber: thread.orderNumber,
          eventType,
          timestamp: new Date().toISOString(),
        });
      });

      console.log(
        `[AdminDeliveryThread] ✅ Emitted ${eventType} for thread: ${thread._id}`
      );
    } catch (error) {
      console.error(
        `[AdminDeliveryThread] ❌ Failed to emit real-time event:`,
        error
      );
      // Don't throw - real-time is not critical
    }
  }

  /**
   * Send Novu notifications to participants
   */
  private sendNotifications(thread: any, senderId: string, messageData: any) {
    try {
      // Send notification to all participants except sender
      thread.participants.forEach((participant: any) => {
        if (participant.userId.toString() === senderId) {
          return; // Skip sender
        }

        // Queue notification job
        addNotificationJob({
          type: "delivery-thread-message",
          recipientId: participant.userId.toString(),
          recipientModel: String(participant.userModel),
          data: {
            threadId: thread._id.toString(),
            orderNumber: String(thread.orderNumber),
            senderName: String(messageData.senderName || "Admin"),
            senderRole: String(messageData.senderRole || "admin"),
            messagePreview: String(
              messageData.content.length > 100
                ? messageData.content.substring(0, 100) + "..."
                : messageData.content
            ),
            checkinId: thread.checkinId.toString(),
          },
        });
      });

      console.log(
        `[AdminDeliveryThread] Queued notifications for thread: ${thread._id}`
      );
    } catch (error) {
      console.error(
        `[AdminDeliveryThread] Failed to queue notifications:`,
        error
      );
      // Don't throw - notifications are not critical
    }
  }
}

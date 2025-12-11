// apps/admin-backend/src/controllers/admin.order-thread.controller.ts
/**
 * Admin Order Thread Controller
 * Handles order-level threads (not checkin-specific)
 */

import { Request, Response, NextFunction } from "express";
import { DeliveryThread } from "../models/delivery-thread.model.js";
import mongoose from "mongoose";
import { pusherService } from "../infrastructure/realtime/pusher.service.js";

const SwagOrder = mongoose.model("SwagOrder");

export class AdminOrderThreadController {
  /**
   * Get or create thread by order ID
   * @route GET /api/admin/order-threads/:orderId
   */
  async getThreadByOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId } = req.params;
      const adminUser = req.admin;

      console.log("[AdminOrderThread] getThreadByOrder called:", {
        orderId,
        hasAdmin: !!adminUser,
        adminId: adminUser?._id,
      });

      if (!adminUser) {
        console.error("[AdminOrderThread] No admin user in request");
        return res.status(401).json({
          success: false,
          error: { message: "Unauthorized" },
        });
      }

      // Find thread by orderId (without checkinId)
      let thread = await DeliveryThread.findOne({
        orderId,
        checkinId: { $exists: false }, // Order-level thread
        isDeleted: false,
      }).lean();

      console.log("[AdminOrderThread] Thread search result:", {
        found: !!thread,
        threadId: thread?._id,
      });

      if (!thread) {
        console.error(
          "[AdminOrderThread] Thread not found for order:",
          orderId
        );
        return res.status(404).json({
          success: false,
          error: {
            message:
              "Thread chưa được tạo cho đơn hàng này. Vui lòng liên hệ support.",
          },
        });
      } else {
        console.log("[AdminOrderThread] Thread exists, checking participant");
        // Add admin as participant if not already
        const isParticipant = thread.participants.some(
          (p: any) => p.userId.toString() === adminUser._id.toString()
        );

        console.log("[AdminOrderThread] Is admin participant?", isParticipant);

        if (!isParticipant) {
          console.log("[AdminOrderThread] Adding admin as participant");
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

          thread = await DeliveryThread.findById(thread._id).lean();
        }
      }

      console.log("[AdminOrderThread] Returning thread:", {
        threadId: thread._id,
        messageCount: thread.messages?.length,
      });

      res.status(200).json({
        success: true,
        data: { thread },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add message to order thread
   * @route POST /api/admin/order-threads/:threadId/messages
   */
  async addMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const { threadId } = req.params;
      const { content } = req.body;
      const adminUser = req.admin;

      console.log("[AdminOrderThread] addMessage called:", {
        threadId,
        hasContent: !!content,
        hasAdmin: !!adminUser,
        adminId: adminUser?._id,
      });

      if (!adminUser) {
        console.error("[AdminOrderThread] No admin user in request");
        return res.status(401).json({
          success: false,
          error: { message: "Unauthorized" },
        });
      }

      if (!content || content.trim().length === 0) {
        console.error("[AdminOrderThread] Empty content");
        return res.status(400).json({
          success: false,
          error: { message: "Nội dung tin nhắn không được để trống" },
        });
      }

      const existingThread = await DeliveryThread.findById(threadId).lean();
      if (!existingThread) {
        console.error("[AdminOrderThread] Thread not found:", threadId);
        return res.status(404).json({
          success: false,
          error: { message: "Thread không tồn tại" },
        });
      }

      console.log("[AdminOrderThread] Thread found, adding message");

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

      console.log("[AdminOrderThread] Message added, thread updated:", {
        threadId: updatedThread?._id,
        messageCount: updatedThread?.messageCount,
      });

      // Emit real-time event
      this.emitThreadUpdate(updatedThread, "message:new");

      // Extract the last message to return
      const lastMessage =
        updatedThread?.messages?.[updatedThread.messages.length - 1];

      console.log("[AdminOrderThread] Sending response with message:", {
        messageId: lastMessage?._id,
        content: lastMessage?.content?.substring(0, 50),
      });

      res.status(201).json({
        success: true,
        data: {
          thread: updatedThread,
          message: lastMessage,
        },
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
        console.warn("[AdminOrderThread] Pusher not configured");
        return;
      }

      const channelName = `thread-${thread._id}`;
      const lastMessage = thread.messages?.[thread.messages.length - 1];

      const payload = {
        threadId: thread._id.toString(),
        message: lastMessage,
        timestamp: new Date().toISOString(),
      };

      console.log(
        `[AdminOrderThread] 📤 Emitting ${eventType} to ${channelName}`
      );
      pusherService.trigger(channelName, eventType, payload);

      // Emit to participants
      thread.participants.forEach((participant: any) => {
        const userId = participant.userId.toString();
        pusherService.emitToUser(userId, "thread:update", {
          threadId: thread._id.toString(),
          orderNumber: thread.orderNumber,
          eventType,
          timestamp: new Date().toISOString(),
        });
      });

      console.log(`[AdminOrderThread] ✅ Emitted ${eventType}`);
    } catch (error) {
      console.error(`[AdminOrderThread] ❌ Emit error:`, error);
    }
  }
}

// apps/customer-backend/src/modules/order-thread/order-thread.controller.js
/**
 * Order Thread Controller (Customer side)
 * Handles order-level chat for customers
 */

import { DeliveryThread } from "../delivery-thread/delivery-thread.model.js";
import { Logger } from "../../shared/utils/index.js";
import { socketService } from "../../infrastructure/realtime/pusher.service.js";
import mongoose from "mongoose";

const SwagOrder = mongoose.model("SwagOrder");

export class OrderThreadController {
  /**
   * Get or create thread by order ID
   * @route GET /api/order-threads/:orderId
   */
  async getThreadByOrder(req, res, next) {
    try {
      const { orderId } = req.params;
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          error: { message: "Unauthorized - No user" },
        });
      }

      // Determine user type
      const isOrganization = !!user.organizationProfileId;
      const isShipper = !isOrganization;

      Logger.debug(
        `[OrderThread] Getting thread for order: ${orderId}, user: ${user._id}, isOrg: ${isOrganization}, isShipper: ${isShipper}`
      );

      // Find thread by orderId (without checkinId)
      let thread = await DeliveryThread.findOne({
        orderId,
        checkinId: { $exists: false },
        isDeleted: false,
      }).lean();

      if (!thread) {
        // Thread doesn't exist
        if (isShipper) {
          // Shipper cannot create thread, only join existing ones
          return res.status(404).json({
            success: false,
            error: { message: "Thread chưa được tạo cho đơn hàng này" },
          });
        }

        // Only organization can create thread
        const organizationId = user.organizationProfileId;

        // Get order info
        const order = await SwagOrder.findById(orderId).lean();
        if (!order) {
          return res.status(404).json({
            success: false,
            error: { message: "Đơn hàng không tồn tại" },
          });
        }

        // Check authorization
        if (order.organization.toString() !== organizationId.toString()) {
          return res.status(403).json({
            success: false,
            error: { message: "Bạn không có quyền truy cập đơn hàng này" },
          });
        }

        // Create new thread
        thread = await DeliveryThread.create({
          orderId,
          orderNumber: order.orderNumber,
          orderType: "swag",
          organizationId: organizationId,
          participants: [
            {
              userId: organizationId,
              userModel: "OrganizationProfile",
              userName: user.displayName || user.email || "Customer",
              role: "customer",
              joinedAt: new Date(),
            },
          ],
          messages: [],
          messageCount: 0,
        });

        Logger.success(`[OrderThread] Created thread: ${thread._id}`);
      } else {
        // Thread exists - check authorization
        if (isShipper) {
          // Shipper must be participant (added by admin when assigned)
          const isParticipant = thread.participants.some(
            (p) => p.userId.toString() === user._id.toString()
          );

          Logger.debug(`[OrderThread] Checking shipper access:`, {
            shipperId: user._id.toString(),
            threadId: thread._id.toString(),
            isParticipant,
            participantCount: thread.participants.length,
            participants: thread.participants.map((p) => ({
              userId: p.userId.toString(),
              role: p.role,
            })),
          });

          if (!isParticipant) {
            // Auto-add shipper to thread (SwagOrder doesn't have shipper assignment)
            Logger.info(
              `[OrderThread] Auto-adding shipper ${user._id} to thread ${thread._id}`
            );
            await DeliveryThread.findByIdAndUpdate(thread._id, {
              $push: {
                participants: {
                  userId: user._id,
                  userModel: "User",
                  userName: user.displayName || user.email || "Shipper",
                  role: "shipper",
                  joinedAt: new Date(),
                },
              },
            });

            // Reload thread with new participant
            thread = await DeliveryThread.findById(thread._id).lean();
          }

          Logger.success(
            `[OrderThread] Shipper ${user._id} has access to thread ${thread._id}`
          );
        } else {
          // Organization must own the order
          const organizationId = user.organizationProfileId;
          if (thread.organizationId.toString() !== organizationId.toString()) {
            return res.status(403).json({
              success: false,
              error: { message: "Bạn không có quyền truy cập thread này" },
            });
          }

          // Add customer as participant if not already
          const isParticipant = thread.participants.some(
            (p) => p.userId.toString() === organizationId.toString()
          );

          if (!isParticipant) {
            await DeliveryThread.findByIdAndUpdate(thread._id, {
              $push: {
                participants: {
                  userId: organizationId,
                  userModel: "OrganizationProfile",
                  userName: user.displayName || user.email || "Customer",
                  role: "customer",
                  joinedAt: new Date(),
                },
              },
            });

            thread = await DeliveryThread.findById(thread._id).lean();
          }
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
   * Add message to order thread
   * @route POST /api/order-threads/:threadId/messages
   */
  async addMessage(req, res, next) {
    try {
      const { threadId } = req.params;
      const { content } = req.body;
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          error: { message: "Unauthorized - No user" },
        });
      }

      // Determine user type: organization customer or shipper
      const isOrganization = !!user.organizationProfileId;
      const isShipper = !isOrganization; // Regular user = shipper

      const senderId = isOrganization ? user.organizationProfileId : user._id;
      const senderModel = isOrganization ? "OrganizationProfile" : "User";
      const senderRole = isOrganization ? "customer" : "shipper";

      if (!content || content.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: { message: "Nội dung tin nhắn không được để trống" },
        });
      }

      const existingThread = await DeliveryThread.findById(threadId).lean();
      if (!existingThread) {
        return res.status(404).json({
          success: false,
          error: { message: "Thread không tồn tại" },
        });
      }

      // Check authorization - shipper must be participant
      if (isShipper) {
        const isParticipant = existingThread.participants.some(
          (p) => p.userId.toString() === user._id.toString()
        );
        if (!isParticipant) {
          return res.status(403).json({
            success: false,
            error: {
              message: "Bạn chưa được thêm vào thread này",
            },
          });
        }
      } else {
        // Organization must own the order
        if (existingThread.organizationId.toString() !== senderId.toString()) {
          return res.status(403).json({
            success: false,
            error: {
              message: "Bạn không có quyền gửi tin nhắn trong thread này",
            },
          });
        }
      }

      const message = {
        senderId: senderId,
        senderModel: senderModel,
        senderName:
          user.displayName ||
          user.email ||
          (isShipper ? "Shipper" : "Customer"),
        senderRole: senderRole,
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

      // Emit real-time event
      this._emitThreadUpdate(updatedThread, "message:new");

      // Extract the last message to return
      const lastMessage =
        updatedThread?.messages?.[updatedThread.messages.length - 1];

      Logger.success(
        `[OrderThread] Message added to thread: ${threadId} by ${senderRole}: ${senderId}`
      );

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
  _emitThreadUpdate(thread, eventType) {
    try {
      const channelName = `thread-${thread._id}`;
      const lastMessage = thread.messages?.[thread.messages.length - 1];

      const payload = {
        threadId: thread._id.toString(),
        message: lastMessage,
        timestamp: new Date().toISOString(),
      };

      Logger.debug(`[OrderThread] 📤 Emitting ${eventType} to ${channelName}`);
      socketService.emitToChannel(channelName, eventType, payload);

      // Emit to participants
      thread.participants.forEach((participant) => {
        const userId = participant.userId.toString();
        socketService.emitToUser(userId, "thread:update", {
          threadId: thread._id.toString(),
          orderNumber: thread.orderNumber,
          eventType,
          timestamp: new Date().toISOString(),
        });
      });

      Logger.success(`[OrderThread] ✅ Emitted ${eventType}`);
    } catch (error) {
      Logger.error(`[OrderThread] ❌ Emit error:`, error);
    }
  }
}

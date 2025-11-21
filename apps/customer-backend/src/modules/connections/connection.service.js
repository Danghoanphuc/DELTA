// apps/customer-backend/src/modules/connections/connection.service.js
import mongoose from "mongoose";
import { ConnectionRepository } from "./connection.repository.js";
import { Notification } from "../../shared/models/notification.model.js";
import { Logger } from "../../shared/utils/index.js";
import { SocialChatService } from "../chat/social-chat.service.js";
import {
  ValidationException,
  NotFoundException,
  ConflictException,
} from "../../shared/exceptions/index.js";

export class ConnectionService {
  constructor() {
    this.connectionRepository = new ConnectionRepository();
    this.socialChatService = new SocialChatService();
  }

  // Helper lấy socket an toàn
  async getSocketService() {
    try {
      const { socketService } = await import(
        "../../infrastructure/realtime/socket.service.js"
      );
      return socketService;
    } catch (e) {
      Logger.error("Socket service import failed", e);
      return null;
    }
  }

  /**
   * ✅ FIX: Send Request - Idempotency (Gửi lại không báo lỗi)
   */
  async sendConnectionRequest(requesterId, recipientId, message) {
    if (requesterId.toString() === recipientId.toString()) {
      throw new ValidationException("Không thể kết bạn với chính mình");
    }

    const existing = await this.connectionRepository.findConnection(
      requesterId,
      recipientId
    );

    if (existing) {
      // ✅ LOGIC MỚI: Xử lý trường hợp đã tồn tại
      if (existing.status === "pending") {
        // Nếu MÌNH là người gửi -> Coi như thành công (để UI không báo lỗi đỏ)
        if (existing.requester.toString() === requesterId.toString()) {
          return existing;
        }
        // Nếu NGƯỜI KIA gửi -> Báo lỗi để mình chấp nhận
        else {
          throw new ConflictException(
            "Người này đã gửi lời mời cho bạn. Hãy kiểm tra tab Lời mời."
          );
        }
      }

      if (existing.status === "accepted")
        throw new ConflictException("Hai người đã là bạn bè");
      if (existing.status === "blocked")
        throw new ConflictException("Không thể kết bạn");

      // Nếu bị từ chối -> Gửi lại (Reset status)
      if (existing.status === "declined") {
        existing.status = "pending";
        existing.requester = requesterId;
        existing.recipient = recipientId;
        existing.message = message;
        existing.declinedAt = null;
        await existing.save();
        this._notifyRequest(existing, requesterId, recipientId);
        return existing;
      }
    }

    const connection = await this.connectionRepository.createConnectionRequest(
      requesterId,
      recipientId,
      message
    );

    this._notifyRequest(connection, requesterId, recipientId);
    return connection;
  }

  /**
   * ✅ TRANSACTION: Đảm bảo Kết bạn & Tạo Chat luôn thành công cùng nhau
   */
  async acceptConnection(connectionId, userId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Cập nhật trạng thái Connection
      const connection = await this.connectionRepository.acceptConnection(
        connectionId,
        userId,
        session
      );

      if (!connection) throw new NotFoundException("Lời mời không tồn tại");

      // 2. Tự động tạo hội thoại Chat (Kèm session để rollback nếu lỗi)
      const chatResult = await this.socialChatService.createPeerConversation(
        connection.requester._id,
        connection.recipient._id,
        session
      );

      await session.commitTransaction();

      // 3. Gửi Socket & Notification (Sau khi commit thành công)
      this._notifyAccept(connection, chatResult.conversation._id);

      return {
        ...connection.toObject(),
        conversationId: chatResult.conversation._id,
      };
    } catch (error) {
      await session.abortTransaction();
      Logger.error(`[ConnectionSvc] Accept Transaction Failed:`, error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  // --- NOTIFICATION HELPERS ---

  async _notifyRequest(connection, requesterId, recipientId) {
    try {
      await connection.populate([
        { path: "requester", select: "_id username displayName avatarUrl" },
        { path: "recipient", select: "_id username displayName avatarUrl" },
      ]);

      // Notification DB
      await Notification.create({
        userId: recipientId,
        type: "connection_request", // Type chuẩn để FE redirect
        title: "Lời mời kết bạn mới",
        message: `${
          connection.requester.displayName || connection.requester.username
        } muốn kết bạn với bạn.`,
        data: {
          connectionId: connection._id,
          requesterId: requesterId,
          requesterAvatar: connection.requester.avatarUrl,
        },
      });

      // Socket Realtime
      const socket = await this.getSocketService();
      if (socket) {
        socket.emitToUser(recipientId.toString(), "notification", {
          type: "connection_request",
          title: "Lời mời kết bạn",
          body: `${connection.requester.displayName} đã gửi lời mời kết bạn`,
          data: { connectionId: connection._id },
        });
        // Refresh list pending
        socket.emitToUser(recipientId.toString(), "connection:update", {
          action: "new_request",
        });
      }
    } catch (e) {
      Logger.warn("Notify request failed", e);
    }
  }

  async _notifyAccept(connection, conversationId) {
    try {
      if (!connection.requester.displayName)
        await connection.populate("requester recipient");

      const friendName =
        connection.recipient.displayName || connection.recipient.username;
      const targetUserId = connection.requester._id;

      await Notification.create({
        userId: targetUserId,
        type: "connection_accepted",
        title: "Đã chấp nhận kết bạn",
        message: `${friendName} đã chấp nhận lời mời kết bạn.`,
        data: {
          connectionId: connection._id,
          conversationId: conversationId, // ID chat để redirect
          friendId: connection.recipient._id,
        },
      });

      const socket = await this.getSocketService();
      if (socket) {
        socket.emitToUser(targetUserId.toString(), "notification", {
          type: "connection_accepted",
          title: "Bạn mới",
          body: `${friendName} đã chấp nhận kết bạn!`,
          data: { conversationId },
        });
        // Refresh list friend
        socket.emitToUser(targetUserId.toString(), "connection:update", {
          action: "friend_added",
        });
        socket.emitToUser(
          connection.recipient._id.toString(),
          "connection:update",
          { action: "friend_added" }
        );
      }
    } catch (e) {
      Logger.warn("Notify accept failed", e);
    }
  }

  // Pass-through methods
  async getFriends(userId) {
    return this.connectionRepository.getFriends(userId);
  }
  async getPendingRequests(userId) {
    return this.connectionRepository.getPendingRequests(userId);
  }
  async getSentRequests(userId) {
    return this.connectionRepository.getSentRequests(userId);
  }
  async declineConnection(id, userId) {
    return this.connectionRepository.declineConnection(id, userId);
  }
  async unfriend(id, userId) {
    return this.connectionRepository.deleteConnection(id, userId);
  }
  async blockUser(reqId, recId) {
    return this.connectionRepository.blockUser(reqId, recId);
  }
  async unblockUser(id, userId) {
    return this.connectionRepository.unblockUser(id, userId);
  }
  async searchUsers(q, uid, limit) {
    return this.connectionRepository.searchUsers(q, uid, limit);
  }
  async getConnectionStatus(uid1, uid2) {
    const conn = await this.connectionRepository.findConnection(uid1, uid2);
    if (!conn) return { status: "none", connection: null };
    return {
      status: conn.status,
      connection: conn,
      isSender: conn.requester.toString() === uid1.toString(),
    };
  }
  async debugClearConnection(u1, u2) {
    const c = await this.connectionRepository.findConnection(u1, u2);
    if (c) await c.deleteOne();
  }
}

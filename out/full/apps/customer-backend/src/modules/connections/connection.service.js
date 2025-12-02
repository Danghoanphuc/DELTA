// apps/customer-backend/src/modules/connections/connection.service.js
import mongoose from "mongoose";
import { Connection } from "../../shared/models/connection.model.js";
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
        "../../infrastructure/realtime/pusher.service.js"
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
   * ✅ FIX: Tách việc tạo Chat ra khỏi Transaction Kết bạn
   * Đảm bảo kết bạn luôn thành công, chat creation chỉ là bonus
   */
  async acceptConnection(connectionId, userId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Chấp nhận kết bạn
      const connection = await this.connectionRepository.acceptConnection(
        connectionId,
        userId,
        session
      );

      if (!connection) throw new NotFoundException("Lời mời không tồn tại");

      // 2. Commit transaction NGAY LẬP TỨC để đảm bảo trạng thái bạn bè được lưu
      // Việc tạo chat có thể làm sau (async) hoặc xử lý lỗi riêng
      await session.commitTransaction();
      session.endSession(); // End session sớm

      // 3. Tạo hội thoại Chat (Tách ra khỏi transaction kết bạn)
      // Nếu lỗi chat -> Log warning nhưng VẪN TRẢ VỀ SUCCESS cho kết bạn
      let conversationId = null;
      try {
        const chatResult = await this.socialChatService.createPeerConversation(
          connection.requester._id,
          connection.recipient._id
          // Không truyền session cũ vào đây nữa vì đã commit
        );
        conversationId = chatResult?.conversation?._id;
      } catch (chatError) {
        Logger.warn(
          `[Connection] Created friend but chat init failed: ${chatError.message}`
        );
        // Không throw error, để FE nhận success
      }

      // 4. Gửi Socket & Notification
      this._notifyAccept(connection, conversationId);

      return {
        ...connection.toObject(),
        conversationId: conversationId,
      };
    } catch (error) {
      // Chỉ abort nếu bước acceptConnection thất bại
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
      Logger.error(`[ConnectionSvc] Accept Failed:`, error);
      throw error;
    } finally {
      if (session.inTransaction()) session.endSession();
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
  /**
   * ✅ [NEW PATCH] Unfriend: Xóa connection và disable chat tương ứng
   */
  async unfriend(connectionId, userId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Lấy thông tin connection trước khi xóa để biết ID đối phương
      const conn = await Connection.findById(connectionId);

      if (!conn) {
        throw new NotFoundException("Connection not found");
      }

      // Lấy ID người kia
      const otherUserId =
        conn.requester.toString() === userId.toString()
          ? conn.recipient
          : conn.requester;

      // 2. Xóa Connection
      await this.connectionRepository.deleteConnection(connectionId, userId);

      await session.commitTransaction();
      session.endSession();

      // 3. [NEW PATCH] Xóa luôn đoạn chat
      // Lưu ý: Gọi ngoài transaction connection để tránh lock,
      // hoặc nếu muốn chắc chắn thì gọi sau khi commit.
      // Ở đây ta gọi luôn (fire & forget) để user cảm thấy nhanh.
      this.socialChatService
        .disableConversationBetween(userId, otherUserId)
        .catch((err) =>
          Logger.warn("Failed to disable chat on unfriend", err)
        );

      return conn;
    } catch (error) {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
      Logger.error(`[ConnectionSvc] Unfriend Failed:`, error);
      throw error;
    } finally {
      if (session.inTransaction()) session.endSession();
    }
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

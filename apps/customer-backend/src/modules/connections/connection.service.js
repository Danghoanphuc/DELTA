import { ConnectionRepository } from "./connection.repository.js";
import { Notification } from "../../shared/models/notification.model.js";
import { Logger } from "../../shared/utils/index.js";
import { SocialChatService } from "../chat/social-chat.service.js"; // ✅ Dùng Social Service
import {
  ValidationException,
  NotFoundException,
  ConflictException,
} from "../../shared/exceptions/index.js";

export class ConnectionService {
  constructor() {
    this.connectionRepository = new ConnectionRepository();
    this.socialChatService = new SocialChatService(); // ✅ Init Social Service
  }

  /**
   * Gửi lời mời kết bạn
   */
  async sendConnectionRequest(requesterId, recipientId, message) {
    Logger.debug(
      `[ConnectionSvc] User ${requesterId} sending request to ${recipientId}`
    );

    if (requesterId.toString() === recipientId.toString()) {
      throw new ValidationException("Không thể kết bạn với chính mình");
    }

    const existingConnection = await this.connectionRepository.findConnection(
      requesterId,
      recipientId
    );

    if (existingConnection) {
      const isRequester =
        existingConnection.requester.toString() === requesterId.toString();
      if (existingConnection.status === "pending") {
        if (isRequester)
          throw new ConflictException("Lời mời kết bạn đã được gửi trước đó");
        else throw new ConflictException("Người này đã gửi lời mời cho bạn.");
      }
      if (existingConnection.status === "accepted")
        throw new ConflictException("Hai người đã là bạn bè");
      if (existingConnection.status === "blocked")
        throw new ConflictException("Không thể gửi lời mời kết bạn");

      // Nếu bị từ chối, cho phép gửi lại
      if (existingConnection.status === "declined") {
        existingConnection.status = "pending";
        existingConnection.message = message;
        existingConnection.declinedAt = null;
        await existingConnection.save();
        return existingConnection;
      }
    }

    const connection = await this.connectionRepository.createConnectionRequest(
      requesterId,
      recipientId,
      message
    );

    // Socket & Notification
    this._notifyRequest(connection, requesterId, recipientId);

    return connection;
  }

  /**
   * Chấp nhận lời mời -> TỰ ĐỘNG TẠO CHAT
   */
  async acceptConnection(connectionId, userId) {
    Logger.debug(
      `[ConnectionSvc] User ${userId} accepting connection ${connectionId}`
    );

    const connection = await this.connectionRepository.acceptConnection(
      connectionId,
      userId
    );
    if (!connection)
      throw new NotFoundException("Không tìm thấy lời mời kết bạn");

    Logger.info(`[ConnectionSvc] Connection accepted: ${connectionId}`);

    // ============================================================
    // ✅ ZERO-LATENCY CHAT: TỰ ĐỘNG TẠO HỘI THOẠI NGAY LẬP TỨC
    // ============================================================
    let conversationId = null;
    try {
      const chatResult = await this.socialChatService.createPeerConversation(
        connection.requester._id,
        connection.recipient._id
      );
      conversationId = chatResult.conversation._id;
      Logger.info(`[ConnectionSvc] ✅ Auto-activated chat: ${conversationId}`);
    } catch (error) {
      Logger.warn(`[ConnectionSvc] ⚠️ Failed to auto-create chat:`, error);
    }

    // Socket & Notification (KÈM CONVERSATION ID)
    this._notifyAccept(connection, conversationId);

    // Trả về kèm conversationId để frontend dùng ngay
    return { ...connection.toObject(), conversationId };
  }

  // --- HELPER FUNCTIONS CHO NOTIFICATION/SOCKET ---

  async _notifyRequest(connection, requesterId, recipientId) {
    try {
      const { socketService } = await import(
        "../../infrastructure/realtime/socket.service.js"
      );
      await connection.populate([
        { path: "requester", select: "_id username displayName avatarUrl" },
        { path: "recipient", select: "_id username displayName avatarUrl" },
      ]);

      socketService.emitToUser(recipientId.toString(), "connection:request", {
        connection,
        requester: connection.requester,
      });

      await Notification.create({
        userId: recipientId,
        type: "connection_request",
        title: "Lời mời kết bạn mới",
        message: `${
          connection.requester.displayName || connection.requester.username
        } muốn kết bạn`,
        data: {
          connectionId: connection._id,
          requesterId,
          requesterName: connection.requester.displayName,
        },
      });
    } catch (e) {
      Logger.error("Notify request failed", e);
    }
  }

  async _notifyAccept(connection, conversationId) {
    try {
      const { socketService } = await import(
        "../../infrastructure/realtime/socket.service.js"
      );
      socketService.emitToUser(
        connection.requester._id.toString(),
        "connection:accepted",
        {
          connection,
          acceptedBy: connection.recipient,
          conversationId, // ✅ Gửi ID hội thoại
        }
      );

      await Notification.create({
        userId: connection.requester._id,
        type: "connection_accepted",
        title: "Kết bạn thành công",
        message: `${
          connection.recipient.displayName || connection.recipient.username
        } đã chấp nhận lời mời`,
        data: {
          connectionId: connection._id,
          friendId: connection.recipient._id,
          conversationId,
        }, // ✅ Gửi ID hội thoại
      });
    } catch (e) {
      Logger.error("Notify accept failed", e);
    }
  }

  // --- CÁC HÀM CÒN LẠI GIỮ NGUYÊN LOGIC ---

  async getFriends(userId) {
    return await this.connectionRepository.getFriends(userId);
  }
  async getPendingRequests(userId) {
    return await this.connectionRepository.getPendingRequests(userId);
  }
  async getSentRequests(userId) {
    return await this.connectionRepository.getSentRequests(userId);
  }

  async declineConnection(connectionId, userId) {
    const connection = await this.connectionRepository.declineConnection(
      connectionId,
      userId
    );
    if (!connection) throw new NotFoundException("Không tìm thấy");
    return connection;
  }

  async unfriend(connectionId, userId) {
    const connection = await this.connectionRepository.deleteConnection(
      connectionId,
      userId
    );
    if (!connection) throw new NotFoundException("Không tìm thấy");
    return connection;
  }

  async blockUser(requesterId, recipientId) {
    if (requesterId.toString() === recipientId.toString())
      throw new ValidationException("Lỗi");
    return await this.connectionRepository.blockUser(requesterId, recipientId);
  }

  async unblockUser(connectionId, userId) {
    const connection = await this.connectionRepository.unblockUser(
      connectionId,
      userId
    );
    if (!connection) throw new NotFoundException("Không tìm thấy");
    return connection;
  }

  async searchUsers(query, currentUserId, limit = 20) {
    if (!query || query.length < 2)
      throw new ValidationException("Nhập ít nhất 2 ký tự");
    return await this.connectionRepository.searchUsers(
      query,
      currentUserId,
      limit
    );
  }

  async getConnectionStatus(userId1, userId2) {
    const connection = await this.connectionRepository.findConnection(
      userId1,
      userId2
    );
    if (!connection) return { status: "none", connection: null };

    await connection.populate([
      { path: "requester", select: "_id username displayName avatarUrl" },
      { path: "recipient", select: "_id username displayName avatarUrl" },
    ]);

    return {
      status: connection.status,
      connection,
      isSender: connection.requester._id.toString() === userId1.toString(),
    };
  }

  async debugClearConnection(userId1, userId2) {
    const connection = await this.connectionRepository.findConnection(
      userId1,
      userId2
    );
    if (connection) await connection.deleteOne();
  }
}

// apps/customer-backend/src/modules/connections/connection.repository.js
// ✅ SOCIAL: Connection Repository

import { Connection } from "../../shared/models/connection.model.js";
import { User } from "../../shared/models/user.model.js";

export class ConnectionRepository {
  /**
   * Gửi lời mời kết bạn
   */
  async createConnectionRequest(requesterId, recipientId, message) {
    return await Connection.create({
      requester: requesterId,
      recipient: recipientId,
      status: "pending",
      message,
    });
  }

  /**
   * Tìm connection giữa 2 users
   */
  async findConnection(userId1, userId2) {
    return await Connection.findOne({
      $or: [
        { requester: userId1, recipient: userId2 },
        { requester: userId2, recipient: userId1 },
      ],
    });
  }

  /**
   * Lấy danh sách bạn bè
   */
  async getFriends(userId) {
    return await Connection.getFriends(userId);
  }

  /**
   * Lấy lời mời đang chờ (received)
   */
  async getPendingRequests(userId) {
    return await Connection.getPendingRequests(userId);
  }

  /**
   * Lấy lời mời đã gửi (sent)
   */
  async getSentRequests(userId) {
    return await Connection.getSentRequests(userId);
  }

  /**
   * Chấp nhận lời mời
   */
  async acceptConnection(connectionId, userId) {
    const connection = await Connection.findById(connectionId);
    
    if (!connection) return null;
    if (connection.recipient.toString() !== userId.toString()) {
      throw new Error("Unauthorized");
    }

    connection.status = "accepted";
    connection.acceptedAt = new Date();
    await connection.save();

    return await connection.populate([
      { path: "requester", select: "username displayName avatarUrl email" },
      { path: "recipient", select: "username displayName avatarUrl email" },
    ]);
  }

  /**
   * Từ chối lời mời
   */
  async declineConnection(connectionId, userId) {
    const connection = await Connection.findById(connectionId);
    
    if (!connection) return null;
    if (connection.recipient.toString() !== userId.toString()) {
      throw new Error("Unauthorized");
    }

    connection.status = "declined";
    connection.declinedAt = new Date();
    await connection.save();

    return connection;
  }

  /**
   * Xóa kết nối (unfriend)
   */
  async deleteConnection(connectionId, userId) {
    const connection = await Connection.findById(connectionId);
    
    if (!connection) return null;
    
    // Check if user is part of this connection
    const isRequester = connection.requester.toString() === userId.toString();
    const isRecipient = connection.recipient.toString() === userId.toString();
    
    if (!isRequester && !isRecipient) {
      throw new Error("Unauthorized");
    }

    await connection.deleteOne();
    return connection;
  }

  /**
   * Block user
   */
  async blockUser(requesterId, recipientId) {
    // Find existing connection or create new one
    let connection = await this.findConnection(requesterId, recipientId);

    if (!connection) {
      connection = await Connection.create({
        requester: requesterId,
        recipient: recipientId,
        status: "blocked",
        blockedBy: requesterId,
        blockedAt: new Date(),
      });
    } else {
      connection.status = "blocked";
      connection.blockedBy = requesterId;
      connection.blockedAt = new Date();
      await connection.save();
    }

    return connection;
  }

  /**
   * Unblock user
   */
  async unblockUser(connectionId, userId) {
    const connection = await Connection.findById(connectionId);
    
    if (!connection) return null;
    if (connection.blockedBy?.toString() !== userId.toString()) {
      throw new Error("Unauthorized");
    }

    await connection.deleteOne();
    return connection;
  }

  /**
   * Check if two users are connected
   */
  async areConnected(userId1, userId2) {
    return await Connection.areConnected(userId1, userId2);
  }

  /**
   * Search users (for adding friends)
   */
  async searchUsers(query, currentUserId, limit = 20) {
    const searchRegex = new RegExp(query, "i");

    return await User.find({
      _id: { $ne: currentUserId }, // Exclude current user
      $or: [
        { username: searchRegex },
        { displayName: searchRegex },
        { email: searchRegex },
      ],
    })
      .select("username displayName avatarUrl email")
      .limit(limit)
      .lean();
  }
}


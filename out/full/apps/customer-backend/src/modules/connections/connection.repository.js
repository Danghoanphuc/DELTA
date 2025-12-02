import { Connection } from "../../shared/models/connection.model.js";
import { User } from "../../shared/models/user.model.js";

export class ConnectionRepository {
  // ... Các hàm create, find giữ nguyên ...
  async createConnectionRequest(requesterId, recipientId, message) {
    return await Connection.create({
      requester: requesterId,
      recipient: recipientId,
      status: "pending",
      message,
    });
  }

  async findConnection(userId1, userId2) {
    return await Connection.findOne({
      $or: [
        { requester: userId1, recipient: userId2 },
        { requester: userId2, recipient: userId1 },
      ],
    });
  }

  // ✅ FIX: Explicit query để tránh nhầm lẫn
  async getFriends(userId) {
    return await Connection.find({
      $or: [{ requester: userId }, { recipient: userId }],
      status: "accepted",
    })
      .populate("requester", "username displayName avatarUrl")
      .populate("recipient", "username displayName avatarUrl")
      .sort({ acceptedAt: -1 })
      .lean(); // ✅ FIX: Thêm lean() để trả về object thuần, an toàn cho FE
  }

  // ✅ FIX: Đảm bảo lấy đúng yêu cầu mình nhận được (mình là recipient)
  async getPendingRequests(userId) {
    return await Connection.find({
      recipient: userId,
      status: "pending",
    })
      .populate("requester", "username displayName avatarUrl") // Mặc định _id luôn có
      .sort({ createdAt: -1 })
      .lean(); // ✅ FIX: Thêm lean() để trả về object thuần, an toàn cho FE
  }

  async getSentRequests(userId) {
    return await Connection.find({
      requester: userId,
      status: "pending",
    })
      .populate("recipient", "username displayName avatarUrl")
      .sort({ createdAt: -1 });
  }

  /**
   * ✅ SUPPORT TRANSACTION
   */
  async acceptConnection(connectionId, userId, session = null) {
    const connection = await Connection.findById(connectionId).session(session);

    if (!connection) return null;
    if (connection.recipient.toString() !== userId.toString()) {
      throw new Error("Unauthorized");
    }

    connection.status = "accepted";
    connection.acceptedAt = new Date();
    await connection.save({ session }); // Save with session

    return await connection.populate([
      { path: "requester", select: "username displayName avatarUrl email" },
      { path: "recipient", select: "username displayName avatarUrl email" },
    ]);
  }

  // ... Các hàm decline, delete, block giữ nguyên ...
  async declineConnection(connectionId, userId) {
    const connection = await Connection.findById(connectionId);
    if (!connection || connection.recipient.toString() !== userId.toString())
      return null;
    connection.status = "declined";
    connection.declinedAt = new Date();
    await connection.save();
    return connection;
  }

  async deleteConnection(connectionId, userId) {
    const connection = await Connection.findById(connectionId);
    if (!connection) return null;
    if (
      connection.requester.toString() !== userId.toString() &&
      connection.recipient.toString() !== userId.toString()
    )
      return null;
    await connection.deleteOne();
    return connection;
  }

  async blockUser(reqId, recId) {
    let conn = await this.findConnection(reqId, recId);
    if (!conn) conn = new Connection({ requester: reqId, recipient: recId });
    conn.status = "blocked";
    conn.blockedBy = reqId;
    conn.blockedAt = new Date();
    return await conn.save();
  }

  async unblockUser(id, userId) {
    const conn = await Connection.findById(id);
    if (conn && conn.blockedBy.toString() === userId.toString()) {
      await conn.deleteOne();
      return conn;
    }
    return null;
  }

  async searchUsers(query, currentUserId, limit = 20) {
    const searchRegex = new RegExp(query, "i");
    return await User.find({
      _id: { $ne: currentUserId },
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

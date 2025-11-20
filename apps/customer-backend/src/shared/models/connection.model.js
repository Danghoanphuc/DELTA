// apps/customer-backend/src/shared/models/connection.model.js
// ✅ SOCIAL: Connection/Friend System Model

import mongoose from "mongoose";

const connectionSchema = new mongoose.Schema(
  {
    // User gửi lời mời
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // User nhận lời mời
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Trạng thái kết nối
    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "blocked"],
      default: "pending",
      required: true,
      index: true,
    },

    // Note từ requester khi gửi lời mời (optional)
    message: {
      type: String,
      maxlength: 200,
    },

    // Thời gian chấp nhận (nếu có)
    acceptedAt: Date,

    // Thời gian từ chối (nếu có)
    declinedAt: Date,

    // Người bị block (nếu status = blocked)
    blockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    blockedAt: Date,
  },
  {
    timestamps: true,
  }
);

// ✅ Compound index để prevent duplicate connections
connectionSchema.index({ requester: 1, recipient: 1 }, { unique: true });

// ✅ Index cho queries phổ biến
connectionSchema.index({ requester: 1, status: 1 });
connectionSchema.index({ recipient: 1, status: 1 });

// ✅ Static: Find connection between two users (any status)
connectionSchema.statics.findConnectionByUsers = async function (userId1, userId2) {
  const connection = await this.findOne({
    $or: [
      { requester: userId1, recipient: userId2 },
      { requester: userId2, recipient: userId1 },
    ],
  });
  return connection;
};

// ✅ Virtual: Check if two users are connected
connectionSchema.statics.areConnected = async function (userId1, userId2) {
  const connection = await this.findOne({
    $or: [
      { requester: userId1, recipient: userId2, status: "accepted" },
      { requester: userId2, recipient: userId1, status: "accepted" },
    ],
  });
  return !!connection;
};

// ✅ Virtual: Get all friends of a user
connectionSchema.statics.getFriends = async function (userId) {
  const connections = await this.find({
    $or: [
      { requester: userId, status: "accepted" },
      { recipient: userId, status: "accepted" },
    ],
  })
    .populate("requester", "username displayName avatarUrl email")
    .populate("recipient", "username displayName avatarUrl email")
    .sort({ acceptedAt: -1 });

  // Map to return friend objects
  return connections.map((conn) => {
    const friend =
      conn.requester._id.toString() === userId.toString()
        ? conn.recipient
        : conn.requester;
    return {
      ...friend.toObject(),
      connectionId: conn._id,
      connectedSince: conn.acceptedAt,
    };
  });
};

// ✅ Virtual: Get pending requests (received)
connectionSchema.statics.getPendingRequests = async function (userId) {
  return await this.find({
    recipient: userId,
    status: "pending",
  })
    .populate("requester", "username displayName avatarUrl email")
    .sort({ createdAt: -1 });
};

// ✅ Virtual: Get sent requests (waiting for response)
connectionSchema.statics.getSentRequests = async function (userId) {
  return await this.find({
    requester: userId,
    status: "pending",
  })
    .populate("recipient", "username displayName avatarUrl email")
    .sort({ createdAt: -1 });
};

export const Connection = mongoose.model("Connection", connectionSchema);


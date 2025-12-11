// apps/customer-backend/src/shared/models/thread-unread.model.js
// Thread Unread Tracking Model

import mongoose from "mongoose";

const threadUnreadSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    threadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Thread",
      required: true,
      index: true,
    },
    unreadCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastReadMessageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ThreadedMessage",
      default: null,
    },
    lastReadAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// ===== INDEXES =====
threadUnreadSchema.index({ userId: 1, threadId: 1 }, { unique: true });
threadUnreadSchema.index({ userId: 1, unreadCount: 1 });

// ===== INSTANCE METHODS =====

/**
 * Mark messages as read up to a specific message
 */
threadUnreadSchema.methods.markAsRead = async function (messageId) {
  const ThreadedMessage = mongoose.model("ThreadedMessage");

  const message = await ThreadedMessage.findById(messageId);
  if (!message) return this;

  this.lastReadMessageId = messageId;
  this.lastReadAt = new Date();

  // Calculate unread count (messages after this one)
  this.unreadCount = await ThreadedMessage.countDocuments({
    conversationId: this.threadId,
    createdAt: { $gt: message.createdAt },
  });

  return this.save();
};

/**
 * Increment unread count
 */
threadUnreadSchema.methods.incrementUnread = function () {
  this.unreadCount++;
  return this.save();
};

/**
 * Reset unread count
 */
threadUnreadSchema.methods.resetUnread = function () {
  this.unreadCount = 0;
  this.lastReadAt = new Date();
  return this.save();
};

// ===== STATIC METHODS =====

/**
 * Get or create unread tracking for user and thread
 */
threadUnreadSchema.statics.getOrCreate = async function (userId, threadId) {
  let unread = await this.findOne({ userId, threadId });

  if (!unread) {
    unread = await this.create({
      userId,
      threadId,
      unreadCount: 0,
      lastReadAt: new Date(),
    });
  }

  return unread;
};

/**
 * Get total unread count for user
 */
threadUnreadSchema.statics.getTotalUnread = async function (userId) {
  const result = await this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: null, total: { $sum: "$unreadCount" } } },
  ]);

  return result[0]?.total || 0;
};

/**
 * Get unread counts for multiple threads
 */
threadUnreadSchema.statics.getUnreadCounts = async function (
  userId,
  threadIds
) {
  const unreads = await this.find({
    userId,
    threadId: { $in: threadIds },
  }).lean();

  const unreadMap = {};
  unreads.forEach((unread) => {
    unreadMap[unread.threadId.toString()] = unread.unreadCount;
  });

  return unreadMap;
};

/**
 * Bulk update unread counts for new message
 */
threadUnreadSchema.statics.incrementForThread = async function (
  threadId,
  excludeUserId
) {
  const Thread = mongoose.model("Thread");
  const thread = await Thread.findById(threadId);

  if (!thread) return;

  const participantIds = thread.participants
    .filter(
      (p) => p.isVisible && p.userId.toString() !== excludeUserId.toString()
    )
    .map((p) => p.userId);

  // Increment unread for all participants except sender
  for (const userId of participantIds) {
    await this.updateOne(
      { userId, threadId },
      { $inc: { unreadCount: 1 } },
      { upsert: true }
    );
  }
};

export const ThreadUnread = mongoose.model("ThreadUnread", threadUnreadSchema);

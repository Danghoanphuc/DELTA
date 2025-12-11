// apps/customer-backend/src/shared/models/thread.model.js
// Enhanced Conversation Model for Threading System

import mongoose from "mongoose";

// Thread Status Enum
export const THREAD_STATUS = {
  ACTIVE: "active",
  RESOLVED: "resolved",
  ARCHIVED: "archived",
};

// Thread Priority Enum
export const THREAD_PRIORITY = {
  LOW: "low",
  NORMAL: "normal",
  HIGH: "high",
  URGENT: "urgent",
};

// Permission Levels
export const PERMISSION_LEVEL = {
  ALL: "all",
  PARTICIPANTS: "participants",
  MODERATORS: "moderators",
  ADMINS: "admins",
  CREATOR: "creator",
};

const threadSchema = new mongoose.Schema(
  {
    // ===== EXISTING FIELDS (from Conversation) =====
    type: {
      type: String,
      enum: ["customer-bot", "peer-to-peer", "customer-printer", "group"],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      default: "Cuộc trò chuyện",
    },
    avatarUrl: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: "",
    },

    // Context - Event Association
    context: {
      referenceId: { type: String, index: true },
      referenceType: {
        type: String,
        enum: ["ORDER", "DESIGN", "PRODUCT", "NONE"],
        default: "NONE",
      },
      metadata: { type: Object, default: {} },
    },

    participants: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        role: {
          type: String,
          enum: ["customer", "printer", "admin", "member", "moderator"],
          default: "member",
        },
        isVisible: {
          type: Boolean,
          default: true,
        },
        joinedAt: { type: Date, default: Date.now },
      },
    ],

    lastMessageAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // ===== NEW FIELDS FOR THREADING =====

    // Thread Status
    status: {
      type: String,
      enum: Object.values(THREAD_STATUS),
      default: THREAD_STATUS.ACTIVE,
      index: true,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    resolutionNotes: {
      type: String,
      default: "",
    },

    // Thread Priority & Pinning
    isPinned: {
      type: Boolean,
      default: false,
      index: true,
    },
    pinnedAt: {
      type: Date,
      default: null,
    },
    pinnedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    priority: {
      type: String,
      enum: Object.values(THREAD_PRIORITY),
      default: THREAD_PRIORITY.NORMAL,
      index: true,
    },

    // Thread Statistics
    stats: {
      messageCount: { type: Number, default: 0 },
      replyCount: { type: Number, default: 0 },
      participantCount: { type: Number, default: 0 },
      unreadCount: { type: Number, default: 0 },
      lastActivityAt: { type: Date, default: Date.now, index: true },
    },

    // Thread Permissions
    permissions: {
      canReply: {
        type: String,
        enum: Object.values(PERMISSION_LEVEL),
        default: PERMISSION_LEVEL.ALL,
      },
      canInvite: {
        type: String,
        enum: Object.values(PERMISSION_LEVEL),
        default: PERMISSION_LEVEL.PARTICIPANTS,
      },
      canPin: {
        type: String,
        enum: [PERMISSION_LEVEL.MODERATORS, PERMISSION_LEVEL.ADMINS],
        default: PERMISSION_LEVEL.MODERATORS,
      },
      canResolve: {
        type: String,
        enum: [
          PERMISSION_LEVEL.CREATOR,
          PERMISSION_LEVEL.MODERATORS,
          PERMISSION_LEVEL.ADMINS,
        ],
        default: PERMISSION_LEVEL.MODERATORS,
      },
      canArchive: {
        type: String,
        enum: [
          PERMISSION_LEVEL.CREATOR,
          PERMISSION_LEVEL.MODERATORS,
          PERMISSION_LEVEL.ADMINS,
        ],
        default: PERMISSION_LEVEL.MODERATORS,
      },
    },

    // Thread Tags (for filtering)
    // ✅ FIX: Remove index here to avoid duplicate index warning
    tags: [
      {
        type: String,
      },
    ],

    // Template Info (if created from template)
    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ThreadTemplate",
      default: null,
    },
    templateName: {
      type: String,
      default: null,
    },

    // Auto-archive settings
    autoArchiveAfterDays: {
      type: Number,
      default: 7,
    },
  },
  { timestamps: true }
);

// ===== INDEXES =====
threadSchema.index({ "participants.userId": 1, isActive: 1 });
threadSchema.index({ lastMessageAt: -1 });
threadSchema.index({ "context.referenceId": 1, "context.referenceType": 1 });
threadSchema.index({ status: 1, "stats.lastActivityAt": 1 }); // For auto-archive
threadSchema.index({ isPinned: -1, lastMessageAt: -1 }); // For sorting
threadSchema.index({ tags: 1 }); // For tag filtering
threadSchema.index({ title: "text", description: "text" }); // For full-text search

// ===== INSTANCE METHODS =====

/**
 * Check if user is participant
 */
threadSchema.methods.isParticipant = function (userId) {
  return this.participants.some(
    (p) => p.userId.toString() === userId.toString() && p.isVisible
  );
};

/**
 * Check if user has specific role
 */
threadSchema.methods.hasRole = function (userId, role) {
  const participant = this.participants.find(
    (p) => p.userId.toString() === userId.toString()
  );
  return participant && participant.role === role;
};

/**
 * Check if user is creator
 */
threadSchema.methods.isCreator = function (userId) {
  return this.creatorId && this.creatorId.toString() === userId.toString();
};

/**
 * Update thread statistics
 */
threadSchema.methods.updateStats = async function () {
  const Message = mongoose.model("Message");

  const messageCount = await Message.countDocuments({
    conversationId: this._id,
  });
  const replyCount = await Message.countDocuments({
    conversationId: this._id,
    replyTo: { $ne: null },
  });

  this.stats.messageCount = messageCount;
  this.stats.replyCount = replyCount;
  this.stats.participantCount = this.participants.filter(
    (p) => p.isVisible
  ).length;
  this.stats.lastActivityAt = this.lastMessageAt;

  return this.save();
};

// ===== STATIC METHODS =====

/**
 * Find threads by event
 */
threadSchema.statics.findByEvent = function (referenceId, referenceType) {
  return this.find({
    "context.referenceId": referenceId,
    "context.referenceType": referenceType,
    isActive: true,
  })
    .sort({ isPinned: -1, lastMessageAt: -1 })
    .lean();
};

/**
 * Find threads by participant
 */
threadSchema.statics.findByParticipant = function (userId, filters = {}) {
  const query = {
    "participants.userId": userId,
    "participants.isVisible": true,
    isActive: true,
  };

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.tags && filters.tags.length > 0) {
    query.tags = { $in: filters.tags };
  }

  return this.find(query).sort({ isPinned: -1, lastMessageAt: -1 }).lean();
};

/**
 * Find inactive threads for auto-archive
 */
threadSchema.statics.findInactiveThreads = function (daysInactive = 7) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysInactive);

  return this.find({
    status: THREAD_STATUS.ACTIVE,
    "stats.lastActivityAt": { $lt: cutoffDate },
    isActive: true,
  });
};

export const Thread = mongoose.model("Thread", threadSchema);

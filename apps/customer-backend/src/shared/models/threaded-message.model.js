// apps/customer-backend/src/shared/models/threaded-message.model.js
// Enhanced Message Model with Threading Support

import mongoose from "mongoose";

const threadedMessageSchema = new mongoose.Schema(
  {
    // ===== EXISTING FIELDS =====
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Thread",
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    senderType: {
      type: String,
      enum: ["User", "Admin", "System", "AI", "Guest"],
      required: true,
    },
    clientSideId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "text",
        "image",
        "file",
        "system",
        "ai_response",
        "product_selection",
        "order_selection",
        "printer_selection",
        "payment_request",
        "product",
        "order",
        "error",
        "quote",
      ],
      default: "text",
    },
    content: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    deletedFor: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // ✅ FIX: Remove index here to avoid duplicate index warning
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ThreadedMessage",
      default: null,
    },

    // ===== NEW FIELDS FOR THREADING =====

    // Thread Hierarchy
    threadDepth: {
      type: Number,
      default: 0,
      min: 0,
      max: 3,
      index: true,
    },
    threadPath: {
      type: String,
      default: "",
      index: true,
    },
    // ✅ FIX: Remove index here to avoid duplicate index warning
    rootMessageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ThreadedMessage",
      default: null,
    },

    // Reply Statistics
    replyCount: {
      type: Number,
      default: 0,
    },
    totalReplyCount: {
      type: Number,
      default: 0,
    },

    // Mentions
    mentions: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        username: String,
        displayName: String,
      },
    ],

    // Reactions (optional - for future)
    reactions: [
      {
        emoji: String,
        users: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
        ],
        count: { type: Number, default: 0 },
      },
    ],

    // Edit History
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
      default: null,
    },
    editHistory: [
      {
        content: mongoose.Schema.Types.Mixed,
        editedAt: Date,
        editedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],

    // Attachments
    attachments: [
      {
        type: {
          type: String,
          enum: ["image", "file", "link"],
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
        thumbnailUrl: String,
        fileName: String,
        fileSize: Number,
        mimeType: String,
        metadata: mongoose.Schema.Types.Mixed,
      },
    ],
  },
  { timestamps: true }
);

// ===== INDEXES =====
threadedMessageSchema.index({ "content.text": "text" });
threadedMessageSchema.index({ conversationId: 1, createdAt: -1 });
threadedMessageSchema.index({ replyTo: 1 }); // For loading replies
threadedMessageSchema.index({ rootMessageId: 1 }); // For thread path
threadedMessageSchema.index({ "mentions.userId": 1 }); // For mention queries
threadedMessageSchema.index({ threadDepth: 1, threadPath: 1 }); // For nested queries

// ===== INSTANCE METHODS =====

/**
 * Get all direct replies to this message
 */
threadedMessageSchema.methods.getReplies = async function () {
  return this.model("ThreadedMessage")
    .find({ replyTo: this._id })
    .sort({ createdAt: 1 })
    .lean();
};

/**
 * Get thread path (all parent messages)
 */
threadedMessageSchema.methods.getThreadPath = async function () {
  if (!this.rootMessageId) return [this];

  const pathIds = this.threadPath.split("/").filter(Boolean);
  const messages = await this.model("ThreadedMessage")
    .find({ _id: { $in: pathIds } })
    .sort({ threadDepth: 1 })
    .lean();

  return messages;
};

/**
 * Update reply counts
 */
threadedMessageSchema.methods.updateReplyCounts = async function () {
  const directReplies = await this.model("ThreadedMessage").countDocuments({
    replyTo: this._id,
  });

  const allReplies = await this.model("ThreadedMessage").countDocuments({
    rootMessageId: this.rootMessageId || this._id,
    _id: { $ne: this._id },
  });

  this.replyCount = directReplies;
  this.totalReplyCount = allReplies;

  return this.save();
};

/**
 * Add reaction
 */
threadedMessageSchema.methods.addReaction = function (emoji, userId) {
  const existingReaction = this.reactions.find((r) => r.emoji === emoji);

  if (existingReaction) {
    if (!existingReaction.users.includes(userId)) {
      existingReaction.users.push(userId);
      existingReaction.count++;
    }
  } else {
    this.reactions.push({
      emoji,
      users: [userId],
      count: 1,
    });
  }

  return this.save();
};

/**
 * Remove reaction
 */
threadedMessageSchema.methods.removeReaction = function (emoji, userId) {
  const reaction = this.reactions.find((r) => r.emoji === emoji);

  if (reaction) {
    reaction.users = reaction.users.filter(
      (id) => id.toString() !== userId.toString()
    );
    reaction.count = reaction.users.length;

    if (reaction.count === 0) {
      this.reactions = this.reactions.filter((r) => r.emoji !== emoji);
    }
  }

  return this.save();
};

// ===== STATIC METHODS =====

/**
 * Find messages by mention
 */
threadedMessageSchema.statics.findByMention = function (userId) {
  return this.find({ "mentions.userId": userId })
    .sort({ createdAt: -1 })
    .lean();
};

/**
 * Get nested replies with depth limit
 */
threadedMessageSchema.statics.getNestedReplies = async function (
  messageId,
  maxDepth = 3
) {
  const rootMessage = await this.findById(messageId).lean();
  if (!rootMessage) return [];

  const replies = await this.find({
    rootMessageId: rootMessage.rootMessageId || messageId,
    threadDepth: { $lte: maxDepth },
  })
    .sort({ threadDepth: 1, createdAt: 1 })
    .lean();

  return replies;
};

/**
 * Flatten deep replies (when depth > 3)
 */
threadedMessageSchema.statics.flattenDeepReplies = async function (messageId) {
  const deepReplies = await this.find({
    rootMessageId: messageId,
    threadDepth: { $gt: 3 },
  });

  for (const reply of deepReplies) {
    reply.threadDepth = 3;
    reply.threadPath = reply.threadPath.split("/").slice(0, 4).join("/");
    await reply.save();
  }

  return deepReplies.length;
};

// ===== PRE-SAVE HOOKS =====

/**
 * Calculate thread depth and path before saving
 */
threadedMessageSchema.pre("save", async function (next) {
  if (this.isNew && this.replyTo) {
    const parentMessage = await this.model("ThreadedMessage").findById(
      this.replyTo
    );

    if (parentMessage) {
      // Calculate depth (max 3)
      this.threadDepth = Math.min(parentMessage.threadDepth + 1, 3);

      // Set root message
      this.rootMessageId = parentMessage.rootMessageId || parentMessage._id;

      // Build thread path
      if (this.threadDepth <= 3) {
        this.threadPath = parentMessage.threadPath
          ? `${parentMessage.threadPath}/${this._id}`
          : `${parentMessage._id}/${this._id}`;
      } else {
        // Flatten if depth > 3
        const pathParts = parentMessage.threadPath.split("/").slice(0, 3);
        this.threadPath = `${pathParts.join("/")}/${this._id}`;
        this.threadDepth = 3;
      }

      // Update parent reply count
      parentMessage.replyCount++;
      await parentMessage.save();
    }
  }

  next();
});

export const ThreadedMessage = mongoose.model(
  "ThreadedMessage",
  threadedMessageSchema
);

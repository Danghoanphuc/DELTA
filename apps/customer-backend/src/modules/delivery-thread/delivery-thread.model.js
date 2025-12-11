// apps/customer-backend/src/modules/delivery-thread/delivery-thread.model.js
/**
 * Delivery Thread Model
 * Manages discussion threads for delivery check-ins between customers, admins, and shippers
 */

import mongoose from "mongoose";

export const THREAD_PARTICIPANT_ROLE = {
  CUSTOMER: "customer",
  ADMIN: "admin",
  SHIPPER: "shipper",
};

export const THREAD_MESSAGE_TYPE = {
  TEXT: "text",
  IMAGE: "image",
  SYSTEM: "system",
};

const threadMessageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "messages.senderModel",
    },
    senderModel: {
      type: String,
      required: true,
      enum: ["User", "OrganizationProfile"],
    },
    senderName: {
      type: String,
      required: true,
    },
    senderRole: {
      type: String,
      required: true,
      enum: Object.values(THREAD_PARTICIPANT_ROLE),
    },
    messageType: {
      type: String,
      required: true,
      enum: Object.values(THREAD_MESSAGE_TYPE),
      default: THREAD_MESSAGE_TYPE.TEXT,
    },
    content: {
      type: String,
      required: true,
    },
    attachments: [
      {
        url: String,
        thumbnailUrl: String,
        filename: String,
        mimeType: String,
        size: Number,
      },
    ],
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: Date,
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
  },
  { timestamps: true }
);

const deliveryThreadSchema = new mongoose.Schema(
  {
    checkinId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryCheckin",
      required: false, // Optional - for order-level threads
      sparse: true, // Allow multiple null values
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    orderNumber: {
      type: String,
      required: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrganizationProfile",
      required: true,
    },
    participants: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          refPath: "participants.userModel",
        },
        userModel: {
          type: String,
          required: true,
          enum: ["User", "OrganizationProfile"],
        },
        userName: String,
        role: {
          type: String,
          required: true,
          enum: Object.values(THREAD_PARTICIPANT_ROLE),
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
        lastReadAt: Date,
      },
    ],
    messages: [threadMessageSchema],
    messageCount: {
      type: Number,
      default: 0,
    },
    lastMessageAt: Date,
    lastMessagePreview: String,
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
deliveryThreadSchema.index({ checkinId: 1 });
deliveryThreadSchema.index({ organizationId: 1, createdAt: -1 });
deliveryThreadSchema.index({ "participants.userId": 1 });

// Instance methods
deliveryThreadSchema.methods.addMessage = function (messageData) {
  this.messages.push(messageData);
  this.messageCount = this.messages.filter((m) => !m.isDeleted).length;
  this.lastMessageAt = new Date();
  this.lastMessagePreview =
    messageData.messageType === THREAD_MESSAGE_TYPE.TEXT
      ? messageData.content.substring(0, 100)
      : `[${messageData.messageType}]`;
  return this.save();
};

deliveryThreadSchema.methods.markAsRead = function (userId) {
  const participant = this.participants.find(
    (p) => p.userId.toString() === userId.toString()
  );
  if (participant) {
    participant.lastReadAt = new Date();
    return this.save();
  }
  return Promise.resolve(this);
};

export const DeliveryThread = mongoose.model(
  "DeliveryThread",
  deliveryThreadSchema
);

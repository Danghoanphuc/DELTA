// apps/admin-backend/src/models/delivery-thread.model.ts
/**
 * Delivery Thread Model
 * Shared model for delivery check-in discussions
 * This model is shared between admin-backend and customer-backend
 */

import mongoose, { Schema, Document } from "mongoose";

// Thread participant roles
export const THREAD_PARTICIPANT_ROLE = {
  CUSTOMER: "customer",
  SHIPPER: "shipper",
  ADMIN: "admin",
} as const;

// Message types
export const THREAD_MESSAGE_TYPE = {
  TEXT: "text",
  IMAGE: "image",
  SYSTEM: "system",
} as const;

// Message schema
const messageSchema = new Schema(
  {
    senderId: {
      type: Schema.Types.ObjectId,
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

// Participant schema
const participantSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: "participants.userModel",
  },
  userModel: {
    type: String,
    required: true,
    enum: ["User", "OrganizationProfile"],
  },
  userName: {
    type: String,
    required: true,
  },
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
});

// Thread schema
const deliveryThreadSchema = new Schema(
  {
    checkinId: {
      type: Schema.Types.ObjectId,
      ref: "DeliveryCheckin",
      required: false, // Optional - for order-level threads
      index: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    orderNumber: {
      type: String,
      required: true,
      index: true,
    },
    orderType: {
      type: String,
      required: true,
      enum: ["swag", "master"],
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "OrganizationProfile",
      required: true,
      index: true,
    },
    participants: [participantSchema],
    messages: [messageSchema],
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
    collection: "deliverythreads", // Ensure same collection name as customer-backend
  }
);

// Indexes
deliveryThreadSchema.index({ checkinId: 1, isDeleted: 1 });
deliveryThreadSchema.index({ organizationId: 1, lastMessageAt: -1 });
deliveryThreadSchema.index({ "participants.userId": 1 });

export interface IDeliveryThread extends Document {
  checkinId: mongoose.Types.ObjectId;
  orderId: mongoose.Types.ObjectId;
  orderNumber: string;
  orderType: "swag" | "master";
  organizationId: mongoose.Types.ObjectId;
  participants: Array<{
    userId: mongoose.Types.ObjectId;
    userModel: "User" | "OrganizationProfile";
    userName: string;
    role: "customer" | "shipper" | "admin";
    joinedAt: Date;
    lastReadAt?: Date;
  }>;
  messages: Array<{
    _id: mongoose.Types.ObjectId;
    senderId: mongoose.Types.ObjectId;
    senderModel: "User" | "OrganizationProfile";
    senderName: string;
    senderRole: "customer" | "shipper" | "admin";
    messageType: "text" | "image" | "system";
    content: string;
    attachments: Array<{
      url: string;
      thumbnailUrl: string;
      filename: string;
      mimeType: string;
      size: number;
    }>;
    isEdited: boolean;
    editedAt?: Date;
    isDeleted: boolean;
    deletedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
  }>;
  messageCount: number;
  lastMessageAt?: Date;
  lastMessagePreview?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const DeliveryThread = mongoose.model<IDeliveryThread>(
  "DeliveryThread",
  deliveryThreadSchema
);

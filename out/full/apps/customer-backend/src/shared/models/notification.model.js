// apps/customer-backend/src/shared/models/notification.model.js
// ✅ FIXED: Thêm 'message' vào enum type để sửa lỗi ValidatorError

import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: [
        // Nhóm Order
        "order_created",
        "order_update",
        "payment_confirmed",
        "order_shipped",
        "order_completed",
        "order_cancelled",

        // Nhóm Social (Đã có sẵn)
        "connection_request",
        "connection_accepted",

        // ✅ FIX: THÊM DÒNG NÀY (Tin nhắn mới)
        "message",

        // Nhóm Hệ thống
        "promotion",
        "system",
      ],
      required: true,
    },

    title: {
      type: String,
      required: true,
      maxlength: 200,
    },

    message: {
      type: String,
      required: true,
      maxlength: 500,
    },

    // Additional data for the notification (e.g., orderId, link, conversationId)
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },

    readAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

// TTL Index: Auto-delete notifications older than 30 days
NotificationSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 30 * 24 * 60 * 60 } // 30 days
);

export const Notification = mongoose.model("Notification", NotificationSchema);

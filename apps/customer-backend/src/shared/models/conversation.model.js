// apps/customer-backend/src/shared/models/conversation.model.js

import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
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
    participants: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        role: {
          type: String,
          enum: ["customer", "printer", "admin", "member"],
          default: "member",
        },
        isVisible: {
          type: Boolean,
          default: true, // ✅ Mặc định hiển thị, user có thể ẩn
        },
      },
    ],
    lastMessageAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true, // ✅ Cuộc trò chuyện còn hoạt động (chưa bị Admin khóa)
    },
  },
  { timestamps: true } // createdAt, updatedAt
);

// ✅ Index để tối ưu query theo participants và type
conversationSchema.index({ "participants.userId": 1, isActive: 1 });
conversationSchema.index({ lastMessageAt: -1 });

export const Conversation = mongoose.model("Conversation", conversationSchema);

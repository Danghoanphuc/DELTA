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
    // ✅ NEW: Avatar nhóm (nếu không có sẽ dùng gradient mặc định ở FE)
    avatarUrl: {
      type: String,
      default: null,
    },
    // ✅ NEW: Mô tả mục đích nhóm
    description: {
      type: String,
      default: "",
    },
    // ✅ NEW: Printz DNA - Gắn ngữ cảnh (Đơn hàng, File thiết kế)
    context: {
      referenceId: { type: String, index: true }, // ID đơn hàng/design
      referenceType: { type: String, enum: ["ORDER", "DESIGN", "PRODUCT", "NONE"], default: "NONE" },
      metadata: { type: Object, default: {} }, // Lưu snapshot thông tin (vd: Mã đơn DH001)
    },
    // ✅ NEW: Cài đặt quyền hạn
    settings: {
      allowMemberInvite: { type: Boolean, default: true }, // Thành viên được mời người khác?
      allowPinMessage: { type: Boolean, default: true },
      onlyAdminMessaging: { type: Boolean, default: false }, // Chế độ chỉ Admin chat (thông báo)
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
          enum: ["customer", "printer", "admin", "member", "moderator"], // Thêm moderator nếu cần
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
    creatorId: { // Người tạo nhóm
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }
  },
  { timestamps: true }
);

conversationSchema.index({ "participants.userId": 1, isActive: 1 });
conversationSchema.index({ lastMessageAt: -1 });
conversationSchema.index({ "context.referenceId": 1, "context.referenceType": 1 }); // Index cho việc tìm nhóm theo đơn hàng

export const Conversation = mongoose.model("Conversation", conversationSchema);
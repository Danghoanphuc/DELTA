// src/modules/approvals/approval.model.js
// ✅ Approval Workflow Model - Quy trình duyệt đơn

import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * Approval Request Schema
 * Dùng cho: Duyệt đơn gửi quà, duyệt ngân sách, duyệt thành viên mới
 */
const approvalRequestSchema = new Schema(
  {
    // Organization
    organization: {
      type: Schema.Types.ObjectId,
      ref: "OrganizationProfile",
      required: true,
      index: true,
    },

    // Loại yêu cầu duyệt
    type: {
      type: String,
      enum: ["swag_order", "budget", "team_member", "pack_publish"],
      required: true,
    },

    // Reference đến object cần duyệt
    referenceId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    referenceModel: {
      type: String,
      enum: ["SwagOrder", "SwagPack", "User"],
      required: true,
    },

    // Thông tin tóm tắt để hiển thị
    summary: {
      title: String,
      description: String,
      amount: Number, // Số tiền (nếu có)
      itemCount: Number, // Số lượng items
      recipientCount: Number, // Số người nhận
    },

    // Người tạo yêu cầu
    requestedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },

    // Trạng thái
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled"],
      default: "pending",
      index: true,
    },

    // Người duyệt
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: Date,
    reviewNote: String,

    // Cấp duyệt (nếu cần nhiều cấp)
    approvalLevel: {
      type: Number,
      default: 1,
    },
    requiredLevel: {
      type: Number,
      default: 1,
    },

    // Lịch sử duyệt
    history: [
      {
        action: {
          type: String,
          enum: ["created", "approved", "rejected", "cancelled", "escalated"],
        },
        by: { type: Schema.Types.ObjectId, ref: "User" },
        at: { type: Date, default: Date.now },
        note: String,
        level: Number,
      },
    ],

    // Thời hạn duyệt
    dueDate: Date,

    // Tự động duyệt nếu quá hạn
    autoApproveOnExpiry: {
      type: Boolean,
      default: false,
    },

    // Metadata
    metadata: Schema.Types.Mixed,
  },
  {
    timestamps: true,
  }
);

// Indexes
approvalRequestSchema.index({ organization: 1, status: 1 });
approvalRequestSchema.index({ organization: 1, type: 1, status: 1 });
approvalRequestSchema.index({ requestedBy: 1, status: 1 });

// Methods
approvalRequestSchema.methods.approve = async function (userId, note) {
  this.status = "approved";
  this.reviewedBy = userId;
  this.reviewedAt = new Date();
  this.reviewNote = note;
  this.history.push({
    action: "approved",
    by: userId,
    note,
    level: this.approvalLevel,
  });
  return this.save();
};

approvalRequestSchema.methods.reject = async function (userId, note) {
  this.status = "rejected";
  this.reviewedBy = userId;
  this.reviewedAt = new Date();
  this.reviewNote = note;
  this.history.push({
    action: "rejected",
    by: userId,
    note,
    level: this.approvalLevel,
  });
  return this.save();
};

approvalRequestSchema.methods.cancel = async function (userId, note) {
  this.status = "cancelled";
  this.history.push({
    action: "cancelled",
    by: userId,
    note,
  });
  return this.save();
};

export const ApprovalRequest = mongoose.model(
  "ApprovalRequest",
  approvalRequestSchema
);

/**
 * Approval Settings Schema
 * Cấu hình quy trình duyệt cho từng organization
 */
const approvalSettingsSchema = new Schema(
  {
    organization: {
      type: Schema.Types.ObjectId,
      ref: "OrganizationProfile",
      required: true,
      unique: true,
    },

    // Bật/tắt approval workflow
    enabled: {
      type: Boolean,
      default: false,
    },

    // Cấu hình theo loại
    rules: {
      // Duyệt đơn gửi quà
      swag_order: {
        enabled: { type: Boolean, default: false },
        // Ngưỡng tự động duyệt (dưới ngưỡng này không cần duyệt)
        autoApproveThreshold: { type: Number, default: 0 },
        // Số người nhận tối đa không cần duyệt
        autoApproveMaxRecipients: { type: Number, default: 0 },
        // Người có quyền duyệt (roles)
        approverRoles: [{ type: String, enum: ["owner", "admin"] }],
        // Thời hạn duyệt (giờ)
        dueDurationHours: { type: Number, default: 24 },
      },

      // Duyệt ngân sách
      budget: {
        enabled: { type: Boolean, default: false },
        autoApproveThreshold: { type: Number, default: 0 },
        approverRoles: [{ type: String }],
        dueDurationHours: { type: Number, default: 48 },
      },

      // Duyệt thành viên mới
      team_member: {
        enabled: { type: Boolean, default: false },
        approverRoles: [{ type: String }],
        dueDurationHours: { type: Number, default: 72 },
      },
    },

    // Thông báo
    notifications: {
      // Gửi Zalo khi có yêu cầu mới
      zaloOnNewRequest: { type: Boolean, default: true },
      // Gửi email khi có yêu cầu mới
      emailOnNewRequest: { type: Boolean, default: true },
      // Nhắc nhở trước khi hết hạn
      reminderBeforeExpiry: { type: Boolean, default: true },
      reminderHours: { type: Number, default: 4 },
    },
  },
  {
    timestamps: true,
  }
);

export const ApprovalSettings = mongoose.model(
  "ApprovalSettings",
  approvalSettingsSchema
);

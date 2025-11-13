import { Schema, model, Document, Types } from "mongoose";
import {
  type AdminRole,
  type AdminAuditAction,
} from "@printz/types";

export interface IAdminAuditLogDocument extends Document {
  action: AdminAuditAction;
  actorId?: Types.ObjectId | null;
  actorEmail?: string | null;
  actorRole?: AdminRole | null;
  targetType?: string | null;
  targetId?: Types.ObjectId | string | null;
  metadata?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: Date;
}

const AdminAuditLogSchema = new Schema<IAdminAuditLogDocument>(
  {
    action: {
      type: String,
      required: true,
      index: true,
    },
    actorId: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      index: true,
    },
    actorEmail: {
      type: String,
      lowercase: true,
      trim: true,
    },
    actorRole: {
      type: String,
      enum: ["superadmin", "finance", "support", "vetting"],
    },
    targetType: {
      type: String,
      trim: true,
    },
    targetId: {
      type: Schema.Types.Mixed,
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: "admin_audit_logs",
  }
);

AdminAuditLogSchema.index({ createdAt: -1 });

export const AdminAuditLog = model<IAdminAuditLogDocument>(
  "AdminAuditLog",
  AdminAuditLogSchema
);


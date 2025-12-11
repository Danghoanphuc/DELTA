/**
 * Alert Model
 *
 * Model for deadline alerts and production issue notifications
 */

import mongoose, { Schema, Document } from "mongoose";

export const ALERT_TYPE = {
  DEADLINE_WARNING: "DEADLINE_WARNING",
  DEADLINE_CRITICAL: "DEADLINE_CRITICAL",
  PRODUCTION_ISSUE: "PRODUCTION_ISSUE",
  ESCALATION: "ESCALATION",
} as const;

export const ALERT_URGENCY = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  CRITICAL: "CRITICAL",
} as const;

export const ALERT_STATUS = {
  PENDING: "PENDING",
  SENT: "SENT",
  ACKNOWLEDGED: "ACKNOWLEDGED",
  RESOLVED: "RESOLVED",
} as const;

export interface IAlert extends Document {
  _id: mongoose.Types.ObjectId;
  type: (typeof ALERT_TYPE)[keyof typeof ALERT_TYPE];
  orderId: mongoose.Types.ObjectId;
  orderNumber?: string;
  recipientId: mongoose.Types.ObjectId;
  recipientName?: string;
  message: string;
  urgency: (typeof ALERT_URGENCY)[keyof typeof ALERT_URGENCY];
  deadline?: Date;
  hoursRemaining?: number;
  status: (typeof ALERT_STATUS)[keyof typeof ALERT_STATUS];
  sentAt?: Date;
  acknowledgedAt?: Date;
  acknowledgedBy?: mongoose.Types.ObjectId;
  resolvedAt?: Date;
  escalatedTo?: mongoose.Types.ObjectId;
  escalatedAt?: Date;
  metadata?: {
    productionStatus?: string;
    customerTier?: string;
    issueType?: string;
    [key: string]: any;
  };
  createdAt: Date;
  updatedAt: Date;
}

const alertSchema = new Schema<IAlert>(
  {
    type: {
      type: String,
      enum: Object.values(ALERT_TYPE),
      required: true,
      index: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "ProductionOrder",
      required: true,
      index: true,
    },
    orderNumber: {
      type: String,
    },
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    recipientName: {
      type: String,
    },
    message: {
      type: String,
      required: true,
    },
    urgency: {
      type: String,
      enum: Object.values(ALERT_URGENCY),
      required: true,
      index: true,
    },
    deadline: {
      type: Date,
      index: true,
    },
    hoursRemaining: {
      type: Number,
    },
    status: {
      type: String,
      enum: Object.values(ALERT_STATUS),
      default: ALERT_STATUS.PENDING,
      index: true,
    },
    sentAt: {
      type: Date,
    },
    acknowledgedAt: {
      type: Date,
    },
    acknowledgedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    resolvedAt: {
      type: Date,
    },
    escalatedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    escalatedAt: {
      type: Date,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for common queries
alertSchema.index({ status: 1, urgency: -1, createdAt: -1 });
alertSchema.index({ recipientId: 1, status: 1 });
alertSchema.index({ orderId: 1, type: 1 });
alertSchema.index({ deadline: 1, status: 1 });

export const Alert = (mongoose.models.Alert ||
  mongoose.model<IAlert>("Alert", alertSchema)) as mongoose.Model<IAlert>;

/**
 * Alert Threshold Model
 *
 * Configuration for alert thresholds per customer tier
 */

import mongoose, { Schema, Document } from "mongoose";

export interface IAlertThreshold extends Document {
  _id: mongoose.Types.ObjectId;
  customerTier: string; // 'standard', 'premium', 'vip', etc.
  deadlineWarningHours: number; // Hours before deadline to send warning (e.g., 48)
  deadlineCriticalHours: number; // Hours before deadline to send critical alert (e.g., 24)
  escalationHours: number; // Hours before deadline to escalate if production not started (e.g., 48)
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const alertThresholdSchema = new Schema<IAlertThreshold>(
  {
    customerTier: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    deadlineWarningHours: {
      type: Number,
      required: true,
      default: 48,
    },
    deadlineCriticalHours: {
      type: Number,
      required: true,
      default: 24,
    },
    escalationHours: {
      type: Number,
      required: true,
      default: 48,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export const AlertThreshold = (mongoose.models.AlertThreshold ||
  mongoose.model<IAlertThreshold>(
    "AlertThreshold",
    alertThresholdSchema
  )) as mongoose.Model<IAlertThreshold>;

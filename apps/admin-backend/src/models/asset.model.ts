/**
 * Asset Model
 *
 * Model for file assets with version control
 * Used for managing design files with clear labeling and approval workflow
 *
 * Requirements: 3.1, 3.2
 */

import mongoose, { Schema, Document, Model, Types } from "mongoose";

/**
 * Asset status enum
 */
export const ASSET_STATUS = {
  DRAFT: "draft",
  REVIEW: "review",
  APPROVED: "approved",
  FINAL: "final",
  SUPERSEDED: "superseded",
} as const;

export type AssetStatus = (typeof ASSET_STATUS)[keyof typeof ASSET_STATUS];

/**
 * Asset document interface
 */
export interface IAsset extends Document {
  _id: Types.ObjectId;
  orderId: Types.ObjectId;
  filename: string;
  originalFilename: string;
  version: number;
  versionLabel: string;
  status: AssetStatus;
  isLocked: boolean;
  previousVersionId?: Types.ObjectId;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  checksum: string;
  uploadedBy: Types.ObjectId;
  approvedBy?: Types.ObjectId;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Asset schema
 */
const assetSchema = new Schema<IAsset>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "SwagOrder",
      required: true,
      index: true,
    },
    filename: {
      type: String,
      required: true,
      trim: true,
    },
    originalFilename: {
      type: String,
      required: true,
      trim: true,
    },
    version: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    versionLabel: {
      type: String,
      required: true,
      trim: true,
      default: "v1",
    },
    status: {
      type: String,
      enum: Object.values(ASSET_STATUS),
      default: ASSET_STATUS.DRAFT,
      index: true,
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    previousVersionId: {
      type: Schema.Types.ObjectId,
      ref: "Asset",
    },
    fileUrl: {
      type: String,
      required: true,
      trim: true,
    },
    fileSize: {
      type: Number,
      required: true,
      min: 0,
    },
    mimeType: {
      type: String,
      required: true,
      trim: true,
    },
    checksum: {
      type: String,
      required: true,
      trim: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
    },
    approvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: "assets",
  }
);

// Compound index for orderId + version (unique per order)
assetSchema.index({ orderId: 1, version: 1 }, { unique: true });
assetSchema.index({ orderId: 1, status: 1 });
assetSchema.index({ createdAt: -1 });

/**
 * Pre-save middleware to generate version label
 */
assetSchema.pre("save", function (next) {
  if (this.isNew || this.isModified("version")) {
    this.versionLabel = `v${this.version}`;
  }
  next();
});

/**
 * Static method to get next version number for an order
 */
assetSchema.statics.getNextVersion = async function (
  orderId: Types.ObjectId
): Promise<number> {
  const lastAsset = await this.findOne({ orderId })
    .sort({ version: -1 })
    .lean();

  return lastAsset ? lastAsset.version + 1 : 1;
};

/**
 * Static method to find FINAL assets for an order
 */
assetSchema.statics.findFinalAssets = function (orderId: Types.ObjectId) {
  return this.find({
    orderId,
    status: ASSET_STATUS.FINAL,
  }).lean();
};

/**
 * Static method to find latest version of each file for an order
 */
assetSchema.statics.findLatestVersions = async function (
  orderId: Types.ObjectId
) {
  return this.aggregate([
    { $match: { orderId: new mongoose.Types.ObjectId(orderId) } },
    { $sort: { version: -1 } },
    {
      $group: {
        _id: "$originalFilename",
        latestAsset: { $first: "$$ROOT" },
      },
    },
    { $replaceRoot: { newRoot: "$latestAsset" } },
  ]);
};

/**
 * Instance method to check if asset can be modified
 */
assetSchema.methods.canModify = function (): boolean {
  return !this.isLocked && this.status !== ASSET_STATUS.FINAL;
};

/**
 * Instance method to mark as FINAL
 */
assetSchema.methods.markAsFinal = async function (
  approvedBy: Types.ObjectId
): Promise<IAsset> {
  if (this.isLocked) {
    throw new Error("Asset is already locked");
  }

  this.status = ASSET_STATUS.FINAL;
  this.isLocked = true;
  this.approvedBy = approvedBy;
  this.approvedAt = new Date();
  this.versionLabel = "FINAL";

  return this.save();
};

export const Asset =
  (mongoose.models.Asset as Model<IAsset>) ||
  mongoose.model<IAsset>("Asset", assetSchema);

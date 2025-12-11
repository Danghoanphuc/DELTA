// src/modules/artworks/artwork.model.js
// ✅ Artwork Model - Quản lý artwork files cho customization

import mongoose from "mongoose";

const ARTWORK_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

const ARTWORK_FILE_FORMATS = {
  AI: "AI",
  EPS: "EPS",
  PDF: "PDF",
  PNG: "PNG",
  JPG: "JPG",
  SVG: "SVG",
};

const COLOR_MODES = {
  CMYK: "CMYK",
  RGB: "RGB",
  PANTONE: "Pantone",
};

const ArtworkSchema = new mongoose.Schema(
  {
    // === OWNERSHIP ===
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrganizationProfile",
      required: true,
      index: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // === FILE INFO ===
    fileName: { type: String, required: true },
    originalFileName: { type: String, required: true },
    fileUrl: { type: String, required: true }, // S3 URL
    thumbnailUrl: { type: String }, // Generated thumbnail
    fileSize: { type: Number, required: true }, // bytes
    fileFormat: {
      type: String,
      enum: Object.values(ARTWORK_FILE_FORMATS),
      required: true,
    },

    // === TECHNICAL SPECS ===
    dimensions: {
      width: { type: Number }, // mm
      height: { type: Number }, // mm
      unit: { type: String, default: "mm" },
    },
    resolution: { type: Number }, // DPI
    colorMode: {
      type: String,
      enum: Object.values(COLOR_MODES),
    },
    colorCount: { type: Number }, // Number of colors used
    hasTransparency: { type: Boolean, default: false },

    // === VALIDATION ===
    validationStatus: {
      type: String,
      enum: Object.values(ARTWORK_STATUS),
      default: ARTWORK_STATUS.PENDING,
      index: true,
    },
    validationErrors: [{ type: String }],
    validatedAt: { type: Date },
    validatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // === USAGE TRACKING ===
    usageCount: { type: Number, default: 0 },
    lastUsedAt: { type: Date },

    // === VERSION CONTROL ===
    version: { type: Number, default: 1 },
    previousVersionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Artwork",
    },

    // === METADATA ===
    tags: [{ type: String }],
    description: { type: String },
    notes: { type: String }, // Internal notes

    // === SOFT DELETE ===
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// === INDEXES ===
ArtworkSchema.index({ organization: 1, validationStatus: 1 });
ArtworkSchema.index({ organization: 1, createdAt: -1 });
ArtworkSchema.index({ organization: 1, isDeleted: 1 });
ArtworkSchema.index({ tags: 1 });

// === VIRTUALS ===
ArtworkSchema.virtual("fileSizeMB").get(function () {
  return (this.fileSize / (1024 * 1024)).toFixed(2);
});

ArtworkSchema.virtual("isValid").get(function () {
  return this.validationStatus === ARTWORK_STATUS.APPROVED;
});

// === METHODS ===
ArtworkSchema.methods.approve = function (userId) {
  this.validationStatus = ARTWORK_STATUS.APPROVED;
  this.validationErrors = [];
  this.validatedAt = new Date();
  this.validatedBy = userId;
  return this.save();
};

ArtworkSchema.methods.reject = function (userId, errors) {
  this.validationStatus = ARTWORK_STATUS.REJECTED;
  this.validationErrors = errors;
  this.validatedAt = new Date();
  this.validatedBy = userId;
  return this.save();
};

ArtworkSchema.methods.incrementUsage = function () {
  this.usageCount += 1;
  this.lastUsedAt = new Date();
  return this.save();
};

ArtworkSchema.methods.createNewVersion = async function (newFileData) {
  const NewArtwork = this.constructor;

  const newVersion = new NewArtwork({
    organization: this.organization,
    uploadedBy: newFileData.uploadedBy,
    fileName: newFileData.fileName,
    originalFileName: newFileData.originalFileName,
    fileUrl: newFileData.fileUrl,
    thumbnailUrl: newFileData.thumbnailUrl,
    fileSize: newFileData.fileSize,
    fileFormat: newFileData.fileFormat,
    dimensions: newFileData.dimensions,
    resolution: newFileData.resolution,
    colorMode: newFileData.colorMode,
    colorCount: newFileData.colorCount,
    hasTransparency: newFileData.hasTransparency,
    version: this.version + 1,
    previousVersionId: this._id,
    tags: this.tags,
    description: this.description,
  });

  return await newVersion.save();
};

// === STATICS ===
ArtworkSchema.statics.findByOrganization = function (
  organizationId,
  options = {}
) {
  const query = {
    organization: organizationId,
    isDeleted: false,
  };

  if (options.status) {
    query.validationStatus = options.status;
  }

  if (options.tags && options.tags.length > 0) {
    query.tags = { $in: options.tags };
  }

  return this.find(query)
    .sort({ createdAt: -1 })
    .populate("uploadedBy", "displayName email")
    .populate("validatedBy", "displayName email");
};

ArtworkSchema.statics.findVersionHistory = function (artworkId) {
  return this.find({
    $or: [{ _id: artworkId }, { previousVersionId: artworkId }],
  }).sort({ version: -1 });
};

export const Artwork =
  mongoose.models.Artwork || mongoose.model("Artwork", ArtworkSchema);
export { ARTWORK_STATUS, ARTWORK_FILE_FORMATS, COLOR_MODES };

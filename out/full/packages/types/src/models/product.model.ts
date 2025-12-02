// packages/types/src/models/product.model.ts
// ✅ Shared Product Model - Dùng chung cho cả Admin và Customer backend

import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    printerProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PrinterProfile",
      required: true,
      index: true,
    },
    taxonomyId: {
      type: String,
      required: false,
      index: true,
      unique: true,
      sparse: true,
    },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, trim: true },
    category: {
      type: String,
      enum: [
        "business-card",
        "flyer",
        "banner",
        "brochure",
        "t-shirt",
        "mug",
        "sticker",
        "packaging",
        "other",
      ],
      required: true,
    },
    assets: {
      modelUrl: { type: String },
      dielineUrl: { type: String },
      surfaces: [
        {
          materialName: { type: String, required: true },
          surfaceKey: { type: String, required: true },
          name: { type: String, required: true },
        },
      ],
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String },
        isPrimary: { type: Boolean, default: false },
      },
    ],
    pricing: [
      {
        minQuantity: { type: Number, required: true },
        maxQuantity: Number,
        pricePerUnit: { type: Number, required: true },
      },
    ],
    basePrice: { type: Number, required: true, default: 0 },
    specifications: {
      material: String,
      size: String,
      color: String,
      finishing: String,
    },
    productionTime: {
      min: Number,
      max: Number,
    },
    customization: {
      allowFileUpload: { type: Boolean, default: true },
      acceptedFileTypes: [String],
      hasDesignService: { type: Boolean, default: false },
      designServiceFee: Number,
    },
    isActive: { type: Boolean, default: true },
    stock: { type: Number, default: 0 },
    totalSold: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    isPublished: {
      type: Boolean,
      default: true,
    },
    healthStatus: {
      type: String,
      enum: ["Active", "Warning", "Suspended"],
      default: "Active",
      index: true,
    },
    stats: {
      refundRate: { type: Number, default: 0 },
      cancellationRate: { type: Number, default: 0 },
      lastSuspensionAt: Date,
    },
    embedding: {
      type: [Number],
      select: false,
      index: false,
    },
    isDraft: {
      type: Boolean,
      default: true,
      index: true,
    },
    draftStep: {
      type: Number,
      default: 1,
      min: 1,
      max: 5,
    },
    draftLastSavedAt: {
      type: Date,
      default: Date.now,
    },
    uploadStatus: {
      type: String,
      enum: ["pending", "uploading", "completed", "failed"],
      default: "pending",
    },
    uploadProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    aiGenerated: {
      description: { type: Boolean, default: false },
      tags: { type: Boolean, default: false },
      generatedAt: Date,
    },
    validationErrors: {
      type: Map,
      of: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

ProductSchema.index({ name: "text", description: "text", category: "text" });
ProductSchema.index({ printerProfileId: 1, isDraft: 1, draftLastSavedAt: -1 });

// ✅ FIX: Check if model already exists before creating it (prevents OverwriteModelError)
export const Product =
  mongoose.models.Product || mongoose.model("Product", ProductSchema);

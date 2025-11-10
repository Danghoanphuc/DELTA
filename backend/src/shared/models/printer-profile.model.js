// src/shared/models/printer-profile.model.js
import mongoose from "mongoose";

const PrinterProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // Business information
    businessName: { type: String, required: true },
    businessLicense: String,
    taxCode: String,

    // Shop address
    shopAddress: {
      street: String,
      ward: String,
      district: String,
      city: String,
      location: {
        type: { type: String, enum: ["Point"], default: "Point" },
        coordinates: { type: [Number], default: [0, 0] },
      },
    },

    // Contact information
    contactPhone: String,
    contactEmail: String,
    website: String,

    // Profile details (Trường "nhẹ")
    description: { type: String, maxlength: 2000 },
    coverImage: String,
    logoUrl: String,
    specialties: {
      type: [String],
      default: [],
    },

    // === TRƯỜNG "NẶNG" MỚI (SẼ BỊ LOẠI TRỪ KHI POPULATE GOM) ===
    factoryImages: [
      {
        url: { type: String, required: true },
        caption: { type: String },
      },
    ],
    factoryVideoUrl: { type: String },
    // ========================================================

    // (Các trường khác... priceTier, productionSpeed, rating, isVerified... giữ nguyên)
    priceTier: {
      type: String,
      enum: ["cheap", "standard", "premium"],
      default: "standard",
    },
    productionSpeed: {
      type: String,
      enum: ["fast", "standard"],
      default: "standard",
    },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    verificationDocs: {
      gpkdUrl: { type: String },
      cccdUrl: { type: String },
    },
    verificationStatus: {
      type: String,
      enum: ["not_submitted", "pending_review", "approved", "rejected"],
      default: "not_submitted",
      index: true,
    },
    totalOrders: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// (Indexes giữ nguyên)
PrinterProfileSchema.index({ "shopAddress.location": "2dsphere" });
PrinterProfileSchema.index({ businessName: "text", description: "text" });

export const PrinterProfile = mongoose.model(
  "PrinterProfile",
  PrinterProfileSchema
);

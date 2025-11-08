// src/shared/models/printer-profile.model.js
// Bàn giao: Đã thêm 'verificationDocs' và 'verificationStatus'

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
        // [longitude, latitude] - Sẽ được lấy từ Google Places API
        coordinates: { type: [Number], default: [0, 0] },
      },
    },

    // Contact information
    contactPhone: String,
    contactEmail: String,
    website: String,

    // Profile details
    description: { type: String, maxlength: 2000 },
    coverImage: String,
    logoUrl: String,

    // Working hours (Giữ nguyên)
    workingHours: {
      // ...
    },

    // Specialties & Services
    specialties: {
      type: [String],
      default: [],
    },

    // Business characteristics (Giữ nguyên)
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

    // Ratings & Reviews (Giữ nguyên)
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },

    // === GIAI ĐOẠN 2: TRẠNG THÁI XÁC THỰC ===
    isVerified: { type: Boolean, default: false }, // Luôn là false khi mới tạo
    isActive: { type: Boolean, default: true }, // Cho phép họ login, nhưng bị chặn bởi UI

    // === GIAI ĐOẠN 2: LƯU TRỮ HỒ SƠ PHÁP LÝ ===
    verificationDocs: {
      gpkdUrl: { type: String }, // Giấy phép kinh doanh
      cccdUrl: { type: String }, // Căn cước
    },
    verificationStatus: {
      type: String,
      enum: ["not_submitted", "pending_review", "approved", "rejected"],
      default: "not_submitted",
      index: true,
    },
    // ======================================

    // Statistics (Giữ nguyên)
    totalOrders: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Indexes for efficient queries (Giữ nguyên)
PrinterProfileSchema.index({ "shopAddress.location": "2dsphere" });
PrinterProfileSchema.index({ businessName: "text", description: "text" });
PrinterProfileSchema.index({ userId: 1 });

export const PrinterProfile = mongoose.model(
  "PrinterProfile",
  PrinterProfileSchema
);

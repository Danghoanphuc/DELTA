// backend/src/models/PrinterProfile.js (CẬP NHẬT)
import mongoose from "mongoose";

const PrinterProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // --- Thông tin doanh nghiệp ---
    businessName: { type: String, required: true }, // Vẫn yêu cầu
    businessLicense: String,
    taxCode: String,

    // --- Địa chỉ cửa hàng (BỎ required) ---
    shopAddress: {
      street: { type: String }, // Bỏ required
      ward: String,
      district: { type: String }, // Bỏ required
      city: { type: String }, // Bỏ required
      location: {
        type: { type: String, enum: ["Point"], default: "Point" },
        coordinates: { type: [Number], default: [0, 0] }, // Bỏ required, thêm default
      },
    },

    // --- Thông tin liên hệ (BỎ required) ---
    contactPhone: { type: String }, // Bỏ required
    contactEmail: String,
    website: String,

    // (Các trường còn lại giữ nguyên: description, workingHours, specialties, v.v.)
    // ...
    description: { type: String, maxlength: 2000 },
    coverImage: String,
    logoUrl: String,
    workingHours: {
      // ...
    },
    specialties: {
      type: [String],
      default: [],
    },
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
    totalOrders: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
  },
  { timestamps: true }
);

PrinterProfileSchema.index({ "shopAddress.location": "2dsphere" });
PrinterProfileSchema.index({ businessName: "text", description: "text" });

export const PrinterProfile = mongoose.model(
  "PrinterProfile",
  PrinterProfileSchema
);

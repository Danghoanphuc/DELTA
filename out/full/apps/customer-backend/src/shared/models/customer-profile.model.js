// src/shared/models/customer-profile.model.js
// ✅ CLEANUP: Removed duplicate index

import mongoose from "mongoose";

// ✅ ĐỊNH NGHĨA SCHEMA CHO BRAND KIT
const BrandKitSchema = new mongoose.Schema(
  {
    logos: [
      {
        mediaAssetId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "MediaAsset",
        },
        url: String,
      },
    ],
    colors: [
      {
        hex: { type: String, match: /^#(?:[0-9a-fA-F]{3}){1,2}$/ },
      },
    ],
    fonts: [
      {
        name: String,
        url: String, // (Nếu hỗ trợ font tự tải lên)
      },
    ],
  },
  { _id: false }
); // Không cần _id cho sub-document này

const CustomerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true, // <- Đã giữ index ở đây
    },
    savedAddresses: [
      {
        recipientName: String,
        phone: String,
        street: String,
        ward: String,
        district: String,
        city: String,
        isDefault: { type: Boolean, default: false }, // ✅ Thêm
      },
    ],

    // ✅ THÊM TRƯỜNG MỚI CHO MODULE 2
    brandKit: {
      type: BrandKitSchema,
      default: () => ({ logos: [], colors: [], fonts: [] }), // Khởi tạo rỗng
    },
  },
  { timestamps: true }
);

// CustomerProfileSchema.index({ userId: 1 }); // <- ❌ ĐÃ XÓA DÒNG NÀY (BỊ TRÙNG)

export const CustomerProfile = mongoose.model(
  "CustomerProfile",
  CustomerProfileSchema
);

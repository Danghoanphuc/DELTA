// src/shared/models/asset.model.js (ĐÃ CẬP NHẬT)
import mongoose from "mongoose";

// (AssetSurfaceSchema giữ nguyên)
const AssetSurfaceSchema = new mongoose.Schema({
  surfaceKey: {
    type: String,
    required: [true, "surfaceKey là bắt buộc"],
  },
  name: {
    type: String,
    required: [true, "Tên bề mặt là bắt buộc"],
  },
  dielineSvgUrl: {
    type: String,
    required: [true, "Link Dieline SVG là bắt buộc"],
  },
  materialName: {
    type: String,
    required: [true, "Tên vật liệu 3D (materialName) là bắt buộc"],
  },
});

const AssetSchema = new mongoose.Schema(
  {
    printerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Tên phôi là bắt buộc"],
      trim: true,
    },
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
      required: [true, "Danh mục là bắt buộc"],
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    assets: {
      modelUrl: {
        type: String,
        required: [true, "Link file 3D .glb là bắt buộc"],
      },
      surfaces: {
        type: [AssetSurfaceSchema],
        validate: [
          (v) => Array.isArray(v) && v.length > 0,
          "Phải có ít nhất 1 bề mặt in (surface)",
        ],
      },
    },
    images: [
      {
        url: String,
        publicId: String,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },

    // ✅ BỔ SUNG: Trường xác định phôi chung (public)
    // Mặc định là 'false' (phôi riêng tư)
    isPublic: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes (thêm isPublic)
AssetSchema.index({ printerId: 1, category: 1 });
AssetSchema.index({ isPublic: 1, category: 1 }); // Index cho phôi chung
AssetSchema.index({ name: "text", description: "text" });

export const Asset = mongoose.model("Asset", AssetSchema);

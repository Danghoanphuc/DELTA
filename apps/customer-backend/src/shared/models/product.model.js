// apps/customer-backend/src/shared/models/product.model.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const ProductSchema = new mongoose.Schema(
  {
    // === SỬA ĐỔI QUAN TRỌNG ===
    printerProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PrinterProfile", // Tham chiếu đến PrinterProfile
      required: true,
      index: true,
    },
    // =========================

    taxonomyId: {
      type: String,
      required: false,
      index: true,
      unique: true,
      sparse: true,
    },

    // (Giữ nguyên) Basic information
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

    // (Giữ nguyên) Assets (W2P)
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

    // (Giữ nguyên) Pricing
    pricing: [
      {
        minQuantity: { type: Number, required: true },
        maxQuantity: Number,
        pricePerUnit: { type: Number, required: true },
      },
    ],
    basePrice: { type: Number, required: true, default: 0 },

    // (Giữ nguyên) Specifications
    specifications: {
      material: String,
      size: String,
      color: String,
      finishing: String,
    },

    // (Giữ nguyên) Production time
    productionTime: {
      min: Number,
      max: Number,
    },

    // (Giữ nguyên) Customization options
    customization: {
      allowFileUpload: { type: Boolean, default: true },
      acceptedFileTypes: [String],
      hasDesignService: { type: Boolean, default: false },
      designServiceFee: Number,
    },

    // (Giữ nguyên) Status
    isActive: { type: Boolean, default: true }, // Nhà in quản lý
    stock: { type: Number, default: 0 },

    // (Giữ nguyên) Metadata
    totalSold: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },

    // === NÂNG CẤP: TRỤ CỘT SỨC KHỎE SẢN PHẨM (ADMIN QUẢN LÝ) ===
    isPublished: {
      type: Boolean,
      default: true, // Admin quản lý
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
    // ==========================================================
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

ProductSchema.index({ name: "text", description: "text", category: "text" });
export const Product = mongoose.model("Product", ProductSchema);

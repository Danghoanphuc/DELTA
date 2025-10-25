// backend/src/models/Product.js (MỚI)
import mongoose from "mongoose";
const ProductSchema = new mongoose.Schema(
  {
    printerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // --- Thông tin cơ bản ---
    name: { type: String, required: true },
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

    // --- Mô tả ---
    description: { type: String, maxlength: 3000 },
    images: [
      {
        url: String,
        publicId: String, // Cloudinary ID
        isPrimary: { type: Boolean, default: false },
      },
    ],

    // --- Giá & Số lượng ---
    pricing: [
      {
        minQuantity: { type: Number, required: true },
        maxQuantity: Number,
        pricePerUnit: { type: Number, required: true },
      },
    ],

    // --- Thông số kỹ thuật ---
    specifications: {
      material: String, // Giấy, vải, nhựa...
      size: String, // A4, A5, custom...
      color: String, // 4 màu, đen trắng...
      finishing: String, // Cán màng, UV...
    },

    // --- Thời gian sản xuất ---
    productionTime: {
      min: Number, // Số ngày tối thiểu
      max: Number,
    },

    // --- Tùy chọn ---
    customization: {
      allowFileUpload: { type: Boolean, default: true },
      acceptedFileTypes: [String], // pdf, ai, psd...
      hasDesignService: { type: Boolean, default: false },
      designServiceFee: Number,
    },

    // --- Trạng thái ---
    isActive: { type: Boolean, default: true },
    stock: { type: Number, default: 0 },

    // --- Metadata ---
    totalSold: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ProductSchema.index({ printerId: 1, category: 1 });
ProductSchema.index({ name: "text", description: "text" });
export const Product = mongoose.model("Product", ProductSchema);

// backend/src/shared/models/Product.models.js

import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    printerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    taxonomyId: {
      type: String,
      required: false,
      index: true,
      unique: true,
      sparse: true,
    },

    // Basic information
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

    // ✅ TRƯỜNG GỐC CỦA BẠN (GIỮ NGUYÊN)
    assets: {
      modelUrl: { type: String }, // Link đến file .glb (Phôi 3D)
      dielineUrl: { type: String }, // Link đến file .svg (Khuôn 2D)
    },

    // Description & Images
    description: { type: String, maxlength: 3000 },
    images: [
      {
        url: String,
        publicId: String,
        isPrimary: { type: Boolean, default: false },
      },
    ],

    // Pricing tiers
    pricing: [
      {
        minQuantity: { type: Number, required: true },
        maxQuantity: Number,
        pricePerUnit: { type: Number, required: true },
      },
    ],

    // Specifications
    specifications: {
      material: String,
      size: String,
      color: String,
      finishing: String,
    },

    // Production time
    productionTime: {
      min: Number,
      max: Number,
    },

    // Customization options
    customization: {
      allowFileUpload: { type: Boolean, default: true },
      acceptedFileTypes: [String],
      hasDesignService: { type: Boolean, default: false },
      designServiceFee: Number,
    },

    // Status
    isActive: { type: Boolean, default: true },
    stock: { type: Number, default: 0 },

    // Metadata
    totalSold: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
  },
  {
    timestamps: true,
    // ✅ THÊM 2 DÒNG NÀY ĐỂ KÍCH HOẠT VIRTUALS
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for efficient queries
ProductSchema.index({ printerId: 1, category: 1 });
ProductSchema.index({ name: "text", description: "text" });

// ✅ THÊM TRƯỜNG VIRTUAL "surfaces"
// Nó sẽ tạo một trường 'surfaces' trỏ đến 'assets'
ProductSchema.virtual("surfaces").get(function () {
  return this.assets;
});

export const Product = mongoose.model("Product", ProductSchema);

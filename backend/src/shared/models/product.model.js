// backend/src/shared/models/Product.models.js

import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    printerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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
    assets: {
      modelUrl: { type: String }, // Link đến file .glb (Phôi 3D)
      dielineUrl: { type: String }, // Link đến file .svg (Khuôn 2D)
    },
    // Description & Images
    description: { type: String, maxlength: 3000 },
    images: [
      {
        url: String,
        publicId: String, // Cloudinary ID
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
      material: String, // Paper, fabric, plastic, etc.
      size: String, // A4, A5, custom, etc.
      color: String, // 4-color, black & white, etc.
      finishing: String, // Lamination, UV coating, etc.
    },

    // Production time
    productionTime: {
      min: Number, // Minimum days
      max: Number,
    },

    // Customization options
    customization: {
      allowFileUpload: { type: Boolean, default: true },
      acceptedFileTypes: [String], // pdf, ai, psd, etc.
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
  { timestamps: true }
);

// Indexes for efficient queries
ProductSchema.index({ printerId: 1, category: 1 });
ProductSchema.index({ name: "text", description: "text" });

export const Product = mongoose.model("Product", ProductSchema);

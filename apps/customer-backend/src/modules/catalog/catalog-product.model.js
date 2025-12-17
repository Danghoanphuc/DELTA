// apps/customer-backend/src/modules/catalog/catalog-product.model.js
/**
 * CatalogProduct Model - Shared with Admin Backend
 * This model represents products managed by admin in the catalog
 */

import mongoose from "mongoose";

const CatalogProductSchema = new mongoose.Schema(
  {
    // Basic Info
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    sku: { type: String, required: true, unique: true, index: true },
    description: { type: String, trim: true },

    // Category
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductCategory",
      required: true,
      index: true,
    },
    categoryPath: { type: String, index: true },

    // Pricing
    basePrice: { type: Number, required: true, default: 0 },
    salePrice: { type: Number },
    costPrice: { type: Number },

    // Images
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String },
        isPrimary: { type: Boolean, default: false },
        alt: { type: String },
      },
    ],

    // Specifications
    specifications: {
      material: String,
      size: String,
      color: String,
      finishing: String,
      weight: Number,
      dimensions: {
        length: Number,
        width: Number,
        height: Number,
        unit: { type: String, enum: ["cm", "mm", "inch"], default: "cm" },
      },
    },

    // Production
    productionTime: {
      min: Number,
      max: Number,
      unit: { type: String, enum: ["hours", "days"], default: "days" },
    },

    // Inventory
    stock: { type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: 10 },

    // Status
    isActive: { type: Boolean, default: true, index: true },
    isPublished: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false, index: true },

    // Stats
    totalSold: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },

    // SEO
    seo: {
      title: String,
      description: String,
      keywords: [String],
    },

    // Tags
    tags: [{ type: String, trim: true }],

    // === STORYTELLING FIELDS (B2B Luxury) ===

    // Hero Section
    tagline: { type: String, trim: true },
    heroMedia: {
      type: { type: String, enum: ["image", "video"] },
      url: String,
      thumbnail: String,
    },

    // Introduction & Specs
    craftingTime: {
      value: Number,
      unit: { type: String, enum: ["hours", "days"] },
    },
    technique: { type: String, trim: true },
    productionLimit: {
      value: Number,
      text: String,
    },
    certification: { type: String, trim: true },

    // Storytelling Content
    story: {
      materials: {
        title: String,
        content: String,
        image: String,
      },
      process: {
        title: String,
        content: String,
        image: String,
      },
    },

    // Feng Shui & Application
    fengShui: {
      suitableElements: [
        {
          type: String,
          enum: ["Thổ", "Kim", "Thủy", "Mộc", "Hỏa"],
        },
      ],
      placement: String,
      meaning: String,
      message: String,
      lifestyleImage: String,
    },

    // Customization & Packaging
    customization: {
      allowLogoCustomization: { type: Boolean, default: false },
      logoMethods: [String],
      packagingImages: [String],
      packagingDescription: String,
    },

    // Artisan Information
    artisan: {
      name: String,
      title: String,
      photo: String,
      bio: String,
    },

    // Social Proof
    clientLogos: [String],

    // Documents & Downloads
    documents: {
      portfolio: {
        url: String,
        publicId: String,
        filename: String,
      },
      catalogue: {
        url: String,
        publicId: String,
        filename: String,
      },
      certificate: {
        url: String,
        publicId: String,
        filename: String,
      },
    },

    // Supplier (if POD)
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
    },

    // Metadata
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
CatalogProductSchema.index({ name: "text", description: "text" });
CatalogProductSchema.index({ isActive: 1, isPublished: 1, isFeatured: -1 });
CatalogProductSchema.index({ categoryId: 1, isActive: 1 });
CatalogProductSchema.index({ createdAt: -1 });

// Virtual: Primary Image
CatalogProductSchema.virtual("primaryImage").get(function () {
  const primary = this.images?.find((img) => img.isPrimary);
  return primary || this.images?.[0] || null;
});

// Virtual: In Stock
CatalogProductSchema.virtual("inStock").get(function () {
  return this.stock > 0;
});

// Virtual: Low Stock
CatalogProductSchema.virtual("isLowStock").get(function () {
  return this.stock <= this.lowStockThreshold && this.stock > 0;
});

export const CatalogProduct = mongoose.model(
  "CatalogProduct",
  CatalogProductSchema
);

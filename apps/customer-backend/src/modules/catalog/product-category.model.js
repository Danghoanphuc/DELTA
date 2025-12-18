// apps/customer-backend/src/modules/catalog/product-category.model.js
// ✅ ProductCategory Model - Shared with Admin Backend
// This model represents product categories managed by admin

import mongoose from "mongoose";

const ProductCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, trim: true },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: "ProductCategory" },
    level: { type: Number, default: 0 },
    path: { type: String, required: true, index: true }, // "apparel/t-shirts/polo"
    icon: { type: String },
    image: { type: String },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    productCount: { type: Number, default: 0 },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

ProductCategorySchema.index({ parentId: 1, sortOrder: 1 });

export const ProductCategory =
  mongoose.models.ProductCategory ||
  mongoose.model("ProductCategory", ProductCategorySchema);

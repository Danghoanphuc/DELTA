// apps/customer-backend/src/models/supplier-post.model.js
// Simplified SupplierPost model for customer-backend (read-only)

import mongoose, { Schema } from "mongoose";

const SupplierPostSchema = new Schema(
  {
    supplierId: {
      type: Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },
    title: { type: String, required: true },
    excerpt: { type: String },
    slug: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    subcategory: String,
    readTime: { type: Number, default: 5 },
    featured: { type: Boolean, default: false },
    content: String,
    blocks: Schema.Types.Mixed,
    editorMode: {
      type: String,
      enum: ["blocks", "markdown"],
      default: "blocks",
    },
    media: {
      type: String,
      enum: ["image", "video", "gallery"],
      default: "image",
    },
    tags: [String],
    metaTitle: String,
    metaDescription: String,
    ogImage: String,
    schemaType: String,
    highlightQuote: String,
    authorProfile: {
      name: String,
      avatar: String,
      bio: String,
    },
    relatedProducts: [{ type: Schema.Types.ObjectId, ref: "CatalogProduct" }],
    relatedPosts: [{ type: Schema.Types.ObjectId, ref: "SupplierPost" }],
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    visibility: {
      type: String,
      enum: ["public", "private", "draft"],
      default: "draft",
    },
    videoUrl: String,
    videoInfo: {
      duration: Number,
      thumbnail: String,
      provider: String,
    },
  },
  { timestamps: true }
);

SupplierPostSchema.index({ slug: 1 });
SupplierPostSchema.index({ supplierId: 1, visibility: 1 });
SupplierPostSchema.index({ category: 1, visibility: 1 });

export const SupplierPost = mongoose.model("SupplierPost", SupplierPostSchema);

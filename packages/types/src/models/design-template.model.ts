// packages/types/src/models/design-template.model.ts
// ✅ Shared DesignTemplate Model - Dùng chung cho cả Admin và Customer backend

import mongoose from "mongoose";

const designTemplateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    printerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    baseProductId: {
      type: String,
      required: true,
      ref: "Product",
    },
    editorData: {
      type: Object,
      required: true,
    },
    preview: {
      thumbnailUrl: { type: String },
      embed3DUrl: { type: String },
    },
    isPublic: {
      type: Boolean,
      default: false,
      index: true,
    },
    tags: [String],
  },
  { timestamps: true }
);

designTemplateSchema.pre("save", function (next) {
  const doc = this as any;
  if (doc.previewImageUrl && !doc.preview?.thumbnailUrl) {
    if (!doc.preview) doc.preview = {};
    doc.preview.thumbnailUrl = doc.previewImageUrl;
    doc.previewImageUrl = undefined;
  }
  next();
});

export const DesignTemplate = mongoose.model(
  "DesignTemplate",
  designTemplateSchema
);

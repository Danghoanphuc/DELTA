// src/modules/media-assets/media-asset.model.js
import mongoose from "mongoose";

const MediaAssetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    url: {
      type: String, // Cloudinary URL
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    fileType: {
      type: String, // vd: 'image/png'
    },
    size: {
      type: Number, // Tinh bằng bytes
    },
  },
  { timestamps: true }
);

export const MediaAsset = mongoose.model("MediaAsset", MediaAssetSchema);

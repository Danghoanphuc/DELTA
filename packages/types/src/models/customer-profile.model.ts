// packages/types/src/models/customer-profile.model.ts
// ✅ Shared CustomerProfile Model - Dùng chung cho cả Admin và Customer backend

import mongoose from "mongoose";

const BrandKitSchema = new mongoose.Schema(
  {
    logos: [
      {
        mediaAssetId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "MediaAsset",
        },
        url: String,
      },
    ],
    colors: [
      {
        hex: { type: String, match: /^#(?:[0-9a-fA-F]{3}){1,2}$/ },
      },
    ],
    fonts: [
      {
        name: String,
        url: String,
      },
    ],
  },
  { _id: false }
);

const CustomerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    savedAddresses: [
      {
        recipientName: String,
        phone: String,
        street: String,
        ward: String,
        district: String,
        city: String,
        isDefault: { type: Boolean, default: false },
      },
    ],
    brandKit: {
      type: BrandKitSchema,
      default: () => ({ logos: [], colors: [], fonts: [] }),
    },
  },
  { timestamps: true }
);

export const CustomerProfile = mongoose.model(
  "CustomerProfile",
  CustomerProfileSchema
);

// apps/customer-backend/src/models/supplier.model.js
// Simplified Supplier model for customer-backend (read-only)

import mongoose, { Schema } from "mongoose";

const SupplierSchema = new Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    type: {
      type: String,
      enum: [
        "manufacturer",
        "distributor",
        "printer",
        "dropshipper",
        "artisan",
      ],
      required: true,
    },
    contactInfo: {
      email: String,
      phone: String,
      address: String,
      city: String,
      country: String,
    },
    capabilities: [String],
    rating: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isPreferred: { type: Boolean, default: false },
    profile: {
      avatar: String,
      coverImage: String,
      bio: String,
      story: String,
      quote: String,
      curatorNote: String,
      yearsOfExperience: Number,
      achievements: [String],
      socialLinks: {
        facebook: String,
        instagram: String,
        youtube: String,
        website: String,
      },
    },
  },
  { timestamps: true }
);

export const Supplier = mongoose.model("Supplier", SupplierSchema);

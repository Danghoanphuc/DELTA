// backend/src/shared/models/PrinterProfile.js

import mongoose from "mongoose";

const PrinterProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // Business information
    businessName: { type: String, required: true },
    businessLicense: String,
    taxCode: String,

    // Shop address
    shopAddress: {
      street: String,
      ward: String,
      district: String,
      city: String,
      location: {
        type: { type: String, enum: ["Point"], default: "Point" },
        coordinates: { type: [Number], default: [0, 0] }, // [longitude, latitude]
      },
    },

    // Contact information
    contactPhone: String,
    contactEmail: String,
    website: String,

    // Profile details
    description: { type: String, maxlength: 2000 },
    coverImage: String,
    logoUrl: String,

    // Working hours
    workingHours: {
      monday: { open: String, close: String, isClosed: Boolean },
      tuesday: { open: String, close: String, isClosed: Boolean },
      wednesday: { open: String, close: String, isClosed: Boolean },
      thursday: { open: String, close: String, isClosed: Boolean },
      friday: { open: String, close: String, isClosed: Boolean },
      saturday: { open: String, close: String, isClosed: Boolean },
      sunday: { open: String, close: String, isClosed: Boolean },
    },

    // Specialties & Services
    specialties: {
      type: [String],
      default: [],
    },

    // Business characteristics
    priceTier: {
      type: String,
      enum: ["cheap", "standard", "premium"],
      default: "standard",
    },
    productionSpeed: {
      type: String,
      enum: ["fast", "standard"],
      default: "standard",
    },

    // Ratings & Reviews
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },

    // Status
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    // Statistics
    totalOrders: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Indexes for efficient queries
PrinterProfileSchema.index({ "shopAddress.location": "2dsphere" });
PrinterProfileSchema.index({ businessName: "text", description: "text" });
PrinterProfileSchema.index({ userId: 1 });

export const PrinterProfile = mongoose.model(
  "PrinterProfile",
  PrinterProfileSchema
);

// packages/types/src/models/shipper-profile.model.ts

import mongoose from "mongoose";

const shipperProfileSchema = new mongoose.Schema(
  {
    // User Reference
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    // Vehicle Information
    vehicleType: {
      type: String,
      enum: ["motorbike", "car", "bicycle", "walking"],
      default: "motorbike",
    },
    vehiclePlate: {
      type: String,
      trim: true,
    },

    // Contact Information
    phoneNumber: {
      type: String,
      required: false, // Shipper will update later
      trim: true,
      default: "",
    },

    // Status
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    // Performance Metrics
    totalDeliveries: {
      type: Number,
      default: 0,
      min: 0,
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 0,
      max: 5,
    },

    // Metadata
    notes: {
      type: String,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
shipperProfileSchema.index({ userId: 1 });
shipperProfileSchema.index({ isActive: 1 });

// Instance Methods
shipperProfileSchema.methods.incrementDeliveries = async function () {
  this.totalDeliveries += 1;
  return await this.save();
};

shipperProfileSchema.methods.updateRating = async function (newRating: number) {
  // Simple average for now, can be improved with weighted average
  if (this.totalDeliveries === 0) {
    this.rating = newRating;
  } else {
    this.rating =
      (this.rating * this.totalDeliveries + newRating) /
      (this.totalDeliveries + 1);
  }
  return await this.save();
};

export const ShipperProfile =
  mongoose.models.ShipperProfile ||
  mongoose.model("ShipperProfile", shipperProfileSchema);

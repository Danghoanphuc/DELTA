// backend/src/shared/models/user.model.js
// ✅ FIXED: customerProfileId is optional, added virtual fields

import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    // --- Identity Information ---
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    avatarUrl: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    // --- Authentication Methods ---
    hashedPassword: {
      type: String,
      select: false,
    },
    authMethod: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },

    // --- Verification Status ---
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      select: false,
    },
    verificationTokenExpiresAt: {
      type: Date,
      select: false,
    },

    // --- Profile Links (REPLACE role field) ---
    customerProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CustomerProfile",
      // ✅ CHANGED: Not required for backward compatibility
      default: null,
      index: true,
    },
    printerProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PrinterProfile",
      default: null,
      index: true,
    },

    // --- Metadata ---
    lastLoginAt: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    // Enable virtuals in JSON and objects
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ✅ Indexes for efficient search
UserSchema.index({ displayName: "text", email: "text" });
UserSchema.index({ googleId: 1 });
UserSchema.index({ isActive: 1 });
UserSchema.index({ createdAt: -1 });

// ✅ Virtual field to check if user is a printer
UserSchema.virtual("isPrinter").get(function () {
  return !!this.printerProfileId;
});

// ✅ Virtual field to check if user is a customer
UserSchema.virtual("isCustomer").get(function () {
  return !!this.customerProfileId;
});

// ✅ Method to check if user has complete profile
UserSchema.methods.hasCompleteProfile = function () {
  return !!(this.displayName && this.email && this.isVerified);
};

// ✅ Method to get user role (for backward compatibility)
UserSchema.methods.getRole = function () {
  if (this.printerProfileId) return "printer";
  if (this.customerProfileId) return "customer";
  return "guest";
};

export const User = mongoose.model("User", UserSchema);

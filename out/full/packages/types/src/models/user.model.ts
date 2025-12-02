// packages/types/src/models/user.model.ts
// ✅ Shared User Model - Dùng chung cho cả Admin và Customer backend

import mongoose from "mongoose";
import bcrypt from "bcrypt";

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
    username: {
      type: String,
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
      index: true,
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

    // --- Profile Links ---
    customerProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CustomerProfile",
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
    isAdmin: {
      type: Boolean,
      default: false,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: {
      type: Date,
    },
    isOnline: {
      type: Boolean,
      default: false,
      index: true,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// === VIRTUALS & METHODS ===
UserSchema.virtual("isPrinter").get(function () {
  return !!this.printerProfileId;
});

UserSchema.virtual("isCustomer").get(function () {
  return !!this.customerProfileId;
});

UserSchema.methods.getRole = function () {
  if (this.isAdmin) return "admin";
  if (this.printerProfileId) return "printer";
  if (this.customerProfileId) return "customer";
  return "guest";
};

// === AUTO HASH PASSWORD ===
UserSchema.pre("save", async function (next) {
  if (!this.isModified("hashedPassword") || !this.hashedPassword) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.hashedPassword = await bcrypt.hash(this.hashedPassword, salt);
    next();
  } catch (err) {
    next(err as Error);
  }
});

// === COMPARE PASSWORD ===
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
) {
  if (!this.hashedPassword) return false;
  return bcrypt.compare(candidatePassword, this.hashedPassword);
};

// ✅ FIX: Check if model already exists before creating it (prevents OverwriteModelError)
export const User = mongoose.models.User || mongoose.model("User", UserSchema);

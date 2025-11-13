// backend/src/shared/models/user.model.js
// ✅ "CHUẨN HÓA" - Đã di chuyển logic hash & compare vào model
// File này là .js, sẽ không còn lỗi gạch đỏ TypeScript

import mongoose from "mongoose";
import bcrypt from "bcrypt"; // Import 'bcrypt' (đã cài trong customer-backend)

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

    // --- Profile Links (REPLACE role field) ---
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
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// === VIRTUALS & METHODS (Lấy từ file cũ của Phúc) ===

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

// === LOGIC MỚI (Từ admin.model.ts) ===

// 1. Tự động hash mật khẩu
// (Hook này sẽ chạy khi Phúc gọi newUser.save() trong auth.service)
UserSchema.pre("save", async function (next) {
  if (!this.isModified("hashedPassword") || !this.hashedPassword) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10); // Khớp với 10 của auth.service.js
    this.hashedPassword = await bcrypt.hash(this.hashedPassword, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// 2. So sánh mật khẩu
UserSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.hashedPassword) return false;
  return bcrypt.compare(candidatePassword, this.hashedPassword);
};

// === EXPORT ===
export const User = mongoose.model("User", UserSchema);

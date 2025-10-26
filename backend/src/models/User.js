import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    // --- Thông tin cơ bản ---
    username: { type: String, unique: true, sparse: true },
    email: { type: String, required: true, unique: true },
    hashedPassword: { type: String, select: false },

    // --- Vai trò ---
    role: {
      type: String,
      enum: ["customer", "printer", "admin"],
      default: "customer",
    },

    // --- Tham chiếu đến hồ sơ nhà in ---
    printerProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PrinterProfile",
    },

    // --- OAuth ---
    authMethod: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    googleId: { type: String, unique: true, sparse: true },

    // --- Profile (Chung) ---
    displayName: { type: String, required: true },
    avatarUrl: { type: String, default: "" },
    phone: { type: String, unique: true, sparse: true },

    // --- Xác thực ---
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String, select: false },
    verificationTokenExpiresAt: { type: Date, select: false },

    // --- Metadata ---
    lastLoginAt: Date,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// (Giữ nguyên các index cũ, chúng vẫn hữu ích)
UserSchema.index({ "address.location": "2dsphere" });
UserSchema.index({
  "address.city": "text",
  "address.district": "text",
  displayName: "text",
});

export const User = mongoose.model("User", UserSchema);

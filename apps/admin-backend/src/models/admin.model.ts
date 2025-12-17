// apps/admin-backend/src/models/admin.model.ts
import mongoose, { Schema, model, Document, Types, Model } from "mongoose"; // <-- Thêm Types
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { type IAdmin as IAdminContract } from "@printz/types"; // Import "Hợp đồng"

// ✅ SỬA LỖI TS2459: Export AdminRole
export type AdminRole = "superadmin" | "finance" | "support" | "vetting";

// ✅ SỬA LỖI TS2320: Interface Mongoose nội bộ
// KHÔNG extends IAdminContract, chỉ extends Document
export interface IAdmin extends Document {
  // Các trường từ IAdminContract (nhưng dùng đúng kiểu Mongoose)
  _id: Types.ObjectId; // <-- Kiểu Mongoose
  email: string;
  displayName: string;
  role: AdminRole;
  isActive: boolean;
  organizationProfileId?: Types.ObjectId; // Organization profile reference
  createdAt: Date;
  updatedAt: Date;

  // ✅ SỬA LỖI TS2339 (lỗi cũ): Thêm 'password'
  password: string;
  passwordResetToken?: string | null;
  passwordResetExpires?: Date | null;
  lastPasswordChangedAt?: Date | null;
  lastLoginAt?: Date;

  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  createPasswordResetToken(): { token: string; expiresAt: Date };
  clearPasswordReset(): void;
}

// Schema sẽ dùng IAdmin (đã kết hợp)
const adminSchema = new Schema<IAdmin>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\\S+@\\S+\.\\S+/, "Email không hợp lệ"],
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false, // ✅ Quan trọng: không trả về password trong query
    },
    displayName: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["superadmin", "finance", "support", "vetting"],
      default: "support",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    organizationProfileId: {
      type: Schema.Types.ObjectId,
      ref: "OrganizationProfile",
      required: false,
    },
    passwordResetToken: {
      type: String,
      select: false,
      index: true,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
    lastPasswordChangedAt: {
      type: Date,
    },
    lastLoginAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Middleware (pre-hook) để tự động hash password
adminSchema.pre<IAdmin>("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.lastPasswordChangedAt = new Date();
  this.passwordResetToken = undefined;
  this.passwordResetExpires = undefined;
  next();
});

// Method so sánh password (cho service)
adminSchema.methods.comparePassword = function (
  candidatePassword: string
): Promise<boolean> {
  // 'this' cũng có 'password'
  return bcrypt.compare(candidatePassword, this.password);
};

adminSchema.methods.createPasswordResetToken = function (): {
  token: string;
  expiresAt: Date;
} {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  const expiresMinutes =
    Number(process.env.ADMIN_PASSWORD_RESET_TOKEN_MINUTES ?? "30") || 30;
  const expiresAt = new Date(Date.now() + expiresMinutes * 60 * 1000);

  this.passwordResetToken = hashedToken;
  this.passwordResetExpires = expiresAt;

  return { token: rawToken, expiresAt };
};

adminSchema.methods.clearPasswordReset = function () {
  this.passwordResetToken = undefined;
  this.passwordResetExpires = undefined;
};

export const Admin =
  (mongoose.models.Admin as Model<IAdmin>) ||
  model<IAdmin>("Admin", adminSchema);

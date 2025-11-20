// apps/admin-backend/src/services/admin.auth.service.ts
import crypto from "crypto";
import { Admin, type IAdmin } from "../models/admin.model.js";
import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import type { StringValue } from "ms";
import {
  ValidationException,
  UnauthorizedException,
} from "../shared/exceptions.js";
import { sendAdminPasswordResetEmail } from "./email.service.js";
import { recordAdminAuditLog } from "./admin.audit-log.service.js";
import { config } from "../config/env.config.js";

const sanitizeAdmin = (admin: IAdmin) => {
  const adminInfo = admin.toObject();
  delete (adminInfo as any).password;
  delete (adminInfo as any).passwordResetToken;
  delete (adminInfo as any).passwordResetExpires;
  return adminInfo;
};

// ✅ SECURITY FIX: Use config for JWT secret
const signAdminToken = (admin: IAdmin) => {
  const secret: Secret = config.auth.jwtSecret;
  const payload = {
    id: admin._id,
    role: admin.role,
  };

  const expiresIn: StringValue | number | undefined = config.auth.jwtExpiresIn as
    | StringValue
    | number
    | undefined;

  const signOptions: SignOptions = expiresIn
    ? {
        expiresIn,
      }
    : {};

  return jwt.sign(payload, secret, signOptions);
};

// Tách biệt hoàn toàn với service của User
export const signIn = async (email: string, password: string) => {
  if (!email || !password) {
    throw new ValidationException("Email và mật khẩu là bắt buộc");
  }

  // 1. Tìm admin trong collection 'Admins' VÀ lấy cả password
  // ✅ SỬA: Gán kiểu 'IAdmin' cho kết quả query
  const admin: IAdmin | null = await Admin.findOne({ email }).select(
    "+password"
  );

  if (!admin) {
    throw new UnauthorizedException("Email hoặc mật khẩu không đúng");
  }

  // 2. So sánh password (dùng method ta đã định nghĩa trong model)
  // ✅ SỬA: TypeScript giờ đã hiểu 'comparePassword'
  const isMatch = await admin.comparePassword(password);
  if (!isMatch) {
    throw new UnauthorizedException("Email hoặc mật khẩu không đúng");
  }

  if (!admin.isActive) {
    throw new UnauthorizedException("Tài khoản Admin này đã bị khóa");
  }

  const token = signAdminToken(admin);
  const adminInfo = sanitizeAdmin(admin);

  void recordAdminAuditLog({
    action: "ADMIN_SIGN_IN",
    actor: admin,
  });

  return { token, admin: adminInfo };
};

export const requestPasswordReset = async (
  email: string,
  ipAddress?: string | null,
  userAgent?: string | null
) => {
  if (!email) {
    throw new ValidationException("Email là bắt buộc");
  }

  const admin = await Admin.findOne({ email });

  if (!admin) {
    // Tránh lộ thông tin: vẫn trả về thành công
    void recordAdminAuditLog({
      action: "ADMIN_PASSWORD_RESET_REQUESTED",
      actor: null,
      actorEmailOverride: email,
      ipAddress: ipAddress ?? undefined,
      userAgent: userAgent ?? undefined,
      metadata: { exists: false },
    });
    return { message: "Nếu email tồn tại, chúng tôi đã gửi hướng dẫn khôi phục." };
  }

  const { token, expiresAt } = admin.createPasswordResetToken();
  await admin.save({ validateBeforeSave: false });

  const appUrl = process.env.ADMIN_APP_URL ?? "http://localhost:5173";
  const resetUrl = `${appUrl.replace(/\/$/, "")}/reset-password?token=${token}`;

  await sendAdminPasswordResetEmail(admin.email, resetUrl, expiresAt);

  void recordAdminAuditLog({
    action: "ADMIN_PASSWORD_RESET_REQUESTED",
    actor: admin,
    targetType: "Admin",
    targetId: admin._id.toString(),
    ipAddress: ipAddress ?? undefined,
    userAgent: userAgent ?? undefined,
  });

  return {
    message: "Nếu email tồn tại, chúng tôi đã gửi hướng dẫn khôi phục.",
  };
};

export const resetPassword = async (
  token: string,
  newPassword: string,
  ipAddress?: string | null,
  userAgent?: string | null
) => {
  if (!token || !newPassword) {
    throw new ValidationException("Thiếu token hoặc mật khẩu mới");
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const admin = await Admin.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() },
  }).select("+password");

  if (!admin) {
    throw new ValidationException(
      "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn"
    );
  }

  admin.password = newPassword;
  admin.clearPasswordReset();
  await admin.save();

  const jwtToken = signAdminToken(admin);
  const adminInfo = sanitizeAdmin(admin);

  void recordAdminAuditLog({
    action: "ADMIN_PASSWORD_RESET_COMPLETED",
    actor: admin,
    targetType: "Admin",
    targetId: admin._id.toString(),
    ipAddress: ipAddress ?? undefined,
    userAgent: userAgent ?? undefined,
  });

  return { token: jwtToken, admin: adminInfo };
};

export const updatePassword = async (
  adminId: string,
  currentPassword: string,
  newPassword: string,
  ipAddress?: string | null,
  userAgent?: string | null
) => {
  if (!adminId || !currentPassword || !newPassword) {
    throw new ValidationException("Thiếu thông tin bắt buộc");
  }

  const admin = await Admin.findById(adminId).select("+password");

  if (!admin) {
    throw new UnauthorizedException("Không tìm thấy tài khoản Admin");
  }

  const isMatch = await admin.comparePassword(currentPassword);
  if (!isMatch) {
    throw new UnauthorizedException("Mật khẩu hiện tại không đúng");
  }

  admin.password = newPassword;
  admin.clearPasswordReset();
  await admin.save();

  const jwtToken = signAdminToken(admin);
  const adminInfo = sanitizeAdmin(admin);

  void recordAdminAuditLog({
    action: "ADMIN_PASSWORD_UPDATED",
    actor: admin,
    targetType: "Admin",
    targetId: admin._id.toString(),
    ipAddress: ipAddress ?? undefined,
    userAgent: userAgent ?? undefined,
  });

  return { token: jwtToken, admin: adminInfo };
};

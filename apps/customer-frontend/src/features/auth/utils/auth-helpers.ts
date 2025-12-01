// apps/customer-frontend/src/features/auth/utils/auth-helpers.ts
// ✅ Shared validation schemas và utilities cho Auth feature

import { z } from "zod";

// --- VALIDATION SCHEMAS ---
// Schema này có thể được share với backend thông qua @printz/types
// ✅ FIX: Sử dụng z.object() trực tiếp thay vì chain để tránh lỗi Zod v4
// ✅ IMPROVED: Stronger password validation
const passwordSchema = z
  .string()
  .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
  .max(128, "Mật khẩu không được quá 128 ký tự")
  .regex(/[A-Z]/, "Mật khẩu phải có ít nhất 1 chữ cái viết hoa")
  .regex(/[a-z]/, "Mật khẩu phải có ít nhất 1 chữ cái viết thường")
  .regex(/[0-9]/, "Mật khẩu phải có ít nhất 1 chữ số")
  .regex(
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
    "Mật khẩu phải có ít nhất 1 ký tự đặc biệt"
  );

export const authFlowSchema = z
  .object({
    email: z
      .string()
      .min(1, "Email không được để trống")
      .email("Email không hợp lệ"),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    password: passwordSchema,
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      // Chỉ validate confirmPassword khi nó có giá trị (tức là đang ở mode signUp)
      if (data.confirmPassword) {
        return data.password === data.confirmPassword;
      }
      return true;
    },
    {
      message: "Mật khẩu xác nhận không khớp",
      path: ["confirmPassword"], // Gắn lỗi vào field confirmPassword
    }
  );

export type AuthFlowValues = z.infer<typeof authFlowSchema>;

// --- STORAGE KEYS ---
export const EMAIL_PREFETCH_KEY = "auth-email-prefetch";
export const AUTH_TEMP_DATA_KEY = "auth-temp-data";

// --- TYPES ---
export type AuthMode = "signIn" | "signUp";
export type AuthStep = "email" | "name" | "password" | "verifySent";

// --- UTILITIES ---

/**
 * Lưu dữ liệu tạm thời khi user đang đăng ký (để restore khi F5)
 */
export const saveTempAuthData = (data: Partial<AuthFlowValues>) => {
  try {
    sessionStorage.setItem(AUTH_TEMP_DATA_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn("[Auth] Failed to save temp data:", err);
  }
};

/**
 * Lấy dữ liệu tạm thời đã lưu
 */
export const getTempAuthData = (): Partial<AuthFlowValues> | null => {
  try {
    const data = sessionStorage.getItem(AUTH_TEMP_DATA_KEY);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.warn("[Auth] Failed to get temp data:", err);
    return null;
  }
};

/**
 * Xóa dữ liệu tạm thời
 */
export const clearTempAuthData = () => {
  try {
    sessionStorage.removeItem(AUTH_TEMP_DATA_KEY);
  } catch (err) {
    console.warn("[Auth] Failed to clear temp data:", err);
  }
};

/**
 * Lưu email để pre-fill khi quay lại trang đăng nhập
 */
export const saveEmailForPrefetch = (email: string) => {
  try {
    localStorage.setItem(EMAIL_PREFETCH_KEY, email);
  } catch (err) {
    console.warn("[Auth] Failed to save email:", err);
  }
};

/**
 * Lấy email đã lưu và xóa khỏi storage
 */
export const getAndClearPrefetchEmail = (): string | null => {
  try {
    const email = localStorage.getItem(EMAIL_PREFETCH_KEY);
    if (email) {
      localStorage.removeItem(EMAIL_PREFETCH_KEY);
      return email;
    }
    return null;
  } catch (err) {
    console.warn("[Auth] Failed to get prefetch email:", err);
    return null;
  }
};

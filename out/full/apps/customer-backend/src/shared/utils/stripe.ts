// apps/customer-backend/src/shared/utils/stripe.ts
// ✅ BẢN VÁ: Thêm .js cho imports, sửa API Version

import Stripe from "stripe";
import { config } from "../../config/env.config.js"; // THÊM .js
import { Logger } from "./logger.util.js"; // THÊM .js

let stripe: Stripe | null = null;

/**
 * Khởi tạo và trả về một Stripe client (Singleton)
 */
export const getStripeClient = (): Stripe => {
  if (!stripe) {
    if (!config.stripe.secretKey) {
      Logger.error("[Stripe] Stripe Secret Key chưa được cấu hình!");
      throw new Error("Stripe Secret Key is not configured.");
    }
    stripe = new Stripe(config.stripe.secretKey, {
      // ✅ BẢN VÁ: Sửa API Version theo lỗi TS2322
      apiVersion: "2025-10-29.clover",
      typescript: true,
    });
    Logger.info("[Stripe] Khởi tạo Stripe Client thành công.");
  }
  return stripe;
};

/**
 * Lấy Webhook Secret từ config
 */
export const getStripeWebhookSecret = (): string => {
  const secret = config.stripe.webhookSecret;
  if (!secret) {
    Logger.error("[Stripe] STRIPE_WEBHOOK_SECRET chưa được cấu hình!");
    throw new Error("Stripe Webhook Secret is not configured.");
  }
  return secret;
};

// Email configuration and constants
import { config } from "../../../config/env.config.js";

export const EMAIL_CONFIG = {
  clientUrl: config.clientUrl,
  appName: "PrintZ",
  domain: "printz.vn",
  // ✅ Use Resend's default email for development (no domain verification needed)
  // Change to support@printz.vn in production after domain verification
  fromEmail:
    config.env === "production"
      ? `PrintZ System <support@printz.vn>`
      : `PrintZ System <onboarding@resend.dev>`,
};

export const EMAIL_TYPES = {
  VERIFICATION: "verification",
  PASSWORD_RESET: "password_reset",
  ORDER_CONFIRMATION: "order_confirmation",
  ORDER_NOTIFICATION: "order_notification",
  DELIVERY_CHECKIN: "delivery_checkin",
};

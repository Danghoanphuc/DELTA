// Email configuration and constants
import { config } from "../../../config/env.config.js";

export const EMAIL_CONFIG = {
  clientUrl: config.clientUrl,
  appName: "PrintZ",
  domain: "printz.vn",
  fromEmail: `PrintZ System <support@printz.vn>`,
};

export const EMAIL_TYPES = {
  VERIFICATION: "verification",
  PASSWORD_RESET: "password_reset",
  ORDER_CONFIRMATION: "order_confirmation",
  ORDER_NOTIFICATION: "order_notification",
};

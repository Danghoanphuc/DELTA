// src/shared/utils/logger.util.ts
// ✅ BÀN GIAO: File Logger mới cho Frontend

/* eslint-disable no-console */
const isProduction = process.env.NODE_ENV === "production";

/**
 * Logger đơn giản cho client-side.
 * Sẽ không in ra 'info' và 'debug' ở môi trường production.
 */
export const Logger = {
  info: (...args: any[]) => {
    if (!isProduction) {
      console.log("ℹ️ [INFO]", ...args);
    }
  },

  debug: (...args: any[]) => {
    if (!isProduction) {
      console.log("🐞 [DEBUG]", ...args);
    }
  },

  warn: (...args: any[]) => {
    console.warn("⚠️ [WARN]", ...args);
  },

  error: (...args: any[]) => {
    console.error("❌ [ERROR]", ...args);
  },
};

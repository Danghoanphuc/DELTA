import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Joi from "joi"; // Import Joi để xác thực

// --- Phần logic tải .env (Giữ nguyên của Phúc) ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ IMPROVEMENT: Load .env silently
if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: path.resolve(__dirname, "../../.env") });
}
// --- Hết phần logic của Phúc ---

// =========================================================================
// ==              ĐỊNH NGHĨA SCHEMA XÁC THỰC (JOI)                     ==
// =========================================================================
const envVarsSchema = Joi.object()
  .keys({
    // Core
    NODE_ENV: Joi.string()
      .valid("development", "production", "test")
      .default("development"),
    SERVER_URL: Joi.string().uri().required(),
    CLIENT_URL: Joi.string().uri().required(),
    CLIENT_URLS: Joi.string(),

    // Database
    MONGODB_CONNECTIONSTRING: Joi.string().required(),

    // Auth
    ACCESS_TOKEN_SECRET: Joi.string().required(),
    SESSION_SECRET: Joi.string().required(),

    // Google OAuth (Tạm thời không bắt buộc)
    GOOGLE_CLIENT_ID: Joi.string(),
    GOOGLE_CLIENT_SECRET: Joi.string(),

    // APIs
    GEMINI_API_KEY: Joi.string(),
    OPENAI_API_KEY: Joi.string(),
    RESEND_API_KEY: Joi.string().required(), // Email là bắt buộc

    // Cloudinary
    CLOUDINARY_CLOUD_NAME: Joi.string().required(),
    CLOUDINARY_API_KEY: Joi.string().required(),
    CLOUDINARY_API_SECRET: Joi.string().required(),

    // --- CẤU HÌNH STRIPE (GĐ 5.R2) ---
    STRIPE_PUBLISHABLE_KEY: Joi.string().required(),
    STRIPE_SECRET_KEY: Joi.string().required(),
    STRIPE_WEBHOOK_SECRET: Joi.string().required(),

    // --- CẤU HÌNH VNPAY (GĐ 5.R2) ---
    VNP_TMN_CODE: Joi.string().required(),
    VNP_HASH_SECRET: Joi.string().required(),
    VNP_URL: Joi.string().uri().required(),
    VNP_RETURN_URL: Joi.string().uri().required(),
    VNP_IPN_URL: Joi.string().uri().required(),

    // --- CẤU HÌNH MOMO ---
    MOMO_PARTNER_CODE: Joi.string().allow("").optional(),
    MOMO_ACCESS_KEY: Joi.string().allow("").optional(),
    MOMO_SECRET_KEY: Joi.string().allow("").optional(),
    MOMO_ENDPOINT: Joi.string().uri().allow("").optional(),
    MOMO_RETURN_URL: Joi.string().uri().allow("").optional(),
    MOMO_IPN_URL: Joi.string().uri().allow("").optional(),

    // --- CẤU HÌNH PAYOS ---
    PAYOS_CLIENT_ID: Joi.string().allow("").optional(),
    PAYOS_API_KEY: Joi.string().allow("").optional(),
    PAYOS_CHECKSUM_KEY: Joi.string().allow("").optional(),
  })
  .unknown(); // Cho phép các biến env khác không được định nghĩa

// =========================================================================
// ==                XÁC THỰC VÀ EXPORT CONFIG                         ==
// =========================================================================

const { value: envVars, error } = envVarsSchema
  .prefs({ errors: { label: "key" } })
  .validate(process.env);

if (error) {
  throw new Error(
    `[Config Validation Error] Lỗi cấu hình .env: ${error.message}`
  );
}

const normalizeClientUrls = () => {
  const urls = new Set();
  if (envVars.CLIENT_URL) {
    urls.add(envVars.CLIENT_URL.trim());
  }
  if (envVars.CLIENT_URLS) {
    envVars.CLIENT_URLS.split(",")
      .map((url) => url.trim())
      .filter(Boolean)
      .forEach((url) => urls.add(url));
  }

  // Thêm các origin dev mặc định để tránh quên cấu hình
  ["http://localhost:5173", "http://localhost:3000"].forEach((url) => {
    if (envVars.NODE_ENV !== "production") {
      urls.add(url);
    }
  });

  return Array.from(urls);
};

// Object config đã được dọn dẹp và nhóm lại
export const config = {
  // Core
  env: envVars.NODE_ENV,
  serverUrl: envVars.SERVER_URL,
  clientUrl: envVars.CLIENT_URL,
  clientUrls: normalizeClientUrls(),

  // Database
  db: {
    connectionString: envVars.MONGODB_CONNECTIONSTRING,
  },

  // Auth
  auth: {
    accessTokenSecret: envVars.ACCESS_TOKEN_SECRET,
    sessionSecret: envVars.SESSION_SECRET,
  },

  // Google OAuth
  oauth: {
    google: {
      clientId: envVars.GOOGLE_CLIENT_ID,
      clientSecret: envVars.GOOGLE_CLIENT_SECRET,
    },
  },

  // APIs
  apiKeys: {
    gemini: envVars.GEMINI_API_KEY,
    openai: envVars.OPENAI_API_KEY,
    resend: envVars.RESEND_API_KEY,
  },

  // Cloudinary
  cloudinary: {
    cloudName: envVars.CLOUDINARY_CLOUD_NAME,
    apiKey: envVars.CLOUDINARY_API_KEY,
    apiSecret: envVars.CLOUDINARY_API_SECRET,
  },

  // --- STRIPE (GĐ 5.R2) ---
  stripe: {
    publicKey: envVars.STRIPE_PUBLISHABLE_KEY,
    secretKey: envVars.STRIPE_SECRET_KEY,
    webhookSecret: envVars.STRIPE_WEBHOOK_SECRET,
  },

  // --- VNPAY (GĐ 5.R2) ---
  vnp: {
    tmnCode: envVars.VNP_TMN_CODE,
    hashSecret: envVars.VNP_HASH_SECRET,
    url: envVars.VNP_URL,
    returnUrl: envVars.VNP_RETURN_URL,
    ipnUrl: envVars.VNP_IPN_URL,
  },

  // --- MOMO ---
  momo: {
    partnerCode: envVars.MOMO_PARTNER_CODE,
    accessKey: envVars.MOMO_ACCESS_KEY,
    secretKey: envVars.MOMO_SECRET_KEY,
    endpoint: envVars.MOMO_ENDPOINT,
    returnUrl: envVars.MOMO_RETURN_URL,
    ipnUrl: envVars.MOMO_IPN_URL,
  },

  // --- PAYOS ---
  payos: {
    clientId: envVars.PAYOS_CLIENT_ID,
    apiKey: envVars.PAYOS_API_KEY,
    checksumKey: envVars.PAYOS_CHECKSUM_KEY,
  },
};

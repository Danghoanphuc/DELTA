// apps/admin-backend/src/config/env.config.ts
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// --- Load .env file ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV !== "production") {
  console.log(
    "🔧 [Admin Backend] Đang chạy ở môi trường DEV, tải file .env..."
  );
  dotenv.config({ path: path.resolve(__dirname, "../../.env") });
} else {
  console.log(
    "🚀 [Admin Backend] Đang chạy ở môi trường PROD, sử dụng biến môi trường từ hosting."
  );
}

// =========================================================================
// ==              VALIDATE & EXPORT CONFIG                              ==
// =========================================================================

const requiredEnvVars = [
  "MONGODB_CONNECTIONSTRING",
  "ADMIN_JWT_SECRET",
  "RESEND_API_KEY",
] as const;

// Validate required environment variables
requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    console.error(
      `❌ [Admin Backend Config] FATAL ERROR: Missing required environment variable: ${envVar}`
    );
    process.exit(1);
  }
});

// Normalize CORS origins
const normalizeAdminCorsOrigins = (): string[] => {
  const origins = new Set<string>();

  // Add from environment variables
  if (process.env.ADMIN_CLIENT_URL) {
    origins.add(process.env.ADMIN_CLIENT_URL.trim());
  }

  if (process.env.ADMIN_CLIENT_URLS) {
    process.env.ADMIN_CLIENT_URLS.split(",")
      .map((url) => url.trim())
      .filter(Boolean)
      .forEach((url) => origins.add(url));
  }

  // Add default dev origins only in development
  if (process.env.NODE_ENV !== "production") {
    [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:5174",
    ].forEach((url) => origins.add(url));
  }

  return Array.from(origins);
};

export const config = {
  // Core
  env: process.env.NODE_ENV || "development",
  port: process.env.PORT || process.env.ADMIN_API_PORT || 5002,

  // Database
  db: {
    connectionString: process.env.MONGODB_CONNECTIONSTRING!,
  },

  // Auth
  auth: {
    jwtSecret: process.env.ADMIN_JWT_SECRET!,
    refreshTokenSecret:
      process.env.ADMIN_REFRESH_TOKEN_SECRET ||
      process.env.ADMIN_JWT_SECRET! + "_refresh", // ✅ STANDARDIZED: Separate refresh token secret
    jwtExpiresIn: process.env.ADMIN_JWT_EXPIRES_IN || "15m", // ✅ ADMIN SECURITY: Shorter TTL
    accessTokenSecret: process.env.ADMIN_JWT_SECRET!, // ✅ STANDARDIZED: Alias for consistency
  },

  // CORS
  cors: {
    origins: normalizeAdminCorsOrigins(),
  },

  // Email
  email: {
    resendApiKey: process.env.RESEND_API_KEY!,
    fromEmail: process.env.ADMIN_FROM_EMAIL || "noreply@printz.vn",
  },

  // Super Admin (for scripts)
  superAdmin: {
    email: process.env.SUPERADMIN_EMAIL,
    password: process.env.SUPERADMIN_PASSWORD,
  },
} as const;

// Log configuration (only in development)
if (config.env === "development") {
  console.log("✅ [Admin Backend] Configuration loaded successfully");
  console.log(`   - Environment: ${config.env}`);
  console.log(`   - Port: ${config.port}`);
  console.log(`   - CORS Origins: ${config.cors.origins.join(", ")}`);
}

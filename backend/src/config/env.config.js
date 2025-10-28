// src/config/env.config.js
import dotenv from "dotenv";
import { Logger } from "../shared/utils/index.js";

dotenv.config();

const requiredEnvVars = [
  "MONGODB_CONNECTIONSTRING",
  "ACCESS_TOKEN_SECRET",
  "SESSION_SECRET",
  "CLIENT_URL",
  "RESEND_API_KEY",
];

export const validateEnv = () => {
  const missing = requiredEnvVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    Logger.error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
    throw new Error("Environment validation failed");
  }

  Logger.success("Environment variables validated");
};

export const config = {
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "5001", 10),

  database: {
    url: process.env.MONGODB_CONNECTIONSTRING,
  },

  jwt: {
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
    accessTokenTTL: process.env.ACCESS_TOKEN_TTL || "30m",
    refreshTokenTTL: 14 * 24 * 60 * 60 * 1000, // 14 days
  },

  session: {
    secret: process.env.SESSION_SECRET,
  },

  client: {
    url: process.env.CLIENT_URL,
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },

  email: {
    apiKey: process.env.RESEND_API_KEY,
    domain: process.env.RESEND_DOMAIN || "printz.vn",
  },

  openai: {
    apiKey: process.env.OPENAI_API_KEY,
  },

  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },
};

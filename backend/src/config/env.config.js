import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Lấy thông tin đường dẫn
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ GIẢI PHÁP: CHỈ CHẠY DOTENV Ở MÔI TRƯỜNG DEV
// Render (production) không cần cái này, nó tự bơm biến env
if (process.env.NODE_ENV !== "production") {
  console.log("Đang chạy ở môi trường DEV, tải file .env...");

  // Tải .env từ thư mục gốc backend
  dotenv.config({ path: path.resolve(__dirname, "../../.env") });
} else {
  console.log(
    "Đang chạy ở môi trường PROD, sử dụng biến môi trường của Render."
  );
}

// =========================================================================
// ==              EXPORTS CONFIG - ĐOẠN NÀY KHÔNG THAY ĐỔI                ==
// ==   Nó chỉ đọc các giá trị đã được nạp vào process.env (bởi Render)    ==
// =========================================================================

export const envConfig = {
  // Core
  NODE_ENV: process.env.NODE_ENV || "development",
  SERVER_URL: process.env.SERVER_URL,
  CLIENT_URL: process.env.CLIENT_URL,

  // Database
  MONGODB_CONNECTIONSTRING: process.env.MONGODB_CONNECTIONSTRING,

  // Auth
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
  SESSION_SECRET: process.env.SESSION_SECRET,

  // Google OAuth
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,

  // APIs
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  RESEND_API_KEY: process.env.RESEND_API_KEY,

  // Cloudinary (Storage)
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
};

// Hàm kiểm tra các biến môi trường quan trọng (Giữ nguyên)
const checkEnvVariables = () => {
  const requiredVars = [
    "MONGODB_CONNECTIONSTRING",
    "CLIENT_URL",
    "SERVER_URL",
    "ACCESS_TOKEN_SECRET",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
  ];

  const missingVars = requiredVars.filter((v) => !process.env[v]);

  if (missingVars.length > 0) {
    console.error("❌ LỖI BIẾN MÔI TRƯỜNG! Thiếu các biến sau:");
    console.error(missingVars.join("\n"));
    if (process.env.NODE_ENV === "production") {
      process.exit(1); // Thoát tiến trình nếu ở production
    }
  }
};

checkEnvVariables();

export default envConfig;

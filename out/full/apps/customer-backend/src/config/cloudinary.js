// config/cloudinary.js - ✅ FIXED VERSION
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { config } from "./env.config.js";

// ✅ Config using validated environment variables
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
  secure: true, // Use HTTPS
});

// ✅ FIXED: Cấu hình lưu trữ cho multer với error handling và fallback
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "printz/products",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
    public_id: (req, file) => {
      try {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const userId = req.user?._id || "anonymous";
        console.log(
          `📸 Generating public_id for user: ${userId}, file: ${file.originalname}`
        );
        return `product-${userId}-${uniqueSuffix}`;
      } catch (error) {
        console.error("❌ Error generating public_id:", error);
        return `product-fallback-${Date.now()}-${Math.round(
          Math.random() * 1e9
        )}`;
      }
    },
  },
});

export { cloudinary, storage };

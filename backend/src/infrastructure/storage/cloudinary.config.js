// backend/src/infrastructure/storage/cloudinary.config.js
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// Kiểm tra kỹ trước khi config
if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  console.error("❌ FATAL: Missing Cloudinary environment variables!");
  console.log(
    `Cloudinary Config Check - Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME}`
  );
  console.log(
    `Cloudinary Config Check - API Key: ${
      process.env.CLOUDINARY_API_KEY ? "Loaded" : "MISSING!"
    }`
  );
  console.log(
    `Cloudinary Config Check - API Secret: ${
      process.env.CLOUDINARY_API_SECRET ? "Loaded" : "MISSING!"
    }`
  );
  // Dừng app nếu thiếu config
  throw new Error("Missing Cloudinary configuration variables!");
}

// Config chỉ chạy khi đủ biến môi trường
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Use HTTPS
});

// Cấu hình lưu trữ cho multer
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "printz/products",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
    public_id: (req, file) => {
      try {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        // Lấy userId từ req.user (đã được protect middleware thêm vào)
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

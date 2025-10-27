// config/cloudinary.js
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Use https
});

// Cấu hình lưu trữ cho multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "printz/products", // Thư mục lưu ảnh trên Cloudinary
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
    // transformation: [{ width: 1000, height: 1000, crop: 'limit' }] // Tùy chọn: Tự động resize ảnh
    public_id: (req, file) => {
      // Tạo public_id duy nhất (tên file trên Cloudinary)
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      return `product-${req.user._id}-${uniqueSuffix}`;
    },
  },
});

export { cloudinary, storage };

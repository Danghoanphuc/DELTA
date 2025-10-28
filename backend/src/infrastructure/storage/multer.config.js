// backend/src/infrastructure/storage/multer.config.js
import multer from "multer";
// ✅ SỬA LỖI: Đường dẫn import chính xác
import { storage as cloudinaryStorage } from "./cloudinary.config.js";

// Khai báo 'upload' middleware
export const upload = multer({
  storage: cloudinaryStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 5, // Maximum 5 files
  },
  fileFilter: (req, file, cb) => {
    console.log(
      `🔍 FileFilter checking: ${file.originalname}, type: ${file.mimetype}`
    );

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      console.error(`❌ FileFilter rejected: ${file.mimetype}`);
      const error = new Error("Chỉ chấp nhận file ảnh (JPEG, PNG, WEBP).");
      error.code = "INVALID_FILE_TYPE";
      cb(error, false);
    }
  },
});

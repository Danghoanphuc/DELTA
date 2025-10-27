// backend/src/routes/productRoute.js - ✅ FIXED VERSION
import express from "express";
import multer from "multer";
import { protect, isPrinter } from "../middleware/authMiddleware.js";
import { storage as cloudinaryStorage } from "../config/cloudinary.js";
import {
  createProduct,
  getMyProducts,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

const router = express.Router();

// ✅ FIXED: Khai báo 'upload' middleware với error handling cải thiện
const upload = multer({
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
      // ✅ Tạo error object rõ ràng thay vì MulterError
      const error = new Error("Chỉ chấp nhận file ảnh (JPEG, PNG, WEBP).");
      error.code = "INVALID_FILE_TYPE";
      cb(error, false);
    }
  },
});

// ✅ IMPROVED: Middleware xử lý lỗi toàn diện hơn
function handleUploadError(err, req, res, next) {
  console.error("🔴 Upload Error Handler triggered:", err);

  // Xử lý lỗi từ Multer
  if (err instanceof multer.MulterError) {
    console.error("❌ Multer Error:", err.code, "-", err.message);
    let message = "Lỗi tải lên file.";

    switch (err.code) {
      case "LIMIT_FILE_SIZE":
        message = "File quá lớn (tối đa 5MB mỗi file).";
        break;
      case "LIMIT_FILE_COUNT":
        message = "Chỉ được tải lên tối đa 5 ảnh.";
        break;
      case "LIMIT_UNEXPECTED_FILE":
        message = err.message || "Trường file không được chấp nhận.";
        break;
      default:
        message = err.message || "Lỗi tải file.";
    }

    return res.status(400).json({
      success: false,
      message: message,
      errorCode: err.code,
    });
  }

  // ✅ CRITICAL FIX: Xử lý lỗi từ Cloudinary Storage
  if (err && err.message) {
    console.error("❌ Cloudinary/Storage Error:", err.message);

    // Lỗi từ Cloudinary thường có message cụ thể
    if (
      err.message.includes("cloud_name") ||
      err.message.includes("api_key") ||
      err.message.includes("api_secret")
    ) {
      return res.status(500).json({
        success: false,
        message: "Lỗi cấu hình hệ thống. Vui lòng liên hệ admin.",
        hint: "Cloudinary configuration error",
      });
    }

    // Lỗi file type từ fileFilter
    if (err.code === "INVALID_FILE_TYPE") {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    // Lỗi khác từ storage
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lưu trữ file. Vui lòng thử lại.",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }

  // ✅ Lỗi không xác định
  console.error("❌ Unknown Upload Error:", err);
  return res.status(500).json({
    success: false,
    message: "Lỗi không xác định khi tải file.",
    error: process.env.NODE_ENV === "development" ? String(err) : undefined,
  });
}

// ============================================
// ROUTES
// ============================================

// --- PUBLIC ---
router.get("/", getAllProducts);

// --- PRIVATE ---
router.get("/my-products", protect, isPrinter, getMyProducts);

// ✅ FIXED: POST /api/products (Tạo sản phẩm) với error handling cải thiện
router.post(
  "/",
  protect, // 1. Xác thực user TRƯỚC (để req.user tồn tại cho cloudinary)
  isPrinter, // 2. Kiểm tra role
  (req, res, next) => {
    console.log("🚀 POST /api/products - Starting upload middleware...");
    console.log(
      "👤 User authenticated:",
      req.user?._id,
      "Role:",
      req.user?.role
    );

    // 3. Chạy multer upload
    upload.array("images", 5)(req, res, (err) => {
      if (err) {
        // ✅ CRITICAL FIX: Bắt TẤT CẢ lỗi từ multer và cloudinary storage
        console.error("❌ Upload middleware error:", err);
        return handleUploadError(err, req, res, next);
      }

      // ✅ Upload thành công
      console.log("✅ Upload middleware completed successfully");
      console.log(`📦 Files uploaded: ${req.files?.length || 0}`);
      console.log(`📝 Body fields received:`, Object.keys(req.body));

      next(); // Chuyển sang controller
    });
  },
  createProduct // 4. Controller xử lý logic tạo product
);

// PUT /api/products/:id (Cập nhật)
router.put("/:id", protect, isPrinter, updateProduct);

// DELETE /api/products/:id (Xóa)
router.delete("/:id", protect, isPrinter, deleteProduct);

// --- DYNAMIC PUBLIC (Cuối cùng) ---
router.get("/:id", getProductById);

export default router;

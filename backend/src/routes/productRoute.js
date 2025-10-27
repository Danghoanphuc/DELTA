// backend/src/routes/productRoute.js
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

// --- Khai báo 'upload' với Cloudinary ---
const upload = multer({
  storage: cloudinaryStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      // Pass an error to Multer's handler
      cb(
        new multer.MulterError(
          "LIMIT_UNEXPECTED_FILE",
          "Chỉ chấp nhận file ảnh (JPEG, PNG, WEBP)."
        ),
        false
      );
    }
  },
}).array("images", 5); // <--- Call .array here directly

// --- Middleware xử lý lỗi Multer (ĐẶT SAU KHAI BÁO ROUTE DÙNG MULTER) ---
function handleMulterError(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    console.error("❌ Lỗi Multer:", err.code, "-", err.message || err.field);
    let message = "Lỗi tải lên file.";
    if (err.code === "LIMIT_FILE_SIZE") {
      message = "File quá lớn (tối đa 5MB).";
    } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
      message = err.message || "Loại file không được chấp nhận."; // Lấy message từ fileFilter
    } else if (err.code === "LIMIT_FILE_COUNT") {
      message = "Chỉ được tải lên tối đa 5 ảnh.";
    }
    return res.status(400).json({ success: false, message: message });
  } else if (err) {
    // Lỗi khác không phải từ Multer (ví dụ: lỗi filter tùy chỉnh)
    console.error("❌ Lỗi khác trong quá trình upload:", err.message);
    return res
      .status(400)
      .json({
        success: false,
        message: err.message || "Lỗi không xác định khi tải file.",
      });
  }
  // Nếu không có lỗi multer, đi tiếp
  next();
}

// ============================================
// ROUTES
// ============================================

// --- PUBLIC ---
router.get("/", getAllProducts);

// --- PRIVATE ---
router.get("/my-products", protect, isPrinter, getMyProducts);

// POST /api/products (Tạo sản phẩm)
router.post(
  "/",
  protect,
  isPrinter,
  // 1. Chạy middleware upload trước
  (req, res, next) => {
    upload(req, res, (err) => {
      // 2. Middleware handleMulterError sẽ bắt lỗi Multer ở đây
      if (err) {
        return handleMulterError(err, req, res, next); // Gửi lỗi đến handler
      }
      // Nếu upload thành công (không có lỗi multer), đi tiếp controller
      next();
    });
  },
  // 3. Controller chỉ chạy nếu upload thành công
  createProduct
);

// PUT /api/products/:id (Cập nhật - Thêm upload nếu cần)
router.put(
  "/:id",
  protect,
  isPrinter,
  // (req, res, next) => { uploadMiddlewareForUpdate(req, res, err => { ... }) }, // Logic tương tự nếu cần update ảnh
  updateProduct
);

router.delete("/:id", protect, isPrinter, deleteProduct);

// --- DYNAMIC PUBLIC (Cuối cùng) ---
router.get("/:id", getProductById);

export default router;

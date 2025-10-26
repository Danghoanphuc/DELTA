// backend/src/routes/productRoute.js (ĐÃ SỬA)
import express from "express";
// Sửa: Sử dụng import nhất quán và bỏ require
import { protect, isPrinter } from "../middleware/authMiddleware.js";
import {
  createProduct,
  getMyProducts,
  getAllProducts,
  getProductById,
  updateProduct, // <-- Sửa: Thêm import updateProduct
  deleteProduct, // <-- Thêm import deleteProduct (nếu bạn có route DELETE)
} from "../controllers/productController.js";

const router = express.Router();

// ============================================
// PRIVATE ROUTES (Cần auth)
// ============================================
// Thống nhất dùng protect (xác thực) và isPrinter (kiểm tra vai trò) nếu cần

// POST /api/products (Chỉ Printer)
router.post("/", protect, isPrinter, createProduct);

// GET /api/products/my-products (Chỉ Printer)
router.get("/my-products", protect, isPrinter, getMyProducts);

// PUT /api/products/:id (Chỉ Printer sở hữu)
router.put(
  "/:id",
  protect,
  isPrinter,
  updateProduct // <-- Sử dụng hàm đã import
);

// DELETE /api/products/:id (Chỉ Printer sở hữu - Giả sử bạn có route này)
// router.delete("/:id", protect, isPrinter, deleteProduct);

// ============================================
// PUBLIC ROUTES (Không cần auth)
// ============================================
// GET /api/products (Lấy tất cả sản phẩm đang active)
router.get("/", getAllProducts);

// GET /api/products/:id (Lấy chi tiết 1 sản phẩm đang active)
// Đặt route động này ở cuối để tránh ghi đè các route khác như /my-products
router.get("/:id", getProductById);

export default router;

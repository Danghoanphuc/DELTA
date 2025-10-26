// backend/src/routes/productRoute.js - ĐÃ CẬP NHẬT ĐẦY ĐỦ
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createProduct,
  getMyProducts,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

const router = express.Router();

// ============================================
// PUBLIC ROUTES (Không cần auth - Đặt trước)
// ============================================
router.get("/", getAllProducts); // GET /api/products (Lấy tất cả)

// ============================================
// PRIVATE ROUTES (Cần auth)
// ============================================
// QUAN TRỌNG: Routes cụ thể phải đặt TRƯỚC routes động (:id)
router.get("/my-products", protect, getMyProducts); // GET /api/products/my-products

// CRUD operations cho printer
router.post("/", protect, createProduct); // POST /api/products (Tạo mới)
router.put("/:id", protect, updateProduct); // PUT /api/products/:id (Cập nhật)
router.delete("/:id", protect, deleteProduct); // DELETE /api/products/:id (Xóa)

// ============================================
// DYNAMIC ROUTES (Phải đặt cuối cùng)
// ============================================
router.get("/:id", getProductById); // GET /api/products/:id (Lấy 1 SP)

export default router;

// backend/src/routes/productRoute.js - ĐÃ CẬP NHẬT ĐẦY ĐỦ
import express from "express";
import { isAuthenticated } from "../middleware/authMiddleware.js";
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
router.get("/my-products", isAuthenticated, getMyProducts); // GET /api/products/my-products

// CRUD operations cho printer
router.post("/", isAuthenticated, createProduct); // POST /api/products (Tạo mới)
router.put("/:id", isAuthenticated, updateProduct); // PUT /api/products/:id (Cập nhật)
router.delete("/:id", isAuthenticated, deleteProduct); // DELETE /api/products/:id (Xóa)

// ============================================
// DYNAMIC ROUTES (Phải đặt cuối cùng)
// ============================================
router.get("/:id", getProductById); // GET /api/products/:id (Lấy 1 SP)

export default router;

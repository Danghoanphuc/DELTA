// backend/src/routes/productRoute.js (ĐÃ SẮP XẾP LẠI THỨ TỰ)
import express from "express";
import { isAuthenticated } from "../middleware/authMiddleware.js";
import {
  createProduct,
  getMyProducts,
  getAllProducts,
  getProductById,
} from "../controllers/productController.js";

const router = express.Router();

// ============================================
// PRIVATE ROUTES (Cần auth - Đặt lên đầu)
// ============================================
// Các route này sẽ chạy middleware 'isAuthenticated' trước
router.post("/", isAuthenticated, createProduct); // POST /api/products
router.get("/my-products", isAuthenticated, getMyProducts); // GET /api/products/my-products

// ============================================
// PUBLIC ROUTES (Không cần auth - Đặt phía dưới)
// ============================================
router.get("/", getAllProducts); // GET /api/products (Lấy tất cả)
router.get("/:id", getProductById); // GET /api/products/:id (Lấy 1 SP - Route động phải ở cuối)

export default router;

// src/routes/productRoute.js
import express from "express";
import { isAuthenticated } from "../middleware/authMiddleware.js";
import {
  createProduct,
  getMyProducts,
} from "../controllers/productController.js";

const router = express.Router();

// Định nghĩa routes
// Chỉ nhà in đã đăng nhập mới được truy cập
router.use(isAuthenticated);

router.route("/").post(createProduct); // POST /api/products (Tạo sản phẩm)

router.route("/my-products").get(getMyProducts); // GET /api/products/my-products (Lấy SP của tôi)

export default router;

// src/routes/productRoute.js
import express from "express";
import { isAuthenticated } from "../middleware/authMiddleware.js";
import {
  createProduct,
  getMyProducts,
  getAllProducts, // <-- THÊM IMPORT
  getProductById, // <-- THÊM IMPORT
} from "../controllers/productController.js";

const router = express.Router();

// --- (CÁC ROUTE CÔNG KHAI - CHO KHÁCH HÀNG) ---
// (Phải đặt TRƯỚC router.use(isAuthenticated))

router.route("/").get(getAllProducts); // GET /api/products (Lấy tất cả sản phẩm)

router.route("/:id").get(getProductById); // GET /api/products/:id (Xem chi tiết 1 sản phẩm)

// --- (CÁC ROUTE CÁ NHÂN - CHO NHÀ IN) ---
// (Các route bên dưới dòng này yêu cầu đăng nhập)

router.use(isAuthenticated);

router.route("/").post(createProduct); // POST /api/products (Nhà in tạo sản phẩm)

router.route("/my-products").get(getMyProducts); // GET /api/products/my-products (Nhà in lấy SP của họ)

export default router;

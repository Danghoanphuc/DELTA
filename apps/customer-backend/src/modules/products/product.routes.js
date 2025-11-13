// apps/customer-backend/src/modules/products/product.routes.js
import { Router } from "express";
import {
  getMyProducts,
  getMyProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  checkSlugAvailability,
  getAllProducts,
  getProductById,
} from "./product.controller.js"; // (File này của anh đã đúng)

// ✅ SỬA ĐƯỜNG DẪN VÀ TÊN MIDDLEWARE
import { protect, isPrinter } from "../../shared/middleware/index.js";

const router = Router();

// === CÁC ROUTE CÔNG KHAI (PUBLIC) - KHÔNG CẦN TOKEN ===
// Lưu ý: Đặt routes public TRƯỚC middleware protect

// Route cụ thể trước (để tránh conflict với /:id)
router.get("/slug-check/:slug", checkSlugAvailability);

// Route public: GET /api/products (danh sách sản phẩm)
router.get("/", getAllProducts);

// Route public: GET /api/products/:id (chi tiết sản phẩm)
router.get("/:id", getProductById);

// === CÁC ROUTE BẢO MẬT (PRINTER) - CẦN TOKEN ===
// ✅ SỬA: Dùng 'protect' và 'isPrinter'
router.use(protect, isPrinter);

// Route protected: GET /api/products (lấy SP của tôi - khác với public route)
// Lưu ý: Route này sẽ không match vì đã có route public GET "/" ở trên
// Nếu cần route riêng cho "my-products", nên dùng "/my-products"
router.post("/", createProduct); // Tạo SP mới

router
  .route("/:id")
  .get(getMyProductById) // Lấy SP của tôi (protected)
  .patch(updateProduct) // Cập nhật SP của tôi
  .delete(deleteProduct); // Xóa SP của tôi

export default router;

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
  // ✨ SMART PIPELINE: Draft API
  saveDraft,
  getMyDrafts,
  publishDraft,
  deleteDraft,
} from "./product.controller.js";

// ✅ SỬA ĐƯỜNG DẪN VÀ TÊN MIDDLEWARE
import { protect, isPrinter, optionalAuth } from "../../shared/middleware/index.js";
import { uploadImage } from "../../infrastructure/storage/multer.config.js";

const router = Router();

// === CÁC ROUTE CÔNG KHAI (PUBLIC) - KHÔNG CẦN TOKEN ===
// ✅ QUAN TRỌNG: Đặt routes public TRƯỚC tất cả middleware protect
// Để customer có thể xem sản phẩm mà không cần đăng nhập

// Route cụ thể trước (để tránh conflict với /:id)
router.get("/slug-check/:slug", checkSlugAvailability);

// Route public: GET /api/products (danh sách sản phẩm)
router.get("/", getAllProducts);

// ✅ Route public: GET /api/products/:id (chi tiết sản phẩm)
// Đặt TRƯỚC protected routes để customer có thể xem mà không cần đăng nhập
// Sử dụng optionalAuth để cho phép owner truy cập sản phẩm của họ dù chưa active
// Controller sẽ check nếu id === "my-products" thì return 404 (đây là route protected)
router.get("/:id", optionalAuth, getProductById);

// === CÁC ROUTE BẢO MẬT (PRINTER) - CẦN TOKEN ===
// ✅ Tạo router riêng cho protected routes
const protectedRouter = Router();

// ✅ Middleware: Chỉ apply protect và isPrinter cho các route trong protectedRouter
// Nếu không có authentication hoặc không phải printer, middleware sẽ reject
protectedRouter.use(protect, isPrinter);

// ✅ QUAN TRỌNG: Route cụ thể "/my-products" PHẢI đặt TRƯỚC route "/:id"
// Nếu không, Express sẽ match "/my-products" với "/:id" và coi "my-products" là ID
protectedRouter.get("/my-products", getMyProducts); // Lấy danh sách SP của tôi

// ✨ SMART PIPELINE: Draft routes (phải đặt TRƯỚC route "/:id")
protectedRouter.post("/draft", saveDraft); // Tạo/cập nhật draft
protectedRouter.get("/drafts", getMyDrafts); // Lấy danh sách drafts
protectedRouter.post("/draft/:id/publish", publishDraft); // Publish draft
protectedRouter.delete("/draft/:id", deleteDraft); // Xóa draft

// ✅ Thêm multer middleware để parse FormData
// Thêm error handler cho multer
protectedRouter.post("/", (req, res, next) => {
  console.log("🔍 [POST /products] Request received");
  uploadImage.any()(req, res, (err) => {
    if (err) {
      console.error("❌ [Multer Error]:", err);
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`,
      });
    }
    console.log("✅ [Multer] Files processed successfully");
    next();
  });
}, createProduct); // Tạo SP mới

// ✅ Route protected cho quản lý sản phẩm của printer
protectedRouter
  .route("/:id")
  .get(getMyProductById) // Lấy SP của tôi (protected) - để printer xem chi tiết sản phẩm của họ
  .put(uploadImage.any(), updateProduct) // Cập nhật SP của tôi (PUT - có thể upload images)
  .patch(uploadImage.any(), updateProduct) // Cập nhật SP của tôi (PATCH - có thể upload images)
  .delete(deleteProduct); // Xóa SP của tôi

// ✅ Mount protected router SAU route public /:id
// Lưu ý: Route /my-products trong protected router sẽ không match với route public /:id
// vì route public /:id chỉ match với các ID thực sự (không phải "my-products")
// Request /my-products sẽ:
// 1. Không match với route public /:id (vì controller check và return 404 nếu id === "my-products")
// 2. Không match với protected router nếu không có authentication
// Vậy cần sửa logic: route public /:id phải skip nếu id === "my-products"
router.use(protectedRouter);


export default router;

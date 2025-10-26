// backend/src/routes/cartRoute.js - ĐÃ CẬP NHẬT ĐẦY ĐỦ
import express from "express";
import { isAuthenticated } from "../middleware/authMiddleware.js";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  batchUpdateCart,
} from "../controllers/cartController.js";

const router = express.Router();

// Bảo vệ tất cả các route giỏ hàng, user phải đăng nhập
router.use(isAuthenticated);

// === CART ROUTES ===
router.route("/").get(getCart); // GET /api/cart - Lấy giỏ hàng

router.route("/add").post(addToCart); // POST /api/cart/add - Thêm/Cập nhật item

router.route("/update").put(updateCartItem); // PUT /api/cart/update - Cập nhật số lượng 1 item

router.route("/batch-update").put(batchUpdateCart); // PUT /api/cart/batch-update - Cập nhật nhiều items

router.route("/remove/:cartItemId").delete(removeFromCart); // DELETE /api/cart/remove/:cartItemId - Xóa 1 item

router.route("/clear").delete(clearCart); // DELETE /api/cart/clear - Xóa sạch giỏ hàng

export default router;

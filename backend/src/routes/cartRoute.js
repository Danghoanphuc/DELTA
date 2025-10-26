// backend/src/routes/cartRoute.js
import express from "express";
import { isAuthenticated } from "../middleware/authMiddleware.js";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../controllers/cartController.js";

const router = express.Router();

// Bảo vệ tất cả các route giỏ hàng, user phải đăng nhập
router.use(isAuthenticated);

// Khớp với các hàm gọi API trong useCartStore
router.route("/").get(getCart); // Lấy giỏ hàng
router.route("/add").post(addToCart); // Thêm/Cập nhật item
router.route("/update").put(updateCartItem); // Cập nhật số lượng
router.route("/remove/:cartItemId").delete(removeFromCart); // Xóa 1 item
router.route("/clear").delete(clearCart); // Xóa sạch giỏ hàng

export default router;

// src/modules/cart/cart.routes.js
import { Router } from "express";
// Sửa lại import: Import các hàm cụ thể
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "./cart.controller.js";
import { protect } from "../../shared/middleware/index.js";

const router = Router();
// Bỏ dòng này: const cartController = new CartController();

// Bảo vệ tất cả các route giỏ hàng
router.use(protect);

// Sửa lại cách gọi: Gọi hàm trực tiếp
router.get("/", getCart);
router.post("/add", addToCart);
router.put("/update", updateCartItem);
router.delete("/remove/:cartItemId", removeFromCart);
router.delete("/clear", clearCart);
// router.put("/batch-update", batchUpdateCart); // Nếu bạn có hàm này, cũng import và gọi trực tiếp

export default router;

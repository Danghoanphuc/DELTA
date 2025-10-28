// src/modules/cart/cart.routes.js
import { Router } from "express";
import { CartController } from "./cart.controller.js";
import { protect } from "../../shared/middleware/index.js";

const router = Router();
const cartController = new CartController();

// Bảo vệ tất cả các route giỏ hàng
router.use(protect);

router.get("/", cartController.getCart);
router.post("/add", cartController.addToCart);
router.put("/update", cartController.updateCartItem);
router.delete("/remove/:cartItemId", cartController.removeFromCart);
router.delete("/clear", cartController.clearCart);
// router.put("/batch-update", cartController.batchUpdateCart); // Bạn có thể thêm lại route này nếu cần

export default router;

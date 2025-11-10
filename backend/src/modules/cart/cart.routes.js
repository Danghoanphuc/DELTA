// src/modules/cart/cart.routes.js
import { Router } from "express";

// ✅ Import Controller Class
import { CartController } from "./cart.controller.js";

import {
  protect,
  optionalAuth,
  requireAuth,
} from "../../shared/middleware/index.js";

const router = Router();
// ✅ Khởi tạo instance
const cartController = new CartController();

/**
 * @route   GET /api/cart
 * @desc    Get user's cart
 * @access  Public with optionalAuth
 */
router.get("/", optionalAuth, cartController.getCart); // ✅ Dùng method

/**
 * @route   POST /api/cart/add
 * @desc    Add item to cart
 * @access  Private (requires authentication)
 */
router.post("/add", optionalAuth, requireAuth, cartController.addToCart); // ✅ Dùng method

/**
 * @route   PUT /api/cart/update
 * @desc    Update cart item quantity
 * @access  Private (requires authentication)
 */
router.put("/update", optionalAuth, requireAuth, cartController.updateCartItem); // ✅ Dùng method

/**
 * @route   DELETE /api/cart/remove/:cartItemId
 * @desc    Remove item from cart
 * @access  Private (requires authentication)
 */
router.delete(
  "/remove/:cartItemId",
  optionalAuth,
  requireAuth,
  cartController.removeFromCart // ✅ Dùng method
);

/**
 * @route   DELETE /api/cart/clear
 * @desc    Clear entire cart
 * @access  Private (requires authentication)
 */
router.delete("/clear", optionalAuth, requireAuth, cartController.clearCart); // ✅ Dùng method

/**
 * ✨ NEW: Merge guest cart to authenticated cart
 * @route   POST /api/cart/merge
 * @desc    Merge localStorage cart items into database cart after login
 * @access  Private (requires authentication)
 */
router.post("/merge", protect, cartController.mergeGuestCart); // ✅ Dùng method

export default router;

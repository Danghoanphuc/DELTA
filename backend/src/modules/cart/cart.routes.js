// src/modules/cart/cart.routes.js (✅ UPDATED - GUEST + AUTH SUPPORT)
import { Router } from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "./cart.controller.js";
import {
  protect,
  optionalAuth,
  requireAuth,
} from "../../shared/middleware/index.js";

const router = Router();

/**
 * Cart Routes
 *
 * ✅ UPDATED Strategy:
 * - GET /cart → optionalAuth (show cart for both guest & auth users)
 * - POST/PUT/DELETE → requireAuth (need login to modify cart in DB)
 *
 * Frontend Strategy:
 * - Guest users: Store cart in localStorage
 * - Authenticated users: Store cart in database
 * - On login: Merge localStorage cart → database cart
 */

/**
 * @route   GET /api/cart
 * @desc    Get user's cart
 * @access  Public with optionalAuth
 *          - If authenticated: Return DB cart
 *          - If guest: Return empty cart (frontend uses localStorage)
 */
router.get("/", optionalAuth, getCart);

/**
 * @route   POST /api/cart/add
 * @desc    Add item to cart
 * @access  Private (requires authentication)
 *          Returns 401 with friendly message if not logged in
 */
router.post("/add", optionalAuth, requireAuth, addToCart);

/**
 * @route   PUT /api/cart/update
 * @desc    Update cart item quantity
 * @access  Private (requires authentication)
 */
router.put("/update", optionalAuth, requireAuth, updateCartItem);

/**
 * @route   DELETE /api/cart/remove/:cartItemId
 * @desc    Remove item from cart
 * @access  Private (requires authentication)
 */
router.delete("/remove/:cartItemId", optionalAuth, requireAuth, removeFromCart);

/**
 * @route   DELETE /api/cart/clear
 * @desc    Clear entire cart
 * @access  Private (requires authentication)
 */
router.delete("/clear", optionalAuth, requireAuth, clearCart);

/**
 * ✨ NEW: Merge guest cart to authenticated cart
 * @route   POST /api/cart/merge
 * @desc    Merge localStorage cart items into database cart after login
 * @body    { items: [...] } - Array of cart items from localStorage
 * @access  Private (requires authentication)
 */
import { mergeGuestCart } from "./cart.controller.js";
router.post("/merge", protect, mergeGuestCart);

export default router;

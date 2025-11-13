// src/modules/cart/cart.controller.js

import { CartService } from "./cart.service.js";
import { ApiResponse } from "../../shared/utils/index.js";
import { API_CODES } from "../../shared/constants/index.js";
import { Logger } from "../../shared/utils/index.js";

export class CartController {
  constructor() {
    this.cartService = new CartService();
  }

  // =========================================================
  // === 💡 CÁC METHOD BỊ THIẾU ĐÃ ĐƯỢC BỔ SUNG ===
  // =========================================================

  /**
   * Lấy giỏ hàng (của user đã login hoặc của guest)
   */
  getCart = async (req, res, next) => {
    try {
      // req.user._id (nếu đã login) hoặc req.guestCartId (nếu là guest)
      // Middleware optionalAuth sẽ xử lý việc gán 1 trong 2 giá trị này
      const userId = req.user?._id;
      const guestCartId = req.guestCartId; // (Cần đảm bảo optionalAuth gán cái này)

      const cart = await this.cartService.getCart(userId, guestCartId);
      res.status(API_CODES.SUCCESS).json(ApiResponse.success(cart));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Thêm sản phẩm vào giỏ hàng
   */
  addToCart = async (req, res, next) => {
    try {
      const { productId, variantId, quantity, customization } = req.body;
      const cart = await this.cartService.addToCart(req.user._id, {
        productId,
        variantId,
        quantity,
        customization,
      });
      res
        .status(API_CODES.CREATED)
        .json(ApiResponse.success(cart, "Đã thêm vào giỏ hàng!"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Cập nhật số lượng item trong giỏ hàng
   */
  updateCartItem = async (req, res, next) => {
    try {
      const { cartItemId, quantity } = req.body;
      const cart = await this.cartService.updateCartItem(
        req.user._id,
        cartItemId,
        quantity
      );
      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success(cart, "Cập nhật giỏ hàng thành công!"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Xóa 1 item khỏi giỏ hàng
   */
  removeFromCart = async (req, res, next) => {
    try {
      const { cartItemId } = req.params;
      const cart = await this.cartService.removeFromCart(
        req.user._id,
        cartItemId
      );
      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success(cart, "Đã xóa khỏi giỏ hàng!"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Gộp giỏ hàng của guest vào giỏ hàng của user sau khi login
   */
  mergeGuestCart = async (req, res, next) => {
    try {
      const { guestCartItems } = req.body; // Giả định guest cart items được gửi lên
      const cart = await this.cartService.mergeGuestCart(
        req.user._id,
        guestCartItems
      );
      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success(cart, "Đồng bộ giỏ hàng thành công!"));
    } catch (error) {
      next(error);
    }
  };

  // =========================================================
  // === CÁC METHOD ANH ĐÃ CÓ ===
  // =========================================================

  /**
   * Xóa sạch giỏ hàng
   */
  clearCart = async (req, res, next) => {
    try {
      const cart = await this.cartService.clearCart(req.user._id);
      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ cart }, "Giỏ hàng đã được làm sạch!"));
    } catch (error) {
      next(error);
    }
  };

  // --- NÂNG CẤP GĐ 5.4: \"HARD CHECK\" ---
  /**
   * Xác thực giỏ hàng trước khi thanh toán
   */
  validateCheckout = async (req, res, next) => {
    try {
      const validationResult = await this.cartService.validateCheckout(
        req.user._id
      );
      res.status(API_CODES.SUCCESS).json(ApiResponse.success(validationResult));
    } catch (error) {
      next(error);
    }
  };
  // --- KẾT THÚC NÂNG CẤP ---
}

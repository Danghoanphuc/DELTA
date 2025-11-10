// src/modules/cart/cart.controller.js
// ✅ BÀN GIAO: Đã refactor 100% sang Class-based
// Controller giờ chỉ điều phối, không chứa logic nghiệp vụ

import { CartService } from "./cart.service.js";
import { ApiResponse } from "../../shared/utils/index.js";
import { API_CODES } from "../../shared/constants/index.js";
import { Logger } from "../../shared/utils/index.js";

export class CartController {
  constructor() {
    this.cartService = new CartService();
  }

  /**
   * Lấy giỏ hàng (cho cả guest và user)
   */
  getCart = async (req, res, next) => {
    try {
      // Logic cho Guest (từ middleware optionalAuth)
      if (!req.user) {
        Logger.debug("[CartCtrl] Guest getting cart, returning empty.");
        return res.status(API_CODES.SUCCESS).json(
          ApiResponse.success({
            items: [],
            totalItems: 0,
            totalAmount: 0,
            isGuest: true,
            message: "Giỏ hàng tạm thời - Đăng nhập để lưu giỏ hàng",
          })
        );
      }

      // Logic cho User đã đăng nhập
      Logger.debug(`[CartCtrl] User ${req.user._id} getting cart.`);
      const cart = await this.cartService.getCart(req.user._id);
      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ cart }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Thêm vào giỏ hàng
   */
  addToCart = async (req, res, next) => {
    try {
      // Middleware requireAuth đảm bảo req.user._id tồn tại
      const cart = await this.cartService.addToCart(req.user._id, req.body);
      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ cart }, "Đã thêm vào giỏ hàng!"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Gộp giỏ hàng (sau khi login)
   */
  mergeGuestCart = async (req, res, next) => {
    try {
      const cart = await this.cartService.mergeGuestCart(
        req.user._id,
        req.body.items // Lấy mảng items từ body
      );
      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ cart }, "Đã gộp giỏ hàng thành công!"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Cập nhật số lượng
   */
  updateCartItem = async (req, res, next) => {
    try {
      const cart = await this.cartService.updateCartItem(
        req.user._id,
        req.body // body chứa { cartItemId, quantity }
      );
      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ cart }, "Đã cập nhật giỏ hàng!"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Xóa sản phẩm
   */
  removeFromCart = async (req, res, next) => {
    try {
      const cart = await this.cartService.removeFromCart(
        req.user._id,
        req.params.cartItemId
      );
      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ cart }, "Đã xóa sản phẩm khỏi giỏ hàng!"));
    } catch (error) {
      next(error);
    }
  };

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
}

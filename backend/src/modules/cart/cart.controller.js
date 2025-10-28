// src/modules/cart/cart.controller.js
import { CartService } from "./cart.service.js";
import { ApiResponse } from "../../shared/utils/index.js";
import { API_CODES } from "../../shared/constants/index.js";

export class CartController {
  constructor() {
    this.cartService = new CartService();
  }

  getCart = async (req, res, next) => {
    try {
      const cart = await this.cartService.getCart(req.user._id);
      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ cart }));
    } catch (error) {
      next(error);
    }
  };

  addToCart = async (req, res, next) => {
    try {
      const cart = await this.cartService.addToCart(req.user._id, req.body);
      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ cart }, "Đã thêm vào giỏ hàng!"));
    } catch (error) {
      next(error);
    }
  };

  updateCartItem = async (req, res, next) => {
    try {
      const cart = await this.cartService.updateCartItem(
        req.user._id,
        req.body
      );
      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ cart }, "Đã cập nhật giỏ hàng!"));
    } catch (error) {
      next(error);
    }
  };

  removeFromCart = async (req, res, next) => {
    try {
      const cart = await this.cartService.removeFromCart(
        req.user._id,
        req.params.cartItemId
      );
      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ cart }, "Đã xóa sản phẩm!"));
    } catch (error) {
      next(error);
    }
  };

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

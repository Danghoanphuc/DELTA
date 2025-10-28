// src/modules/cart/cart.controller.js (✅ FIXED VERSION)
import { CartService } from "./cart.service.js";
import { ApiResponse } from "../../shared/utils/index.js";
import { API_CODES } from "../../shared/constants/index.js";
import { Logger } from "../../shared/utils/index.js";

export class CartController {
  constructor() {
    this.cartService = new CartService();
  }

  getCart = async (req, res, next) => {
    try {
      Logger.debug("=== GET CART CONTROLLER ===");
      Logger.debug("User ID:", req.user._id);

      const cart = await this.cartService.getCart(req.user._id);

      Logger.debug("Cart retrieved:", {
        cartId: cart?._id,
        itemsCount: cart?.items?.length || 0,
      });

      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ cart }));
    } catch (error) {
      Logger.error("Error in getCart:", error);
      next(error);
    }
  };

  addToCart = async (req, res, next) => {
    try {
      Logger.debug("=== ADD TO CART CONTROLLER START ===");
      Logger.debug("User ID:", req.user._id);
      Logger.debug("Request body:", req.body);

      const cart = await this.cartService.addToCart(req.user._id, req.body);

      // ✅ Validate response
      if (!cart || !cart._id) {
        throw new Error("Service returned invalid cart");
      }

      Logger.debug("Cart added successfully:", {
        cartId: cart._id,
        itemsCount: cart.items?.length || 0,
        totalAmount: cart.totalAmount,
      });

      // ✅ Ensure cart is properly serialized
      const responseCart = cart.toObject ? cart.toObject() : cart;

      Logger.debug("Sending response with cart:", {
        cartId: responseCart._id,
        itemsCount: responseCart.items?.length || 0,
      });

      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success({ cart: responseCart }, "Đã thêm vào giỏ hàng!")
        );

      Logger.debug("=== ADD TO CART CONTROLLER END ===");
    } catch (error) {
      // Logger.error("Error caught in addToCart controller:", error); // Tạm comment Logger
      console.error("!!! ERROR IN addToCart Controller CATCH:", error); // Dùng console.error
      next(error);
    }
  };

  updateCartItem = async (req, res, next) => {
    try {
      Logger.debug("=== UPDATE CART ITEM ===");
      Logger.debug("User ID:", req.user._id);
      Logger.debug("Request body:", req.body);

      const cart = await this.cartService.updateCartItem(
        req.user._id,
        req.body
      );

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ cart }, "Đã cập nhật giỏ hàng!"));
    } catch (error) {
      Logger.error("Error in updateCartItem:", error);
      next(error);
    }
  };

  removeFromCart = async (req, res, next) => {
    try {
      Logger.debug("=== REMOVE FROM CART ===");
      Logger.debug("User ID:", req.user._id);
      Logger.debug("Cart Item ID:", req.params.cartItemId);

      const cart = await this.cartService.removeFromCart(
        req.user._id,
        req.params.cartItemId
      );

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ cart }, "Đã xóa sản phẩm!"));
    } catch (error) {
      Logger.error("Error in removeFromCart:", error);
      next(error);
    }
  };

  clearCart = async (req, res, next) => {
    try {
      Logger.debug("=== CLEAR CART ===");
      Logger.debug("User ID:", req.user._id);

      const cart = await this.cartService.clearCart(req.user._id);

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ cart }, "Giỏ hàng đã được làm sạch!"));
    } catch (error) {
      Logger.error("Error in clearCart:", error);
      next(error);
    }
  };
}

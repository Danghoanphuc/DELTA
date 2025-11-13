// src/modules/checkout/checkout.controller.js
import { CheckoutService } from "./checkout.service.js";
import { ApiResponse } from "../../shared/utils/index.js";
import { API_CODES } from "../../shared/constants/index.js";

export class CheckoutController {
  constructor() {
    this.checkoutService = new CheckoutService();
  }

  // --- HÀM CŨ (GĐ 5.4) - GIỮ NGUYÊN ---
  createStripePaymentIntent = async (req, res, next) => {
    try {
      const result = await this.checkoutService.createStripePaymentIntent(req);
      res.status(API_CODES.CREATED).json(ApiResponse.success(result));
    } catch (error) {
      next(error);
    }
  };

  // --- HÀM MỚI (GĐ 5.R2) ---
  createVnPayUrl = async (req, res, next) => {
    try {
      // (Chúng ta cần IP của user)
      // Chuyển req (đã chứa IP) vào service
      const result = await this.checkoutService.createVnPayPaymentUrl(req);
      res.status(API_CODES.CREATED).json(ApiResponse.success(result));
    } catch (error) {
      next(error);
    }
  };
}

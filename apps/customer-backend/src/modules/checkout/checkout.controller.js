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

  // --- MoMo create payment URL ---
  createMomoUrl = async (req, res, next) => {
    try {
      const result = await this.checkoutService.createMomoPaymentUrl(req);
      res.status(API_CODES.CREATED).json(ApiResponse.success(result));
    } catch (error) {
      next(error);
    }
  };

  // --- COD confirm order ---
  confirmCodOrder = async (req, res, next) => {
    try {
      const result = await this.checkoutService.confirmCodOrder(req);
      res.status(API_CODES.CREATED).json(ApiResponse.success(result));
    } catch (error) {
      next(error);
    }
  };
}

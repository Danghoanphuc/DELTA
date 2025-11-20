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

  // --- ✅ NEW: Unified process checkout endpoint ---
  processCheckout = async (req, res, next) => {
    try {
      const { paymentMethod } = req.body;

      let result;
      switch (paymentMethod) {
        case 'cod':
          result = await this.checkoutService.confirmCodOrder(req);
          break;
        case 'momo':
          result = await this.checkoutService.createMomoPaymentUrl(req);
          break;
        case 'stripe':
          result = await this.checkoutService.createStripePaymentIntent(req);
          break;
        default:
          return res.status(API_CODES.BAD_REQUEST).json(
            ApiResponse.error(`Invalid payment method: ${paymentMethod}`, API_CODES.BAD_REQUEST)
          );
      }

      res.status(API_CODES.CREATED).json(ApiResponse.success(result));
    } catch (error) {
      next(error);
    }
  };
}

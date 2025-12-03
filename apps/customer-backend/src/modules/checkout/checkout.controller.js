// src/modules/checkout/checkout.controller.js
import { CheckoutService } from "./checkout.service.js";
import { ApiResponse } from "../../shared/utils/index.js";
import { API_CODES } from "../../shared/constants/index.js";

export class CheckoutController {
  constructor() {
    this.checkoutService = new CheckoutService();
  }

  // --- COD confirm order ---
  confirmCodOrder = async (req, res, next) => {
    try {
      const result = await this.checkoutService.confirmCodOrder(req);
      res.status(API_CODES.CREATED).json(ApiResponse.success(result));
    } catch (error) {
      next(error);
    }
  };

  // --- ✅ Unified process checkout endpoint (COD only) ---
  processCheckout = async (req, res, next) => {
    try {
      const { paymentMethod } = req.body;

      if (paymentMethod !== "cod") {
        return res
          .status(API_CODES.BAD_REQUEST)
          .json(
            ApiResponse.error(
              `Only COD payment is supported. Use PayOS for online payment.`,
              API_CODES.BAD_REQUEST
            )
          );
      }

      const result = await this.checkoutService.confirmCodOrder(req);
      res.status(API_CODES.CREATED).json(ApiResponse.success(result));
    } catch (error) {
      next(error);
    }
  };
}

// apps/customer-backend/src/modules/auth/shipper-auth.controller.js
/**
 * Shipper Authentication Controller
 * Handles shipper registration for testing purposes
 */

import { ShipperAuthService } from "./shipper-auth.service.js";
import { ApiResponse } from "../../shared/utils/index.js";
import { API_CODES } from "../../shared/constants/index.js";

export class ShipperAuthController {
  constructor() {
    this.shipperAuthService = new ShipperAuthService();
  }

  /**
   * Register a new shipper account
   * @route POST /api/auth/signup-shipper
   */
  signUpShipper = async (req, res, next) => {
    try {
      const shipper = await this.shipperAuthService.signUpShipper(req.body);

      res.status(API_CODES.CREATED).json(
        ApiResponse.success(
          {
            user: {
              _id: shipper._id,
              email: shipper.email,
              displayName: shipper.displayName,
              role: shipper.role,
              shipperProfile: shipper.shipperProfile,
            },
          },
          "Đăng ký shipper thành công! Bạn có thể đăng nhập ngay."
        )
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get shipper profile
   * @route GET /api/auth/shipper/profile
   */
  getShipperProfile = async (req, res, next) => {
    try {
      const profile = await this.shipperAuthService.getShipperProfile(
        req.user._id
      );

      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ profile }));
    } catch (error) {
      next(error);
    }
  };
}

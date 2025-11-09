// src/modules/customer/customer.controller.js
import { CustomerService } from "./customer.service.js";
import { ApiResponse } from "../../shared/utils/index.js";
import { API_CODES } from "../../shared/constants/index.js";

export class CustomerController {
  constructor() {
    this.customerService = new CustomerService();
  }

  /**
   * Cập nhật các trường trên User model (displayName, phone, avatarUrl)
   */
  updateMyProfile = async (req, res, next) => {
    try {
      const { user } = await this.customerService.updateProfile(
        req.user._id,
        req.body
      );
      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ user }, "Cập nhật hồ sơ thành công."));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Cập nhật Brand Kit (lưu vào CustomerProfile)
   */
  updateMyBrandKit = async (req, res, next) => {
    try {
      const { profile } = await this.customerService.updateBrandKit(
        req.user._id,
        req.body // req.body ở đây là { logos: [...], colors: [...] }
      );
      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success({ profile }, "Cập nhật Brand Kit thành công.")
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Đổi mật khẩu
   */
  changeMyPassword = async (req, res, next) => {
    try {
      const result = await this.customerService.changePassword(
        req.user._id,
        req.body
      );
      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success(result, result.message));
    } catch (error) {
      next(error);
    }
  };
}

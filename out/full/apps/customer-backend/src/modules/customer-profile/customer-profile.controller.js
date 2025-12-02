// src/modules/customer-profile/customer-profile.controller.js
import { CustomerProfileService } from "./customer-profile.service.js";

export class CustomerProfileController {
  constructor() {
    this.service = new CustomerProfileService();
  }

  /**
   * GET /api/customer-profile/addresses
   */
  getSavedAddresses = async (req, res, next) => {
    try {
      const userId = req.user._id;
      const addresses = await this.service.getSavedAddresses(userId);

      res.json({
        success: true,
        data: addresses,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/customer-profile/addresses
   */
  addAddress = async (req, res, next) => {
    try {
      const userId = req.user._id;
      const addressData = req.body;

      const newAddress = await this.service.addAddress(userId, addressData);

      res.status(201).json({
        success: true,
        data: newAddress,
        message: "Đã lưu địa chỉ thành công",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/customer-profile/addresses/:addressId
   */
  updateAddress = async (req, res, next) => {
    try {
      const userId = req.user._id;
      const { addressId } = req.params;
      const updateData = req.body;

      const updatedAddress = await this.service.updateAddress(
        userId,
        addressId,
        updateData
      );

      res.json({
        success: true,
        data: updatedAddress,
        message: "Đã cập nhật địa chỉ thành công",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/customer-profile/addresses/:addressId
   */
  deleteAddress = async (req, res, next) => {
    try {
      const userId = req.user._id;
      const { addressId } = req.params;

      await this.service.deleteAddress(userId, addressId);

      res.json({
        success: true,
        message: "Đã xóa địa chỉ thành công",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/customer-profile/addresses/:addressId/set-default
   */
  setDefaultAddress = async (req, res, next) => {
    try {
      const userId = req.user._id;
      const { addressId } = req.params;

      const address = await this.service.setDefaultAddress(userId, addressId);

      res.json({
        success: true,
        data: address,
        message: "Đã đặt làm địa chỉ mặc định",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/customer-profile/addresses/default
   */
  getDefaultAddress = async (req, res, next) => {
    try {
      const userId = req.user._id;
      const address = await this.service.getDefaultAddress(userId);

      res.json({
        success: true,
        data: address,
      });
    } catch (error) {
      next(error);
    }
  };
}

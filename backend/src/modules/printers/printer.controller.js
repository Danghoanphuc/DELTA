// src/modules/printers/printer.controller.js
import { PrinterService } from "./printer.service.js";
import { ApiResponse } from "../../shared/utils/index.js";
import { API_CODES } from "../../shared/constants/index.js";

export class PrinterController {
  constructor() {
    this.printerService = new PrinterService();
  }

  getMyProfile = async (req, res, next) => {
    try {
      const profile = await this.printerService.getProfile(req.user._id);
      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ profile }));
    } catch (error) {
      next(error);
    }
  };

  updateMyProfile = async (req, res, next) => {
    try {
      const { user, profile } = await this.printerService.updateProfile(
        req.user._id,
        req.body
      );
      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success({ user, profile }, "Cập nhật hồ sơ thành công!")
        );
    } catch (error) {
      next(error);
    }
  };
}

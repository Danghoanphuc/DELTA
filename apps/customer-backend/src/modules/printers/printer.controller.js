// src/modules/printers/printer.controller.js
import { PrinterService } from "./printer.service.js";
import { ApiResponse } from "../../shared/utils/index.js";
import { API_CODES } from "../../shared/constants/index.js";
import { Logger } from "../../shared/utils/logger.util.js";
import { ValidationException } from "../../shared/exceptions/index.js";

export class PrinterController {
  constructor() {
    this.printerService = new PrinterService();
  }

  // (Các hàm cũ: createMyProfile, getMyProfile, updateMyProfile, submitVerificationDocs... giữ nguyên)
  // ...
  createMyProfile = async (req, res, next) => {
    try {
      Logger.debug(
        `[PrinterCtrl] Nhận yêu cầu Onboarding cho User: ${req.user._id}`
      );
      const profile = await this.printerService.createProfile(
        req.user._id,
        req.body
      );
      res
        .status(API_CODES.CREATED)
        .json(ApiResponse.success({ profile }, "Tạo hồ sơ nhà in thành công!"));
    } catch (error) {
      next(error);
    }
  };

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

  submitVerificationDocs = async (req, res, next) => {
    try {
      Logger.debug(
        `[PrinterCtrl] Nhận hồ sơ xác thực từ User: ${req.user._id}`
      );
      if (!req.files) {
        throw new ValidationException("Không có file nào được tải lên.");
      }
      const docUrls = {
        gpkdUrl: req.files.gpkdFile ? req.files.gpkdFile[0].path : undefined,
        cccdUrl: req.files.cccdFile ? req.files.cccdFile[0].path : undefined,
      };
      if (!docUrls.gpkdUrl && !docUrls.cccdUrl) {
        throw new ValidationException("Phải tải lên ít nhất 1 loại tài liệu.");
      }
      const updatedProfile = await this.printerService.submitVerificationDocs(
        req.user._id,
        docUrls
      );
      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success(
            { profile: updatedProfile },
            "Đã nộp hồ sơ. Chúng tôi sẽ duyệt sớm!"
          )
        );
    } catch (error) {
      next(error);
    }
  };
  // ...

  /**
   * HÀM MỚI: Lấy gallery (công khai)
   */
  getPublicGallery = async (req, res, next) => {
    try {
      const gallery = await this.printerService.getPublicGallery(
        req.params.profileId
      );
      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ gallery }));
    } catch (error) {
      next(error);
    }
  };
}

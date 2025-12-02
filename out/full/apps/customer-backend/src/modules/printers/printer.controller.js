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
      
      // ✅ FIX: Validate payload trước khi gọi service
      const { businessName, contactPhone, shopAddress } = req.body;
      
      if (!businessName || !businessName.trim()) {
        throw new ValidationException("Tên doanh nghiệp là bắt buộc");
      }
      if (!contactPhone || !contactPhone.trim()) {
        throw new ValidationException("Số điện thoại liên hệ là bắt buộc");
      }
      if (!shopAddress || !shopAddress.street || !shopAddress.district || !shopAddress.city) {
        throw new ValidationException("Địa chỉ xưởng in là bắt buộc");
      }
      
      // ✅ FIX: Đảm bảo coordinates có giá trị hợp lệ
      if (shopAddress.location && shopAddress.location.coordinates) {
        const [lng, lat] = shopAddress.location.coordinates;
        if (typeof lng !== "number" || typeof lat !== "number" || 
            lng === 0 && lat === 0) {
          // Nếu coordinates không hợp lệ, set default (TP.HCM)
          shopAddress.location.coordinates = [106.6297, 10.8231];
          Logger.warn(`[PrinterCtrl] Coordinates không hợp lệ, sử dụng default: ${shopAddress.location.coordinates}`);
        }
      } else {
        // Nếu không có coordinates, set default
        shopAddress.location = {
          type: "Point",
          coordinates: [106.6297, 10.8231], // Default: TP.HCM
        };
      }
      
      const profile = await this.printerService.createProfile(
        req.user._id,
        req.body
      );
      
      Logger.success(
        `[PrinterCtrl] Đã tạo profile thành công: ${profile._id} cho User: ${req.user._id}`
      );
      
      res
        .status(API_CODES.CREATED)
        .json(ApiResponse.success({ profile }, "Tạo hồ sơ nhà in thành công!"));
    } catch (error) {
      Logger.error(`[PrinterCtrl] Lỗi khi tạo profile:`, error);
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

  /**
   * ✅ FIX: Endpoint kiểm tra profile có tồn tại không
   * @route   GET /api/printers/profile-exists
   * @desc    Check if printer profile exists for current user
   * @access  Private (Printer only)
   */
  checkProfileExists = async (req, res, next) => {
    try {
      const profile = await this.printerService.getProfile(req.user._id);
      if (profile) {
        res.status(API_CODES.SUCCESS).json(ApiResponse.success({ exists: true }));
      } else {
        res.status(API_CODES.NOT_FOUND).json(ApiResponse.error("Profile not found"));
      }
    } catch (error) {
      // Nếu không tìm thấy profile, trả về 404
      if (error.name === "NotFoundException") {
        res.status(API_CODES.NOT_FOUND).json(ApiResponse.error("Profile not found"));
      } else {
        next(error);
      }
    }
  };

  // ============================================
  // ✅ OBJECTIVE 2: PROOFING WORKFLOW ENDPOINTS
  // ============================================
  
  /**
   * Upload proof file for printer order
   */
  uploadProof = async (req, res, next) => {
    try {
      const { orderId } = req.params;
      const { proofUrl, fileName, fileType } = req.body;
      const printerId = req.user.printerProfileId;
      
      Logger.debug(`[PrinterCtrl] 📤 Upload proof request for order ${orderId}`);
      
      if (!proofUrl) {
        throw new ValidationException("proofUrl là bắt buộc");
      }
      
      const result = await this.printerService.uploadProof(orderId, printerId, {
        url: proofUrl,
        fileName,
        fileType,
      });
      
      res.status(API_CODES.SUCCESS).json(ApiResponse.success(result));
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * Get order detail (for printer)
   */
  getOrderDetail = async (req, res, next) => {
    try {
      const { orderId } = req.params;
      const printerId = req.user.printerProfileId;
      
      const order = await this.printerService.getOrderDetail(orderId, printerId);
      
      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ order }));
    } catch (error) {
      next(error);
    }
  };
}

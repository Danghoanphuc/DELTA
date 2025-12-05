// src/modules/organizations/organization.controller.js
import { OrganizationService } from "./organization.service.js";
import { ApiResponse } from "../../shared/utils/index.js";
import { API_CODES } from "../../shared/constants/index.js";
import { Logger } from "../../shared/utils/logger.util.js";
import { ValidationException } from "../../shared/exceptions/index.js";

export class OrganizationController {
  constructor() {
    this.organizationService = new OrganizationService();
  }

  /**
   * ✅ VALUE-FIRST: Register Organization với minimal fields
   * Chỉ cần businessName là đủ để tạo account, các field khác điền sau
   * @route   POST /api/organizations/register
   */
  registerOrganization = async (req, res, next) => {
    try {
      Logger.debug(
        `[OrgCtrl] Nhận yêu cầu đăng ký Organization cho User: ${req.user._id}`
      );

      const { businessName } = req.body;

      // ✅ VALUE-FIRST: Chỉ validate businessName, còn lại optional
      if (!businessName || !businessName.trim()) {
        throw new ValidationException("Tên doanh nghiệp là bắt buộc");
      }

      const profile = await this.organizationService.registerOrganization(
        req.user._id,
        req.body
      );

      Logger.success(
        `[OrgCtrl] Đã đăng ký Organization thành công: ${profile._id} cho User: ${req.user._id}`
      );

      res
        .status(API_CODES.CREATED)
        .json(
          ApiResponse.success({ profile }, "Chào mừng bạn đến với PrintZ!")
        );
    } catch (error) {
      Logger.error(`[OrgCtrl] Lỗi khi đăng ký Organization:`, error);
      next(error);
    }
  };

  /**
   * ✅ NEW: Save usage intent from onboarding wizard
   * @route   PUT /api/organizations/usage-intent
   */
  saveUsageIntent = async (req, res, next) => {
    try {
      const { usageIntent, industry } = req.body;

      Logger.debug(`[OrgCtrl] 📝 Save usage intent for User: ${req.user._id}`);

      const updatedProfile = await this.organizationService.saveUsageIntent(
        req.user._id,
        { usageIntent, industry }
      );

      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success({ profile: updatedProfile }, "Đã lưu thông tin!")
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * ✅ NEW: Invite team members
   * @route   POST /api/organizations/invite-members
   */
  inviteMembers = async (req, res, next) => {
    try {
      const { emails } = req.body;

      Logger.debug(`[OrgCtrl] 📧 Invite members for User: ${req.user._id}`);

      if (!emails || !Array.isArray(emails) || emails.length === 0) {
        throw new ValidationException("Vui lòng nhập ít nhất 1 email");
      }

      const result = await this.organizationService.inviteMembers(
        req.user._id,
        emails
      );

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success(result, "Đã gửi lời mời!"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get my organization profile
   * @route   GET /api/organizations/profile/me
   */
  getMyProfile = async (req, res, next) => {
    try {
      const profile = await this.organizationService.getProfile(req.user._id);
      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ profile }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update my organization profile
   * @route   PUT /api/organizations/profile/me
   */
  updateMyProfile = async (req, res, next) => {
    try {
      const { user, profile } = await this.organizationService.updateProfile(
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

  /**
   * ✅ RENAMED: submitVerificationDocs -> submitBusinessDocs
   * Submit business documents for Net 30 or red invoice
   * @route   PUT /api/organizations/submit-business-docs
   */
  submitBusinessDocs = async (req, res, next) => {
    try {
      Logger.debug(
        `[OrgCtrl] Nhận hồ sơ doanh nghiệp từ User: ${req.user._id}`
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

      const updatedProfile = await this.organizationService.submitBusinessDocs(
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

  /**
   * Check if organization profile exists
   * @route   GET /api/organizations/profile-exists
   */
  checkProfileExists = async (req, res, next) => {
    try {
      const profile = await this.organizationService.getProfile(req.user._id);
      if (profile) {
        res
          .status(API_CODES.SUCCESS)
          .json(ApiResponse.success({ exists: true }));
      } else {
        res
          .status(API_CODES.NOT_FOUND)
          .json(ApiResponse.error("Profile not found"));
      }
    } catch (error) {
      if (error.name === "NotFoundException") {
        res
          .status(API_CODES.NOT_FOUND)
          .json(ApiResponse.success({ exists: false }));
      } else {
        next(error);
      }
    }
  };

  /**
   * ✅ NEW: Upload brand assets (Logo/Vector for Studio)
   * @route   PUT /api/organizations/brand-assets
   */
  uploadBrandAssets = async (req, res, next) => {
    try {
      const { logoUrl, vectorUrl, brandGuidelineUrl } = req.body;

      Logger.debug(
        `[OrgCtrl] 📤 Upload brand assets request for User: ${req.user._id}`
      );

      if (!logoUrl && !vectorUrl && !brandGuidelineUrl) {
        throw new ValidationException(
          "Phải tải lên ít nhất 1 loại tài sản thương hiệu"
        );
      }

      const updatedProfile = await this.organizationService.uploadBrandAssets(
        req.user._id,
        req.body
      );

      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success(
            { profile: updatedProfile },
            "Tải lên tài sản thương hiệu thành công!"
          )
        );
    } catch (error) {
      next(error);
    }
  };
}

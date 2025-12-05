// src/modules/organizations/organization.service.js
// ✅ B2B Organization Service - Refactored from PrinterService

import { OrganizationRepository } from "./organization.repository.js";
import {
  NotFoundException,
  ConflictException,
  ValidationException,
} from "../../shared/exceptions/index.js";
import { Logger } from "../../shared/utils/index.js";
import { CacheService } from "../../shared/services/cache.service.js";

const CACHE_TTL = {
  ORGANIZATION_PROFILE: 7200, // 2 hours
};

export class OrganizationService {
  constructor() {
    this.organizationRepository = new OrganizationRepository();
    this.cacheService = new CacheService();
  }

  _getProfileCacheKey(profileId) {
    return `org:profile:${profileId}`;
  }

  /**
   * ✅ VALUE-FIRST: Register Organization với minimal fields
   * Chỉ cần businessName, các field khác optional và điền sau
   */
  async registerOrganization(userId, profileData) {
    Logger.debug(`[OrgSvc] Bắt đầu đăng ký Organization cho User: ${userId}`);

    const {
      businessName,
      taxCode,
      contactPhone,
      billingAddress,
      industry,
      usageIntent,
      logoUrl,
    } = profileData;

    // Validate user exists
    const user = await this.organizationRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundException("Không tìm thấy người dùng", userId);
    }

    // Check if user already has organization profile
    if (user.organizationProfileId) {
      Logger.warn(
        `[OrgSvc] User ${userId} đã có organizationProfileId. Báo lỗi Conflict.`
      );
      throw new ConflictException(
        "Tài khoản này đã được liên kết với một tổ chức."
      );
    }

    // Check for orphaned profile
    const existingProfile =
      await this.organizationRepository.findProfileByUserId(userId);
    if (existingProfile) {
      Logger.warn(
        `[OrgSvc] User ${userId} có profile mồ côi (ID: ${existingProfile._id}). Đang liên kết lại...`
      );
      try {
        await this.organizationRepository.updateUser(userId, {
          organizationProfileId: existingProfile._id,
        });
      } catch (updateError) {
        Logger.error(
          `[OrgSvc] Lỗi nghiêm trọng khi đang "chữa lành" user ${userId}:`,
          updateError
        );
        throw updateError;
      }
      throw new ConflictException(
        "Phát hiện hồ sơ tổ chức đã tồn tại. Đang đồng bộ lại, vui lòng tải lại trang."
      );
    }

    // ✅ VALUE-FIRST: Chỉ check taxCode nếu có nhập
    if (taxCode) {
      const existingTaxCode =
        await this.organizationRepository.findProfileByTaxCode(taxCode);
      if (existingTaxCode) {
        throw new ConflictException(
          "Mã số thuế này đã được đăng ký bởi tổ chức khác."
        );
      }
    }

    // ✅ VALUE-FIRST: Create profile với minimal required fields
    const newProfile = await this.organizationRepository.createProfile({
      user: userId,
      businessName,
      // Optional fields - điền sau khi checkout hoặc billing
      taxCode: taxCode || null,
      contactPhone: contactPhone || null,
      billingAddress: billingAddress || null,
      industry: industry || null,
      usageIntent: usageIntent || null,
      logoUrl: logoUrl || null,
      // ✅ VALUE-FIRST: Active ngay lập tức, không cần duyệt
      isVerified: false,
      isActive: true,
      verificationStatus: "unverified", // Đổi từ 'not_submitted' -> 'unverified'
      credits: 0,
    });

    // Link profile to user
    await this.organizationRepository.updateUser(userId, {
      organizationProfileId: newProfile._id,
    });

    Logger.success(
      `[OrgSvc] Đăng ký Organization thành công cho User: ${userId}, Profile: ${newProfile._id}`
    );

    return newProfile;
  }

  /**
   * ✅ NEW: Save usage intent from onboarding wizard (Step 1)
   */
  async saveUsageIntent(userId, intentData) {
    Logger.debug(`[OrgSvc] 📝 Saving usage intent for User: ${userId}`);

    const { usageIntent, industry } = intentData;

    const profile = await this.getProfile(userId);

    if (usageIntent) profile.usageIntent = usageIntent;
    if (industry) profile.industry = industry;

    const updatedProfile = await profile.save();

    // Invalidate cache
    const cacheKey = this._getProfileCacheKey(updatedProfile._id);
    await this.cacheService.clear(cacheKey);

    Logger.success(`[OrgSvc] ✅ Usage intent saved for User: ${userId}`);
    return updatedProfile;
  }

  /**
   * ✅ NEW: Invite team members (Step 3 of wizard)
   */
  async inviteMembers(userId, emails) {
    Logger.debug(`[OrgSvc] 📧 Inviting members for User: ${userId}`, emails);

    const profile = await this.getProfile(userId);

    // Store pending invites
    if (!profile.pendingInvites) {
      profile.pendingInvites = [];
    }

    const newInvites = emails.map((email) => ({
      email: email.toLowerCase().trim(),
      invitedAt: new Date(),
      status: "pending",
    }));

    profile.pendingInvites.push(...newInvites);
    await profile.save();

    // TODO: Send invitation emails via email service
    // await emailService.sendTeamInvites(profile, emails);

    Logger.success(
      `[OrgSvc] ✅ Invited ${emails.length} members for Org: ${profile._id}`
    );

    return {
      invited: emails.length,
      emails,
    };
  }

  /**
   * Get organization profile (with cache)
   */
  async getProfile(userId) {
    const user = await this.organizationRepository.findUserById(userId);
    if (!user) throw new NotFoundException("User", userId);

    const profileId = user.organizationProfileId;
    if (!profileId) {
      throw new NotFoundException(
        "Không tìm thấy hồ sơ tổ chức cho người dùng này."
      );
    }

    const cacheKey = this._getProfileCacheKey(profileId);
    const profile = await this.cacheService.getOrSet(
      cacheKey,
      CACHE_TTL.ORGANIZATION_PROFILE,
      () => {
        Logger.debug(
          `[Cache Miss] Đang gọi DB cho organization profile: ${profileId}`
        );
        return this.organizationRepository.findProfileById(profileId);
      }
    );

    if (!profile) {
      await this.cacheService.clear(cacheKey);
      throw new NotFoundException("Hồ sơ tổ chức", profileId);
    }

    return profile;
  }

  /**
   * Update organization profile (with cache invalidation)
   */
  async updateProfile(userId, updateData) {
    const { displayName, phone, ...profileFields } = updateData;

    const userFieldsToUpdate = {};
    if (displayName) userFieldsToUpdate.displayName = displayName;
    if (phone) userFieldsToUpdate.phone = phone;

    // Update User
    const updatedUser = await this.organizationRepository.updateUser(
      userId,
      userFieldsToUpdate
    );

    // Update Organization Profile
    const updatedProfile =
      await this.organizationRepository.updateProfileByUserId(
        userId,
        profileFields
      );

    // Invalidate cache
    if (updatedProfile) {
      const cacheKey = this._getProfileCacheKey(updatedProfile._id);
      await this.cacheService.clear(cacheKey);
      Logger.info(
        `[Cache Invalidate] Đã xóa cache cho organization profile: ${cacheKey}`
      );
    }

    return { user: updatedUser, profile: updatedProfile };
  }

  /**
   * ✅ RENAMED: submitVerificationDocs -> submitBusinessDocs
   * Submit business documents for Net 30 payment terms or red invoice
   */
  async submitBusinessDocs(userId, docUrls) {
    Logger.debug(
      `[OrgSvc] User ${userId} đang nộp hồ sơ doanh nghiệp...`,
      docUrls
    );

    const { gpkdUrl, cccdUrl } = docUrls;
    if (!gpkdUrl && !cccdUrl) {
      throw new ValidationException("Phải tải lên ít nhất 1 loại tài liệu.");
    }

    const profile = await this.getProfile(userId);

    profile.verificationDocs = { gpkdUrl, cccdUrl };
    profile.verificationStatus = "pending_review";
    profile.isVerified = false;

    const updatedProfile = await profile.save();

    // Invalidate cache
    const cacheKey = this._getProfileCacheKey(updatedProfile._id);
    await this.cacheService.clear(cacheKey);
    Logger.info(
      `[Cache Invalidate] Đã xóa cache cho organization profile (do submit docs): ${cacheKey}`
    );

    Logger.success(
      `[OrgSvc] User ${userId} đã nộp hồ sơ. Chuyển sang 'pending_review'.`
    );
    return updatedProfile;
  }

  /**
   * ✅ NEW: Upload brand assets (Logo/Vector for Studio)
   * Replace old uploadProof function
   */
  async uploadBrandAssets(userId, assetData) {
    Logger.debug(`[OrgSvc] 📤 Uploading brand assets for User: ${userId}`);

    const { logoUrl, vectorUrl, brandGuidelineUrl } = assetData;

    if (!logoUrl && !vectorUrl && !brandGuidelineUrl) {
      throw new ValidationException(
        "Phải tải lên ít nhất 1 loại tài sản thương hiệu."
      );
    }

    const profile = await this.getProfile(userId);

    // Update brand assets
    if (logoUrl) profile.logoUrl = logoUrl;
    if (vectorUrl) profile.vectorUrl = vectorUrl;
    if (brandGuidelineUrl) profile.brandGuidelineUrl = brandGuidelineUrl;

    const updatedProfile = await profile.save();

    // Invalidate cache
    const cacheKey = this._getProfileCacheKey(updatedProfile._id);
    await this.cacheService.clear(cacheKey);
    Logger.info(
      `[Cache Invalidate] Đã xóa cache cho organization profile (do upload assets): ${cacheKey}`
    );

    Logger.success(`[OrgSvc] ✅ Brand assets uploaded for User: ${userId}`);
    return updatedProfile;
  }
}

// src/modules/printers/printer.service.js
import { PrinterRepository } from "./printer.repository.js";
import {
  NotFoundException,
  ConflictException,
  ForbiddenException,
  ValidationException,
} from "../../shared/exceptions/index.js";
import { Logger } from "../../shared/utils/index.js";

export class PrinterService {
  constructor() {
    this.printerRepository = new PrinterRepository();
  }

  // (Các hàm cũ: createProfile, getProfile, updateProfile, submitVerificationDocs... giữ nguyên)
  // ...
  async createProfile(userId, profileData) {
    // ... (logic onboarding)
    Logger.debug(`[PrinterSvc] Bắt đầu onboarding cho User: ${userId}`);
    const { businessName, contactPhone, shopAddress, logoUrl, coverImage } =
      profileData;
    const user = await this.printerRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundException("Không tìm thấy người dùng", userId);
    }
    if (user.printerProfileId) {
      Logger.warn(
        `[PrinterSvc] User ${userId} đã có printerProfileId. Báo lỗi Conflict.`
      );
      throw new ConflictException(
        "Tài khoản này đã được liên kết với một xưởng in."
      );
    }
    const existingProfile = await this.printerRepository.findProfileByUserId(
      userId
    );
    if (existingProfile) {
      Logger.warn(
        `[PrinterSvc] User ${userId} có profile mồ côi (ID: ${existingProfile._id}). Đang liên kết lại...`
      );
      try {
        await this.printerRepository.updateUser(userId, {
          printerProfileId: existingProfile._id,
        });
      } catch (updateError) {
        Logger.error(
          `[PrinterSvc] Lỗi nghiêm trọng khi đang "chữa lành" user ${userId}:`,
          updateError
        );
        throw updateError;
      }
      throw new ConflictException(
        "Phát hiện hồ sơ nhà in đã tồn tại. Đang đồng bộ lại, vui lòng tải lại trang."
      );
    }
    const newProfile = await this.printerRepository.createProfile({
      userId,
      businessName,
      contactPhone,
      shopAddress,
      logoUrl,
      coverImage,
      isVerified: false,
      isActive: true,
      verificationStatus: "not_submitted",
    });
    await this.printerRepository.updateUser(userId, {
      printerProfileId: newProfile._id,
    });
    Logger.success(
      `[PrinterSvc] Onboarding thành công cho User: ${userId}, Profile: ${newProfile._id}`
    );
    return newProfile;
  }

  async getProfile(userId) {
    const user = await this.printerRepository.findUserById(userId);
    if (!user) throw new NotFoundException("User", userId);
    const profileId = user.printerProfileId;
    if (!profileId) {
      throw new NotFoundException(
        "Không tìm thấy hồ sơ nhà in cho người dùng này."
      );
    }
    const profile = await this.printerRepository.findProfileById(profileId);
    if (!profile) {
      throw new NotFoundException("Hồ sơ nhà in", profileId);
    }
    return profile;
  }

  async updateProfile(userId, updateData) {
    const { displayName, phone, ...profileFields } = updateData;
    const userFieldsToUpdate = {};
    if (displayName) userFieldsToUpdate.displayName = displayName;
    if (phone) userFieldsToUpdate.phone = phone;
    const updatedUser = await this.printerRepository.updateUser(
      userId,
      userFieldsToUpdate
    );
    const updatedProfile = await this.printerRepository.updateProfileByUserId(
      userId,
      profileFields
    );
    return { user: updatedUser, profile: updatedProfile };
  }

  async submitVerificationDocs(userId, docUrls) {
    Logger.debug(
      `[PrinterSvc] User ${userId} đang nộp hồ sơ xác thực...`,
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
    Logger.success(
      `[PrinterSvc] User ${userId} đã nộp hồ sơ. Chuyển sang 'pending_review'.`
    );
    return updatedProfile;
  }
  // ...

  /**
   * HÀM MỚI: Lấy dữ liệu "nặng" công khai
   */
  async getPublicGallery(profileId) {
    const gallery = await this.printerRepository.findGalleryById(profileId);
    if (!gallery) {
      throw new NotFoundException(
        "Không tìm thấy gallery cho nhà in",
        profileId
      );
    }
    return gallery;
  }
}

// src/modules/printers/printer.service.js
// BÀN GIAO: Đã sửa lỗi logic "chữa lành" (healing)

import { PrinterRepository } from "./printer.repository.js";
import {
  NotFoundException,
  ConflictException,
  ForbiddenException,
  ValidationException, // ✅ Thêm
} from "../../shared/exceptions/index.js";
import { Logger } from "../../shared/utils/index.js";

export class PrinterService {
  constructor() {
    this.printerRepository = new PrinterRepository();
  }

  /**
   * ✅ GIAI ĐOẠN 1: Nâng cấp hàm Onboarding (ĐÃ SỬA LỖI HEALING)
   */
  async createProfile(userId, profileData) {
    Logger.debug(`[PrinterSvc] Bắt đầu onboarding cho User: ${userId}`);
    const { businessName, contactPhone, shopAddress, logoUrl, coverImage } =
      profileData;

    // 1. Kiểm tra User
    const user = await this.printerRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundException("Không tìm thấy người dùng", userId);
    }

    // ==========================================================
    // ✅ SỬA LỖI LOGIC: KIỂM TRA 2 CHIỀU (ROBUST CHECK)
    // ==========================================================

    // 2a. Kiểm tra xem User model có liên kết không
    if (user.printerProfileId) {
      Logger.warn(
        `[PrinterSvc] User ${userId} đã có printerProfileId. Báo lỗi Conflict.`
      );
      throw new ConflictException(
        "Tài khoản này đã được liên kết với một xưởng in."
      );
    }

    // 2b. (FIX) Kiểm tra xem có Profile "mồ côi" nào đã tồn tại không
    const existingProfile = await this.printerRepository.findProfileByUserId(
      userId
    );
    if (existingProfile) {
      Logger.warn(
        `[PrinterSvc] User ${userId} có profile mồ côi (ID: ${existingProfile._id}). Đang liên kết lại...`
      );

      // ==========================================================
      // ✅✅✅ SỬA LỖI 400 TẠI ĐÂY ✅✅✅
      // Thay vì dùng user.save() (validate toàn bộ doc),
      // chúng ta dùng updateUser() (chỉ update 1 trường)
      // ==========================================================
      try {
        await this.printerRepository.updateUser(userId, {
          printerProfileId: existingProfile._id,
        });
      } catch (updateError) {
        // Nếu bản thân việc update này cũng lỗi (ví dụ Mongoose lỗi)
        Logger.error(
          `[PrinterSvc] Lỗi nghiêm trọng khi đang "chữa lành" user ${userId}:`,
          updateError
        );
        throw updateError; // Ném lỗi ra ngoài
      }

      // Báo lỗi thân thiện để user tải lại trang
      throw new ConflictException(
        "Phát hiện hồ sơ nhà in đã tồn tại. Đang đồng bộ lại, vui lòng tải lại trang."
      );
    }
    // ==========================================================
    // (Kết thúc sửa lỗi)
    // ==========================================================

    // 3. Tạo PrinterProfile (Chỉ chạy nếu cả 2 check trên đều qua)
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

    // 4. Liên kết profile mới với User
    // (Lần này dùng updateUser thay vì save để đảm bảo an toàn)
    await this.printerRepository.updateUser(userId, {
      printerProfileId: newProfile._id,
    });
    // user.printerProfileId = newProfile._id;
    // await user.save(); // <-- Dòng này đã bị thay thế

    Logger.success(
      `[PrinterSvc] Onboarding thành công cho User: ${userId}, Profile: ${newProfile._id}`
    );

    return newProfile;
  }

  // (Hàm getProfile giữ nguyên)
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

  // (Hàm updateProfile giữ nguyên)
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

  // (Hàm submitVerificationDocs giữ nguyên)
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
}

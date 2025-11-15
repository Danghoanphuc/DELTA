// src/modules/printers/printer.repository.js
import { User } from "../../shared/models/user.model.js";
import { PrinterProfile } from "../../shared/models/printer-profile.model.js";

export class PrinterRepository {
  // (Các hàm cũ: findUserById, createProfile, findProfileById... giữ nguyên)
  async findUserById(userId) {
    return await User.findById(userId);
  }
  async createProfile(profileData) {
    return await PrinterProfile.create(profileData);
  }
  async findProfileById(profileId) {
    return await PrinterProfile.findById(profileId);
  }
  async findProfileByUserId(userId) {
    // ✅ FIX: Tìm bằng 'user' field (ref)
    return await PrinterProfile.findOne({ user: userId });
  }
  async updateUser(userId, userFields) {
    if (Object.keys(userFields).length === 0) {
      return await User.findById(userId).select("-hashedPassword");
    }
    return await User.findByIdAndUpdate(
      userId,
      { $set: userFields },
      { new: true }
    ).select("-hashedPassword");
  }
  async updateProfileByUserId(userId, profileFields) {
    if (Object.keys(profileFields).length === 0) {
      return await this.findProfileByUserId(userId);
    }
    // ✅ FIX: Tìm bằng 'user' field (ref)
    return await PrinterProfile.findOneAndUpdate(
      { user: userId },
      { $set: profileFields },
      { new: true, runValidators: true }
    );
  }

  /**
   * HÀM MỚI: Chỉ lấy các trường "nặng" (gallery)
   */
  async findGalleryById(profileId) {
    return await PrinterProfile.findById(profileId).select(
      "factoryImages factoryVideoUrl" // Chỉ chọn 2 trường này
    );
  }
}

// src/modules/printers/printer.repository.js
import { User } from "../../shared/models/user.model.js";
import { PrinterProfile } from "../../shared/models/printer-profile.model.js";

export class PrinterRepository {
  // ✅ HÀM MỚI
  async findUserById(userId) {
    return await User.findById(userId); // Cần lấy user đầy đủ
  }

  // ✅ HÀM MỚI
  async createProfile(profileData) {
    return await PrinterProfile.create(profileData);
  }

  // ✅ SỬA: Tìm bằng profileId
  async findProfileById(profileId) {
    return await PrinterProfile.findById(profileId);
  }

  // (Hàm này giữ nguyên)
  async findProfileByUserId(userId) {
    return await PrinterProfile.findOne({ userId });
  }

  // (Hàm này giữ nguyên)
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

  // ✅ SỬA: Đổi tên hàm cho rõ ràng
  async updateProfileByUserId(userId, profileFields) {
    if (Object.keys(profileFields).length === 0) {
      return await this.findProfileByUserId(userId);
    }
    return await PrinterProfile.findOneAndUpdate(
      { userId: userId },
      { $set: profileFields },
      { new: true, runValidators: true, upsert: true }
    );
  }
}

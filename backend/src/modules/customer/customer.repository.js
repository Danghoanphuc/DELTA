// src/modules/customer/customer.repository.js
import { User } from "../../shared/models/user.model.js";
import { CustomerProfile } from "../../shared/models/customer-profile.model.js";

export class CustomerRepository {
  /**
   * Lấy CustomerProfile bằng UserId
   */
  async findProfileByUserId(userId) {
    return await CustomerProfile.findOne({ userId });
  }

  /**
   * Cập nhật User (chỉ các trường an toàn)
   */
  async updateUser(userId, userData) {
    const safeData = {
      displayName: userData.displayName,
      phone: userData.phone,
      avatarUrl: userData.avatarUrl,
    };

    // Lọc ra các trường undefined
    Object.keys(safeData).forEach(
      (key) => safeData[key] === undefined && delete safeData[key]
    );

    if (Object.keys(safeData).length === 0) {
      return await User.findById(userId).select("-hashedPassword");
    }

    return await User.findByIdAndUpdate(
      userId,
      { $set: safeData },
      { new: true, runValidators: true }
    ).select("-hashedPassword");
  }

  /**
   * Cập nhật CustomerProfile
   */
  async updateProfile(userId, profileData) {
    // (Sau này sẽ mở rộng: savedAddresses, brandKit)
    const { brandKit } = profileData;

    const safeData = {
      brandKit: brandKit,
    };

    // Lọc ra các trường undefined
    Object.keys(safeData).forEach(
      (key) => safeData[key] === undefined && delete safeData[key]
    );

    if (Object.keys(safeData).length === 0) {
      return await this.findProfileByUserId(userId);
    }

    return await CustomerProfile.findOneAndUpdate(
      { userId: userId },
      { $set: safeData },
      { new: true, runValidators: true }
    );
  }
}

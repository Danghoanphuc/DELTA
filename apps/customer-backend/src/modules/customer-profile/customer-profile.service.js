// src/modules/customer-profile/customer-profile.service.js
import { CustomerProfile } from "../../shared/models/customer-profile.model.js";
import { NotFoundException } from "../../shared/exceptions/index.js";

export class CustomerProfileService {
  /**
   * Lấy hoặc tạo profile của customer
   */
  async getOrCreateProfile(userId) {
    let profile = await CustomerProfile.findOne({ userId });

    if (!profile) {
      profile = await CustomerProfile.create({
        userId,
        savedAddresses: [],
        brandKit: { logos: [], colors: [], fonts: [] },
      });
    }

    return profile;
  }

  /**
   * Lấy tất cả địa chỉ đã lưu
   */
  async getSavedAddresses(userId) {
    const profile = await this.getOrCreateProfile(userId);
    return profile.savedAddresses || [];
  }

  /**
   * Thêm địa chỉ mới
   */
  async addAddress(userId, addressData) {
    const profile = await this.getOrCreateProfile(userId);

    // Nếu đây là địa chỉ đầu tiên hoặc được đánh dấu mặc định
    if (addressData.isDefault || profile.savedAddresses.length === 0) {
      // Bỏ default của các địa chỉ khác
      profile.savedAddresses.forEach((addr) => {
        addr.isDefault = false;
      });
      addressData.isDefault = true;
    }

    profile.savedAddresses.push(addressData);
    await profile.save();

    return profile.savedAddresses[profile.savedAddresses.length - 1];
  }

  /**
   * Cập nhật địa chỉ
   */
  async updateAddress(userId, addressId, updateData) {
    const profile = await this.getOrCreateProfile(userId);

    const address = profile.savedAddresses.id(addressId);
    if (!address) {
      throw new NotFoundException("Địa chỉ", addressId);
    }

    // Nếu set làm default, bỏ default của các địa chỉ khác
    if (updateData.isDefault) {
      profile.savedAddresses.forEach((addr) => {
        if (addr._id.toString() !== addressId) {
          addr.isDefault = false;
        }
      });
    }

    Object.assign(address, updateData);
    await profile.save();

    return address;
  }

  /**
   * Xóa địa chỉ
   */
  async deleteAddress(userId, addressId) {
    const profile = await this.getOrCreateProfile(userId);

    const address = profile.savedAddresses.id(addressId);
    if (!address) {
      throw new NotFoundException("Địa chỉ", addressId);
    }

    const wasDefault = address.isDefault;
    address.deleteOne();

    // Nếu xóa địa chỉ default và còn địa chỉ khác, set địa chỉ đầu tiên làm default
    if (wasDefault && profile.savedAddresses.length > 0) {
      profile.savedAddresses[0].isDefault = true;
    }

    await profile.save();
    return { success: true };
  }

  /**
   * Đặt địa chỉ mặc định
   */
  async setDefaultAddress(userId, addressId) {
    const profile = await this.getOrCreateProfile(userId);

    const address = profile.savedAddresses.id(addressId);
    if (!address) {
      throw new NotFoundException("Địa chỉ", addressId);
    }

    // Bỏ default của tất cả
    profile.savedAddresses.forEach((addr) => {
      addr.isDefault = false;
    });

    // Set địa chỉ này làm default
    address.isDefault = true;
    await profile.save();

    return address;
  }

  /**
   * Lấy địa chỉ mặc định
   */
  async getDefaultAddress(userId) {
    const profile = await this.getOrCreateProfile(userId);
    return profile.savedAddresses.find((addr) => addr.isDefault) || null;
  }
}

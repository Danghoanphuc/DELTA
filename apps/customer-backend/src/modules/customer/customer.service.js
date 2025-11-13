// src/modules/customer/customer.service.js
import { CustomerRepository } from "./customer.repository.js";
import { AuthRepository } from "../auth/auth.repository.js";
import { Logger } from "../../shared/utils/index.js";
import bcrypt from "bcrypt";
import {
  ValidationException,
  UnauthorizedException,
} from "../../shared/exceptions/index.js";

export class CustomerService {
  constructor() {
    this.customerRepo = new CustomerRepository();
    this.authRepo = new AuthRepository(); // Dùng để đổi mật khẩu
  }

  /**
   * Cập nhật hồ sơ (displayName, phone, avatarUrl)
   */
  async updateProfile(userId, profileData) {
    const { displayName, phone, avatarUrl } = profileData;

    // Service này chỉ cập nhật User model
    const user = await this.customerRepo.updateUser(userId, {
      displayName,
      phone,
      avatarUrl,
    });

    Logger.success(`[CustomerSvc] Cập nhật hồ sơ cho User ${userId}`);
    return { user };
  }

  /**
   * Cập nhật Brand Kit
   */
  async updateBrandKit(userId, brandKitData) {
    const profile = await this.customerRepo.updateProfile(userId, {
      brandKit: brandKitData,
    });

    Logger.success(`[CustomerSvc] Cập nhật Brand Kit cho User ${userId}`);
    return { profile };
  }

  /**
   * Đổi mật khẩu
   */
  async changePassword(userId, passwordData) {
    const { currentPassword, newPassword } = passwordData;

    if (!currentPassword || !newPassword) {
      throw new ValidationException(
        "Thiếu mật khẩu hiện tại hoặc mật khẩu mới."
      );
    }

    // 1. Lấy user CÓ KÈM hashedPassword
    const user = await this.authRepo.findUserByEmail(
      user.email,
      "+hashedPassword"
    );
    if (!user) {
      throw new UnauthorizedException("Không tìm thấy user.");
    }

    // 2. Kiểm tra mật khẩu hiện tại
    const isMatch = await bcrypt.compare(currentPassword, user.hashedPassword);
    if (!isMatch) {
      throw new UnauthorizedException("Mật khẩu hiện tại không đúng.");
    }

    // 3. Hash và lưu mật khẩu mới
    user.hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.save();

    Logger.success(`[CustomerSvc] Đổi mật khẩu thành công cho User ${userId}`);
    return { message: "Đổi mật khẩu thành công." };
  }
}

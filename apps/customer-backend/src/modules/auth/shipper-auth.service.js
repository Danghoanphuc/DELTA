// apps/customer-backend/src/modules/auth/shipper-auth.service.js
/**
 * Shipper Authentication Service
 * Handles shipper registration and profile management
 */

import { User } from "../../shared/models/user.model.js";
import { ShipperProfile } from "../../shared/models/shipper-profile.model.js";
import { generateUniqueUsername } from "../../shared/utils/username.util.js";
import {
  ValidationException,
  ConflictException,
  NotFoundException,
} from "../../shared/exceptions/index.js";
import { Logger } from "../../shared/utils/index.js";

export class ShipperAuthService {
  /**
   * Validate password strength
   */
  validatePassword(password) {
    if (!password) {
      throw new ValidationException("Mật khẩu là bắt buộc");
    }

    if (password.length < 8) {
      throw new ValidationException("Mật khẩu phải có ít nhất 8 ký tự");
    }

    if (password.length > 128) {
      throw new ValidationException("Mật khẩu không được quá 128 ký tự");
    }

    if (!/[A-Z]/.test(password)) {
      throw new ValidationException(
        "Mật khẩu phải có ít nhất 1 chữ cái viết hoa"
      );
    }

    if (!/[a-z]/.test(password)) {
      throw new ValidationException(
        "Mật khẩu phải có ít nhất 1 chữ cái viết thường"
      );
    }

    if (!/[0-9]/.test(password)) {
      throw new ValidationException("Mật khẩu phải có ít nhất 1 chữ số");
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      throw new ValidationException(
        "Mật khẩu phải có ít nhất 1 ký tự đặc biệt (!@#$%^&*...)"
      );
    }

    return true;
  }

  /**
   * Register a new shipper account
   * @param {Object} body - Registration data
   * @returns {Promise<User>}
   */
  async signUpShipper(body) {
    const {
      email,
      password,
      displayName,
      phoneNumber,
      vehicleType = "motorbike",
      vehiclePlate = "",
    } = body;

    // Validate required fields
    if (!email || !password || !displayName) {
      throw new ValidationException(
        "Thiếu thông tin email, mật khẩu hoặc tên hiển thị"
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationException("Email không hợp lệ");
    }

    // Validate password strength
    this.validatePassword(password);

    // Validate displayName
    if (displayName.trim().length < 2) {
      throw new ValidationException("Tên hiển thị phải có ít nhất 2 ký tự");
    }

    if (displayName.trim().length > 50) {
      throw new ValidationException("Tên hiển thị không được quá 50 ký tự");
    }

    // Validate phone number (optional but recommended)
    if (phoneNumber && !/^[0-9]{10,11}$/.test(phoneNumber)) {
      throw new ValidationException("Số điện thoại không hợp lệ (10-11 số)");
    }

    // Validate vehicle type
    const validVehicleTypes = ["motorbike", "car", "bicycle", "walking"];
    if (!validVehicleTypes.includes(vehicleType)) {
      throw new ValidationException("Loại phương tiện không hợp lệ");
    }

    // Check for duplicate email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ConflictException("Email này đã được sử dụng");
    }

    try {
      const username = await generateUniqueUsername(email);

      // Step 1: Create shipper user
      const newShipper = new User({
        email,
        username,
        displayName: displayName.trim(),
        hashedPassword: password, // Will be hashed by pre-save hook
        authMethod: "local",
        isVerified: true, // Auto-verify for testing
        isActive: true,
      });

      // Step 2: Create ShipperProfile
      const shipperProfile = new ShipperProfile({
        userId: newShipper._id,
        vehicleType,
        vehiclePlate: vehiclePlate || "",
        phoneNumber: phoneNumber || "0000000000", // Default phone if not provided
        isActive: true,
        totalDeliveries: 0,
        rating: 5.0,
      });

      // Step 3: Link profile to user
      newShipper.shipperProfileId = shipperProfile._id;

      // Step 4: Save both
      await newShipper.save();
      await shipperProfile.save();

      Logger.success(`[ShipperAuth] New shipper created: ${newShipper.email}`);
      Logger.success(
        `[ShipperAuth] ShipperProfile created: ${shipperProfile._id}`
      );

      return newShipper;
    } catch (error) {
      Logger.error(`[ShipperAuth] Sign up error:`, error);
      throw error;
    }
  }

  /**
   * Get shipper profile by user ID
   * @param {ObjectId} userId - User ID
   * @returns {Promise<Object>}
   */
  async getShipperProfile(userId) {
    const user = await User.findById(userId)
      .populate("shipperProfileId")
      .lean();

    if (!user) {
      throw new NotFoundException("User", userId);
    }

    if (!user.shipperProfileId) {
      throw new ValidationException("Tài khoản này không phải là shipper");
    }

    return {
      _id: user._id,
      email: user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      shipperProfile: user.shipperProfileId,
      createdAt: user.createdAt,
    };
  }
}

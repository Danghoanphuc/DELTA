// src/modules/printers/printer.service.js
// ✅ BÀN GIAO: Tích hợp CacheService (P1)

import { PrinterRepository } from "./printer.repository.js";
import {
  NotFoundException,
  ConflictException,
  ForbiddenException,
  ValidationException,
} from "../../shared/exceptions/index.js";
import { Logger } from "../../shared/utils/index.js";

// ✅ BƯỚC 1: Import CacheService
import { CacheService } from "../../shared/services/cache.service.js";

// ✅ BƯỚC 2: Định nghĩa TTL (Time-to-Live)
const CACHE_TTL = {
  PRINTER_PROFILE: 7200, // 2 giờ
};

export class PrinterService {
  constructor() {
    this.printerRepository = new PrinterRepository();
    // ✅ BƯỚC 3: Khởi tạo CacheService
    this.cacheService = new CacheService();
  }

  // ✅ BƯỚC 4: Helper tạo cache key
  _getProfileCacheKey(profileId) {
    return `printer:profile:${profileId}`;
  }

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
    // ✅ FIX: Sử dụng 'user' thay vì 'userId' để populate được
    const newProfile = await this.printerRepository.createProfile({
      user: userId, // Mongoose ref đến User
      businessName,
      contactPhone,
      shopAddress,
      logoUrl: logoUrl || null,
      coverImage: coverImage || null,
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

    // Không cần xóa cache ở đây vì đây là profile mới
    return newProfile;
  }

  /**
   * ✅ ĐÃ TÍCH HỢP CACHE (P1)
   */
  async getProfile(userId) {
    const user = await this.printerRepository.findUserById(userId);
    if (!user) throw new NotFoundException("User", userId);

    const profileId = user.printerProfileId;
    if (!profileId) {
      throw new NotFoundException(
        "Không tìm thấy hồ sơ nhà in cho người dùng này."
      );
    }

    // ✅ BƯỚC 5: Dùng CacheService
    const cacheKey = this._getProfileCacheKey(profileId);
    const profile = await this.cacheService.getOrSet(
      cacheKey,
      CACHE_TTL.PRINTER_PROFILE,
      () => {
        // Hàm này chỉ chạy khi cache miss
        Logger.debug(`[Cache Miss] Đang gọi DB cho profile: ${profileId}`);
        return this.printerRepository.findProfileById(profileId);
      }
    );

    if (!profile) {
      // Nếu không tìm thấy, cũng xóa cache (để tránh cache 404)
      await this.cacheService.clear(cacheKey);
      throw new NotFoundException("Hồ sơ nhà in", profileId);
    }

    return profile;
  }

  /**
   * ✅ ĐÃ TÍCH HỢP CACHE (INVALIDATION)
   */
  async updateProfile(userId, updateData) {
    const { displayName, phone, ...profileFields } = updateData;

    const userFieldsToUpdate = {};
    if (displayName) userFieldsToUpdate.displayName = displayName;
    if (phone) userFieldsToUpdate.phone = phone;

    // Cập nhật User (không cần cache)
    const updatedUser = await this.printerRepository.updateUser(
      userId,
      userFieldsToUpdate
    );

    // Cập nhật Profile
    const updatedProfile = await this.printerRepository.updateProfileByUserId(
      userId,
      profileFields
    );

    // ✅ BƯỚC 6: Xóa cache của profile này
    if (updatedProfile) {
      const cacheKey = this._getProfileCacheKey(updatedProfile._id);
      await this.cacheService.clear(cacheKey);
      Logger.info(`[Cache Invalidate] Đã xóa cache cho profile: ${cacheKey}`);
    }

    return { user: updatedUser, profile: updatedProfile };
  }

  /**
   * ✅ ĐÃ TÍCH HỢP CACHE (INVALIDATION)
   */
  async submitVerificationDocs(userId, docUrls) {
    Logger.debug(
      `[PrinterSvc] User ${userId} đang nộp hồ sơ xác thực...`,
      docUrls
    );
    const { gpkdUrl, cccdUrl } = docUrls;
    if (!gpkdUrl && !cccdUrl) {
      throw new ValidationException("Phải tải lên ít nhất 1 loại tài liệu.");
    }
    const profile = await this.getProfile(userId); // Dùng hàm getProfile đã có cache

    profile.verificationDocs = { gpkdUrl, cccdUrl };
    profile.verificationStatus = "pending_review";
    profile.isVerified = false; // Đặt lại thành false khi nộp lại

    const updatedProfile = await profile.save();

    // ✅ BƯỚC 6: Xóa cache của profile này
    const cacheKey = this._getProfileCacheKey(updatedProfile._id);
    await this.cacheService.clear(cacheKey);
    Logger.info(
      `[Cache Invalidate] Đã xóa cache cho profile (do submit docs): ${cacheKey}`
    );

    Logger.success(
      `[PrinterSvc] User ${userId} đã nộp hồ sơ. Chuyển sang 'pending_review'.`
    );
    return updatedProfile;
  }

  /**
   * HÀM MỚI: Lấy gallery (công khai)
   * (Hàm này lấy dữ liệu "nặng", không cache chung với profile)
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

  // ============================================
  // ✅ OBJECTIVE 2: PROOFING WORKFLOW
  // ============================================
  
  /**
   * Upload proof file cho printer order
   */
  async uploadProof(orderId, printerId, proofData) {
    Logger.debug(`[PrinterSvc] 📤 Uploading proof for order ${orderId}`);
    
    // 1. Import MasterOrder model (cần thêm ở đầu file)
    const { MasterOrder } = await import("../../shared/models/master-order.model.js");
    
    // 2. Find order and validate ownership
    const order = await MasterOrder.findById(orderId);
    if (!order) {
      throw new NotFoundException("Không tìm thấy đơn hàng", orderId);
    }
    
    // 3. Find printer's sub-order
    const printerOrder = order.printerOrders.find(
      (po) => po.printerProfileId.toString() === printerId.toString()
    );
    
    if (!printerOrder) {
      throw new ForbiddenException("Đây không phải đơn hàng của bạn");
    }
    
    // 4. Validate current status
    if (printerOrder.artworkStatus === "approved") {
      throw new ValidationException("Proof đã được duyệt, không thể upload lại");
    }
    
    // 5. Mark old proofs as superseded
    if (printerOrder.proofFiles) {
      printerOrder.proofFiles.forEach((pf) => {
        if (pf.status === "current") {
          pf.status = "superseded";
        }
      });
    } else {
      printerOrder.proofFiles = [];
    }
    
    // 6. Add new proof
    const version = printerOrder.proofFiles.length + 1;
    printerOrder.proofFiles.push({
      url: proofData.url,
      version,
      fileName: proofData.fileName,
      fileType: proofData.fileType,
      uploadedBy: printerId,
      status: "current",
      uploadedAt: new Date(),
    });
    
    // 7. Update artwork status
    printerOrder.artworkStatus = "pending_approval";
    
    // 8. Save order
    await order.save();
    
    // 9. Invalidate cache (nếu có)
    if (this.cacheService) {
      await this.cacheService.del(`order:${orderId}`);
    }
    
    Logger.success(`[PrinterSvc] ✅ Proof v${version} uploaded for order ${orderId}`);
    
    return {
      order,
      message: "Proof uploaded successfully. Waiting for customer approval.",
    };
  }
  
  /**
   * Get order detail for printer
   */
  async getOrderDetail(orderId, printerId) {
    const { MasterOrder } = await import("../../shared/models/master-order.model.js");
    
    const order = await MasterOrder.findById(orderId);
    if (!order) {
      throw new NotFoundException("Không tìm thấy đơn hàng", orderId);
    }
    
    // Validate ownership
    const printerOrder = order.printerOrders.find(
      (po) => po.printerProfileId.toString() === printerId.toString()
    );
    
    if (!printerOrder) {
      throw new ForbiddenException("Đây không phải đơn hàng của bạn");
    }
    
    return order;
  }
}

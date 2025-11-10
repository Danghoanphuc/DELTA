// src/modules/assets/asset.service.js
// ✅ BÀN GIAO: Tích hợp CacheService (P2)

import { AssetRepository } from "./asset.repository.js";
import {
  ForbiddenException,
  NotFoundException,
} from "../../shared/exceptions/index.js";
import { Logger } from "../../shared/utils/index.js";
// import { Asset } from "../../shared/models/asset.model.js"; // (Không cần import Model ở đây)

// ✅ BƯỚC 1: Import CacheService
import { CacheService } from "../../shared/services/cache.service.js";

// ✅ BƯỚC 2: Định nghĩa TTL và Keys
const CACHE_TTL = {
  PUBLIC_ASSETS_LIST: 21600, // 6 giờ
  ASSET_DETAIL: 7200, // 2 giờ
};

const CACHE_KEY = {
  PUBLIC_ASSETS_LIST: "assets:public:all",
};

export class AssetService {
  constructor() {
    this.assetRepository = new AssetRepository();
    // ✅ BƯỚC 3: Khởi tạo CacheService
    this.cacheService = new CacheService();
  }

  async createAsset(assetData, printerId) {
    Logger.info(`[AssetService] Printer ${printerId} đang tạo phôi...`);
    const dataToSave = {
      ...assetData,
      printerId: printerId,
    };
    const asset = await this.assetRepository.create(dataToSave);
    Logger.success(`[AssetService] Đã tạo phôi: ${asset._id}`);

    // ✅ BƯỚC 4: Xóa cache (Nếu phôi mới là public)
    if (asset.isPublic) {
      await this.cacheService.clear(CACHE_KEY.PUBLIC_ASSETS_LIST);
      Logger.info(`[Cache Invalidate] Đã xóa cache phôi public (do tạo mới).`);
    }

    return asset;
  }

  /**
   * ✅ ĐÃ TÍCH HỢP CACHE (P2)
   */
  async getMyAssets(printerId) {
    Logger.debug(`[AssetService] Lấy phôi (Hybrid) cho printer: ${printerId}`);

    // 1. Lấy phôi riêng (Private) - Không cache
    const privateAssets = await this.assetRepository.findPrivateAssets(
      printerId
    );

    // 2. Lấy phôi chung (Public) - CÓ CACHE
    const publicAssets = await this.cacheService.getOrSet(
      CACHE_KEY.PUBLIC_ASSETS_LIST,
      CACHE_TTL.PUBLIC_ASSETS_LIST,
      () => {
        // Hàm này chỉ chạy khi cache miss
        Logger.debug(`[Cache Miss] Đang gọi DB cho danh sách phôi public...`);
        return this.assetRepository.findPublicAssets();
      }
    );

    // 3. Trả về đối tượng có cấu trúc
    return { privateAssets, publicAssets };
  }

  /**
   * ✅ ĐÃ TÍCH HỢP CACHE (P2)
   */
  async getAssetById(assetId, printerId) {
    // 1. Tạo cache key
    const cacheKey = `asset:${assetId}`;

    // 2. Dùng getOrSet
    const asset = await this.cacheService.getOrSet(
      cacheKey,
      CACHE_TTL.ASSET_DETAIL,
      () => {
        // Hàm này chỉ chạy khi cache miss
        Logger.debug(`[Cache Miss] Đang gọi DB cho chi tiết phôi: ${assetId}`);
        return this.assetRepository.findById(assetId);
      }
    );

    if (!asset) {
      // Nếu không tìm thấy, cũng xóa cache (để tránh cache 404)
      await this.cacheService.clear(cacheKey);
      throw new NotFoundException("Không tìm thấy phôi", assetId);
    }

    // 3. Kiểm tra quyền (Sau khi đã lấy từ cache/DB)
    // Cho phép xem nếu là phôi public HOẶC mình sở hữu
    if (
      !asset.isPublic &&
      asset.printerId.toString() !== printerId.toString()
    ) {
      throw new ForbiddenException("Không có quyền truy cập phôi này");
    }
    return asset;
  }

  /**
   * ✅ ĐÃ TÍCH HỢP CACHE (INVALIDATION)
   */
  async updateAsset(assetId, assetData, printerId) {
    const asset = await this.assetRepository.findById(assetId); // Lấy bản gốc
    if (!asset) {
      throw new NotFoundException("Không tìm thấy phôi", assetId);
    }
    // Chỉ chủ sở hữu mới được sửa
    if (asset.printerId.toString() !== printerId.toString()) {
      throw new ForbiddenException("Chỉ chủ sở hữu mới được cập nhật phôi này");
    }

    const updatedAsset = await this.assetRepository.update(assetId, assetData);
    Logger.success(`[AssetService] Đã cập nhật phôi: ${updatedAsset._id}`);

    // ✅ BƯỚC 4: Xóa cache (Invalidation)
    // 1. Xóa cache chi tiết
    await this.cacheService.clear(`asset:${assetId}`);

    // 2. Xóa cache public list (vì phôi này có thể vừa được bật/tắt public)
    // Chúng ta xóa luôn cho chắc chắn, dù trạng thái isPublic có đổi hay không.
    await this.cacheService.clear(CACHE_KEY.PUBLIC_ASSETS_LIST);
    Logger.info(
      `[Cache Invalidate] Đã xóa cache chi tiết ${assetId} và cache public list (do cập nhật).`
    );

    return updatedAsset;
  }
}

// src/modules/assets/asset.service.js (ĐÃ CẬP NHẬT)
import { AssetRepository } from "./asset.repository.js";
import {
  ForbiddenException,
  NotFoundException,
} from "../../shared/exceptions/index.js";
import { Logger } from "../../shared/utils/index.js";
import { Asset } from "../../shared/models/asset.model.js";

export class AssetService {
  constructor() {
    this.assetRepository = new AssetRepository();
  }

  async createAsset(assetData, printerId) {
    Logger.info(`[AssetService] Printer ${printerId} đang tạo phôi...`);
    const dataToSave = {
      ...assetData,
      printerId: printerId,
      // Mặc định isPublic là false (theo Model)
    };
    const asset = await this.assetRepository.create(dataToSave);
    Logger.success(`[AssetService] Đã tạo phôi: ${asset._id}`);
    return asset;
  }

  /**
   * ✅ SỬA: Logic lấy phôi (Hybrid Model)
   * Trả về cả phôi riêng tư và phôi công khai
   */
  async getMyAssets(printerId) {
    Logger.debug(`[AssetService] Lấy phôi (Hybrid) cho printer: ${printerId}`);

    // 1. Lấy phôi riêng (Private)
    const privateAssets = await this.assetRepository.findPrivateAssets(
      printerId
    );

    // 2. Lấy phôi chung (Public)
    const publicAssets = await this.assetRepository.findPublicAssets();

    // 3. Trả về đối tượng có cấu trúc
    return { privateAssets, publicAssets };
  }

  async getAssetById(assetId, printerId) {
    const asset = await this.assetRepository.findById(assetId);
    if (!asset) {
      throw new NotFoundException("Không tìm thấy phôi", assetId);
    }
    // Sửa logic: Cho phép xem nếu là phôi public HOẶC mình sở hữu
    if (
      !asset.isPublic &&
      asset.printerId.toString() !== printerId.toString()
    ) {
      throw new ForbiddenException("Không có quyền truy cập phôi này");
    }
    return asset;
  }

  async updateAsset(assetId, assetData, printerId) {
    const asset = await this.assetRepository.findById(assetId);
    if (!asset) {
      throw new NotFoundException("Không tìm thấy phôi", assetId);
    }
    // Chỉ chủ sở hữu mới được sửa
    if (asset.printerId.toString() !== printerId.toString()) {
      throw new ForbiddenException("Chỉ chủ sở hữu mới được cập nhật phôi này");
    }

    const updatedAsset = await this.assetRepository.update(assetId, assetData);
    Logger.success(`[AssetService] Đã cập nhật phôi: ${updatedAsset._id}`);
    return updatedAsset;
  }
}

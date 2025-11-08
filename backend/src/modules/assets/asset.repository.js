// src/modules/assets/asset.repository.js (ĐÃ KHẮC PHỤC LỖI LỌC)
import { Asset } from "../../shared/models/asset.model.js";

export class AssetRepository {
  async create(assetData) {
    return await Asset.create(assetData);
  }

  async findById(assetId) {
    return await Asset.findById(assetId);
  }

  /**
   * ✅ SỬA LỖI LỌC:
   * Đổi từ { isPublic: false } thành { isPublic: { $ne: true } }
   * * '$ne: true' (Not Equal to true) sẽ tìm tất cả phôi có:
   * 1. isPublic: false
   * 2. isPublic: null
   * 3. (QUAN TRỌNG) Thiếu trường 'isPublic' (như dữ liệu của anh)
   */
  async findPrivateAssets(printerId) {
    return await Asset.find({
      printerId: printerId,
      isPublic: { $ne: true }, // <-- LỌC ĐÚNG
    }).sort({
      createdAt: -1,
    });
  }

  /**
   * (Hàm này giữ nguyên)
   * Tìm tất cả phôi CÔNG KHAI
   */
  async findPublicAssets() {
    return await Asset.find({ isPublic: true, isActive: true }).sort({
      name: 1,
    });
  }

  async update(assetId, assetData) {
    delete assetData.printerId;
    return await Asset.findByIdAndUpdate(
      assetId,
      { $set: assetData },
      {
        new: true,
        runValidators: true,
      }
    );
  }
}

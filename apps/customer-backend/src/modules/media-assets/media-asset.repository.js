// src/modules/media-assets/media-asset.repository.js
// ✅ Import này sẽ hoạt động sau khi anh tạo File 1
import { MediaAsset } from "../../shared/models/media-asset.model.js";

export class MediaAssetRepository {
  async findByUserId(userId) {
    return await MediaAsset.find({ userId }).sort({ createdAt: -1 });
  }

  async create(assetData) {
    return await MediaAsset.create(assetData);
  }

  async findById(assetId) {
    return await MediaAsset.findById(assetId);
  }

  async deleteById(assetId) {
    return await MediaAsset.findByIdAndDelete(assetId);
  }
}

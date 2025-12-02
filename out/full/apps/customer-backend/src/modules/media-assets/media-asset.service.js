// src/modules/media-assets/media-asset.service.js
import { MediaAssetRepository } from "./media-asset.repository.js";
import { cloudinary } from "../../infrastructure/storage/multer.config.js";
import { Logger } from "../../shared/utils/index.js";
import {
  ForbiddenException,
  NotFoundException,
} from "../../shared/exceptions/index.js";

export class MediaAssetService {
  constructor() {
    this.mediaAssetRepository = new MediaAssetRepository();
  }

  async getMyMediaAssets(userId) {
    return await this.mediaAssetRepository.findByUserId(userId);
  }

  async createMediaAsset(userId, assetData) {
    // Service này chỉ nhận dữ liệu đã được upload
    // (File đã được upload lên cloud bởi 'uploadFileToCloudinary' ở frontend)
    // (Và frontend đã gọi 'api.post("/media-assets")' với body là assetData)
    const { url, publicId, name, fileType, size } = assetData;

    return await this.mediaAssetRepository.create({
      userId,
      url,
      publicId, // ✅ Lưu publicId
      name,
      fileType,
      size,
    });
  }

  async deleteMediaAsset(userId, assetId) {
    const asset = await this.mediaAssetRepository.findById(assetId);

    if (!asset) {
      throw new NotFoundException("Không tìm thấy tài sản media", assetId);
    }

    if (asset.userId.toString() !== userId.toString()) {
      throw new ForbiddenException("Không có quyền xóa tài sản này");
    }

    // 1. Xóa file trên Cloudinary
    try {
      // ✅ Dùng publicId đã lưu để xóa
      Logger.debug(
        `[MediaService] Đang xóa file Cloudinary: ${asset.publicId}`
      );

      // Tự động nhận diện resource_type
      await cloudinary.uploader.destroy(asset.publicId, { invalidate: true });
    } catch (cloudError) {
      Logger.error(
        `[MediaService] Lỗi xóa file Cloudinary (nhưng vẫn tiếp tục):`,
        cloudError
      );
    }

    // 2. Xóa khỏi CSDL
    await this.mediaAssetRepository.deleteById(assetId);

    Logger.success(`[MediaService] Đã xóa media asset: ${assetId}`);
    return { message: "Đã xóa tài sản media." };
  }
}

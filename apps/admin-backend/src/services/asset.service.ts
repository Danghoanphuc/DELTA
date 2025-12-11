/**
 * AssetService - Asset Version Control Service
 *
 * Business logic for managing file assets with version control
 * Implements Asset Version Control feature
 *
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
 */

import crypto from "crypto";
import { Types } from "mongoose";
import { Logger } from "../utils/logger.js";
import {
  AssetRepository,
  assetRepository,
} from "../repositories/asset.repository.js";
import { Asset, IAsset, ASSET_STATUS } from "../models/asset.model.js";
import {
  ValidationException,
  NotFoundException,
  ConflictException,
} from "../shared/exceptions.js";

/**
 * File upload data interface
 */
export interface FileUploadData {
  filename: string;
  originalFilename: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  buffer?: Buffer;
}

/**
 * Asset validation result interface
 */
export interface AssetValidationResult {
  isValid: boolean;
  hasFinalAssets: boolean;
  finalAssets: IAsset[];
  message?: string;
}

/**
 * Custom exception for locked assets
 */
export class AssetLockedException extends Error {
  public statusCode: number;

  constructor(assetId: string) {
    super(`Asset ${assetId} is locked and cannot be modified`);
    this.name = "AssetLockedException";
    this.statusCode = 409;
  }
}

/**
 * Custom exception for no FINAL assets
 */
export class NoFinalAssetException extends Error {
  public statusCode: number;

  constructor(orderId: string) {
    super(`Order ${orderId} has no FINAL assets for production`);
    this.name = "NoFinalAssetException";
    this.statusCode = 400;
  }
}

/**
 * AssetService - Asset management with version control
 */
export class AssetService {
  private repository: AssetRepository;

  constructor(repository: AssetRepository = assetRepository) {
    this.repository = repository;
  }

  /**
   * Upload asset with auto-versioning
   * Requirements: 3.1 - Assign sequential version numbers (v1, v2, v3...)
   * Uses atomic version increment to prevent race conditions
   *
   * @param orderId - Order ID to attach asset to
   * @param fileData - File upload data
   * @param uploadedBy - ID of user uploading the file
   * @returns Created asset
   */
  async uploadAsset(
    orderId: string,
    fileData: FileUploadData,
    uploadedBy: string
  ): Promise<IAsset> {
    Logger.debug(`[AssetSvc] Uploading asset for order: ${orderId}`);

    // Validate input
    this.validateFileData(fileData);

    // Calculate checksum for file integrity
    const checksum = this.calculateChecksum(fileData);

    // Create asset data (version will be assigned atomically)
    const assetData: Partial<IAsset> = {
      orderId: new Types.ObjectId(orderId),
      filename: fileData.filename,
      originalFilename: fileData.originalFilename,
      status: ASSET_STATUS.DRAFT,
      isLocked: false,
      fileUrl: fileData.fileUrl,
      fileSize: fileData.fileSize,
      mimeType: fileData.mimeType,
      checksum,
      uploadedBy: new Types.ObjectId(uploadedBy),
    };

    // Use atomic version increment to prevent race conditions
    const asset = await this.repository.createWithAtomicVersion(assetData);

    Logger.success(
      `[AssetSvc] Uploaded asset: ${asset.filename} (${asset.versionLabel})`
    );

    return asset;
  }

  /**
   * Validate file upload data
   */
  private validateFileData(fileData: FileUploadData): void {
    if (!fileData.filename || fileData.filename.trim().length === 0) {
      throw new ValidationException("Filename không được để trống");
    }

    if (
      !fileData.originalFilename ||
      fileData.originalFilename.trim().length === 0
    ) {
      throw new ValidationException("Original filename không được để trống");
    }

    if (!fileData.fileUrl || fileData.fileUrl.trim().length === 0) {
      throw new ValidationException("File URL không được để trống");
    }

    if (!fileData.fileSize || fileData.fileSize <= 0) {
      throw new ValidationException("File size phải lớn hơn 0");
    }

    if (!fileData.mimeType || fileData.mimeType.trim().length === 0) {
      throw new ValidationException("MIME type không được để trống");
    }
  }

  /**
   * Calculate checksum for file integrity
   * Requirements: 3.1 - Store file with checksum for integrity
   */
  private calculateChecksum(fileData: FileUploadData): string {
    // If buffer is provided, calculate from buffer
    if (fileData.buffer) {
      return crypto.createHash("sha256").update(fileData.buffer).digest("hex");
    }

    // Otherwise, create checksum from file metadata
    const data = `${fileData.filename}:${fileData.fileSize}:${fileData.mimeType}`;
    return crypto.createHash("sha256").update(data).digest("hex");
  }

  /**
   * Mark asset as FINAL with locking mechanism
   * Requirements: 3.2 - Set status to 'final' and isLocked to true
   *
   * @param assetId - Asset ID to mark as FINAL
   * @param approvedBy - ID of user approving the asset
   * @returns Updated asset
   */
  async markAsFinal(assetId: string, approvedBy: string): Promise<IAsset> {
    Logger.debug(`[AssetSvc] Marking asset ${assetId} as FINAL`);

    // Get asset
    const asset = await this.repository.findById(assetId);
    if (!asset) {
      throw new NotFoundException("Asset", assetId);
    }

    // Check if already locked
    if (asset.isLocked) {
      throw new AssetLockedException(assetId);
    }

    // Check if already FINAL
    if (asset.status === ASSET_STATUS.FINAL) {
      throw new ConflictException(`Asset ${assetId} đã được đánh dấu là FINAL`);
    }

    // Update asset to FINAL status
    const updated = await this.repository.update(assetId, {
      status: ASSET_STATUS.FINAL,
      isLocked: true,
      versionLabel: "FINAL",
      approvedBy: new Types.ObjectId(approvedBy),
      approvedAt: new Date(),
    });

    if (!updated) {
      throw new NotFoundException("Asset", assetId);
    }

    Logger.success(
      `[AssetSvc] Marked asset ${updated.filename} as FINAL (version ${updated.version})`
    );

    return updated;
  }

  /**
   * Validate order for production
   * Requirements: 3.3, 3.4 - Check if order has at least one FINAL asset, block submission if no FINAL assets
   *
   * @param orderId - Order ID to validate
   * @returns Validation result
   */
  async validateForProduction(orderId: string): Promise<AssetValidationResult> {
    Logger.debug(`[AssetSvc] Validating order ${orderId} for production`);

    // Get all FINAL assets for the order
    const finalAssets = await this.repository.findFinalAssets(orderId);

    const hasFinalAssets = finalAssets.length > 0;

    if (!hasFinalAssets) {
      Logger.warn(
        `[AssetSvc] Order ${orderId} has no FINAL assets for production`
      );
      return {
        isValid: false,
        hasFinalAssets: false,
        finalAssets: [],
        message:
          "Đơn hàng chưa có file FINAL. Vui lòng đánh dấu ít nhất một file là FINAL trước khi gửi sản xuất.",
      };
    }

    Logger.success(
      `[AssetSvc] Order ${orderId} has ${finalAssets.length} FINAL asset(s)`
    );

    return {
      isValid: true,
      hasFinalAssets: true,
      finalAssets,
      message: `Đơn hàng có ${finalAssets.length} file FINAL sẵn sàng cho sản xuất`,
    };
  }

  /**
   * Create revision for FINAL file
   * Requirements: 3.5 - Create new version from FINAL file, mark old FINAL as superseded
   *
   * @param assetId - ID of FINAL asset to create revision from
   * @param fileData - New file data
   * @param uploadedBy - ID of user creating revision
   * @returns New asset version
   */
  async createRevision(
    assetId: string,
    fileData: FileUploadData,
    uploadedBy: string
  ): Promise<IAsset> {
    Logger.debug(`[AssetSvc] Creating revision for asset ${assetId}`);

    // Get original FINAL asset
    const originalAsset = await this.repository.findById(assetId);
    if (!originalAsset) {
      throw new NotFoundException("Asset", assetId);
    }

    // Verify it's a FINAL asset
    if (originalAsset.status !== ASSET_STATUS.FINAL) {
      throw new ValidationException("Chỉ có thể tạo revision từ file FINAL");
    }

    // Mark original FINAL as superseded
    await this.repository.update(assetId, {
      status: ASSET_STATUS.SUPERSEDED,
      versionLabel: `v${originalAsset.version} (superseded)`,
    });

    Logger.debug(`[AssetSvc] Marked original asset ${assetId} as superseded`);

    // Create new version
    const newAsset = await this.uploadAsset(
      originalAsset.orderId.toString(),
      fileData,
      uploadedBy
    );

    // Link to previous version
    await this.repository.update(newAsset._id.toString(), {
      previousVersionId: originalAsset._id,
    });

    Logger.success(
      `[AssetSvc] Created revision: ${newAsset.filename} (${newAsset.versionLabel}) from ${originalAsset.versionLabel}`
    );

    return newAsset;
  }

  /**
   * Get asset by ID
   */
  async getAsset(id: string): Promise<IAsset> {
    const asset = await this.repository.findById(id);
    if (!asset) {
      throw new NotFoundException("Asset", id);
    }
    return asset;
  }

  /**
   * Get all assets for an order
   */
  async getAssetsByOrder(orderId: string): Promise<IAsset[]> {
    return this.repository.findByOrder(orderId);
  }

  /**
   * Get asset versions for an order
   */
  async getAssetVersions(orderId: string): Promise<IAsset[]> {
    return this.repository.findByOrder(orderId);
  }

  /**
   * Get FINAL assets for an order
   */
  async getFinalAssets(orderId: string): Promise<IAsset[]> {
    return this.repository.findFinalAssets(orderId);
  }

  /**
   * Update asset status
   */
  async updateStatus(id: string, status: string): Promise<IAsset> {
    // Validate status
    if (!Object.values(ASSET_STATUS).includes(status as any)) {
      throw new ValidationException(`Invalid status: ${status}`);
    }

    // Get asset to check if locked
    const asset = await this.repository.findById(id);
    if (!asset) {
      throw new NotFoundException("Asset", id);
    }

    // Reject modification attempts on locked assets
    // Requirements: 3.2 - Reject any modification attempts on locked assets
    if (asset.isLocked && status !== asset.status) {
      throw new AssetLockedException(id);
    }

    const updated = await this.repository.updateStatus(id, status);
    if (!updated) {
      throw new NotFoundException("Asset", id);
    }

    Logger.success(
      `[AssetSvc] Updated asset ${updated.filename} status to ${status}`
    );

    return updated;
  }

  /**
   * Delete asset
   * Only allowed for non-FINAL, non-locked assets
   */
  async deleteAsset(id: string): Promise<void> {
    const asset = await this.repository.findById(id);
    if (!asset) {
      throw new NotFoundException("Asset", id);
    }

    // Cannot delete FINAL or locked assets
    if (asset.isLocked || asset.status === ASSET_STATUS.FINAL) {
      throw new ConflictException("Không thể xóa file FINAL hoặc file đã khóa");
    }

    await this.repository.delete(id);
    Logger.success(`[AssetSvc] Deleted asset: ${asset.filename}`);
  }
}

// Export singleton instance
export const assetService = new AssetService();

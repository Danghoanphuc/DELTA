// src/modules/artworks/artwork.service.js
// ✅ Artwork Service - Business logic layer

import { ArtworkRepository } from "./artwork.repository.js";
import { ARTWORK_STATUS, ARTWORK_FILE_FORMATS } from "./artwork.model.js";
import {
  ValidationException,
  NotFoundException,
  ForbiddenException,
} from "../../shared/exceptions/index.js";
import { Logger } from "../../shared/utils/logger.util.js";

export class ArtworkService {
  constructor() {
    this.repository = new ArtworkRepository();
  }

  /**
   * Upload new artwork
   */
  async uploadArtwork(organizationId, userId, fileData) {
    Logger.debug(`[ArtworkSvc] Uploading artwork for org: ${organizationId}`);

    // Validate file data
    this.validateFileData(fileData);

    // Create artwork record
    const artwork = await this.repository.create({
      organization: organizationId,
      uploadedBy: userId,
      fileName: fileData.fileName,
      originalFileName: fileData.originalFileName,
      fileUrl: fileData.fileUrl,
      thumbnailUrl: fileData.thumbnailUrl,
      fileSize: fileData.fileSize,
      fileFormat: fileData.fileFormat,
      dimensions: fileData.dimensions,
      resolution: fileData.resolution,
      colorMode: fileData.colorMode,
      colorCount: fileData.colorCount,
      hasTransparency: fileData.hasTransparency,
      tags: fileData.tags || [],
      description: fileData.description,
    });

    Logger.success(`[ArtworkSvc] Artwork uploaded: ${artwork._id}`);
    return artwork;
  }

  /**
   * Get artwork by ID
   */
  async getArtwork(organizationId, artworkId) {
    const artwork = await this.repository.findById(artworkId);

    if (!artwork) {
      throw new NotFoundException("Artwork", artworkId);
    }

    // Check authorization
    if (artwork.organization.toString() !== organizationId.toString()) {
      throw new ForbiddenException("Bạn không có quyền truy cập artwork này");
    }

    return artwork;
  }

  /**
   * Get artwork library for organization
   */
  async getArtworkLibrary(organizationId, options = {}) {
    Logger.debug(
      `[ArtworkSvc] Getting artwork library for org: ${organizationId}`
    );

    const result = await this.repository.findByOrganization(
      organizationId,
      options
    );

    return result;
  }

  /**
   * Validate artwork against requirements
   */
  async validateArtwork(organizationId, artworkId, requirements) {
    Logger.debug(`[ArtworkSvc] Validating artwork: ${artworkId}`);

    const artwork = await this.getArtwork(organizationId, artworkId);

    const errors = [];

    // Check resolution
    if (
      requirements.minResolution &&
      artwork.resolution < requirements.minResolution
    ) {
      errors.push(
        `Resolution ${artwork.resolution}dpi is below minimum ${requirements.minResolution}dpi`
      );
    }

    // Check file format
    if (
      requirements.acceptedFormats &&
      !requirements.acceptedFormats.includes(artwork.fileFormat)
    ) {
      errors.push(
        `File format ${
          artwork.fileFormat
        } is not accepted. Accepted formats: ${requirements.acceptedFormats.join(
          ", "
        )}`
      );
    }

    // Check color mode
    if (
      requirements.colorMode &&
      artwork.colorMode !== requirements.colorMode
    ) {
      errors.push(
        `Color mode ${artwork.colorMode} does not match required ${requirements.colorMode}`
      );
    }

    // Check file size
    if (
      requirements.maxFileSize &&
      artwork.fileSize > requirements.maxFileSize * 1024 * 1024
    ) {
      errors.push(
        `File size ${(artwork.fileSize / (1024 * 1024)).toFixed(
          2
        )}MB exceeds maximum ${requirements.maxFileSize}MB`
      );
    }

    // Check dimensions if provided
    if (requirements.maxWidth && artwork.dimensions?.width) {
      if (artwork.dimensions.width > requirements.maxWidth) {
        errors.push(
          `Width ${artwork.dimensions.width}mm exceeds maximum ${requirements.maxWidth}mm`
        );
      }
    }

    if (requirements.maxHeight && artwork.dimensions?.height) {
      if (artwork.dimensions.height > requirements.maxHeight) {
        errors.push(
          `Height ${artwork.dimensions.height}mm exceeds maximum ${requirements.maxHeight}mm`
        );
      }
    }

    const isValid = errors.length === 0;

    return {
      isValid,
      errors,
      artwork,
    };
  }

  /**
   * Approve artwork
   */
  async approveArtwork(organizationId, artworkId, userId) {
    Logger.debug(`[ArtworkSvc] Approving artwork: ${artworkId}`);

    const artwork = await this.getArtwork(organizationId, artworkId);

    // Update via model method
    const artworkDoc = await this.repository.update(artworkId, {
      validationStatus: ARTWORK_STATUS.APPROVED,
      validationErrors: [],
      validatedAt: new Date(),
      validatedBy: userId,
    });

    Logger.success(`[ArtworkSvc] Artwork approved: ${artworkId}`);
    return artworkDoc;
  }

  /**
   * Reject artwork
   */
  async rejectArtwork(organizationId, artworkId, userId, errors) {
    Logger.debug(`[ArtworkSvc] Rejecting artwork: ${artworkId}`);

    if (!errors || errors.length === 0) {
      throw new ValidationException("Vui lòng cung cấp lý do từ chối artwork");
    }

    const artwork = await this.getArtwork(organizationId, artworkId);

    const artworkDoc = await this.repository.update(artworkId, {
      validationStatus: ARTWORK_STATUS.REJECTED,
      validationErrors: errors,
      validatedAt: new Date(),
      validatedBy: userId,
    });

    Logger.success(`[ArtworkSvc] Artwork rejected: ${artworkId}`);
    return artworkDoc;
  }

  /**
   * Create new version of artwork
   */
  async createNewVersion(organizationId, artworkId, userId, fileData) {
    Logger.debug(`[ArtworkSvc] Creating new version for: ${artworkId}`);

    const originalArtwork = await this.getArtwork(organizationId, artworkId);

    // Validate file data
    this.validateFileData(fileData);

    // Create new version
    const newVersion = await this.repository.create({
      organization: organizationId,
      uploadedBy: userId,
      fileName: fileData.fileName,
      originalFileName: fileData.originalFileName,
      fileUrl: fileData.fileUrl,
      thumbnailUrl: fileData.thumbnailUrl,
      fileSize: fileData.fileSize,
      fileFormat: fileData.fileFormat,
      dimensions: fileData.dimensions,
      resolution: fileData.resolution,
      colorMode: fileData.colorMode,
      colorCount: fileData.colorCount,
      hasTransparency: fileData.hasTransparency,
      version: originalArtwork.version + 1,
      previousVersionId: originalArtwork._id,
      tags: originalArtwork.tags,
      description: originalArtwork.description,
    });

    Logger.success(
      `[ArtworkSvc] New version created: ${newVersion._id} (v${newVersion.version})`
    );
    return newVersion;
  }

  /**
   * Delete artwork (soft delete)
   */
  async deleteArtwork(organizationId, artworkId, userId) {
    Logger.debug(`[ArtworkSvc] Deleting artwork: ${artworkId}`);

    const artwork = await this.getArtwork(organizationId, artworkId);

    // Check if artwork is in use
    if (artwork.usageCount > 0) {
      throw new ValidationException(
        "Không thể xóa artwork đang được sử dụng trong đơn hàng"
      );
    }

    await this.repository.softDelete(artworkId, userId);

    Logger.success(`[ArtworkSvc] Artwork deleted: ${artworkId}`);
  }

  /**
   * Increment usage count
   */
  async incrementUsage(artworkId) {
    const artwork = await this.repository.update(artworkId, {
      $inc: { usageCount: 1 },
      lastUsedAt: new Date(),
    });

    return artwork;
  }

  /**
   * Get version history
   */
  async getVersionHistory(organizationId, artworkId) {
    const artwork = await this.getArtwork(organizationId, artworkId);

    const history = await this.repository.findVersionHistory(artworkId);

    return history;
  }

  /**
   * Get artwork statistics
   */
  async getStats(organizationId) {
    return await this.repository.getStats(organizationId);
  }

  /**
   * Get most used artworks
   */
  async getMostUsed(organizationId, limit = 10) {
    return await this.repository.findMostUsed(organizationId, limit);
  }

  /**
   * Update artwork metadata
   */
  async updateMetadata(organizationId, artworkId, data) {
    Logger.debug(`[ArtworkSvc] Updating artwork metadata: ${artworkId}`);

    const artwork = await this.getArtwork(organizationId, artworkId);

    const updates = {};
    if (data.tags !== undefined) updates.tags = data.tags;
    if (data.description !== undefined) updates.description = data.description;
    if (data.notes !== undefined) updates.notes = data.notes;

    const updated = await this.repository.update(artworkId, updates);

    Logger.success(`[ArtworkSvc] Artwork metadata updated: ${artworkId}`);
    return updated;
  }

  /**
   * Search artworks by tags
   */
  async searchByTags(organizationId, tags) {
    return await this.repository.searchByTags(organizationId, tags);
  }

  /**
   * Get all tags
   */
  async getAllTags(organizationId) {
    return await this.repository.getAllTags(organizationId);
  }

  // === PRIVATE METHODS ===

  /**
   * Validate file data
   */
  validateFileData(fileData) {
    if (!fileData.fileName) {
      throw new ValidationException("File name is required");
    }

    if (!fileData.fileUrl) {
      throw new ValidationException("File URL is required");
    }

    if (!fileData.fileSize) {
      throw new ValidationException("File size is required");
    }

    if (!fileData.fileFormat) {
      throw new ValidationException("File format is required");
    }

    // Validate file format
    const validFormats = Object.values(ARTWORK_FILE_FORMATS);
    if (!validFormats.includes(fileData.fileFormat)) {
      throw new ValidationException(
        `Invalid file format. Accepted formats: ${validFormats.join(", ")}`
      );
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (fileData.fileSize > maxSize) {
      throw new ValidationException(
        `File size exceeds maximum 50MB. Current size: ${(
          fileData.fileSize /
          (1024 * 1024)
        ).toFixed(2)}MB`
      );
    }
  }
}

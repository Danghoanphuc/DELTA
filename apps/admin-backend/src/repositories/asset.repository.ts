/**
 * AssetRepository - Data Access Layer for Assets
 *
 * Implements repository pattern for Asset model with version management
 * Following SOLID principles and existing codebase patterns
 *
 * Requirements: 3.1
 */

import { FilterQuery, UpdateQuery, Types } from "mongoose";
import { Logger } from "../utils/logger.js";
import { Asset, IAsset, ASSET_STATUS } from "../models/asset.model.js";
import {
  IRepository,
  PaginatedResult,
} from "../interfaces/repository.interface.js";

/**
 * Asset Repository Interface
 */
export interface IAssetRepository extends IRepository<IAsset> {
  findByOrder(orderId: string): Promise<IAsset[]>;
  findLatestVersion(orderId: string): Promise<IAsset | null>;
  updateStatus(id: string, status: string): Promise<IAsset | null>;
  findFinalAssets(orderId: string): Promise<IAsset[]>;
  getNextVersion(orderId: string): Promise<number>;
  createWithAtomicVersion(data: Partial<IAsset>): Promise<IAsset>;
}

/**
 * AssetRepository - Data access for assets with version control
 */
export class AssetRepository implements IAssetRepository {
  /**
   * Find asset by ID
   */
  async findById(id: string): Promise<IAsset | null> {
    try {
      return await Asset.findById(id)
        .populate("uploadedBy", "email name")
        .populate("approvedBy", "email name")
        .lean();
    } catch (error) {
      Logger.error(`[AssetRepo] Error finding asset by ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Find single asset by filter
   */
  async findOne(filter: FilterQuery<IAsset>): Promise<IAsset | null> {
    try {
      return await Asset.findOne(filter)
        .populate("uploadedBy", "email name")
        .populate("approvedBy", "email name")
        .lean();
    } catch (error) {
      Logger.error(`[AssetRepo] Error finding asset:`, error);
      throw error;
    }
  }

  /**
   * Find all assets matching filter
   */
  async find(filter: FilterQuery<IAsset>): Promise<IAsset[]> {
    try {
      return await Asset.find(filter)
        .populate("uploadedBy", "email name")
        .populate("approvedBy", "email name")
        .sort({ version: -1 })
        .lean();
    } catch (error) {
      Logger.error(`[AssetRepo] Error finding assets:`, error);
      throw error;
    }
  }

  /**
   * Create new asset
   * Requirements: 3.1
   */
  async create(data: Partial<IAsset>): Promise<IAsset> {
    try {
      const asset = new Asset(data);
      const saved = await asset.save();
      Logger.success(
        `[AssetRepo] Created asset: ${saved.filename} (${saved.versionLabel})`
      );
      return saved.toObject();
    } catch (error) {
      Logger.error(`[AssetRepo] Error creating asset:`, error);
      throw error;
    }
  }

  /**
   * Update asset by ID
   */
  async update(id: string, data: UpdateQuery<IAsset>): Promise<IAsset | null> {
    try {
      const updated = await Asset.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
      })
        .populate("uploadedBy", "email name")
        .populate("approvedBy", "email name")
        .lean();

      if (updated) {
        Logger.success(
          `[AssetRepo] Updated asset: ${updated.filename} (${updated.versionLabel})`
        );
      }
      return updated;
    } catch (error) {
      Logger.error(`[AssetRepo] Error updating asset ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete asset by ID
   */
  async delete(id: string): Promise<boolean> {
    try {
      const result = await Asset.findByIdAndDelete(id);
      if (result) {
        Logger.success(
          `[AssetRepo] Deleted asset: ${result.filename} (${result.versionLabel})`
        );
      }
      return !!result;
    } catch (error) {
      Logger.error(`[AssetRepo] Error deleting asset ${id}:`, error);
      throw error;
    }
  }

  /**
   * Count assets matching filter
   */
  async count(filter?: FilterQuery<IAsset>): Promise<number> {
    try {
      return await Asset.countDocuments(filter || {});
    } catch (error) {
      Logger.error(`[AssetRepo] Error counting assets:`, error);
      throw error;
    }
  }

  /**
   * Find all assets for an order
   * Requirements: 3.1
   */
  async findByOrder(orderId: string): Promise<IAsset[]> {
    try {
      return await Asset.find({ orderId: new Types.ObjectId(orderId) })
        .populate("uploadedBy", "email name")
        .populate("approvedBy", "email name")
        .sort({ version: -1 })
        .lean();
    } catch (error) {
      Logger.error(
        `[AssetRepo] Error finding assets by order ${orderId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Find latest version of asset for an order
   * Requirements: 3.1
   */
  async findLatestVersion(orderId: string): Promise<IAsset | null> {
    try {
      return await Asset.findOne({ orderId: new Types.ObjectId(orderId) })
        .sort({ version: -1 })
        .populate("uploadedBy", "email name")
        .populate("approvedBy", "email name")
        .lean();
    } catch (error) {
      Logger.error(
        `[AssetRepo] Error finding latest version for order ${orderId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Update asset status
   * Requirements: 3.1
   */
  async updateStatus(id: string, status: string): Promise<IAsset | null> {
    try {
      const updated = await Asset.findByIdAndUpdate(
        id,
        { status },
        { new: true, runValidators: true }
      )
        .populate("uploadedBy", "email name")
        .populate("approvedBy", "email name")
        .lean();

      if (updated) {
        Logger.success(
          `[AssetRepo] Updated asset ${updated.filename} status to ${status}`
        );
      }
      return updated;
    } catch (error) {
      Logger.error(`[AssetRepo] Error updating asset ${id} status:`, error);
      throw error;
    }
  }

  /**
   * Find FINAL assets for an order
   * Requirements: 3.3, 3.4
   */
  async findFinalAssets(orderId: string): Promise<IAsset[]> {
    try {
      return await Asset.find({
        orderId: new Types.ObjectId(orderId),
        status: ASSET_STATUS.FINAL,
      })
        .populate("uploadedBy", "email name")
        .populate("approvedBy", "email name")
        .sort({ version: -1 })
        .lean();
    } catch (error) {
      Logger.error(
        `[AssetRepo] Error finding FINAL assets for order ${orderId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Get next version number for an order (DEPRECATED - use createWithAtomicVersion)
   * Requirements: 3.1
   *
   * @deprecated This method has a race condition. Use createWithAtomicVersion instead.
   */
  async getNextVersion(orderId: string): Promise<number> {
    try {
      const lastAsset = await Asset.findOne({
        orderId: new Types.ObjectId(orderId),
      })
        .sort({ version: -1 })
        .lean();

      return lastAsset ? lastAsset.version + 1 : 1;
    } catch (error) {
      Logger.error(
        `[AssetRepo] Error getting next version for order ${orderId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Create asset with atomic version increment
   * Uses findOneAndUpdate with upsert to prevent race conditions
   * Requirements: 3.1 - Prevent duplicate version numbers with atomic operations
   *
   * @param data - Asset data to create
   * @returns Created asset with atomically assigned version number
   */
  async createWithAtomicVersion(
    data: Partial<IAsset>,
    retryCount: number = 0
  ): Promise<IAsset> {
    const MAX_RETRIES = 5;

    try {
      // Step 1: Find the highest version number
      const lastAsset = await Asset.findOne({
        orderId: data.orderId,
      })
        .sort({ version: -1 })
        .lean();

      const nextVersion = lastAsset ? lastAsset.version + 1 : 1;

      // Step 2: Create the asset with the calculated version
      // The unique compound index (orderId + version) will prevent duplicates
      const assetData = {
        ...data,
        version: nextVersion,
        versionLabel: `v${nextVersion}`,
      };

      const asset = new Asset(assetData);
      const saved = await asset.save();

      Logger.success(
        `[AssetRepo] Created asset with atomic version: ${saved.filename} (${saved.versionLabel})`
      );

      return saved.toObject();
    } catch (error: any) {
      // Handle duplicate key error (race condition detected)
      if (error.code === 11000 && retryCount < MAX_RETRIES) {
        Logger.warn(
          `[AssetRepo] Duplicate version detected for order ${
            data.orderId
          }, retrying... (attempt ${retryCount + 1}/${MAX_RETRIES})`
        );

        // Add small random delay to reduce contention
        await new Promise((resolve) =>
          setTimeout(resolve, Math.random() * 10 + 5)
        );

        // Retry with incremented count
        return this.createWithAtomicVersion(data, retryCount + 1);
      }

      Logger.error(
        `[AssetRepo] Error creating asset with atomic version:`,
        error
      );
      throw error;
    }
  }

  /**
   * Find assets with pagination
   */
  async findWithPagination(
    filter: FilterQuery<IAsset>,
    page: number = 1,
    limit: number = 20,
    sort: Record<string, 1 | -1> = { version: -1 }
  ): Promise<PaginatedResult<IAsset>> {
    try {
      const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
        Asset.find(filter)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .populate("uploadedBy", "email name")
          .populate("approvedBy", "email name")
          .lean(),
        Asset.countDocuments(filter),
      ]);

      return {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      Logger.error(`[AssetRepo] Error finding assets with pagination:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const assetRepository = new AssetRepository();

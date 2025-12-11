/**
 * AssetController - Asset Version Control Controller
 *
 * HTTP handlers for asset management with version control
 * Implements Asset Version Control feature
 *
 * Requirements: 3.1, 3.2, 3.5
 */

import { Request, Response, NextFunction } from "express";
import { Logger } from "../utils/logger.js";
import { assetService, AssetService } from "../services/asset.service.js";
import { API_CODES } from "../shared/constants/api-codes.js";
import { ApiResponse } from "../shared/utils/api-response.js";

/**
 * AssetController - HTTP handlers for asset operations
 */
export class AssetController {
  private assetService: AssetService;

  constructor(service: AssetService = assetService) {
    this.assetService = service;
  }

  /**
   * Upload asset
   * @route POST /api/orders/:orderId/assets
   * Requirements: 3.1 - Upload asset with auto-versioning
   */
  uploadAsset = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orderId } = req.params;
      const userId = req.user?._id;

      if (!userId) {
        return res
          .status(API_CODES.UNAUTHORIZED)
          .json(ApiResponse.error("UNAUTHORIZED", "Unauthorized"));
      }

      // Extract file data from request
      // In a real implementation, this would come from multer or similar
      const fileData = {
        filename: req.body.filename,
        originalFilename: req.body.originalFilename,
        fileUrl: req.body.fileUrl,
        fileSize: req.body.fileSize,
        mimeType: req.body.mimeType,
      };

      const asset = await this.assetService.uploadAsset(
        orderId,
        fileData,
        userId.toString()
      );

      Logger.success(
        `[AssetCtrl] Uploaded asset for order ${orderId}: ${asset.filename}`
      );

      res
        .status(API_CODES.CREATED)
        .json(ApiResponse.success({ asset }, "Đã upload file thành công!"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get assets for an order
   * @route GET /api/orders/:orderId/assets
   * Requirements: 3.1 - List assets with versions
   */
  getAssets = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orderId } = req.params;

      const assets = await this.assetService.getAssetsByOrder(orderId);

      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success(
            { assets },
            `Tìm thấy ${assets.length} file cho đơn hàng`
          )
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Mark asset as FINAL
   * @route PUT /api/assets/:id/final
   * Requirements: 3.2 - Mark as FINAL with locking mechanism
   */
  markAsFinal = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user?._id;

      if (!userId) {
        return res
          .status(API_CODES.UNAUTHORIZED)
          .json(ApiResponse.error("UNAUTHORIZED", "Unauthorized"));
      }

      const asset = await this.assetService.markAsFinal(id, userId.toString());

      Logger.success(
        `[AssetCtrl] Marked asset ${id} as FINAL by user ${userId}`
      );

      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success(
            { asset },
            "Đã đánh dấu file là FINAL thành công!"
          )
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create revision for FINAL asset
   * @route POST /api/assets/:id/revision
   * Requirements: 3.5 - Create revision from FINAL file
   */
  createRevision = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user?._id;

      if (!userId) {
        return res
          .status(API_CODES.UNAUTHORIZED)
          .json(ApiResponse.error("UNAUTHORIZED", "Unauthorized"));
      }

      // Extract file data from request
      const fileData = {
        filename: req.body.filename,
        originalFilename: req.body.originalFilename,
        fileUrl: req.body.fileUrl,
        fileSize: req.body.fileSize,
        mimeType: req.body.mimeType,
      };

      const asset = await this.assetService.createRevision(
        id,
        fileData,
        userId.toString()
      );

      Logger.success(
        `[AssetCtrl] Created revision for asset ${id}: ${asset.filename}`
      );

      res
        .status(API_CODES.CREATED)
        .json(
          ApiResponse.success({ asset }, "Đã tạo phiên bản mới thành công!")
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get asset by ID
   * @route GET /api/assets/:id
   */
  getAsset = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const asset = await this.assetService.getAsset(id);

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ asset }, "Lấy thông tin file thành công"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Validate order for production
   * @route GET /api/orders/:orderId/assets/validate
   */
  validateForProduction = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { orderId } = req.params;

      const validation = await this.assetService.validateForProduction(orderId);

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ validation }, validation.message));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete asset
   * @route DELETE /api/assets/:id
   */
  deleteAsset = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      await this.assetService.deleteAsset(id);

      Logger.success(`[AssetCtrl] Deleted asset ${id}`);

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success(null, "Đã xóa file thành công"));
    } catch (error) {
      next(error);
    }
  };
}

// Export singleton instance
export const assetController = new AssetController();

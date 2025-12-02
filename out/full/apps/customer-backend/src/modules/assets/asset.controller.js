// src/modules/assets/asset.controller.js (ĐÃ CẬP NHẬT)
import { AssetService } from "./asset.service.js";
import { ApiResponse } from "../../shared/utils/index.js";
import { API_CODES } from "../../shared/constants/index.js";
import { Logger } from "../../shared/utils/logger.util.js";

export class AssetController {
  constructor() {
    this.assetService = new AssetService();
  }

  createAsset = async (req, res, next) => {
    try {
      const asset = await this.assetService.createAsset(req.body, req.user._id);
      res
        .status(API_CODES.CREATED)
        .json(ApiResponse.success({ asset }, "Tạo phôi thành công!"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * ✅ SỬA: Trả về đối tượng do Service cung cấp
   */
  getMyAssets = async (req, res, next) => {
    try {
      // assets bây giờ là { privateAssets, publicAssets }
      const assets = await this.assetService.getMyAssets(req.user._id);
      res.status(API_CODES.SUCCESS).json(ApiResponse.success(assets));
    } catch (error) {
      next(error);
    }
  };

  getAssetById = async (req, res, next) => {
    try {
      const asset = await this.assetService.getAssetById(
        req.params.assetId,
        req.user._id
      );
      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ asset }));
    } catch (error) {
      next(error);
    }
  };

  updateAsset = async (req, res, next) => {
    try {
      const asset = await this.assetService.updateAsset(
        req.params.assetId,
        req.body,
        req.user._id
      );
      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ asset }, "Cập nhật phôi thành công!"));
    } catch (error) {
      next(error);
    }
  };
}

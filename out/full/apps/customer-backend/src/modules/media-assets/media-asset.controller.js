// src/modules/media-assets/media-asset.controller.js
import { MediaAssetService } from "./media-asset.service.js";
import { ApiResponse } from "../../shared/utils/index.js";
import { API_CODES } from "../../shared/constants/index.js";

export class MediaAssetController {
  constructor() {
    this.mediaAssetService = new MediaAssetService();
  }

  handleGetMyAssets = async (req, res, next) => {
    try {
      const assets = await this.mediaAssetService.getMyMediaAssets(
        req.user._id
      );
      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ assets }));
    } catch (error) {
      next(error);
    }
  };

  handleCreateMediaAsset = async (req, res, next) => {
    try {
      // req.body chứa (url, publicId, name, fileType, size)
      const asset = await this.mediaAssetService.createMediaAsset(
        req.user._id,
        req.body
      );
      res.status(API_CODES.CREATED).json(ApiResponse.success({ asset }));
    } catch (error) {
      next(error);
    }
  };

  handleDeleteMediaAsset = async (req, res, next) => {
    try {
      await this.mediaAssetService.deleteMediaAsset(
        req.user._id,
        req.params.id
      );
      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success(null, "Xóa tài sản thành công."));
    } catch (error) {
      next(error);
    }
  };
}

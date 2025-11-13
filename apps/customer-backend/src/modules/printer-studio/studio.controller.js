// src/modules/printer-studio/studio.controller.js
import { StudioService } from "./studio.service.js";
import { ApiResponse } from "../../shared/utils/index.js";
import { API_CODES } from "../../shared/constants/index.js";

export class StudioController {
  constructor() {
    this.studioService = new StudioService();
  }

  publishStudioAsset = async (req, res, next) => {
    try {
      const result = await this.studioService.publish(
        req.user._id, // ID của Printer
        req.body, // Dữ liệu JSON (productData, templateData)
        req.files // Các file đã upload (modelFile, dielineFile, v.v.)
      );

      res
        .status(API_CODES.CREATED)
        .json(ApiResponse.success(result, "Tác phẩm đã được đăng bán!"));
    } catch (error) {
      next(error);
    }
  };
}

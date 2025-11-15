// src/modules/designs/design.controller.js
import { DesignService } from "./design.service.js";
import { ApiResponse } from "../../shared/utils/index.js";
import { API_CODES } from "../../shared/constants/index.js";

export class DesignController {
  constructor() {
    this.designService = new DesignService();
  }

  // === Template (Printer) ===

  createTemplate = async (req, res, next) => {
    try {
      const template = await this.designService.createTemplate(
        req.user._id,
        req.body,
        req.files
      );
      res
        .status(API_CODES.CREATED)
        .json(ApiResponse.success({ template }, "Tạo mẫu thành công!"));
    } catch (error) {
      next(error);
    }
  };

  getMyTemplates = async (req, res, next) => {
    try {
      const templates = await this.designService.getMyTemplates(req.user._id);
      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ templates }));
    } catch (error) {
      next(error);
    }
  };

  // === Public (User) ===

  getPublicTemplates = async (req, res, next) => {
    try {
      const templates = await this.designService.getPublicTemplates();
      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ templates }));
    } catch (error) {
      next(error);
    }
  };

  getTemplateById = async (req, res, next) => {
    try {
      const template = await this.designService.getTemplateById(req.params.id);
      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ template }));
    } catch (error) {
      next(error);
    }
  };

  // === Customized Design (User) ===

  createCustomizedDesign = async (req, res, next) => {
    try {
      const design = await this.designService.createCustomizedDesign(
        req.user._id,
        req.body
      );
      res
        .status(API_CODES.CREATED)
        .json(
          ApiResponse.success({ design }, "Lưu thiết kế tùy chỉnh thành công!")
        );
    } catch (error) {
      next(error);
    }
  };

  getCustomizedDesign = async (req, res, next) => {
    try {
      const design = await this.designService.getCustomizedDesign(
        req.params.id,
        req.user
      );
      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ design }));
    } catch (error) {
      next(error);
    }
  };
  getMyCustomizedDesigns = async (req, res, next) => {
    try {
      const designs = await this.designService.getMyCustomizedDesigns(
        req.user._id
      );
      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ designs }));
    } catch (error) {
      next(error);
    }
  };

  // ✅ THÊM: Save draft design
  saveDraftDesign = async (req, res, next) => {
    try {
      const design = await this.designService.saveDraftDesign(
        req.user._id,
        req.body
      );
      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ design }, "Đã lưu bản nháp"));
    } catch (error) {
      next(error);
    }
  };

  // ✅ THÊM: Get draft design
  getDraftDesign = async (req, res, next) => {
    try {
      const { productId } = req.query;
      if (!productId) {
        return res.status(400).json(
          ApiResponse.error("Thiếu productId trong query")
        );
      }
      const design = await this.designService.getDraftDesign(
        req.user._id,
        productId
      );
      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ design }));
    } catch (error) {
      next(error);
    }
  };
}

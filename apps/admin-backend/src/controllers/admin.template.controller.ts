// apps/admin-backend/src/controllers/admin.template.controller.ts
// ✅ PHASE 9.1.3: Template Controller - HTTP handlers for template management

import { Request, Response, NextFunction } from "express";
import { TemplateService } from "../services/template.service.js";
import { ApiResponse } from "../../../shared/utils/api-response.js";
import { API_CODES } from "../../../shared/constants/api-codes.js";

/**
 * Template Controller
 * Handles HTTP requests for product template management
 */
export class TemplateController {
  private templateService: TemplateService;

  constructor() {
    this.templateService = new TemplateService();
  }

  /**
   * Create template from existing order
   * @route POST /api/admin/templates/from-order/:orderId
   */
  createFromOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const organizationId = req.user.organizationProfileId;
      const userId = req.user._id;
      const { orderId } = req.params;
      const { name, description, type, isPublic } = req.body;

      const template = await this.templateService.createFromOrder(
        organizationId,
        userId,
        {
          orderId,
          name,
          description,
          type,
          isPublic,
        }
      );

      res
        .status(API_CODES.CREATED)
        .json(ApiResponse.success({ template }, "Đã tạo template thành công!"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get templates list
   * @route GET /api/admin/templates
   */
  getTemplates = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const organizationId = req.user.organizationProfileId;
      const { type, isPublic, isActive } = req.query;

      const templates = await this.templateService.getTemplates(
        organizationId,
        {
          type: type as string,
          isPublic: isPublic === "true",
          isActive: isActive !== "false",
        }
      );

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ templates, total: templates.length }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get template detail
   * @route GET /api/admin/templates/:id
   */
  getTemplate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const organizationId = req.user.organizationProfileId;
      const { id } = req.params;

      const template = await this.templateService.getTemplate(
        organizationId,
        id
      );

      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ template }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Load template for reorder
   * @route GET /api/admin/templates/:id/load-for-reorder
   */
  loadForReorder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const organizationId = req.user.organizationProfileId;
      const { id } = req.params;

      const result = await this.templateService.loadForReorder(
        organizationId,
        id
      );

      res.status(API_CODES.SUCCESS).json(ApiResponse.success(result));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get suggested substitutes for a product
   * @route GET /api/admin/templates/:id/substitutes/:productId
   */
  getSuggestedSubstitutes = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id, productId } = req.params;

      const substitutes = await this.templateService.getSuggestedSubstitutes(
        id,
        productId
      );

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ substitutes, total: substitutes.length }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update template substitutes
   * @route PUT /api/admin/templates/:id/substitutes/:productId
   */
  updateSubstitutes = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const organizationId = req.user.organizationProfileId;
      const { id, productId } = req.params;
      const { substituteProductIds } = req.body;

      const template = await this.templateService.updateSubstitutes(
        organizationId,
        id,
        productId,
        substituteProductIds
      );

      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success(
            { template },
            "Đã cập nhật sản phẩm thay thế thành công!"
          )
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update template
   * @route PUT /api/admin/templates/:id
   */
  updateTemplate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const organizationId = req.user.organizationProfileId;
      const { id } = req.params;
      const data = req.body;

      const template = await this.templateService.updateTemplate(
        organizationId,
        id,
        data
      );

      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success({ template }, "Đã cập nhật template thành công!")
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete template
   * @route DELETE /api/admin/templates/:id
   */
  deleteTemplate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const organizationId = req.user.organizationProfileId;
      const { id } = req.params;

      await this.templateService.deleteTemplate(organizationId, id);

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success(null, "Đã xóa template thành công!"));
    } catch (error) {
      next(error);
    }
  };
}

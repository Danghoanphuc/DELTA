// src/modules/swag-packs/swag-pack.controller.js
// ✅ Swag Pack Controller - HTTP handlers

import { SwagPackService } from "./swag-pack.service.js";
import { ApiResponse } from "../../shared/utils/index.js";
import { API_CODES } from "../../shared/constants/index.js";
import { ValidationException } from "../../shared/exceptions/index.js";

export class SwagPackController {
  constructor() {
    this.swagPackService = new SwagPackService();
  }

  /**
   * Create a new swag pack
   * @route POST /api/swag-packs
   */
  createPack = async (req, res, next) => {
    try {
      const organizationId = req.user.organizationProfileId;
      const userId = req.user._id;

      const pack = await this.swagPackService.createPack(
        organizationId,
        userId,
        req.body
      );

      res
        .status(API_CODES.CREATED)
        .json(ApiResponse.success({ pack }, "Đã tạo bộ quà!"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get packs list
   * @route GET /api/swag-packs
   */
  getPacks = async (req, res, next) => {
    try {
      const organizationId = req.user.organizationProfileId;
      const { status, type, search, page, limit, sortBy, sortOrder } =
        req.query;

      const result = await this.swagPackService.getPacks(organizationId, {
        status,
        type,
        search,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        sortBy,
        sortOrder,
      });

      res.status(API_CODES.SUCCESS).json(ApiResponse.success(result));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get single pack
   * @route GET /api/swag-packs/:id
   */
  getPack = async (req, res, next) => {
    try {
      const organizationId = req.user.organizationProfileId;
      const pack = await this.swagPackService.getPack(
        organizationId,
        req.params.id
      );

      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ pack }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update pack
   * @route PUT /api/swag-packs/:id
   */
  updatePack = async (req, res, next) => {
    try {
      const organizationId = req.user.organizationProfileId;
      const pack = await this.swagPackService.updatePack(
        organizationId,
        req.params.id,
        req.body
      );

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ pack }, "Đã cập nhật!"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Add item to pack
   * @route POST /api/swag-packs/:id/items
   */
  addItem = async (req, res, next) => {
    try {
      const organizationId = req.user.organizationProfileId;
      const pack = await this.swagPackService.addItem(
        organizationId,
        req.params.id,
        req.body
      );

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ pack }, "Đã thêm sản phẩm!"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Remove item from pack
   * @route DELETE /api/swag-packs/:id/items/:itemId
   */
  removeItem = async (req, res, next) => {
    try {
      const organizationId = req.user.organizationProfileId;
      const pack = await this.swagPackService.removeItem(
        organizationId,
        req.params.id,
        req.params.itemId
      );

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ pack }, "Đã xóa sản phẩm!"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update item in pack
   * @route PUT /api/swag-packs/:id/items/:itemId
   */
  updateItem = async (req, res, next) => {
    try {
      const organizationId = req.user.organizationProfileId;
      const pack = await this.swagPackService.updateItem(
        organizationId,
        req.params.id,
        req.params.itemId,
        req.body
      );

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ pack }, "Đã cập nhật!"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Publish pack
   * @route POST /api/swag-packs/:id/publish
   */
  publishPack = async (req, res, next) => {
    try {
      const organizationId = req.user.organizationProfileId;
      const pack = await this.swagPackService.publishPack(
        organizationId,
        req.params.id
      );

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ pack }, "Đã kích hoạt bộ quà!"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Archive pack
   * @route POST /api/swag-packs/:id/archive
   */
  archivePack = async (req, res, next) => {
    try {
      const organizationId = req.user.organizationProfileId;
      const pack = await this.swagPackService.archivePack(
        organizationId,
        req.params.id
      );

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ pack }, "Đã lưu trữ bộ quà!"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete pack
   * @route DELETE /api/swag-packs/:id
   */
  deletePack = async (req, res, next) => {
    try {
      const organizationId = req.user.organizationProfileId;
      await this.swagPackService.deletePack(organizationId, req.params.id);

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success(null, "Đã xóa bộ quà!"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Duplicate pack
   * @route POST /api/swag-packs/:id/duplicate
   */
  duplicatePack = async (req, res, next) => {
    try {
      const organizationId = req.user.organizationProfileId;
      const pack = await this.swagPackService.duplicatePack(
        organizationId,
        req.params.id
      );

      res
        .status(API_CODES.CREATED)
        .json(ApiResponse.success({ pack }, "Đã nhân bản bộ quà!"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get pack templates
   * @route GET /api/swag-packs/templates
   */
  getTemplates = async (req, res, next) => {
    try {
      const templates = await this.swagPackService.getTemplates();
      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ templates }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get dashboard stats
   * @route GET /api/swag-packs/stats
   */
  getStats = async (req, res, next) => {
    try {
      const organizationId = req.user.organizationProfileId;
      const stats = await this.swagPackService.getStats(organizationId);
      res.status(API_CODES.SUCCESS).json(ApiResponse.success(stats));
    } catch (error) {
      next(error);
    }
  };
}

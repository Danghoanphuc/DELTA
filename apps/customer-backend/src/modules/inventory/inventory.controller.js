// src/modules/inventory/inventory.controller.js
// ✅ Inventory Controller - HTTP handlers

import { InventoryService } from "./inventory.service.js";
import { ApiResponse } from "../../shared/utils/index.js";
import { API_CODES } from "../../shared/constants/index.js";
import { ValidationException } from "../../shared/exceptions/index.js";

export class InventoryController {
  constructor() {
    this.inventoryService = new InventoryService();
  }

  /**
   * Get inventory
   * @route GET /api/inventory
   */
  getInventory = async (req, res, next) => {
    try {
      const organizationId = req.user.organizationProfileId;
      const { status, search, page, limit } = req.query;

      const result = await this.inventoryService.getInventory(organizationId, {
        status,
        search,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 50,
      });

      res.status(API_CODES.SUCCESS).json(ApiResponse.success(result));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get inventory stats
   * @route GET /api/inventory/stats
   */
  getStats = async (req, res, next) => {
    try {
      const organizationId = req.user.organizationProfileId;
      const stats = await this.inventoryService.getStats(organizationId);

      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ stats }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get low stock items
   * @route GET /api/inventory/low-stock
   */
  getLowStockItems = async (req, res, next) => {
    try {
      const organizationId = req.user.organizationProfileId;
      const items = await this.inventoryService.getLowStockItems(
        organizationId
      );

      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ items }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Add item to inventory
   * @route POST /api/inventory/items
   */
  addItem = async (req, res, next) => {
    try {
      const organizationId = req.user.organizationProfileId;
      const { product, productName, quantity, unitCost } = req.body;

      if (!product || !productName) {
        throw new ValidationException("Sản phẩm là bắt buộc");
      }

      const inventory = await this.inventoryService.addItem(
        organizationId,
        req.body
      );

      res
        .status(API_CODES.CREATED)
        .json(ApiResponse.success({ inventory }, "Đã thêm vào kho!"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update item quantity
   * @route PUT /api/inventory/items/:itemId/quantity
   */
  updateQuantity = async (req, res, next) => {
    try {
      const organizationId = req.user.organizationProfileId;
      const { itemId } = req.params;
      const { quantity, operation } = req.body;

      if (quantity === undefined || quantity < 0) {
        throw new ValidationException("Số lượng không hợp lệ");
      }

      const inventory = await this.inventoryService.updateItemQuantity(
        organizationId,
        itemId,
        quantity,
        operation
      );

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ inventory }, "Đã cập nhật số lượng!"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update item details
   * @route PUT /api/inventory/items/:itemId
   */
  updateItem = async (req, res, next) => {
    try {
      const organizationId = req.user.organizationProfileId;
      const { itemId } = req.params;

      const inventory = await this.inventoryService.updateItem(
        organizationId,
        itemId,
        req.body
      );

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ inventory }, "Đã cập nhật!"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Remove item from inventory
   * @route DELETE /api/inventory/items/:itemId
   */
  removeItem = async (req, res, next) => {
    try {
      const organizationId = req.user.organizationProfileId;
      const { itemId } = req.params;

      const inventory = await this.inventoryService.removeItem(
        organizationId,
        itemId
      );

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ inventory }, "Đã xóa khỏi kho!"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Reserve items
   * @route POST /api/inventory/items/:itemId/reserve
   */
  reserveItems = async (req, res, next) => {
    try {
      const organizationId = req.user.organizationProfileId;
      const { itemId } = req.params;
      const { quantity } = req.body;

      const inventory = await this.inventoryService.reserveItems(
        organizationId,
        itemId,
        quantity
      );

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ inventory }, "Đã đặt trước!"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update settings
   * @route PUT /api/inventory/settings
   */
  updateSettings = async (req, res, next) => {
    try {
      const organizationId = req.user.organizationProfileId;

      const inventory = await this.inventoryService.updateSettings(
        organizationId,
        req.body
      );

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ inventory }, "Đã cập nhật cài đặt!"));
    } catch (error) {
      next(error);
    }
  };
}

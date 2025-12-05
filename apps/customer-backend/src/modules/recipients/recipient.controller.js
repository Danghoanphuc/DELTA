// src/modules/recipients/recipient.controller.js
// ✅ Recipient Controller - HTTP handlers

import { RecipientService } from "./recipient.service.js";
import { ApiResponse } from "../../shared/utils/index.js";
import { API_CODES } from "../../shared/constants/index.js";
import { Logger } from "../../shared/utils/logger.util.js";
import { ValidationException } from "../../shared/exceptions/index.js";

export class RecipientController {
  constructor() {
    this.recipientService = new RecipientService();
  }

  /**
   * Create a single recipient
   * @route POST /api/recipients
   */
  createRecipient = async (req, res, next) => {
    try {
      const organizationId = req.user.organizationProfileId;
      const { firstName, lastName, email, phone, address, customFields, tags } =
        req.body;

      if (!firstName || !lastName || !email) {
        throw new ValidationException("Họ, tên và email là bắt buộc");
      }

      const recipient = await this.recipientService.createRecipient(
        organizationId,
        {
          firstName,
          lastName,
          email,
          phone,
          address,
          customFields,
          tags,
        }
      );

      res
        .status(API_CODES.CREATED)
        .json(ApiResponse.success({ recipient }, "Đã thêm người nhận!"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Import recipients from CSV
   * @route POST /api/recipients/import
   */
  importCSV = async (req, res, next) => {
    try {
      const organizationId = req.user.organizationProfileId;

      if (!req.file) {
        throw new ValidationException("Vui lòng upload file CSV");
      }

      const csvContent = req.file.buffer.toString("utf-8");
      const { skipDuplicates, tags } = req.body;

      const results = await this.recipientService.importFromCSV(
        organizationId,
        csvContent,
        {
          skipDuplicates: skipDuplicates !== "false",
          tags: tags ? tags.split(",").map((t) => t.trim()) : [],
        }
      );

      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success(
            results,
            `Đã import ${results.imported} người nhận!`
          )
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get recipients list
   * @route GET /api/recipients
   */
  getRecipients = async (req, res, next) => {
    try {
      const organizationId = req.user.organizationProfileId;
      const {
        status,
        tags,
        department,
        search,
        page,
        limit,
        sortBy,
        sortOrder,
      } = req.query;

      const result = await this.recipientService.getRecipients(organizationId, {
        status,
        tags: tags ? tags.split(",") : undefined,
        department,
        search,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 50,
        sortBy,
        sortOrder,
      });

      res.status(API_CODES.SUCCESS).json(ApiResponse.success(result));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get single recipient
   * @route GET /api/recipients/:id
   */
  getRecipient = async (req, res, next) => {
    try {
      const organizationId = req.user.organizationProfileId;
      const recipient = await this.recipientService.getRecipient(
        organizationId,
        req.params.id
      );

      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ recipient }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update recipient
   * @route PUT /api/recipients/:id
   */
  updateRecipient = async (req, res, next) => {
    try {
      const organizationId = req.user.organizationProfileId;
      const recipient = await this.recipientService.updateRecipient(
        organizationId,
        req.params.id,
        req.body
      );

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ recipient }, "Đã cập nhật!"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Archive recipient
   * @route DELETE /api/recipients/:id
   */
  archiveRecipient = async (req, res, next) => {
    try {
      const organizationId = req.user.organizationProfileId;
      await this.recipientService.archiveRecipient(
        organizationId,
        req.params.id
      );

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success(null, "Đã xóa người nhận!"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Bulk archive recipients
   * @route POST /api/recipients/bulk-archive
   */
  bulkArchive = async (req, res, next) => {
    try {
      const organizationId = req.user.organizationProfileId;
      const { ids } = req.body;

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new ValidationException("Vui lòng chọn ít nhất 1 người nhận");
      }

      const result = await this.recipientService.bulkArchive(
        organizationId,
        ids
      );

      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success(result, `Đã xóa ${result.archived} người nhận!`)
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Add tags to recipients
   * @route POST /api/recipients/add-tags
   */
  addTags = async (req, res, next) => {
    try {
      const organizationId = req.user.organizationProfileId;
      const { ids, tags } = req.body;

      if (!ids || !tags) {
        throw new ValidationException("Vui lòng chọn người nhận và tags");
      }

      const result = await this.recipientService.addTags(
        organizationId,
        ids,
        tags
      );

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success(result, "Đã thêm tags!"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get filter options
   * @route GET /api/recipients/filters
   */
  getFilterOptions = async (req, res, next) => {
    try {
      const organizationId = req.user.organizationProfileId;
      const options = await this.recipientService.getFilterOptions(
        organizationId
      );

      res.status(API_CODES.SUCCESS).json(ApiResponse.success(options));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Download CSV template
   * @route GET /api/recipients/template
   */
  downloadTemplate = async (req, res, next) => {
    try {
      const template = this.recipientService.getCSVTemplate();

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=recipients_template.csv"
      );
      res.send("\uFEFF" + template); // BOM for Excel UTF-8
    } catch (error) {
      next(error);
    }
  };
}

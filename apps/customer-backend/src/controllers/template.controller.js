// apps/customer-backend/src/controllers/template.controller.js
// Template Controller - HTTP Request Handlers

import { templateService } from "../services/template.service.js";
import { threadService } from "../services/thread.service.js";
import { ApiResponse } from "../shared/utils/api-response.util.js";
import { API_CODES } from "../shared/constants/api-codes.constants.js";
import { Logger } from "../shared/utils/logger.util.js";

/**
 * Template Controller
 * Handles HTTP requests for thread templates
 */
export class TemplateController {
  /**
   * Create a new template
   * @route POST /api/thread-templates
   */
  createTemplate = async (req, res, next) => {
    try {
      const userId = req.user._id;
      const data = req.body;

      const template = await templateService.createTemplate(userId, data);

      res
        .status(API_CODES.CREATED)
        .json(
          ApiResponse.success({ template }, "Template đã được tạo thành công!")
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get templates with filters
   * @route GET /api/thread-templates
   * @query category - Filter by category
   * @query contextType - Filter by context type
   * @query organizationId - Filter by organization
   */
  getTemplates = async (req, res, next) => {
    try {
      const { category, contextType, organizationId } = req.query;

      const filters = {};
      if (category) filters.category = category;
      if (contextType) filters.contextType = contextType;
      if (organizationId) filters.organizationId = organizationId;

      const templates = await templateService.getTemplates(filters);

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ templates, count: templates.length }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get template by ID
   * @route GET /api/thread-templates/:id
   */
  getTemplate = async (req, res, next) => {
    try {
      const { id } = req.params;

      const template = await templateService.getTemplate(id);

      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ template }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get templates for specific context
   * @route GET /api/thread-templates/context/:contextType
   * @query organizationId - Optional organization filter
   */
  getTemplatesForContext = async (req, res, next) => {
    try {
      const { contextType } = req.params;
      const { organizationId } = req.query;

      const templates = await templateService.getTemplatesForContext(
        contextType,
        organizationId || null
      );

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ templates, count: templates.length }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get templates by category
   * @route GET /api/thread-templates/category/:category
   * @query organizationId - Optional organization filter
   */
  getTemplatesByCategory = async (req, res, next) => {
    try {
      const { category } = req.params;
      const { organizationId } = req.query;

      const templates = await templateService.getTemplatesByCategory(
        category,
        organizationId || null
      );

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success({ templates, count: templates.length }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update template
   * @route PUT /api/thread-templates/:id
   */
  updateTemplate = async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user._id;
      const data = req.body;

      const template = await templateService.updateTemplate(id, userId, data);

      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success(
            { template },
            "Template đã được cập nhật thành công!"
          )
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete template (soft delete)
   * @route DELETE /api/thread-templates/:id
   */
  deleteTemplate = async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user._id;

      const result = await templateService.deleteTemplate(id, userId);

      res.status(API_CODES.SUCCESS).json(ApiResponse.success(result));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create thread from template
   * @route POST /api/threads/from-template/:templateId
   */
  createThreadFromTemplate = async (req, res, next) => {
    try {
      const { templateId } = req.params;
      const userId = req.user._id;
      const { templateData, threadData } = req.body;

      Logger.debug(
        `[TemplateCtrl] Creating thread from template: ${templateId}`
      );

      // Apply template
      const applied = await templateService.applyTemplate(
        templateId,
        templateData || {}
      );

      // Merge with thread data
      const mergedData = {
        ...threadData,
        title: applied.title,
        description: applied.content,
        tags: applied.tags,
        priority: applied.priority,
        templateId: applied.templateId,
        templateName: applied.templateName,
      };

      // Create thread
      const thread = await threadService.createThread(userId, mergedData);

      res
        .status(API_CODES.CREATED)
        .json(
          ApiResponse.success(
            { thread },
            "Thread đã được tạo từ template thành công!"
          )
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Apply template (preview without creating thread)
   * @route POST /api/thread-templates/:id/apply
   */
  applyTemplate = async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = req.body;

      const applied = await templateService.applyTemplate(id, data);

      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ applied }));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create default templates
   * @route POST /api/thread-templates/seed-defaults
   */
  seedDefaultTemplates = async (req, res, next) => {
    try {
      const userId = req.user._id;

      const templates = await templateService.createDefaultTemplates(userId);

      res
        .status(API_CODES.CREATED)
        .json(
          ApiResponse.success(
            { templates, count: templates.length },
            `Đã tạo ${templates.length} default templates`
          )
        );
    } catch (error) {
      next(error);
    }
  };
}

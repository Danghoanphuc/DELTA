// apps/customer-backend/src/services/template.service.js
// Template Service - Business Logic Layer for Thread Templates

import {
  ThreadTemplate,
  TEMPLATE_CATEGORY,
  CONTEXT_TYPE,
} from "../shared/models/thread-template.model.js";
import {
  ValidationException,
  NotFoundException,
  ForbiddenException,
} from "../shared/exceptions/index.js";
import { Logger } from "../shared/utils/logger.util.js";

/**
 * Template Service
 * Handles business logic for thread templates
 */
export class TemplateService {
  /**
   * Create a new template
   */
  async createTemplate(userId, data) {
    Logger.debug(`[TemplateSvc] Creating template for user: ${userId}`);

    // Validation
    if (!data.name || data.name.trim().length === 0) {
      throw new ValidationException("Tên template không được để trống");
    }

    if (!data.titleTemplate || data.titleTemplate.trim().length === 0) {
      throw new ValidationException("Title template không được để trống");
    }

    if (!data.category) {
      throw new ValidationException("Category không được để trống");
    }

    if (!Object.values(TEMPLATE_CATEGORY).includes(data.category)) {
      throw new ValidationException(
        `Category không hợp lệ. Phải là một trong: ${Object.values(
          TEMPLATE_CATEGORY
        ).join(", ")}`
      );
    }

    // Validate applicable contexts
    if (data.applicableContexts && data.applicableContexts.length > 0) {
      const invalidContexts = data.applicableContexts.filter(
        (ctx) => !Object.values(CONTEXT_TYPE).includes(ctx)
      );
      if (invalidContexts.length > 0) {
        throw new ValidationException(
          `Context không hợp lệ: ${invalidContexts.join(", ")}`
        );
      }
    }

    // Prepare template data
    const templateData = {
      name: data.name,
      description: data.description || "",
      category: data.category,
      titleTemplate: data.titleTemplate,
      contentTemplate: data.contentTemplate || "",
      defaultTags: data.defaultTags || [],
      defaultPriority: data.defaultPriority || "normal",
      applicableContexts: data.applicableContexts || [],
      quickActions: data.quickActions || [],
      organizationId: data.organizationId || null,
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdBy: userId,
    };

    const template = await ThreadTemplate.create(templateData);

    Logger.success(
      `[TemplateSvc] Created template: ${template.name} (${template._id})`
    );

    return template;
  }

  /**
   * Get templates with filters
   */
  async getTemplates(filters = {}) {
    Logger.debug(`[TemplateSvc] Getting templates with filters:`, filters);

    const query = { isActive: true };

    // Filter by category
    if (filters.category) {
      query.category = filters.category;
    }

    // Filter by context
    if (filters.contextType) {
      query.$or = [
        { applicableContexts: filters.contextType },
        { applicableContexts: { $size: 0 } }, // Global templates
      ];
    }

    // Filter by organization
    if (filters.organizationId) {
      query.$or = [
        { organizationId: filters.organizationId },
        { organizationId: null }, // Global templates
      ];
    } else if (filters.organizationId === null) {
      query.organizationId = null; // Only global templates
    }

    const templates = await ThreadTemplate.find(query)
      .sort({ category: 1, name: 1 })
      .lean();

    Logger.debug(`[TemplateSvc] Found ${templates.length} templates`);

    return templates;
  }

  /**
   * Get template by ID
   */
  async getTemplate(templateId) {
    Logger.debug(`[TemplateSvc] Getting template: ${templateId}`);

    const template = await ThreadTemplate.findById(templateId).lean();

    if (!template) {
      throw new NotFoundException("Template", templateId);
    }

    return template;
  }

  /**
   * Get templates for specific context
   */
  async getTemplatesForContext(contextType, organizationId = null) {
    Logger.debug(
      `[TemplateSvc] Getting templates for context: ${contextType}, org: ${organizationId}`
    );

    const templates = await ThreadTemplate.getForContext(
      contextType,
      organizationId
    );

    Logger.debug(
      `[TemplateSvc] Found ${templates.length} templates for context ${contextType}`
    );

    return templates;
  }

  /**
   * Get templates by category
   */
  async getTemplatesByCategory(category, organizationId = null) {
    Logger.debug(
      `[TemplateSvc] Getting templates for category: ${category}, org: ${organizationId}`
    );

    if (!Object.values(TEMPLATE_CATEGORY).includes(category)) {
      throw new ValidationException(
        `Category không hợp lệ. Phải là một trong: ${Object.values(
          TEMPLATE_CATEGORY
        ).join(", ")}`
      );
    }

    const templates = await ThreadTemplate.getByCategory(
      category,
      organizationId
    );

    Logger.debug(
      `[TemplateSvc] Found ${templates.length} templates for category ${category}`
    );

    return templates;
  }

  /**
   * Apply template with data
   */
  async applyTemplate(templateId, data = {}) {
    Logger.debug(`[TemplateSvc] Applying template: ${templateId}`);

    const template = await ThreadTemplate.findById(templateId);

    if (!template) {
      throw new NotFoundException("Template", templateId);
    }

    if (!template.isActive) {
      throw new ValidationException("Template không còn hoạt động");
    }

    // Apply template
    const applied = template.apply(data);

    Logger.debug(`[TemplateSvc] Applied template: ${template.name}`);

    return applied;
  }

  /**
   * Update template
   */
  async updateTemplate(templateId, userId, data) {
    Logger.debug(`[TemplateSvc] Updating template: ${templateId}`);

    const template = await ThreadTemplate.findById(templateId);

    if (!template) {
      throw new NotFoundException("Template", templateId);
    }

    // Check permission (only creator or admin can update)
    // TODO: Add proper permission checking when user roles are available
    if (template.createdBy.toString() !== userId.toString()) {
      // For now, allow updates. In production, check if user is admin
      Logger.warn(
        `[TemplateSvc] User ${userId} updating template created by ${template.createdBy}`
      );
    }

    // Update fields
    if (data.name !== undefined) template.name = data.name;
    if (data.description !== undefined) template.description = data.description;
    if (data.category !== undefined) {
      if (!Object.values(TEMPLATE_CATEGORY).includes(data.category)) {
        throw new ValidationException(
          `Category không hợp lệ. Phải là một trong: ${Object.values(
            TEMPLATE_CATEGORY
          ).join(", ")}`
        );
      }
      template.category = data.category;
    }
    if (data.titleTemplate !== undefined)
      template.titleTemplate = data.titleTemplate;
    if (data.contentTemplate !== undefined)
      template.contentTemplate = data.contentTemplate;
    if (data.defaultTags !== undefined) template.defaultTags = data.defaultTags;
    if (data.defaultPriority !== undefined)
      template.defaultPriority = data.defaultPriority;
    if (data.applicableContexts !== undefined) {
      // Validate contexts
      const invalidContexts = data.applicableContexts.filter(
        (ctx) => !Object.values(CONTEXT_TYPE).includes(ctx)
      );
      if (invalidContexts.length > 0) {
        throw new ValidationException(
          `Context không hợp lệ: ${invalidContexts.join(", ")}`
        );
      }
      template.applicableContexts = data.applicableContexts;
    }
    if (data.quickActions !== undefined)
      template.quickActions = data.quickActions;
    if (data.isActive !== undefined) template.isActive = data.isActive;

    await template.save();

    Logger.success(`[TemplateSvc] Updated template: ${template.name}`);

    return template;
  }

  /**
   * Delete template (soft delete by setting isActive = false)
   */
  async deleteTemplate(templateId, userId) {
    Logger.debug(`[TemplateSvc] Deleting template: ${templateId}`);

    const template = await ThreadTemplate.findById(templateId);

    if (!template) {
      throw new NotFoundException("Template", templateId);
    }

    // Check permission (only creator or admin can delete)
    // TODO: Add proper permission checking when user roles are available
    if (template.createdBy.toString() !== userId.toString()) {
      Logger.warn(
        `[TemplateSvc] User ${userId} deleting template created by ${template.createdBy}`
      );
    }

    // Soft delete
    template.isActive = false;
    await template.save();

    Logger.success(`[TemplateSvc] Deleted template: ${template.name}`);

    return { success: true, message: "Template đã được xóa" };
  }

  /**
   * Check if template is applicable for context
   */
  async checkApplicability(templateId, contextType) {
    Logger.debug(
      `[TemplateSvc] Checking applicability of template ${templateId} for context ${contextType}`
    );

    const template = await ThreadTemplate.findById(templateId);

    if (!template) {
      throw new NotFoundException("Template", templateId);
    }

    if (!template.isActive) {
      throw new ValidationException("Template không còn hoạt động");
    }

    const isApplicable = template.isApplicableFor(contextType);

    if (!isApplicable) {
      throw new ValidationException(
        `Template không áp dụng được cho context ${contextType}`
      );
    }

    return true;
  }

  /**
   * Create default templates
   */
  async createDefaultTemplates(userId) {
    Logger.debug(`[TemplateSvc] Creating default templates`);

    const created = await ThreadTemplate.createDefaults(userId);

    Logger.success(`[TemplateSvc] Created ${created.length} default templates`);

    return created;
  }
}

// Export singleton instance
export const templateService = new TemplateService();

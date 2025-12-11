// apps/customer-backend/src/services/quick-action.service.js
// Quick Action Service for ORDER Context

import logger from "../infrastructure/logger.js";
import { ThreadTemplate } from "../shared/models/thread-template.model.js";
import { ThreadService } from "./thread.service.js";
import { ParticipantService } from "./participant.service.js";
import {
  ValidationException,
  NotFoundException,
  ForbiddenException,
} from "../shared/exceptions/index.js";

// Quick Action Types
export const QUICK_ACTION_TYPE = {
  CANCEL_ORDER: "cancel_order",
  CHANGE_ADDRESS: "change_address",
  CHANGE_QUANTITY: "change_quantity",
  REPORT_PRODUCT_ISSUE: "report_product_issue",
  REPORT_SHIPPING_ISSUE: "report_shipping_issue",
};

export class QuickActionService {
  constructor() {
    this.threadService = new ThreadService();
    this.participantService = new ParticipantService();
  }

  /**
   * Get available quick actions for an order
   * @param {string} orderId - Order ID
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - Array of quick actions with templates
   */
  async getQuickActionsForOrder(orderId, userId) {
    logger.debug(
      `[QuickActionSvc] Getting quick actions for order: ${orderId}`
    );

    // Get all templates with quick actions for ORDER context
    const templates = await ThreadTemplate.find({
      "quickActions.0": { $exists: true }, // Has at least one quick action
      applicableContexts: "ORDER",
      isActive: true,
    }).lean();

    if (!templates || templates.length === 0) {
      logger.warn(`[QuickActionSvc] No templates with quick actions found`);
      return [];
    }

    // Extract all quick actions from templates
    const quickActions = [];
    templates.forEach((template) => {
      template.quickActions.forEach((action) => {
        quickActions.push({
          action: action.action,
          label: action.label,
          icon: action.icon,
          templateId: template._id,
          templateName: template.name,
          category: template.category,
        });
      });
    });

    logger.success(
      `[QuickActionSvc] Found ${quickActions.length} quick actions`
    );
    return quickActions;
  }

  /**
   * Execute a quick action
   * @param {string} action - Action type (cancel_order, change_address, etc.)
   * @param {string} orderId - Order ID
   * @param {string} userId - User ID
   * @param {Object} data - Action-specific data
   * @returns {Promise<Object>} - Created thread
   */
  async executeQuickAction(action, orderId, userId, data = {}) {
    logger.debug(
      `[QuickActionSvc] Executing quick action: ${action} for order: ${orderId}`
    );

    // Validate action type
    if (!Object.values(QUICK_ACTION_TYPE).includes(action)) {
      throw new ValidationException(`Invalid quick action type: ${action}`);
    }

    // Find template with this quick action
    const template = await ThreadTemplate.findOne({
      "quickActions.action": action,
      applicableContexts: "ORDER",
      isActive: true,
    });

    if (!template) {
      throw new NotFoundException("Template", `with action ${action}`);
    }

    logger.debug(
      `[QuickActionSvc] Found template: ${template.name} for action: ${action}`
    );

    // Prepare template data based on action type
    const templateData = await this.prepareTemplateData(action, orderId, data);

    // Apply template
    const applied = template.apply(templateData);

    // Create thread with template
    const threadData = {
      title: applied.title,
      description: applied.content,
      context: {
        referenceId: orderId,
        referenceType: "ORDER",
        metadata: {
          orderNumber: data.orderNumber || orderId,
          quickAction: action,
          ...data.metadata,
        },
      },
      tags: applied.tags,
      priority: applied.priority,
      templateId: applied.templateId,
      templateName: applied.templateName,
    };

    // Create thread
    const thread = await this.threadService.createThread(userId, threadData);

    // Auto-add stakeholders for ORDER context
    await this.participantService.autoAddStakeholders(
      thread._id.toString(),
      orderId,
      "ORDER"
    );

    logger.success(
      `[QuickActionSvc] Created thread ${thread._id} from quick action: ${action}`
    );

    return thread;
  }

  /**
   * Prepare template data based on action type
   * @param {string} action - Action type
   * @param {string} orderId - Order ID
   * @param {Object} data - User-provided data
   * @returns {Promise<Object>} - Template data
   */
  async prepareTemplateData(action, orderId, data) {
    const templateData = {
      order_id: orderId,
      order_number: data.orderNumber || orderId,
      ...data,
    };

    switch (action) {
      case QUICK_ACTION_TYPE.CANCEL_ORDER:
        return {
          ...templateData,
          reason: data.reason || "",
          notes: data.notes || "",
        };

      case QUICK_ACTION_TYPE.CHANGE_ADDRESS:
        return {
          ...templateData,
          change_type: "Địa chỉ giao hàng",
          current_info: data.currentAddress || "",
          new_info: data.newAddress || "",
          reason: data.reason || "",
        };

      case QUICK_ACTION_TYPE.CHANGE_QUANTITY:
        return {
          ...templateData,
          change_type: "Số lượng sản phẩm",
          current_info: data.currentQuantity || "",
          new_info: data.newQuantity || "",
          reason: data.reason || "",
        };

      case QUICK_ACTION_TYPE.REPORT_PRODUCT_ISSUE:
        return {
          ...templateData,
          issue_type: "Sản phẩm bị lỗi",
          description: data.description || "",
          screenshots: data.screenshots || "",
          additional_info: data.additionalInfo || "",
        };

      case QUICK_ACTION_TYPE.REPORT_SHIPPING_ISSUE:
        return {
          ...templateData,
          issue_type: "Vấn đề giao hàng",
          description: data.description || "",
          screenshots: data.screenshots || "",
          additional_info: data.additionalInfo || "",
        };

      default:
        return templateData;
    }
  }

  /**
   * Validate user has permission to execute quick action on order
   * @param {string} orderId - Order ID
   * @param {string} userId - User ID
   * @returns {Promise<boolean>}
   */
  async validateQuickActionPermission(orderId, userId) {
    // TODO: Implement actual order access check
    // For now, assume user has access if they can view the order
    // This should check if user is customer, printer, or admin for the order

    logger.debug(
      `[QuickActionSvc] Validating permission for user ${userId} on order ${orderId}`
    );

    // Placeholder - replace with actual order access check
    return true;
  }
}

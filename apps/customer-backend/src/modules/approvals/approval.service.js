// src/modules/approvals/approval.service.js
// ✅ Approval Workflow Service - Business logic

import { ApprovalRequest, ApprovalSettings } from "./approval.model.js";
import { zaloService } from "../notifications/zalo.service.js";
import {
  NotFoundException,
  ValidationException,
  ForbiddenException,
} from "../../shared/exceptions/index.js";
import { Logger } from "../../shared/utils/index.js";

export class ApprovalService {
  /**
   * Kiểm tra xem có cần duyệt không
   */
  async needsApproval(organizationId, type, data) {
    const settings = await ApprovalSettings.findOne({
      organization: organizationId,
    });

    // Nếu chưa cấu hình hoặc tắt approval
    if (!settings?.enabled || !settings.rules?.[type]?.enabled) {
      return { needsApproval: false };
    }

    const rule = settings.rules[type];

    // Check auto-approve conditions
    if (type === "swag_order") {
      const { totalAmount, recipientCount } = data;

      // Dưới ngưỡng tiền → tự động duyệt
      if (
        rule.autoApproveThreshold > 0 &&
        totalAmount <= rule.autoApproveThreshold
      ) {
        return { needsApproval: false, reason: "under_threshold" };
      }

      // Dưới ngưỡng người nhận → tự động duyệt
      if (
        rule.autoApproveMaxRecipients > 0 &&
        recipientCount <= rule.autoApproveMaxRecipients
      ) {
        return { needsApproval: false, reason: "under_recipient_limit" };
      }
    }

    return {
      needsApproval: true,
      dueDurationHours: rule.dueDurationHours || 24,
      approverRoles: rule.approverRoles || ["owner", "admin"],
    };
  }

  /**
   * Tạo yêu cầu duyệt
   */
  async createRequest(organizationId, userId, data) {
    const { type, referenceId, referenceModel, summary, metadata } = data;

    Logger.debug(
      `[ApprovalSvc] Creating ${type} request for org: ${organizationId}`
    );

    // Get settings for due date
    const settings = await ApprovalSettings.findOne({
      organization: organizationId,
    });
    const dueDurationHours = settings?.rules?.[type]?.dueDurationHours || 24;
    const dueDate = new Date(Date.now() + dueDurationHours * 60 * 60 * 1000);

    const request = await ApprovalRequest.create({
      organization: organizationId,
      type,
      referenceId,
      referenceModel,
      summary,
      requestedBy: userId,
      dueDate,
      metadata,
      history: [
        {
          action: "created",
          by: userId,
        },
      ],
    });

    Logger.success(`[ApprovalSvc] Created request: ${request._id}`);

    // Send notifications
    await this._notifyApprovers(organizationId, request);

    return request;
  }

  /**
   * Lấy danh sách yêu cầu chờ duyệt
   */
  async getPendingRequests(organizationId, options = {}) {
    const { type, page = 1, limit = 20 } = options;

    const query = {
      organization: organizationId,
      status: "pending",
    };

    if (type) query.type = type;

    const [requests, total] = await Promise.all([
      ApprovalRequest.find(query)
        .populate("requestedBy", "displayName email avatarUrl")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      ApprovalRequest.countDocuments(query),
    ]);

    return {
      requests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Lấy chi tiết yêu cầu
   */
  async getRequest(organizationId, requestId) {
    const request = await ApprovalRequest.findById(requestId)
      .populate("requestedBy", "displayName email avatarUrl")
      .populate("reviewedBy", "displayName email avatarUrl")
      .populate("history.by", "displayName email");

    if (!request) {
      throw new NotFoundException("ApprovalRequest", requestId);
    }

    if (request.organization.toString() !== organizationId.toString()) {
      throw new ForbiddenException("Không có quyền truy cập");
    }

    return request;
  }

  /**
   * Duyệt yêu cầu
   */
  async approveRequest(organizationId, requestId, userId, note) {
    const request = await this.getRequest(organizationId, requestId);

    if (request.status !== "pending") {
      throw new ValidationException("Yêu cầu đã được xử lý");
    }

    // Check permission
    await this._checkApproverPermission(organizationId, userId, request.type);

    await request.approve(userId, note);

    Logger.success(`[ApprovalSvc] Approved request: ${requestId}`);

    // Execute post-approval action
    await this._executePostApproval(request);

    // Notify requester
    await this._notifyRequester(request, "approved");

    return request;
  }

  /**
   * Từ chối yêu cầu
   */
  async rejectRequest(organizationId, requestId, userId, note) {
    const request = await this.getRequest(organizationId, requestId);

    if (request.status !== "pending") {
      throw new ValidationException("Yêu cầu đã được xử lý");
    }

    // Check permission
    await this._checkApproverPermission(organizationId, userId, request.type);

    if (!note) {
      throw new ValidationException("Vui lòng nhập lý do từ chối");
    }

    await request.reject(userId, note);

    Logger.success(`[ApprovalSvc] Rejected request: ${requestId}`);

    // Notify requester
    await this._notifyRequester(request, "rejected");

    return request;
  }

  /**
   * Hủy yêu cầu (bởi người tạo)
   */
  async cancelRequest(organizationId, requestId, userId, note) {
    const request = await this.getRequest(organizationId, requestId);

    if (request.status !== "pending") {
      throw new ValidationException("Yêu cầu đã được xử lý");
    }

    // Only requester or admin can cancel
    if (request.requestedBy.toString() !== userId.toString()) {
      await this._checkApproverPermission(organizationId, userId, request.type);
    }

    await request.cancel(userId, note);

    Logger.success(`[ApprovalSvc] Cancelled request: ${requestId}`);

    return request;
  }

  /**
   * Lấy/tạo cài đặt approval
   */
  async getSettings(organizationId) {
    let settings = await ApprovalSettings.findOne({
      organization: organizationId,
    });

    if (!settings) {
      settings = await ApprovalSettings.create({
        organization: organizationId,
        enabled: false,
      });
    }

    return settings;
  }

  /**
   * Cập nhật cài đặt approval
   */
  async updateSettings(organizationId, data) {
    const settings = await this.getSettings(organizationId);

    const allowedFields = ["enabled", "rules", "notifications"];
    allowedFields.forEach((field) => {
      if (data[field] !== undefined) {
        settings[field] = data[field];
      }
    });

    await settings.save();
    Logger.success(`[ApprovalSvc] Updated settings for org: ${organizationId}`);

    return settings;
  }

  /**
   * Thống kê
   */
  async getStats(organizationId) {
    const [pending, approved, rejected] = await Promise.all([
      ApprovalRequest.countDocuments({
        organization: organizationId,
        status: "pending",
      }),
      ApprovalRequest.countDocuments({
        organization: organizationId,
        status: "approved",
      }),
      ApprovalRequest.countDocuments({
        organization: organizationId,
        status: "rejected",
      }),
    ]);

    // Pending by type
    const pendingByType = await ApprovalRequest.aggregate([
      { $match: { organization: organizationId, status: "pending" } },
      { $group: { _id: "$type", count: { $sum: 1 } } },
    ]);

    return {
      pending,
      approved,
      rejected,
      total: pending + approved + rejected,
      pendingByType: pendingByType.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
    };
  }

  // === PRIVATE METHODS ===

  async _checkApproverPermission(organizationId, userId, type) {
    // TODO: Check user role in organization
    // For now, allow owner and admin
    return true;
  }

  async _notifyApprovers(organizationId, request) {
    // TODO: Get approvers and send notifications
    Logger.debug(
      `[ApprovalSvc] Notifying approvers for request: ${request._id}`
    );
  }

  async _notifyRequester(request, action) {
    // TODO: Send notification to requester
    Logger.debug(`[ApprovalSvc] Notifying requester: ${action}`);
  }

  async _executePostApproval(request) {
    // Execute action based on type
    switch (request.type) {
      case "swag_order":
        // TODO: Submit the order
        Logger.debug(
          `[ApprovalSvc] Post-approval: Submit swag order ${request.referenceId}`
        );
        break;
      case "pack_publish":
        // TODO: Publish the pack
        Logger.debug(
          `[ApprovalSvc] Post-approval: Publish pack ${request.referenceId}`
        );
        break;
      default:
        break;
    }
  }
}

export const approvalService = new ApprovalService();

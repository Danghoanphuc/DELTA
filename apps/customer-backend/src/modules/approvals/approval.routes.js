// src/modules/approvals/approval.routes.js
// ✅ Approval Workflow Routes

import { Router } from "express";
import { approvalService } from "./approval.service.js";
import { protect, isOrganization } from "../../shared/middleware/index.js";
import { asyncHandler } from "../../shared/utils/index.js";

const router = Router();

// All routes require authentication + organization
router.use(protect, isOrganization);

/**
 * @route   GET /api/approvals/settings
 * @desc    Get approval settings
 */
router.get(
  "/settings",
  asyncHandler(async (req, res) => {
    const settings = await approvalService.getSettings(req.organizationId);
    res.json({ success: true, data: { settings } });
  })
);

/**
 * @route   PUT /api/approvals/settings
 * @desc    Update approval settings
 */
router.put(
  "/settings",
  asyncHandler(async (req, res) => {
    const settings = await approvalService.updateSettings(
      req.organizationId,
      req.body
    );
    res.json({ success: true, data: { settings } });
  })
);

/**
 * @route   GET /api/approvals/stats
 * @desc    Get approval stats
 */
router.get(
  "/stats",
  asyncHandler(async (req, res) => {
    const stats = await approvalService.getStats(req.organizationId);
    res.json({ success: true, data: stats });
  })
);

/**
 * @route   GET /api/approvals/pending
 * @desc    Get pending approval requests
 */
router.get(
  "/pending",
  asyncHandler(async (req, res) => {
    const { type, page, limit } = req.query;
    const result = await approvalService.getPendingRequests(
      req.organizationId,
      {
        type,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
      }
    );
    res.json({ success: true, data: result });
  })
);

/**
 * @route   GET /api/approvals/:id
 * @desc    Get single approval request
 */
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const request = await approvalService.getRequest(
      req.organizationId,
      req.params.id
    );
    res.json({ success: true, data: { request } });
  })
);

/**
 * @route   POST /api/approvals/:id/approve
 * @desc    Approve a request
 */
router.post(
  "/:id/approve",
  asyncHandler(async (req, res) => {
    const request = await approvalService.approveRequest(
      req.organizationId,
      req.params.id,
      req.user._id,
      req.body.note
    );
    res.json({ success: true, data: { request } });
  })
);

/**
 * @route   POST /api/approvals/:id/reject
 * @desc    Reject a request
 */
router.post(
  "/:id/reject",
  asyncHandler(async (req, res) => {
    const request = await approvalService.rejectRequest(
      req.organizationId,
      req.params.id,
      req.user._id,
      req.body.note
    );
    res.json({ success: true, data: { request } });
  })
);

/**
 * @route   POST /api/approvals/:id/cancel
 * @desc    Cancel a request
 */
router.post(
  "/:id/cancel",
  asyncHandler(async (req, res) => {
    const request = await approvalService.cancelRequest(
      req.organizationId,
      req.params.id,
      req.user._id,
      req.body.note
    );
    res.json({ success: true, data: { request } });
  })
);

/**
 * @route   POST /api/approvals/check
 * @desc    Check if approval is needed
 */
router.post(
  "/check",
  asyncHandler(async (req, res) => {
    const { type, totalAmount, recipientCount } = req.body;
    const result = await approvalService.needsApproval(
      req.organizationId,
      type,
      {
        totalAmount,
        recipientCount,
      }
    );
    res.json({ success: true, data: result });
  })
);

export default router;

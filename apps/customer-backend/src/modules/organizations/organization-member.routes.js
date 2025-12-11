// src/modules/organizations/organization-member.routes.js
// ✅ Routes for Organization Member Management

import { Router } from "express";
import { OrganizationMemberController } from "./organization-member.controller.js";
import {
  protect,
  requireOrgMembership,
  requireAdminOrOwner,
  requireOwner,
} from "../../shared/middleware/index.js";

const router = Router();
const controller = new OrganizationMemberController();

// === PUBLIC ROUTES (with auth) ===

/**
 * Get user's organizations
 * @route GET /api/organizations/my-organizations
 */
router.get("/my-organizations", protect, controller.getMyOrganizations);

/**
 * Accept invitation
 * @route POST /api/organizations/invitations/:token/accept
 */
router.post("/invitations/:token/accept", protect, controller.acceptInvite);

// === ORGANIZATION-SPECIFIC ROUTES ===

/**
 * Get organization members
 * @route GET /api/organizations/:organizationId/members
 */
router.get(
  "/:organizationId/members",
  protect,
  requireOrgMembership,
  controller.getMembers
);

/**
 * Get member statistics
 * @route GET /api/organizations/:organizationId/members/stats
 */
router.get(
  "/:organizationId/members/stats",
  protect,
  requireOrgMembership,
  controller.getStats
);

/**
 * Invite member (Admin/Owner only)
 * @route POST /api/organizations/:organizationId/members/invite
 */
router.post(
  "/:organizationId/members/invite",
  protect,
  requireAdminOrOwner,
  controller.inviteMember
);

/**
 * Update member role (Admin/Owner only)
 * @route PUT /api/organizations/:organizationId/members/:userId/role
 */
router.put(
  "/:organizationId/members/:userId/role",
  protect,
  requireAdminOrOwner,
  controller.updateMemberRole
);

/**
 * Remove member (Admin/Owner only)
 * @route DELETE /api/organizations/:organizationId/members/:userId
 */
router.delete(
  "/:organizationId/members/:userId",
  protect,
  requireAdminOrOwner,
  controller.removeMember
);

/**
 * Leave organization
 * @route POST /api/organizations/:organizationId/leave
 */
router.post(
  "/:organizationId/leave",
  protect,
  requireOrgMembership,
  controller.leaveOrganization
);

/**
 * Transfer ownership (Owner only)
 * @route POST /api/organizations/:organizationId/transfer-ownership
 */
router.post(
  "/:organizationId/transfer-ownership",
  protect,
  requireOwner,
  controller.transferOwnership
);

export default router;

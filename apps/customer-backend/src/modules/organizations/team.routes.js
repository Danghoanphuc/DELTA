// src/modules/organizations/team.routes.js
// ✅ Team Management Routes

import { Router } from "express";
import { TeamService, ROLE_PERMISSIONS } from "./team.service.js";
import { protect, isOrganization } from "../../shared/middleware/index.js";
import { ApiResponse } from "../../shared/utils/index.js";
import { API_CODES } from "../../shared/constants/index.js";

const router = Router();
const teamService = new TeamService();

// All routes require authentication + organization
router.use(protect, isOrganization);

/**
 * @route   GET /api/organizations/team
 * @desc    Get team members
 */
router.get("/", async (req, res, next) => {
  try {
    const organizationId = req.user.organizationProfileId;
    const team = await teamService.getTeamMembers(organizationId);
    res.status(API_CODES.SUCCESS).json(ApiResponse.success(team));
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/organizations/team/roles
 * @desc    Get available roles and permissions
 */
router.get("/roles", async (req, res, next) => {
  try {
    const roles = Object.entries(ROLE_PERMISSIONS).map(
      ([role, permissions]) => ({
        role,
        label: {
          owner: "Chủ sở hữu",
          admin: "Quản trị viên",
          manager: "Quản lý",
          member: "Thành viên",
          viewer: "Chỉ xem",
        }[role],
        permissions,
      })
    );
    res.status(API_CODES.SUCCESS).json(ApiResponse.success({ roles }));
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/organizations/team/invite
 * @desc    Invite team member
 */
router.post("/invite", async (req, res, next) => {
  try {
    const organizationId = req.user.organizationProfileId;
    const userId = req.user._id;
    const { email, role } = req.body;

    const result = await teamService.inviteMember(
      organizationId,
      userId,
      email,
      role
    );
    res
      .status(API_CODES.SUCCESS)
      .json(ApiResponse.success(result, "Đã gửi lời mời!"));
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/organizations/team/:memberId/role
 * @desc    Update member role
 */
router.put("/:memberId/role", async (req, res, next) => {
  try {
    const organizationId = req.user.organizationProfileId;
    const userId = req.user._id;
    const { memberId } = req.params;
    const { role } = req.body;

    const result = await teamService.updateMemberRole(
      organizationId,
      userId,
      memberId,
      role
    );
    res
      .status(API_CODES.SUCCESS)
      .json(ApiResponse.success(result, "Đã cập nhật vai trò!"));
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/organizations/team/:memberId
 * @desc    Remove team member
 */
router.delete("/:memberId", async (req, res, next) => {
  try {
    const organizationId = req.user.organizationProfileId;
    const userId = req.user._id;
    const { memberId } = req.params;

    const result = await teamService.removeMember(
      organizationId,
      userId,
      memberId
    );
    res
      .status(API_CODES.SUCCESS)
      .json(ApiResponse.success(result, "Đã xóa thành viên!"));
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/organizations/team/invite/:email
 * @desc    Cancel pending invite
 */
router.delete("/invite/:email", async (req, res, next) => {
  try {
    const organizationId = req.user.organizationProfileId;
    const userId = req.user._id;
    const { email } = req.params;

    const result = await teamService.cancelInvite(
      organizationId,
      userId,
      email
    );
    res
      .status(API_CODES.SUCCESS)
      .json(ApiResponse.success(result, "Đã hủy lời mời!"));
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/organizations/team/permissions/:permission
 * @desc    Check if current user has permission
 */
router.get("/permissions/:permission", async (req, res, next) => {
  try {
    const organizationId = req.user.organizationProfileId;
    const userId = req.user._id;
    const { permission } = req.params;

    const hasPermission = await teamService.checkPermission(
      organizationId,
      userId,
      permission
    );
    res.status(API_CODES.SUCCESS).json(ApiResponse.success({ hasPermission }));
  } catch (error) {
    next(error);
  }
});

export default router;

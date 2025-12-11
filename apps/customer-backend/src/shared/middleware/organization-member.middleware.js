// src/shared/middleware/organization-member.middleware.js
// ✅ Middleware for Organization Membership checks

import { OrganizationMemberRepository } from "../../modules/organizations/organization-member.repository.js";
import { MEMBER_ROLES } from "../../modules/organizations/organization-member.model.js";

const memberRepository = new OrganizationMemberRepository();

/**
 * Middleware: Require user to be member of organization
 * Organization ID can come from:
 * - req.params.organizationId
 * - req.body.organizationId
 * - req.user.organizationProfileId (current context)
 */
export const requireOrgMembership = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Yêu cầu đăng nhập",
        requiresAuth: true,
      });
    }

    // Get organization ID from various sources
    const organizationId =
      req.params.organizationId ||
      req.body.organizationId ||
      req.query.organizationId ||
      req.user.organizationProfileId;

    if (!organizationId) {
      return res.status(400).json({
        success: false,
        message: "Organization ID is required",
      });
    }

    // Check membership
    const isMember = await memberRepository.isMember(
      req.user._id,
      organizationId
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "Bạn không phải thành viên của tổ chức này",
        requiresMembership: true,
      });
    }

    // Attach organization ID to request for downstream use
    req.organizationId = organizationId;

    // Get and attach member info
    const member = await memberRepository.findByUserAndOrg(
      req.user._id,
      organizationId
    );
    req.member = member;

    next();
  } catch (error) {
    console.error("Error in requireOrgMembership middleware:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi kiểm tra quyền thành viên",
    });
  }
};

/**
 * Middleware factory: Require specific role(s)
 * Usage: requireOrgRole([MEMBER_ROLES.OWNER, MEMBER_ROLES.ADMIN])
 */
export const requireOrgRole = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Yêu cầu đăng nhập",
          requiresAuth: true,
        });
      }

      // Get organization ID
      const organizationId =
        req.params.organizationId ||
        req.body.organizationId ||
        req.query.organizationId ||
        req.user.organizationProfileId;

      if (!organizationId) {
        return res.status(400).json({
          success: false,
          message: "Organization ID is required",
        });
      }

      // Get user's role
      const userRole = await memberRepository.getUserRole(
        req.user._id,
        organizationId
      );

      if (!userRole) {
        return res.status(403).json({
          success: false,
          message: "Bạn không phải thành viên của tổ chức này",
          requiresMembership: true,
        });
      }

      // Check if user has required role
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: "Bạn không có quyền thực hiện thao tác này",
          requiredRoles: allowedRoles,
          currentRole: userRole,
        });
      }

      // Attach to request
      req.organizationId = organizationId;
      req.userRole = userRole;

      next();
    } catch (error) {
      console.error("Error in requireOrgRole middleware:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi kiểm tra quyền",
      });
    }
  };
};

/**
 * Middleware: Require owner role
 */
export const requireOwner = requireOrgRole([MEMBER_ROLES.OWNER]);

/**
 * Middleware: Require admin or owner role
 */
export const requireAdminOrOwner = requireOrgRole([
  MEMBER_ROLES.OWNER,
  MEMBER_ROLES.ADMIN,
]);

/**
 * Middleware: Check custom permission
 * Usage: requirePermission('canManageTeam')
 */
export const requirePermission = (permission) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Yêu cầu đăng nhập",
          requiresAuth: true,
        });
      }

      const organizationId =
        req.params.organizationId ||
        req.body.organizationId ||
        req.query.organizationId ||
        req.user.organizationProfileId;

      if (!organizationId) {
        return res.status(400).json({
          success: false,
          message: "Organization ID is required",
        });
      }

      // Get member
      const member = await memberRepository.findByUserAndOrg(
        req.user._id,
        organizationId
      );

      if (!member) {
        return res.status(403).json({
          success: false,
          message: "Bạn không phải thành viên của tổ chức này",
        });
      }

      // Owner and Admin have all permissions
      if ([MEMBER_ROLES.OWNER, MEMBER_ROLES.ADMIN].includes(member.role)) {
        req.organizationId = organizationId;
        req.member = member;
        return next();
      }

      // Check custom permission
      if (!member.permissions || !member.permissions[permission]) {
        return res.status(403).json({
          success: false,
          message: "Bạn không có quyền thực hiện thao tác này",
          requiredPermission: permission,
        });
      }

      req.organizationId = organizationId;
      req.member = member;
      next();
    } catch (error) {
      console.error("Error in requirePermission middleware:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi kiểm tra quyền",
      });
    }
  };
};

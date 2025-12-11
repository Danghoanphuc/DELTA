// src/modules/organizations/organization-member.controller.js
// ✅ Controller Layer - HTTP handlers for OrganizationMember

import { OrganizationMemberService } from "./organization-member.service.js";
import { ApiResponse } from "../../shared/utils/index.js";
import { API_CODES } from "../../shared/constants/api-codes.constants.js";

export class OrganizationMemberController {
  constructor() {
    this.service = new OrganizationMemberService();
  }

  /**
   * Get organization members
   * @route GET /api/organizations/:organizationId/members
   */
  getMembers = async (req, res, next) => {
    try {
      const { organizationId } = req.params;
      const { includeInvited } = req.query;

      const members = await this.service.getMembers(
        req.user._id,
        organizationId,
        {
          includeInvited: includeInvited === "true",
        }
      );

      res.status(API_CODES.SUCCESS).json(
        ApiResponse.success({
          members,
          total: members.length,
        })
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get user's organizations
   * @route GET /api/organizations/my-organizations
   */
  getMyOrganizations = async (req, res, next) => {
    try {
      const memberships = await this.service.getUserOrganizations(req.user._id);

      res.status(API_CODES.SUCCESS).json(
        ApiResponse.success({
          organizations: memberships.map((m) => ({
            ...m.organizationId,
            role: m.role,
            joinedAt: m.joinedAt,
          })),
          total: memberships.length,
        })
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Invite member
   * @route POST /api/organizations/:organizationId/members/invite
   */
  inviteMember = async (req, res, next) => {
    try {
      const { organizationId } = req.params;
      const { email, role } = req.body;

      const result = await this.service.inviteMember(
        req.user._id,
        organizationId,
        email,
        role
      );

      res.status(API_CODES.CREATED).json(
        ApiResponse.success(
          {
            invitation: result.invitation,
            inviteLink: result.inviteLink,
          },
          "Đã gửi lời mời thành công"
        )
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Accept invitation
   * @route POST /api/organizations/invitations/:token/accept
   */
  acceptInvite = async (req, res, next) => {
    try {
      const { token } = req.params;

      const member = await this.service.acceptInvite(token, req.user._id);

      res.status(API_CODES.SUCCESS).json(
        ApiResponse.success(
          {
            member,
            organization: member.organizationId,
          },
          "Đã tham gia tổ chức thành công"
        )
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update member role
   * @route PUT /api/organizations/:organizationId/members/:userId/role
   */
  updateMemberRole = async (req, res, next) => {
    try {
      const { organizationId, userId } = req.params;
      const { role } = req.body;

      const updated = await this.service.updateMemberRole(
        req.user._id,
        organizationId,
        userId,
        role
      );

      res
        .status(API_CODES.SUCCESS)
        .json(
          ApiResponse.success(
            { member: updated },
            "Đã cập nhật vai trò thành công"
          )
        );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Remove member
   * @route DELETE /api/organizations/:organizationId/members/:userId
   */
  removeMember = async (req, res, next) => {
    try {
      const { organizationId, userId } = req.params;

      await this.service.removeMember(req.user._id, organizationId, userId);

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success(null, "Đã xóa thành viên thành công"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Leave organization
   * @route POST /api/organizations/:organizationId/leave
   */
  leaveOrganization = async (req, res, next) => {
    try {
      const { organizationId } = req.params;

      await this.service.leaveOrganization(req.user._id, organizationId);

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success(null, "Đã rời khỏi tổ chức thành công"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Transfer ownership
   * @route POST /api/organizations/:organizationId/transfer-ownership
   */
  transferOwnership = async (req, res, next) => {
    try {
      const { organizationId } = req.params;
      const { newOwnerId } = req.body;

      await this.service.transferOwnership(
        req.user._id,
        organizationId,
        newOwnerId
      );

      res
        .status(API_CODES.SUCCESS)
        .json(ApiResponse.success(null, "Đã chuyển quyền sở hữu thành công"));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get member statistics
   * @route GET /api/organizations/:organizationId/members/stats
   */
  getStats = async (req, res, next) => {
    try {
      const { organizationId } = req.params;

      const stats = await this.service.getStats(req.user._id, organizationId);

      res.status(API_CODES.SUCCESS).json(ApiResponse.success({ stats }));
    } catch (error) {
      next(error);
    }
  };
}

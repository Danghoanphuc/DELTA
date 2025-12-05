// src/modules/organizations/team.service.js
// ✅ Team Management Service - Quản lý thành viên và phân quyền

import { OrganizationProfile } from "./organization.model.js";
import { User } from "../../shared/models/user.model.js";
import {
  NotFoundException,
  ForbiddenException,
  ValidationException,
  ConflictException,
} from "../../shared/exceptions/index.js";
import { Logger } from "../../shared/utils/index.js";
import crypto from "crypto";

// Role permissions
const ROLE_PERMISSIONS = {
  owner: {
    canManageTeam: true,
    canManageBilling: true,
    canManageSettings: true,
    canCreateOrders: true,
    canApproveOrders: true,
    canViewReports: true,
    canManageInventory: true,
    canManageRecipients: true,
    canManagePacks: true,
  },
  admin: {
    canManageTeam: true,
    canManageBilling: false,
    canManageSettings: true,
    canCreateOrders: true,
    canApproveOrders: true,
    canViewReports: true,
    canManageInventory: true,
    canManageRecipients: true,
    canManagePacks: true,
  },
  manager: {
    canManageTeam: false,
    canManageBilling: false,
    canManageSettings: false,
    canCreateOrders: true,
    canApproveOrders: true,
    canViewReports: true,
    canManageInventory: true,
    canManageRecipients: true,
    canManagePacks: true,
  },
  member: {
    canManageTeam: false,
    canManageBilling: false,
    canManageSettings: false,
    canCreateOrders: true,
    canApproveOrders: false,
    canViewReports: false,
    canManageInventory: false,
    canManageRecipients: true,
    canManagePacks: false,
  },
  viewer: {
    canManageTeam: false,
    canManageBilling: false,
    canManageSettings: false,
    canCreateOrders: false,
    canApproveOrders: false,
    canViewReports: true,
    canManageInventory: false,
    canManageRecipients: false,
    canManagePacks: false,
  },
};

export class TeamService {
  /**
   * Get team members
   */
  async getTeamMembers(organizationId) {
    const org = await OrganizationProfile.findById(organizationId).populate(
      "teamMembers.userId",
      "displayName email avatarUrl"
    );

    if (!org) throw new NotFoundException("Organization", organizationId);

    // Get owner info
    const owner = await User.findById(org.user).select(
      "displayName email avatarUrl"
    );

    return {
      owner: {
        userId: owner._id,
        displayName: owner.displayName,
        email: owner.email,
        avatarUrl: owner.avatarUrl,
        role: "owner",
        permissions: ROLE_PERMISSIONS.owner,
      },
      members: org.teamMembers.map((member) => ({
        ...member.toObject(),
        user: member.userId,
        permissions: ROLE_PERMISSIONS[member.role] || ROLE_PERMISSIONS.member,
      })),
      pendingInvites: org.pendingInvites || [],
    };
  }

  /**
   * Invite team member
   */
  async inviteMember(organizationId, inviterUserId, email, role = "member") {
    Logger.debug(`[TeamSvc] Inviting ${email} to org ${organizationId}`);

    const org = await OrganizationProfile.findById(organizationId);
    if (!org) throw new NotFoundException("Organization", organizationId);

    // Check if inviter has permission
    const inviterRole = this._getUserRole(org, inviterUserId);
    if (!ROLE_PERMISSIONS[inviterRole]?.canManageTeam) {
      throw new ForbiddenException("Bạn không có quyền mời thành viên");
    }

    // Check if email already invited or member
    const existingInvite = org.pendingInvites?.find(
      (i) => i.email === email.toLowerCase()
    );
    if (existingInvite) {
      throw new ConflictException("Email này đã được mời");
    }

    const existingMember = org.teamMembers?.find((m) => {
      // Need to check user email
      return false; // TODO: Check user email
    });

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    // Generate invite token
    const inviteToken = crypto.randomBytes(32).toString("hex");
    const inviteExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Add to pending invites
    if (!org.pendingInvites) org.pendingInvites = [];
    org.pendingInvites.push({
      email: email.toLowerCase(),
      role,
      inviteToken,
      inviteExpiry,
      invitedBy: inviterUserId,
      invitedAt: new Date(),
      status: "pending",
    });

    await org.save();

    // TODO: Send invitation email
    // await emailService.sendTeamInvite(email, org, inviteToken);

    Logger.success(`[TeamSvc] Invited ${email} to org ${organizationId}`);

    return {
      email,
      role,
      inviteToken: existingUser ? null : inviteToken, // Only return token if user doesn't exist
      message: existingUser
        ? "Đã gửi lời mời đến người dùng hiện có"
        : "Đã gửi email mời tham gia",
    };
  }

  /**
   * Accept invite
   */
  async acceptInvite(inviteToken, userId) {
    Logger.debug(`[TeamSvc] Accepting invite with token`);

    // Find org with this invite token
    const org = await OrganizationProfile.findOne({
      "pendingInvites.inviteToken": inviteToken,
      "pendingInvites.inviteExpiry": { $gt: new Date() },
    });

    if (!org) {
      throw new NotFoundException("Lời mời không hợp lệ hoặc đã hết hạn");
    }

    const invite = org.pendingInvites.find(
      (i) => i.inviteToken === inviteToken
    );
    if (!invite) {
      throw new NotFoundException("Lời mời không tìm thấy");
    }

    // Check if user email matches invite email
    const user = await User.findById(userId);
    if (user.email.toLowerCase() !== invite.email.toLowerCase()) {
      throw new ForbiddenException("Email không khớp với lời mời");
    }

    // Add to team members
    if (!org.teamMembers) org.teamMembers = [];
    org.teamMembers.push({
      userId,
      role: invite.role || "member",
      joinedAt: new Date(),
    });

    // Update invite status
    invite.status = "accepted";
    invite.acceptedAt = new Date();

    await org.save();

    // Update user's organizationProfileId
    await User.findByIdAndUpdate(userId, {
      organizationProfileId: org._id,
    });

    Logger.success(`[TeamSvc] User ${userId} joined org ${org._id}`);

    return {
      organizationId: org._id,
      businessName: org.businessName,
      role: invite.role,
    };
  }

  /**
   * Update member role
   */
  async updateMemberRole(organizationId, updaterUserId, memberId, newRole) {
    Logger.debug(`[TeamSvc] Updating role for ${memberId} to ${newRole}`);

    const org = await OrganizationProfile.findById(organizationId);
    if (!org) throw new NotFoundException("Organization", organizationId);

    // Check if updater has permission
    const updaterRole = this._getUserRole(org, updaterUserId);
    if (!ROLE_PERMISSIONS[updaterRole]?.canManageTeam) {
      throw new ForbiddenException("Bạn không có quyền thay đổi vai trò");
    }

    // Cannot change owner role
    if (org.user.toString() === memberId) {
      throw new ValidationException(
        "Không thể thay đổi vai trò của chủ sở hữu"
      );
    }

    // Find and update member
    const memberIndex = org.teamMembers.findIndex(
      (m) => m.userId.toString() === memberId
    );
    if (memberIndex === -1) {
      throw new NotFoundException("Member", memberId);
    }

    // Validate role
    if (!ROLE_PERMISSIONS[newRole]) {
      throw new ValidationException("Vai trò không hợp lệ");
    }

    org.teamMembers[memberIndex].role = newRole;
    await org.save();

    Logger.success(`[TeamSvc] Updated role for ${memberId} to ${newRole}`);

    return {
      memberId,
      newRole,
      permissions: ROLE_PERMISSIONS[newRole],
    };
  }

  /**
   * Remove member
   */
  async removeMember(organizationId, removerUserId, memberId) {
    Logger.debug(
      `[TeamSvc] Removing member ${memberId} from org ${organizationId}`
    );

    const org = await OrganizationProfile.findById(organizationId);
    if (!org) throw new NotFoundException("Organization", organizationId);

    // Check if remover has permission
    const removerRole = this._getUserRole(org, removerUserId);
    if (!ROLE_PERMISSIONS[removerRole]?.canManageTeam) {
      throw new ForbiddenException("Bạn không có quyền xóa thành viên");
    }

    // Cannot remove owner
    if (org.user.toString() === memberId) {
      throw new ValidationException("Không thể xóa chủ sở hữu");
    }

    // Remove from team
    org.teamMembers = org.teamMembers.filter(
      (m) => m.userId.toString() !== memberId
    );
    await org.save();

    // Remove organizationProfileId from user
    await User.findByIdAndUpdate(memberId, {
      $unset: { organizationProfileId: 1 },
    });

    Logger.success(
      `[TeamSvc] Removed member ${memberId} from org ${organizationId}`
    );

    return { success: true };
  }

  /**
   * Cancel pending invite
   */
  async cancelInvite(organizationId, userId, email) {
    const org = await OrganizationProfile.findById(organizationId);
    if (!org) throw new NotFoundException("Organization", organizationId);

    // Check permission
    const userRole = this._getUserRole(org, userId);
    if (!ROLE_PERMISSIONS[userRole]?.canManageTeam) {
      throw new ForbiddenException("Bạn không có quyền hủy lời mời");
    }

    org.pendingInvites = org.pendingInvites.filter(
      (i) => i.email !== email.toLowerCase()
    );
    await org.save();

    return { success: true };
  }

  /**
   * Check user permission
   */
  async checkPermission(organizationId, userId, permission) {
    const org = await OrganizationProfile.findById(organizationId);
    if (!org) return false;

    const role = this._getUserRole(org, userId);
    return ROLE_PERMISSIONS[role]?.[permission] || false;
  }

  /**
   * Get user role in organization
   */
  _getUserRole(org, userId) {
    // Check if owner
    if (org.user.toString() === userId.toString()) {
      return "owner";
    }

    // Check team members
    const member = org.teamMembers?.find(
      (m) => m.userId.toString() === userId.toString()
    );
    return member?.role || null;
  }
}

export { ROLE_PERMISSIONS };

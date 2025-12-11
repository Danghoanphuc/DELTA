// src/modules/organizations/organization-member.service.js
// ✅ Service Layer - Business logic for OrganizationMember

import { OrganizationMemberRepository } from "./organization-member.repository.js";
import { MEMBER_ROLES, MEMBER_STATUS } from "./organization-member.model.js";
import { Organization } from "./organization-refactored.model.js";
import { User } from "../../shared/models/user.model.js";
import crypto from "crypto";
import { Logger } from "../../shared/utils/index.js";
import {
  ValidationException,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from "../../shared/exceptions/index.js";

export class OrganizationMemberService {
  constructor() {
    this.repository = new OrganizationMemberRepository();
  }

  /**
   * Add owner when organization is created
   */
  async addOwner(userId, organizationId) {
    Logger.debug(
      `[OrgMemberSvc] Adding owner: user=${userId}, org=${organizationId}`
    );

    // Check if already exists
    const existing = await this.repository.findByUserAndOrg(
      userId,
      organizationId
    );
    if (existing) {
      throw new ConflictException(
        "User is already a member of this organization"
      );
    }

    // Create owner membership
    const member = await this.repository.create({
      userId,
      organizationId,
      role: MEMBER_ROLES.OWNER,
      status: MEMBER_STATUS.ACTIVE,
      joinedAt: new Date(),
    });

    Logger.success(`[OrgMemberSvc] Owner added: ${member._id}`);
    return member;
  }

  /**
   * Invite member to organization
   */
  async inviteMember(
    invitedBy,
    organizationId,
    email,
    role = MEMBER_ROLES.MEMBER
  ) {
    Logger.debug(
      `[OrgMemberSvc] Inviting member: ${email} to org ${organizationId}`
    );

    // 1. Validate inviter permissions
    const inviterRole = await this.repository.getUserRole(
      invitedBy,
      organizationId
    );
    if (![MEMBER_ROLES.OWNER, MEMBER_ROLES.ADMIN].includes(inviterRole)) {
      throw new ForbiddenException("Only owners and admins can invite members");
    }

    // 2. Validate role
    if (role === MEMBER_ROLES.OWNER) {
      throw new ValidationException(
        "Cannot invite as owner. Transfer ownership instead."
      );
    }

    // 3. Check if organization exists
    const org = await Organization.findById(organizationId);
    if (!org) {
      throw new NotFoundException("Organization", organizationId);
    }

    // 4. Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      // Check if already a member
      const existingMember = await this.repository.findByUserAndOrg(
        existingUser._id,
        organizationId
      );
      if (existingMember) {
        throw new ConflictException(
          "User is already a member of this organization"
        );
      }
    }

    // 5. Generate invite token
    const inviteToken = crypto.randomBytes(32).toString("hex");
    const inviteExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // 6. Create invitation
    const invitation = await this.repository.create({
      userId: existingUser?._id, // null if user doesn't exist yet
      organizationId,
      role,
      status: MEMBER_STATUS.INVITED,
      invitedBy,
      invitedAt: new Date(),
      inviteToken,
      inviteExpiresAt,
    });

    // TODO: Send invitation email
    Logger.success(`[OrgMemberSvc] Invitation created: ${invitation._id}`);

    return {
      invitation,
      inviteLink: `${process.env.FRONTEND_URL}/invite/${inviteToken}`,
    };
  }

  /**
   * Accept invitation
   */
  async acceptInvite(inviteToken, userId) {
    Logger.debug(
      `[OrgMemberSvc] Accepting invite: token=${inviteToken}, user=${userId}`
    );

    // 1. Find invitation
    const invitation = await this.repository.findByInviteToken(inviteToken);
    if (!invitation) {
      throw new NotFoundException("Invitation not found or expired");
    }

    // 2. Check if user already member
    const existing = await this.repository.findByUserAndOrg(
      userId,
      invitation.organizationId._id
    );
    if (existing && existing.status === MEMBER_STATUS.ACTIVE) {
      throw new ConflictException(
        "You are already a member of this organization"
      );
    }

    // 3. Accept invitation
    const member = await this.repository.acceptInvite(inviteToken, userId);

    // 4. Update organization stats
    await Organization.findByIdAndUpdate(invitation.organizationId._id, {
      $inc: { "stats.totalMembers": 1 },
    });

    Logger.success(`[OrgMemberSvc] Invitation accepted: ${member._id}`);
    return member;
  }

  /**
   * Get organization members
   */
  async getMembers(requesterId, organizationId, options = {}) {
    // Validate requester is member
    const isMember = await this.repository.isMember(
      requesterId,
      organizationId
    );
    if (!isMember) {
      throw new ForbiddenException("You are not a member of this organization");
    }

    return await this.repository.findByOrganization(organizationId, options);
  }

  /**
   * Get user's organizations
   */
  async getUserOrganizations(userId) {
    return await this.repository.findByUser(userId);
  }

  /**
   * Update member role
   */
  async updateMemberRole(requesterId, organizationId, targetUserId, newRole) {
    Logger.debug(
      `[OrgMemberSvc] Updating role: requester=${requesterId}, target=${targetUserId}, newRole=${newRole}`
    );

    // 1. Validate requester is owner or admin
    const requesterRole = await this.repository.getUserRole(
      requesterId,
      organizationId
    );
    if (![MEMBER_ROLES.OWNER, MEMBER_ROLES.ADMIN].includes(requesterRole)) {
      throw new ForbiddenException(
        "Only owners and admins can update member roles"
      );
    }

    // 2. Cannot change owner role (must transfer ownership)
    const targetRole = await this.repository.getUserRole(
      targetUserId,
      organizationId
    );
    if (targetRole === MEMBER_ROLES.OWNER) {
      throw new ValidationException(
        "Cannot change owner role. Transfer ownership instead."
      );
    }

    // 3. Only owner can promote to admin
    if (
      newRole === MEMBER_ROLES.ADMIN &&
      requesterRole !== MEMBER_ROLES.OWNER
    ) {
      throw new ForbiddenException("Only owners can promote members to admin");
    }

    // 4. Cannot set as owner
    if (newRole === MEMBER_ROLES.OWNER) {
      throw new ValidationException(
        "Cannot set as owner. Transfer ownership instead."
      );
    }

    // 5. Update role
    const updated = await this.repository.updateRole(
      targetUserId,
      organizationId,
      newRole
    );

    Logger.success(`[OrgMemberSvc] Role updated: ${updated._id}`);
    return updated;
  }

  /**
   * Remove member
   */
  async removeMember(requesterId, organizationId, targetUserId) {
    Logger.debug(
      `[OrgMemberSvc] Removing member: requester=${requesterId}, target=${targetUserId}`
    );

    // 1. Validate requester is owner or admin
    const requesterRole = await this.repository.getUserRole(
      requesterId,
      organizationId
    );
    if (![MEMBER_ROLES.OWNER, MEMBER_ROLES.ADMIN].includes(requesterRole)) {
      throw new ForbiddenException("Only owners and admins can remove members");
    }

    // 2. Cannot remove owner
    const targetRole = await this.repository.getUserRole(
      targetUserId,
      organizationId
    );
    if (targetRole === MEMBER_ROLES.OWNER) {
      throw new ValidationException(
        "Cannot remove owner. Transfer ownership first."
      );
    }

    // 3. Admin cannot remove another admin
    if (
      requesterRole === MEMBER_ROLES.ADMIN &&
      targetRole === MEMBER_ROLES.ADMIN &&
      requesterId.toString() !== targetUserId.toString()
    ) {
      throw new ForbiddenException("Admins cannot remove other admins");
    }

    // 4. Remove member
    await this.repository.remove(targetUserId, organizationId);

    // 5. Update organization stats
    await Organization.findByIdAndUpdate(organizationId, {
      $inc: { "stats.totalMembers": -1 },
    });

    Logger.success(`[OrgMemberSvc] Member removed: ${targetUserId}`);
    return { success: true };
  }

  /**
   * Leave organization
   */
  async leaveOrganization(userId, organizationId) {
    Logger.debug(
      `[OrgMemberSvc] User leaving org: user=${userId}, org=${organizationId}`
    );

    // 1. Check if user is member
    const member = await this.repository.findByUserAndOrg(
      userId,
      organizationId
    );
    if (!member) {
      throw new NotFoundException("Membership not found");
    }

    // 2. Owner cannot leave (must transfer ownership first)
    if (member.role === MEMBER_ROLES.OWNER) {
      throw new ValidationException(
        "Owner cannot leave. Transfer ownership first."
      );
    }

    // 3. Remove membership
    await this.repository.remove(userId, organizationId);

    // 4. Update organization stats
    await Organization.findByIdAndUpdate(organizationId, {
      $inc: { "stats.totalMembers": -1 },
    });

    Logger.success(`[OrgMemberSvc] User left organization: ${userId}`);
    return { success: true };
  }

  /**
   * Transfer ownership
   */
  async transferOwnership(currentOwnerId, organizationId, newOwnerId) {
    Logger.debug(
      `[OrgMemberSvc] Transferring ownership: from=${currentOwnerId}, to=${newOwnerId}`
    );

    // 1. Validate current owner
    const isOwner = await this.repository.isOwner(
      currentOwnerId,
      organizationId
    );
    if (!isOwner) {
      throw new ForbiddenException("Only owner can transfer ownership");
    }

    // 2. Validate new owner is member
    const newOwnerMember = await this.repository.findByUserAndOrg(
      newOwnerId,
      organizationId
    );
    if (!newOwnerMember) {
      throw new NotFoundException(
        "New owner must be a member of the organization"
      );
    }

    // 3. Transfer ownership
    await Promise.all([
      // Demote current owner to admin
      this.repository.updateRole(
        currentOwnerId,
        organizationId,
        MEMBER_ROLES.ADMIN
      ),
      // Promote new owner
      this.repository.updateRole(
        newOwnerId,
        organizationId,
        MEMBER_ROLES.OWNER
      ),
    ]);

    Logger.success(`[OrgMemberSvc] Ownership transferred to: ${newOwnerId}`);
    return { success: true };
  }

  /**
   * Get member statistics
   */
  async getStats(requesterId, organizationId) {
    // Validate requester is member
    const isMember = await this.repository.isMember(
      requesterId,
      organizationId
    );
    if (!isMember) {
      throw new ForbiddenException("You are not a member of this organization");
    }

    return await this.repository.getStats(organizationId);
  }

  /**
   * Check if user can perform action
   */
  async canPerformAction(userId, organizationId, action) {
    const member = await this.repository.findByUserAndOrg(
      userId,
      organizationId
    );
    if (!member || member.status !== MEMBER_STATUS.ACTIVE) {
      return false;
    }

    // Owner and Admin have all permissions
    if ([MEMBER_ROLES.OWNER, MEMBER_ROLES.ADMIN].includes(member.role)) {
      return true;
    }

    // Check custom permissions
    return member.permissions?.[action] || false;
  }
}

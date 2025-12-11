// src/modules/organizations/organization-member.repository.js
// ✅ Repository Layer - Data access for OrganizationMember

import {
  OrganizationMember,
  MEMBER_STATUS,
  MEMBER_ROLES,
} from "./organization-member.model.js";

export class OrganizationMemberRepository {
  /**
   * Create a new member
   */
  async create(data) {
    const member = new OrganizationMember(data);
    return await member.save();
  }

  /**
   * Find member by ID
   */
  async findById(id) {
    return await OrganizationMember.findById(id)
      .populate("userId", "displayName email avatarUrl")
      .populate("organizationId", "businessName logoUrl")
      .lean();
  }

  /**
   * Find member by user and organization
   */
  async findByUserAndOrg(userId, organizationId) {
    return await OrganizationMember.findOne({
      userId,
      organizationId,
    })
      .populate("userId", "displayName email avatarUrl")
      .populate("organizationId")
      .lean();
  }

  /**
   * Find all members of an organization
   */
  async findByOrganization(organizationId, options = {}) {
    const { status = MEMBER_STATUS.ACTIVE, includeInvited = false } = options;

    const query = { organizationId };
    if (includeInvited) {
      query.status = { $in: [MEMBER_STATUS.ACTIVE, MEMBER_STATUS.INVITED] };
    } else {
      query.status = status;
    }

    return await OrganizationMember.find(query)
      .populate("userId", "displayName email avatarUrl lastSeen isOnline")
      .populate("invitedBy", "displayName email")
      .sort({ role: 1, joinedAt: 1 })
      .lean();
  }

  /**
   * Find all organizations of a user
   */
  async findByUser(userId, options = {}) {
    const { status = MEMBER_STATUS.ACTIVE } = options;

    return await OrganizationMember.find({
      userId,
      status,
    })
      .populate("organizationId")
      .sort({ joinedAt: -1 })
      .lean();
  }

  /**
   * Check if user is member of organization
   */
  async isMember(userId, organizationId) {
    const member = await OrganizationMember.findOne({
      userId,
      organizationId,
      status: MEMBER_STATUS.ACTIVE,
    });
    return !!member;
  }

  /**
   * Get user's role in organization
   */
  async getUserRole(userId, organizationId) {
    const member = await OrganizationMember.findOne({
      userId,
      organizationId,
      status: MEMBER_STATUS.ACTIVE,
    }).lean();

    return member ? member.role : null;
  }

  /**
   * Check if user is owner
   */
  async isOwner(userId, organizationId) {
    const role = await this.getUserRole(userId, organizationId);
    return role === MEMBER_ROLES.OWNER;
  }

  /**
   * Check if user is admin or owner
   */
  async isAdminOrOwner(userId, organizationId) {
    const role = await this.getUserRole(userId, organizationId);
    return [MEMBER_ROLES.OWNER, MEMBER_ROLES.ADMIN].includes(role);
  }

  /**
   * Update member
   */
  async update(id, data) {
    return await OrganizationMember.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    })
      .populate("userId", "displayName email avatarUrl")
      .lean();
  }

  /**
   * Update member role
   */
  async updateRole(userId, organizationId, newRole) {
    return await OrganizationMember.findOneAndUpdate(
      { userId, organizationId },
      { role: newRole },
      { new: true, runValidators: true }
    )
      .populate("userId", "displayName email avatarUrl")
      .lean();
  }

  /**
   * Remove member
   */
  async remove(userId, organizationId) {
    return await OrganizationMember.findOneAndDelete({
      userId,
      organizationId,
    });
  }

  /**
   * Find by invite token
   */
  async findByInviteToken(token) {
    return await OrganizationMember.findOne({
      inviteToken: token,
      status: MEMBER_STATUS.INVITED,
      inviteExpiresAt: { $gt: new Date() },
    })
      .populate("organizationId", "businessName logoUrl")
      .populate("invitedBy", "displayName email")
      .lean();
  }

  /**
   * Accept invitation
   */
  async acceptInvite(inviteToken, userId) {
    return await OrganizationMember.findOneAndUpdate(
      {
        inviteToken,
        status: MEMBER_STATUS.INVITED,
        inviteExpiresAt: { $gt: new Date() },
      },
      {
        userId,
        status: MEMBER_STATUS.ACTIVE,
        joinedAt: new Date(),
        $unset: { inviteToken: 1, inviteExpiresAt: 1 },
      },
      { new: true }
    )
      .populate("organizationId")
      .lean();
  }

  /**
   * Count members by organization
   */
  async countByOrganization(organizationId, status = MEMBER_STATUS.ACTIVE) {
    return await OrganizationMember.countDocuments({
      organizationId,
      status,
    });
  }

  /**
   * Get member statistics
   */
  async getStats(organizationId) {
    const [total, active, invited, byRole] = await Promise.all([
      this.countByOrganization(organizationId, null),
      this.countByOrganization(organizationId, MEMBER_STATUS.ACTIVE),
      this.countByOrganization(organizationId, MEMBER_STATUS.INVITED),
      OrganizationMember.aggregate([
        {
          $match: {
            organizationId: organizationId,
            status: MEMBER_STATUS.ACTIVE,
          },
        },
        {
          $group: {
            _id: "$role",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    return {
      total,
      active,
      invited,
      byRole: byRole.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
    };
  }

  /**
   * Update last accessed time
   */
  async updateLastAccessed(userId, organizationId) {
    return await OrganizationMember.findOneAndUpdate(
      { userId, organizationId },
      { lastAccessedAt: new Date() },
      { new: true }
    );
  }
}

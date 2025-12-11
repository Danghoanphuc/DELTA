// src/features/organization/services/organization-member.service.ts
// ✅ Service Layer - API calls for Organization Members

import api from "@/shared/lib/axios";

export interface OrganizationMember {
  _id: string;
  userId: {
    _id: string;
    displayName: string;
    email: string;
    avatarUrl?: string;
    lastSeen?: Date;
    isOnline?: boolean;
  };
  organizationId: string;
  role: "owner" | "admin" | "member" | "viewer";
  status: "active" | "inactive" | "invited";
  joinedAt: Date;
  permissions?: {
    canManageTeam?: boolean;
    canManageOrders?: boolean;
    canManageInventory?: boolean;
    canManageBilling?: boolean;
    canViewAnalytics?: boolean;
  };
  invitedBy?: {
    _id: string;
    displayName: string;
    email: string;
  };
  invitedAt?: Date;
}

export interface OrganizationWithRole {
  _id: string;
  businessName: string;
  logoUrl?: string;
  slug?: string;
  role: string;
  joinedAt: Date;
}

export interface InviteMemberData {
  email: string;
  role: "admin" | "member" | "viewer";
}

export interface MemberStats {
  total: number;
  active: number;
  invited: number;
  byRole: {
    owner?: number;
    admin?: number;
    member?: number;
    viewer?: number;
  };
}

class OrganizationMemberService {
  /**
   * Get all members of an organization
   */
  async getMembers(organizationId: string, includeInvited = false) {
    const params = new URLSearchParams();
    if (includeInvited) params.append("includeInvited", "true");

    const res = await api.get(
      `/organizations/${organizationId}/members?${params}`
    );
    return res.data?.data?.members || [];
  }

  /**
   * Get user's organizations
   */
  async getMyOrganizations(): Promise<OrganizationWithRole[]> {
    const res = await api.get("/organizations/my-organizations");
    return res.data?.data?.organizations || [];
  }

  /**
   * Invite member to organization
   */
  async inviteMember(organizationId: string, data: InviteMemberData) {
    const res = await api.post(
      `/organizations/${organizationId}/members/invite`,
      data
    );
    return res.data?.data;
  }

  /**
   * Accept invitation
   */
  async acceptInvite(token: string) {
    const res = await api.post(`/organizations/invitations/${token}/accept`);
    return res.data?.data;
  }

  /**
   * Update member role
   */
  async updateMemberRole(organizationId: string, userId: string, role: string) {
    const res = await api.put(
      `/organizations/${organizationId}/members/${userId}/role`,
      { role }
    );
    return res.data?.data?.member;
  }

  /**
   * Remove member
   */
  async removeMember(organizationId: string, userId: string) {
    await api.delete(`/organizations/${organizationId}/members/${userId}`);
  }

  /**
   * Leave organization
   */
  async leaveOrganization(organizationId: string) {
    await api.post(`/organizations/${organizationId}/leave`);
  }

  /**
   * Transfer ownership
   */
  async transferOwnership(organizationId: string, newOwnerId: string) {
    await api.post(`/organizations/${organizationId}/transfer-ownership`, {
      newOwnerId,
    });
  }

  /**
   * Get member statistics
   */
  async getStats(organizationId: string): Promise<MemberStats> {
    const res = await api.get(`/organizations/${organizationId}/members/stats`);
    return res.data?.data?.stats || {};
  }
}

export const organizationMemberService = new OrganizationMemberService();

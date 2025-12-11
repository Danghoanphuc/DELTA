// src/features/organization/hooks/useOrganizationMembers.ts
// ✅ Hook for Organization Member Management

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  organizationMemberService,
  OrganizationMember,
  InviteMemberData,
  MemberStats,
} from "../services/organization-member.service";

export function useOrganizationMembers(organizationId?: string) {
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [stats, setStats] = useState<MemberStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch members
   */
  const fetchMembers = useCallback(
    async (includeInvited = false) => {
      if (!organizationId) return;

      setIsLoading(true);
      setError(null);
      try {
        const data = await organizationMemberService.getMembers(
          organizationId,
          includeInvited
        );
        setMembers(data);
      } catch (err: any) {
        const message =
          err.response?.data?.message || "Không thể tải danh sách thành viên";
        setError(message);
        toast.error(message);
        console.error("Error fetching members:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [organizationId]
  );

  /**
   * Fetch statistics
   */
  const fetchStats = useCallback(async () => {
    if (!organizationId) return;

    try {
      const data = await organizationMemberService.getStats(organizationId);
      setStats(data);
    } catch (err: any) {
      console.error("Error fetching stats:", err);
    }
  }, [organizationId]);

  /**
   * Invite member
   */
  const inviteMember = async (data: InviteMemberData) => {
    if (!organizationId) return;

    try {
      const result = await organizationMemberService.inviteMember(
        organizationId,
        data
      );
      toast.success("Đã gửi lời mời thành công!");
      fetchMembers(true); // Refresh with invited members
      fetchStats();
      return result;
    } catch (err: any) {
      const message = err.response?.data?.message || "Không thể gửi lời mời";
      toast.error(message);
      throw err;
    }
  };

  /**
   * Update member role
   */
  const updateMemberRole = async (userId: string, role: string) => {
    if (!organizationId) return;

    try {
      await organizationMemberService.updateMemberRole(
        organizationId,
        userId,
        role
      );
      toast.success("Đã cập nhật vai trò thành công!");
      fetchMembers();
      fetchStats();
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Không thể cập nhật vai trò";
      toast.error(message);
      throw err;
    }
  };

  /**
   * Remove member
   */
  const removeMember = async (userId: string) => {
    if (!organizationId) return;

    try {
      await organizationMemberService.removeMember(organizationId, userId);
      toast.success("Đã xóa thành viên thành công!");
      fetchMembers();
      fetchStats();
    } catch (err: any) {
      const message = err.response?.data?.message || "Không thể xóa thành viên";
      toast.error(message);
      throw err;
    }
  };

  /**
   * Leave organization
   */
  const leaveOrganization = async () => {
    if (!organizationId) return;

    try {
      await organizationMemberService.leaveOrganization(organizationId);
      toast.success("Đã rời khỏi tổ chức thành công!");
      // Redirect to home or organization list
      window.location.href = "/";
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Không thể rời khỏi tổ chức";
      toast.error(message);
      throw err;
    }
  };

  /**
   * Transfer ownership
   */
  const transferOwnership = async (newOwnerId: string) => {
    if (!organizationId) return;

    try {
      await organizationMemberService.transferOwnership(
        organizationId,
        newOwnerId
      );
      toast.success("Đã chuyển quyền sở hữu thành công!");
      fetchMembers();
      fetchStats();
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Không thể chuyển quyền sở hữu";
      toast.error(message);
      throw err;
    }
  };

  // Auto-fetch on mount
  useEffect(() => {
    if (organizationId) {
      fetchMembers();
      fetchStats();
    }
  }, [organizationId, fetchMembers, fetchStats]);

  return {
    members,
    stats,
    isLoading,
    error,
    fetchMembers,
    fetchStats,
    inviteMember,
    updateMemberRole,
    removeMember,
    leaveOrganization,
    transferOwnership,
  };
}

/**
 * Hook for getting user's organizations
 */
export function useMyOrganizations() {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrganizations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await organizationMemberService.getMyOrganizations();
      setOrganizations(data);
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Không thể tải danh sách tổ chức";
      setError(message);
      console.error("Error fetching organizations:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  return {
    organizations,
    isLoading,
    error,
    refetch: fetchOrganizations,
  };
}

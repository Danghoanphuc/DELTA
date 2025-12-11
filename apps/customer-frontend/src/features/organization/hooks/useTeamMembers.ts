// src/features/organization/hooks/useTeamMembers.ts
// ✅ SOLID - Team members management hook

import { useState } from "react";
import { toast } from "@/shared/utils/toast";
import { useAuthStore } from "@/stores/useAuthStore";
import api from "@/shared/lib/axios";

interface PendingInvite {
  email: string;
  invitedAt?: string;
  status: string;
}

interface TeamMember {
  userId: string;
  role: string;
  joinedAt: string;
  user?: {
    displayName: string;
    email: string;
    avatarUrl?: string;
  };
}

export function useTeamMembers() {
  const profile = useAuthStore((s) => s.activeOrganizationProfile);
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pendingInvites: PendingInvite[] = profile?.pendingInvites || [];
  const teamMembers: TeamMember[] = profile?.teamMembers || [];

  // Send invites
  const sendInvites = async (emails: string[]) => {
    const validEmails = emails.filter(
      (email) => email.trim() && email.includes("@")
    );

    if (validEmails.length === 0) {
      toast.error("Vui lòng nhập ít nhất 1 email hợp lệ");
      return false;
    }

    setIsSubmitting(true);
    try {
      await api.post("/organizations/invite-members", { emails: validEmails });
      toast.success(`Đã gửi lời mời đến ${validEmails.length} người!`);
      await fetchMe(true);
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gửi lời mời thất bại");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return {
    pendingInvites,
    teamMembers,
    isSubmitting,
    sendInvites,
    formatDate,
  };
}

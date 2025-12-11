// src/features/organization/hooks/useApprovals.ts
// ✅ SOLID - Approvals management hook

import { useState, useEffect, useCallback } from "react";
import { toast } from "@/shared/utils/toast";
import api from "@/shared/lib/axios";

interface ApprovalRequest {
  _id: string;
  type: string;
  status: string;
  summary: {
    title: string;
    description?: string;
    amount?: number;
    itemCount?: number;
    recipientCount?: number;
  };
  requestedBy: {
    displayName: string;
    email: string;
    avatarUrl?: string;
  };
  requestedAt: string;
  dueDate?: string;
  reviewedBy?: {
    displayName: string;
  };
  reviewedAt?: string;
  reviewNote?: string;
}

interface ApprovalSettings {
  enabled: boolean;
  rules: {
    swag_order: {
      enabled: boolean;
      autoApproveThreshold: number;
      autoApproveMaxRecipients: number;
      dueDurationHours: number;
    };
  };
  notifications: {
    zaloOnNewRequest: boolean;
    emailOnNewRequest: boolean;
  };
}

export function useApprovals() {
  const [isLoading, setIsLoading] = useState(true);
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [settings, setSettings] = useState<ApprovalSettings | null>(null);

  // Fetch data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [requestsRes, statsRes, settingsRes] = await Promise.allSettled([
        api.get("/approvals/pending"),
        api.get("/approvals/stats"),
        api.get("/approvals/settings"),
      ]);

      if (requestsRes.status === "fulfilled") {
        setRequests(requestsRes.value.data?.data?.requests || []);
      }
      if (statsRes.status === "fulfilled") {
        setStats(
          statsRes.value.data?.data || { pending: 0, approved: 0, rejected: 0 }
        );
      }
      if (settingsRes.status === "fulfilled") {
        setSettings(settingsRes.value.data?.data?.settings);
      }
    } catch (error) {
      console.error("[useApprovals] Error fetching approvals:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Approve request
  const approveRequest = async (requestId: string, note: string) => {
    try {
      await api.post(`/approvals/${requestId}/approve`, { note });
      toast.success("Đã duyệt yêu cầu!");
      await fetchData();
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
      return false;
    }
  };

  // Reject request
  const rejectRequest = async (requestId: string, note: string) => {
    if (!note.trim()) {
      toast.error("Vui lòng nhập lý do từ chối");
      return false;
    }

    try {
      await api.post(`/approvals/${requestId}/reject`, { note });
      toast.success("Đã từ chối yêu cầu!");
      await fetchData();
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
      return false;
    }
  };

  // Update settings
  const updateSettings = async (newSettings: ApprovalSettings) => {
    try {
      await api.put("/approvals/settings", newSettings);
      toast.success("Đã lưu cài đặt!");
      setSettings(newSettings);
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
      return false;
    }
  };

  return {
    isLoading,
    requests,
    stats,
    settings,
    setSettings,
    approveRequest,
    rejectRequest,
    updateSettings,
    refetch: fetchData,
  };
}

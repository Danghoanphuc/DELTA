// apps/customer-frontend/src/features/notifications/hooks/useNotifications.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/shared/lib/axios";

// --- TYPES ---
export interface Notification {
  _id: string;
  userId: string;
  type: "order_created" | "payment_confirmed" | "order_shipped" | "order_completed" | "order_cancelled" | "promotion" | "system" | string;
  title: string;
  message: string;
  isRead: boolean;
  data?: any;
  createdAt: string;
}

interface NotificationResponse {
  data: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  unreadCount: number;
}

// --- API CALLS ---
// ✅ Cập nhật: Hỗ trợ filter params
const getNotifications = async (page = 1, limit = 10, filter?: string) => {
  const params: any = { page, limit };
  if (filter === "unread") {
    params.isRead = false;
  }
  const { data } = await api.get<NotificationResponse>("/notifications", { params });
  return data;
};

const getUnreadCount = async () => {
  const { data } = await api.get<{ data: { count: number } }>(
    "/notifications/unread-count"
  );
  return data.data.count;
};

const markAsRead = async (id: string) => {
  const { data } = await api.put(`/notifications/${id}/read`);
  return data;
};

const markAllAsRead = async () => {
  const { data } = await api.put("/notifications/read-all");
  return data;
};

// --- HOOKS ---

export const useNotifications = (
  params: { page?: number; limit?: number; filter?: "all" | "unread" } = {},
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["notifications", params.page || 1, params.filter || "all"],
    queryFn: () => getNotifications(params.page, params.limit, params.filter),
    enabled,
    // ✅ FIX: Tắt polling khi bị rate limit hoặc không enabled
    refetchInterval: (query) => {
      // Tắt polling nếu query bị lỗi 429 (rate limit)
      if (query.state.error && (query.state.error as any)?.response?.status === 429) {
        return false;
      }
      // Chỉ polling khi enabled
      return enabled ? 30000 : false; // ✅ Tăng lên 30s để giảm tải
    },
    retry: (failureCount, error: any) => {
      // ✅ FIX: Không retry khi bị rate limit (429)
      if (error?.response?.status === 429) {
        return false;
      }
      return failureCount < 2; // Chỉ retry tối đa 2 lần cho các lỗi khác
    },
    placeholderData: (previousData) => previousData, // Giữ data cũ khi chuyển trang (UX mượt hơn)
  });
};

export const useUnreadCount = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: getUnreadCount,
    // ✅ FIX: Tắt polling khi bị rate limit
    refetchInterval: (query) => {
      // Tắt polling nếu query bị lỗi 429 (rate limit)
      if (query.state.error && (query.state.error as any)?.response?.status === 429) {
        return false;
      }
      return 30000; // ✅ Tăng lên 30s để giảm tải (thay vì 10s)
    },
    retry: (failureCount, error: any) => {
      // ✅ FIX: Không retry khi bị rate limit (429)
      if (error?.response?.status === 429) {
        return false;
      }
      return failureCount < 2; // Chỉ retry tối đa 2 lần cho các lỗi khác
    },
  });

  return { unreadCount: data || 0, isLoading };
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    },
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    },
  });
};
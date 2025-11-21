// apps/customer-frontend/src/features/notifications/hooks/useNotifications.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/shared/lib/axios";

// --- TYPES ---
export interface Notification {
  _id: string;
  userId: string;
  type: string;
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
const getNotifications = async (page = 1, limit = 10) => {
  const { data } = await api.get<NotificationResponse>("/notifications", {
    params: { page, limit },
  });
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

/**
 * Hook lấy danh sách thông báo (có phân trang)
 * ✅ FIX CRASH: Ép kiểu 'enabled' thành boolean chuẩn (!!enabled)
 */
export const useNotifications = (
  params: { page?: number; limit?: number } = {},
  enabled: any = true // Chấp nhận mọi kiểu dữ liệu để tránh lỗi TS
) => {
  return useQuery({
    queryKey: ["notifications", params.page || 1],
    queryFn: () => getNotifications(params.page, params.limit),
    // ✅ FIX QUAN TRỌNG: Nếu enabled là null/undefined thì sẽ thành false, ngược lại true
    enabled: enabled !== undefined && enabled !== null ? !!enabled : true,
    refetchInterval: 30000,
  });
};

/**
 * Hook lấy số lượng chưa đọc (dùng cho badge đỏ)
 */
export const useUnreadCount = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: getUnreadCount,
    refetchInterval: 15000,
  });

  return { unreadCount: data || 0, isLoading };
};

/**
 * Hook đánh dấu 1 tin là đã đọc
 */
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["notifications", "unread-count"],
      });
    },
  });
};

/**
 * Hook đánh dấu TẤT CẢ là đã đọc
 */
export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["notifications", "unread-count"],
      });
    },
  });
};

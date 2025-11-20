// apps/customer-frontend/src/features/notifications/hooks/useNotifications.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/shared/lib/axios";
import { toast } from "sonner";

interface Notification {
  _id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data: {
    orderId?: string;
    orderNumber?: string;
    link?: string;
    [key: string]: any;
  };
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface NotificationsResponse {
  success: boolean;
  data: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  unreadCount: number;
}

interface UnreadCountResponse {
  success: boolean;
  data: {
    count: number;
  };
}

/**
 * Hook to manage notifications
 */
export function useNotifications(page = 1, limit = 20, isRead?: boolean) {
  const queryClient = useQueryClient();

  // Build query params
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (typeof isRead === "boolean") {
    params.append("isRead", isRead.toString());
  }

  // Fetch notifications
  const {
    data: notificationsData,
    isLoading,
    error,
    refetch,
  } = useQuery<NotificationsResponse>({
    queryKey: ["notifications", page, limit, isRead],
    queryFn: async () => {
      const response = await api.get(`/notifications?${params.toString()}`);
      return response.data;
    },
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
  });

  // Fetch unread count
  const { data: unreadData, refetch: refetchUnreadCount } =
    useQuery<UnreadCountResponse>({
      queryKey: ["notifications", "unread-count"],
      queryFn: async () => {
        const response = await api.get("/notifications/unread-count");
        return response.data;
      },
      staleTime: 10000, // 10 seconds
      refetchInterval: 30000, // Refetch every 30 seconds
      refetchOnWindowFocus: true,
    });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await api.put(`/notifications/${notificationId}/read`);
      return response.data;
    },
    onSuccess: () => {
      // Refetch notifications and unread count
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Không thể đánh dấu đã đọc"
      );
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await api.put("/notifications/read-all");
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(
        data.message || "Đã đánh dấu tất cả thông báo là đã đọc"
      );
      // Refetch notifications and unread count
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          "Không thể đánh dấu tất cả đã đọc"
      );
    },
  });

  return {
    // Data
    notifications: notificationsData?.data || [],
    pagination: notificationsData?.pagination,
    unreadCount: unreadData?.data?.count || 0,

    // Loading states
    isLoading,
    error,

    // Actions
    markAsRead: (id: string) => markAsReadMutation.mutate(id),
    markAllAsRead: () => markAllAsReadMutation.mutate(),
    refetch,
    refetchUnreadCount,

    // Mutation states
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
  };
}

/**
 * Hook to only get unread count (for badge)
 */
export function useUnreadCount() {
  const { data, refetch } = useQuery<UnreadCountResponse>({
    queryKey: ["notifications", "unread-count"],
    queryFn: async () => {
      const response = await api.get("/notifications/unread-count");
      return response.data;
    },
    staleTime: 10000, // 10 seconds
    refetchInterval: 30000, // Refetch every 30 seconds
    refetchOnWindowFocus: true,
  });

  return {
    unreadCount: data?.data?.count || 0,
    refetch,
  };
}


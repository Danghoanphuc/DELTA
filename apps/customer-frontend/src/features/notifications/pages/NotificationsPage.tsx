// apps/customer-frontend/src/features/notifications/pages/NotificationsPage.tsx
import { useState } from "react";
// ✅ Import đầy đủ các hooks riêng biệt
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  type Notification,
} from "../hooks/useNotifications";
import { NotificationItem } from "../components/NotificationItem";
import { Button } from "@/shared/components/ui/button";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export function NotificationsPage() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  // ✅ 1. Gọi Hook lấy dữ liệu (Truyền object param chuẩn)
  const { data, isLoading } = useNotifications(
    {
      page,
      limit: 20,
      // Lưu ý: Hook hiện tại chưa hỗ trợ filter isRead,
      // nhưng ta cứ truyền đúng cấu trúc để sau này update hook là chạy được ngay.
      // isRead: filter === "unread" ? false : undefined
    },
    true // Enabled
  );

  // ✅ 2. Trích xuất dữ liệu an toàn (Safety Check)
  // Dùng toán tử ?. và || [] để đảm bảo không bao giờ bị undefined
  const notifications = (data?.data ?? []) as Notification[];
  const pagination = data?.pagination;
  const unreadCount = data?.unreadCount || 0;

  // ✅ 3. Gọi Hook Mutation riêng biệt
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();

  const handleMarkAllAsRead = () => {
    if (unreadCount === 0) return;
    markAllAsReadMutation.mutate();
  };

  const handleMarkOneAsRead = (id: string) => {
    markAsReadMutation.mutate(id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-6 w-6 text-gray-700" />
              <h1 className="text-2xl font-bold text-gray-900">Thông báo</h1>
              {unreadCount > 0 && (
                <span className="px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded-full animate-in zoom-in">
                  {unreadCount}
                </span>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0 || markAllAsReadMutation.isPending}
              className="gap-2"
            >
              {markAllAsReadMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCheck className="h-4 w-4" />
              )}
              Đánh dấu đã đọc tất cả
            </Button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => {
                setFilter("all");
                setPage(1);
              }}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                filter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              Tất cả
              {pagination && (
                <span className="ml-1.5 text-xs opacity-80">
                  ({pagination.total})
                </span>
              )}
            </button>
            <button
              onClick={() => {
                setFilter("unread");
                setPage(1);
              }}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                filter === "unread"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              Chưa đọc
              {unreadCount > 0 && (
                <span className="ml-1.5 text-xs opacity-80">
                  ({unreadCount})
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden min-h-[400px]">
          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
              <p className="text-gray-500 text-sm">Đang tải thông báo...</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && notifications.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Bell className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                {filter === "unread"
                  ? "Không có thông báo chưa đọc"
                  : "Bạn chưa có thông báo nào"}
              </h3>
              <p className="text-sm text-gray-500">
                {filter === "unread"
                  ? "Tất cả thông báo của bạn đã được đọc"
                  : "Thông báo đơn hàng và tin nhắn sẽ xuất hiện ở đây"}
              </p>
            </div>
          )}

          {/* Notification List */}
          {!isLoading && notifications.length > 0 && (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => {
                const safeNotification: Notification = {
                  ...notification,
                  data: notification.data ?? {},
                };
                return (
                  <NotificationItem
                    key={notification._id}
                    notification={safeNotification}
                    onMarkAsRead={() => handleMarkOneAsRead(notification._id)}
                  />
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {!isLoading && pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
              <p className="text-sm text-gray-600">
                Trang {pagination.page} / {pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="bg-white"
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= pagination.totalPages}
                  className="bg-white"
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NotificationsPage;

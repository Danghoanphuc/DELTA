// apps/customer-frontend/src/features/notifications/pages/NotificationsPage.tsx
import { useState } from "react";
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  type Notification,
} from "../hooks/useNotifications";
import { NotificationItem } from "../components/NotificationItem";
import { Button } from "@/shared/components/ui/button";
import { Bell, CheckCheck, Loader2, Inbox } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function NotificationsPage() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  // Hook Fetch Data
  const { data, isLoading } = useNotifications({ page, limit: 20, filter }, true);

  const notifications = (data?.data ?? []) as Notification[];
  const pagination = data?.pagination;
  const unreadCount = data?.unreadCount || 0;

  // Hook Mutations
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
    <div className="min-h-screen bg-gray-50/50 pb-20">
      
      {/* === HEADER (Sticky Glassmorphism) === */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm transition-all duration-200">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">Thông báo</h1>
              {unreadCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="px-2 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full shadow-sm"
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </motion.span>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0 || markAllAsReadMutation.isPending}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 gap-1.5 h-8 text-xs font-medium"
            >
              {markAllAsReadMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCheck className="h-3.5 w-3.5" />
              )}
              Đã đọc tất cả
            </Button>
          </div>

          {/* TABS (Pills Animation) */}
          <div className="flex p-1 bg-gray-100/80 rounded-lg w-fit relative">
            {[
              { id: "all", label: "Tất cả" },
              { id: "unread", label: "Chưa đọc" }
            ].map((tab) => {
                const isActive = filter === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => { setFilter(tab.id as any); setPage(1); }}
                        className={cn(
                            "relative px-4 py-1.5 text-sm font-medium rounded-md transition-all z-10",
                            isActive ? "text-gray-900" : "text-gray-500 hover:text-gray-700"
                        )}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="activeTabNotification"
                                className="absolute inset-0 bg-white rounded-md shadow-sm border border-gray-200/50"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                style={{ zIndex: -1 }}
                            />
                        )}
                        {tab.label}
                    </button>
                );
            })}
          </div>
        </div>
      </div>

      {/* === CONTENT === */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden min-h-[400px] relative">
          
          {/* Loading State */}
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-20">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
              <p className="text-gray-500 text-xs font-medium">Đang tải thông báo...</p>
            </div>
          )}

          {/* List */}
          <AnimatePresence mode="wait">
            {!isLoading && notifications.length === 0 ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-24 text-center px-4"
              >
                <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 shadow-inner">
                  <Inbox className="h-10 w-10 text-gray-300" />
                </div>
                <h3 className="text-base font-semibold text-gray-900">
                  {filter === "unread" ? "Bạn đã đọc hết thông báo" : "Chưa có thông báo nào"}
                </h3>
                <p className="text-sm text-gray-500 mt-1 max-w-xs">
                  {filter === "unread" 
                    ? "Tuyệt vời! Bạn đã cập nhật tất cả thông tin mới nhất." 
                    : "Khi có đơn hàng hoặc tin nhắn mới, chúng sẽ xuất hiện tại đây."}
                </p>
              </motion.div>
            ) : (
              <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="divide-y divide-gray-50">
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification._id}
                    notification={{ ...notification, data: notification.data ?? {} }}
                    onMarkAsRead={() => handleMarkOneAsRead(notification._id)}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pagination Footer */}
          {!isLoading && pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/50">
              <Button
                variant="outline" size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="bg-white text-xs h-8"
              >
                Trước
              </Button>
              <span className="text-xs text-gray-500 font-medium">
                Trang {pagination.page} / {pagination.totalPages}
              </span>
              <Button
                variant="outline" size="sm"
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={page >= pagination.totalPages}
                className="bg-white text-xs h-8"
              >
                Sau
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NotificationsPage;
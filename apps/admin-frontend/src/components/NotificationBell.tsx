import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { useAdminAuthStore } from "@/store/useAdminAuthStore";
import { Novu } from "@novu/js";

interface Notification {
  _id: string;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  data?: {
    url?: string;
    threadId?: string;
    orderNumber?: string;
  };
}

// Initialize Novu client
const novu = new Novu({
  subscriberId: "69133fb134099877aaa371a2", // Admin user ID
  applicationIdentifier: import.meta.env.VITE_NOVU_APP_ID || "",
});

export function NotificationBell() {
  const { admin } = useAdminAuthStore((state) => ({ admin: state.admin }));
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications from Novu
  useEffect(() => {
    if (!admin) return;

    const fetchNotifications = async () => {
      try {
        const { data } = await novu.notifications.list({
          limit: 20,
        });

        const notificationData = Array.isArray(data) ? data : [];
        const formattedNotifications: Notification[] = notificationData.map(
          (n: any) => ({
            _id: n._id,
            title: n.payload?.senderName
              ? `${n.payload.senderName} đã gửi tin nhắn`
              : "Thông báo mới",
            message:
              n.payload?.messagePreview ||
              n.payload?.messages ||
              n.content ||
              "Bạn có tin nhắn mới",
            createdAt: n.createdAt,
            isRead: n.read,
            data: {
              url: n.payload?.url || n.cta?.data?.url,
              threadId: n.payload?.threadId,
              orderNumber: n.payload?.orderNumber,
            },
          })
        );

        setNotifications(formattedNotifications);
        setUnreadCount(formattedNotifications.filter((n) => !n.isRead).length);
      } catch (error) {
        console.error(
          "[NotificationBell] Failed to fetch notifications:",
          error
        );
        // Fallback to empty state
        setNotifications([]);
        setUnreadCount(0);
      }
    };

    fetchNotifications();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [admin]);

  const handleNotificationClick = async (notification: Notification) => {
    try {
      // Mark as read in Novu
      if (!notification.isRead) {
        await (novu.notifications as any).markAs({
          messageId: notification._id,
          seen: true,
          read: true,
        });
      }

      // Update local state
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notification._id ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      // Navigate to URL
      if (notification.data?.url) {
        window.location.href = notification.data.url;
      }
    } catch (error) {
      console.error("[NotificationBell] Failed to mark as read:", error);
    }

    setIsOpen(false);
  };

  const handleMarkAllRead = async () => {
    try {
      // Mark all as read in Novu
      await (novu.notifications as any).markAllAs({ read: true });

      // Update local state
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("[NotificationBell] Failed to mark all as read:", error);
    }
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Notification Panel */}
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-[600px] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Thông báo</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Đánh dấu đã đọc
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Không có thông báo mới</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <button
                      key={notification._id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                        !notification.isRead ? "bg-blue-50" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                            !notification.isRead ? "bg-blue-500" : "bg-gray-300"
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm mb-1">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(notification.createdAt).toLocaleString(
                              "vi-VN"
                            )}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200">
                <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Xem tất cả thông báo
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

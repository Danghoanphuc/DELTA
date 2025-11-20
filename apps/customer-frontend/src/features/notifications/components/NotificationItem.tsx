// apps/customer-frontend/src/features/notifications/components/NotificationItem.tsx
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import {
  Package,
  DollarSign,
  CheckCircle,
  XCircle,
  Bell,
  Gift,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface NotificationItemProps {
  notification: {
    _id: string;
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
    createdAt: string;
  };
  onMarkAsRead: (id: string) => void;
}

export function NotificationItem({
  notification,
  onMarkAsRead,
}: NotificationItemProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    // Mark as read
    if (!notification.isRead) {
      onMarkAsRead(notification._id);
    }

    // Navigate to link if available
    if (notification.data?.link) {
      navigate(notification.data.link);
    }
  };

  // Get icon based on notification type
  const getIcon = () => {
    switch (notification.type) {
      case "order_created":
        return <Package className="h-5 w-5 text-blue-600" />;
      case "payment_confirmed":
        return <DollarSign className="h-5 w-5 text-green-600" />;
      case "order_shipped":
        return <Package className="h-5 w-5 text-purple-600" />;
      case "order_completed":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "order_cancelled":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "promotion":
        return <Gift className="h-5 w-5 text-orange-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  // Get background color based on type
  const getBgColor = () => {
    if (notification.isRead) {
      return "bg-white hover:bg-gray-50";
    }
    return "bg-blue-50 hover:bg-blue-100";
  };

  // Format time ago
  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
    locale: vi,
  });

  return (
    <div
      onClick={handleClick}
      className={cn(
        "flex items-start gap-3 p-4 border-b border-gray-200 cursor-pointer transition-colors",
        getBgColor()
      )}
    >
      {/* Icon */}
      <div className="flex-shrink-0 mt-1">{getIcon()}</div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4
            className={cn(
              "text-sm font-medium text-gray-900",
              !notification.isRead && "font-semibold"
            )}
          >
            {notification.title}
          </h4>
          {!notification.isRead && (
            <div className="flex-shrink-0 h-2 w-2 bg-blue-600 rounded-full mt-1" />
          )}
        </div>

        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>

        <p className="text-xs text-gray-400 mt-2">{timeAgo}</p>
      </div>
    </div>
  );
}


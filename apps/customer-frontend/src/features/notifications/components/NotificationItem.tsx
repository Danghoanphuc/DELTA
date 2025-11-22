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
  Truck,
  Info
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { motion } from "framer-motion";
import type { Notification } from "../hooks/useNotifications";

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

export function NotificationItem({
  notification,
  onMarkAsRead,
}: NotificationItemProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification._id);
    }
    // Navigate logic
    if (notification.data?.link) {
      navigate(notification.data.link);
    } else if (notification.data?.orderId) {
        navigate(`/orders/${notification.data.orderId}`);
    }
  };

  // Config Icon & Color based on Type
  const getConfig = () => {
    switch (notification.type) {
      case "order_created":
        return { icon: Package, color: "text-blue-600", bg: "bg-blue-100" };
      case "payment_confirmed":
        return { icon: DollarSign, color: "text-green-600", bg: "bg-green-100" };
      case "order_shipped":
        return { icon: Truck, color: "text-indigo-600", bg: "bg-indigo-100" };
      case "order_completed":
        return { icon: CheckCircle, color: "text-teal-600", bg: "bg-teal-100" };
      case "order_cancelled":
        return { icon: XCircle, color: "text-red-600", bg: "bg-red-100" };
      case "promotion":
        return { icon: Gift, color: "text-orange-600", bg: "bg-orange-100" };
      default:
        return { icon: Bell, color: "text-gray-600", bg: "bg-gray-100" };
    }
  };

  const { icon: Icon, color, bg } = getConfig();

  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
    locale: vi,
  });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.01, backgroundColor: "rgba(249, 250, 251, 0.8)" }} // Hover effect nhẹ
      whileTap={{ scale: 0.99 }}
      onClick={handleClick}
      className={cn(
        "relative flex items-start gap-4 p-4 border-b border-gray-100 cursor-pointer transition-all duration-200 last:border-0",
        !notification.isRead ? "bg-blue-50/60" : "bg-white"
      )}
    >
      {/* Unread Indicator */}
      {!notification.isRead && (
        <div className="absolute top-4 right-4 h-2.5 w-2.5 bg-blue-600 rounded-full shadow-sm animate-pulse" />
      )}

      {/* Icon Box */}
      <div className={cn("flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm", bg)}>
        <Icon className={cn("h-5 w-5", color)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex flex-col gap-1">
          <h4 className={cn("text-sm text-gray-900 leading-snug pr-6", !notification.isRead ? "font-bold" : "font-medium")}>
            {notification.title}
          </h4>
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {notification.message}
          </p>
          <p className="text-xs text-gray-400 mt-1 font-medium">
            {timeAgo}
          </p>
        </div>
        
        {/* Optional: Action Link Preview (nếu có) */}
        {/* {notification.data?.link && (
            <div className="mt-2 text-xs font-semibold text-blue-600 flex items-center gap-1">
                Xem chi tiết <ChevronRight size={12} />
            </div>
        )} */}
      </div>
    </motion.div>
  );
}
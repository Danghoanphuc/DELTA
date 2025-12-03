// apps/customer-frontend/src/features/chat/components/message-status/MessageStatusIndicator.tsx
/**
 * 🔥 MESSAGE STATUS INDICATOR
 * Hiển thị trạng thái gửi tin nhắn (sending, sent, failed, retrying)
 */

import { MessageStatus } from "@/types/chat";
import { Check, CheckCheck, Clock, AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface MessageStatusIndicatorProps {
  status?: MessageStatus;
  retryCount?: number;
  className?: string;
}

export function MessageStatusIndicator({
  status = "sent",
  retryCount = 0,
  className,
}: MessageStatusIndicatorProps) {
  const getStatusIcon = () => {
    switch (status) {
      case "pending":
      case "sending":
        return <Clock className="w-3 h-3 text-gray-400 animate-pulse" />;

      case "retrying":
        return <RefreshCw className="w-3 h-3 text-yellow-500 animate-spin" />;

      case "sent":
        return <Check className="w-3 h-3 text-gray-400" />;

      case "delivered":
        return <CheckCheck className="w-3 h-3 text-gray-400" />;

      case "read":
        return <CheckCheck className="w-3 h-3 text-blue-500" />;

      case "failed":
        return <AlertCircle className="w-3 h-3 text-red-500" />;

      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "pending":
        return "Đang chờ...";
      case "sending":
        return "Đang gửi...";
      case "retrying":
        return `Đang thử lại (${retryCount})...`;
      case "sent":
        return "Đã gửi";
      case "delivered":
        return "Đã nhận";
      case "read":
        return "Đã xem";
      case "failed":
        return "Gửi thất bại";
      default:
        return "";
    }
  };

  return (
    <div
      className={cn(
        "flex items-center gap-1 text-xs",
        status === "failed" && "text-red-500",
        status === "retrying" && "text-yellow-600",
        className
      )}
      title={getStatusText()}
    >
      {getStatusIcon()}
      {(status === "failed" || status === "retrying") && (
        <span className="font-medium">{getStatusText()}</span>
      )}
    </div>
  );
}

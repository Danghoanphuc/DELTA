// apps/customer-frontend/src/features/chat/components/message-status/FailedMessageActions.tsx
/**
 * 🔥 FAILED MESSAGE ACTIONS
 * UI để retry hoặc xóa tin nhắn gửi thất bại
 */

import { RefreshCw, X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

interface FailedMessageActionsProps {
  messageId: string;
  conversationId: string;
  error?: string;
  errorCode?: string;
  onRetry: (messageId: string, conversationId: string) => void;
  onCancel: (messageId: string, conversationId: string) => void;
  className?: string;
}

export function FailedMessageActions({
  messageId,
  conversationId,
  error,
  errorCode,
  onRetry,
  onCancel,
  className,
}: FailedMessageActionsProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 mt-2 p-2 bg-red-50 border border-red-200 rounded-lg",
        className
      )}
    >
      <div className="flex-1 min-w-0">
        <p className="text-xs text-red-600 font-medium">Gửi thất bại</p>
        {error && (
          <p className="text-xs text-red-500 truncate" title={error}>
            {error}
          </p>
        )}
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onRetry(messageId, conversationId)}
          className="h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-100"
        >
          <RefreshCw className="w-3 h-3 mr-1" />
          Thử lại
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => onCancel(messageId, conversationId)}
          className="h-7 px-2 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100"
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}

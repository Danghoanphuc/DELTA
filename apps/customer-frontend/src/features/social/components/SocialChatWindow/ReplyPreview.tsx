// ReplyPreview.tsx - Reply preview component above input
import { X } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { ChatMessage } from "@/types/chat";

interface ReplyPreviewProps {
  message: ChatMessage;
  previewText: string;
  onCancel: () => void;
}

export function ReplyPreview({
  message,
  previewText,
  onCancel,
}: ReplyPreviewProps) {
  const senderName =
    typeof message.sender === "object" && message.sender
      ? message.sender.displayName || message.sender.username || "Người dùng"
      : "Người dùng";

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
      <div className="flex-1 min-w-0">
        <div className="text-xs font-bold text-blue-700 mb-0.5">
          Trả lời {senderName}
        </div>
        <div className="text-xs text-stone-600 truncate">{previewText}</div>
      </div>
      <button
        onClick={onCancel}
        className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full hover:bg-blue-100 text-stone-400 hover:text-stone-600 transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
}

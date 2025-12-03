// MessageActions.tsx - Floating action buttons for messages
import { cn } from "@/shared/lib/utils";
import {
  Copy,
  Check,
  Quote,
  MoreHorizontal,
  Download,
  Trash2,
  AlertCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

interface MessageActionsProps {
  message: any;
  isMe: boolean;
  isCopied: boolean;
  hasText: boolean;
  hasAttachments: boolean;
  onCopy: () => void;
  onReply: () => void;
  onDownload: () => void;
  onDelete: (deleteForEveryone: boolean) => void;
}

export function MessageActions({
  message,
  isMe,
  isCopied,
  hasText,
  hasAttachments,
  onCopy,
  onReply,
  onDownload,
  onDelete,
}: MessageActionsProps) {
  return (
    <div
      className={cn(
        "absolute bottom-0 z-10 flex items-center gap-1 opacity-0 transition-all duration-200 group-hover:opacity-100",
        isMe ? "right-full mr-2" : "left-full ml-2"
      )}
    >
      {/* Copy Button - Show if has text or image */}
      {(hasText || hasAttachments) && (
        <button
          onClick={onCopy}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-full border border-stone-200 bg-white shadow-sm transition-all hover:bg-stone-50 hover:text-stone-900 active:scale-95",
            isCopied ? "text-green-600 border-green-200" : "text-stone-400"
          )}
          title="Sao chép"
        >
          {isCopied ? (
            <Check size={14} strokeWidth={2.5} className="animate-in zoom-in" />
          ) : (
            <Copy size={13} />
          )}
        </button>
      )}

      {/* Reply Button */}
      <button
        onClick={onReply}
        className="flex h-7 w-7 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-400 shadow-sm transition-all hover:bg-stone-50 hover:text-blue-600 active:scale-95"
        title="Trả lời"
      >
        <Quote size={13} className="fill-current opacity-80" />
      </button>

      {/* More Dropdown */}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <button className="flex h-7 w-7 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-400 shadow-sm transition-all hover:bg-stone-50 hover:text-stone-900 active:scale-95">
            <MoreHorizontal size={14} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align={isMe ? "end" : "start"}
          className="w-40 p-1"
          sideOffset={5}
        >
          {/* Download - Show if has attachments */}
          {hasAttachments && (
            <DropdownMenuItem
              onClick={onDownload}
              className="text-stone-600 rounded-lg cursor-pointer"
            >
              <Download size={14} className="mr-2" /> Tải xuống
            </DropdownMenuItem>
          )}

          {/* Delete - Show if is my message */}
          {isMe && (
            <>
              <DropdownMenuItem
                onClick={() => onDelete(false)}
                className="text-stone-600 rounded-lg cursor-pointer"
              >
                <Trash2 size={14} className="mr-2" /> Thu hồi (chỉ tôi)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(true)}
                className="text-red-600 focus:text-red-600 focus:bg-red-50 rounded-lg cursor-pointer"
              >
                <Trash2 size={14} className="mr-2" /> Thu hồi (mọi người)
              </DropdownMenuItem>
            </>
          )}

          {/* Report - Show if not my message */}
          {!isMe && (
            <DropdownMenuItem className="text-stone-600 rounded-lg cursor-pointer">
              <AlertCircle size={14} className="mr-2" /> Báo cáo
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

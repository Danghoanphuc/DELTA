// MessageBubble.tsx - Standard message bubble component
import { cn } from "@/shared/lib/utils";
import { CheckCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import DOMPurify from "dompurify";
import { MessageAttachments } from "./MessageAttachments";
import { ReplyPreviewInMessage } from "./ReplyPreviewInMessage";

interface MessageBubbleProps {
  message: any;
  isMe: boolean;
  isGroupedWithPrev: boolean;
  isGroupedWithNext: boolean;
  onImageClick: (url: string, name: string) => void;
  onFileClick: (file: any) => void;
  onReplyClick?: (messageId: string) => void;
}

export function MessageBubble({
  message,
  isMe,
  isGroupedWithPrev,
  isGroupedWithNext,
  onImageClick,
  onFileClick,
  onReplyClick,
}: MessageBubbleProps) {
  const attachments = (message.content as any)?.attachments || [];
  const text = (message.content as any)?.text;
  const replyTo = message.replyTo;

  return (
    <div
      className={cn(
        "relative overflow-hidden px-3 py-2 text-[15px] leading-relaxed shadow-sm transition-all",
        "rounded-[16px]",
        isMe
          ? "bg-stone-100 text-stone-900 border-stone-200"
          : "bg-white text-stone-800 border border-stone-100 shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
        isMe && isGroupedWithPrev && "rounded-tr-[4px]",
        isMe && isGroupedWithNext && "rounded-br-[4px]",
        !isMe && isGroupedWithPrev && "rounded-tl-[4px]",
        !isMe && isGroupedWithNext && "rounded-bl-[4px]"
      )}
    >
      {/* Reply Preview */}
      {replyTo && (
        <ReplyPreviewInMessage
          replyTo={replyTo}
          isMe={isMe}
          onClick={() => onReplyClick?.(replyTo._id)}
        />
      )}

      {/* Attachments */}
      {attachments.length > 0 && (
        <MessageAttachments
          attachments={attachments}
          isMe={isMe}
          onImageClick={onImageClick}
          onFileClick={onFileClick}
        />
      )}

      {/* Text Content */}
      {text && (
        <div
          className="whitespace-pre-wrap break-words font-sans prose prose-sm max-w-none prose-p:my-0 prose-ul:my-0 prose-li:my-0 [&_ul]:pl-4 [&_li]:list-disc"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(text),
          }}
        />
      )}

      {/* Meta Time */}
      <div
        className={cn(
          "mt-0.5 flex items-center justify-end gap-1 text-[9px] font-medium select-none opacity-60",
          isMe ? "text-stone-500" : "text-stone-400"
        )}
      >
        <span>
          {formatDistanceToNow(new Date(message.createdAt || Date.now()), {
            addSuffix: false,
            locale: vi,
          })}
        </span>
        {isMe && (
          <CheckCheck
            size={11}
            className={cn(
              message.status === "read" ? "text-blue-500" : "text-stone-300"
            )}
          />
        )}
      </div>
    </div>
  );
}

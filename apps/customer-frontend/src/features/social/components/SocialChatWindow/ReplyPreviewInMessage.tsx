// ReplyPreviewInMessage.tsx - Reply preview inside message bubble
import { cn } from "@/shared/lib/utils";
import { Reply } from "lucide-react";
import type { ChatMessage } from "@/types/chat";

interface ReplyPreviewInMessageProps {
  replyTo: ChatMessage;
  isMe: boolean;
  onClick?: () => void;
}

export function ReplyPreviewInMessage({
  replyTo,
  isMe,
  onClick,
}: ReplyPreviewInMessageProps) {
  const senderName =
    typeof replyTo.sender === "object" && replyTo.sender
      ? replyTo.sender.displayName || replyTo.sender.username || "Người dùng"
      : "Người dùng";

  const content = replyTo.content as any;
  const attachments = content?.attachments || [];
  const text = content?.text;

  // Get image thumbnail if exists
  const imageAttachment = attachments.find(
    (att: any) =>
      att.type === "image" || att.url?.match(/\.(jpeg|jpg|png|webp|heic)$/i)
  );

  // Get preview text
  let previewText = "";
  if (attachments.length > 0) {
    if (imageAttachment) {
      previewText = "Ảnh";
    } else {
      previewText = attachments[0].originalName || "File";
    }
  } else if (text) {
    const div = document.createElement("div");
    div.innerHTML = text;
    const plainText = div.textContent || div.innerText || "";
    previewText =
      plainText.length > 60 ? plainText.substring(0, 60) + "..." : plainText;
  } else {
    previewText = "Tin nhắn";
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        "mb-2 flex items-start gap-2 px-2.5 py-2 rounded-lg border-l-[3px] cursor-pointer transition-all hover:brightness-95 active:scale-[0.99]",
        isMe
          ? "bg-stone-200/50 border-stone-400 hover:bg-stone-200/70"
          : "bg-blue-50/50 border-blue-400 hover:bg-blue-50/70"
      )}
    >
      {/* Thumbnail if image (left side) */}
      {imageAttachment && (
        <div className="w-12 h-12 rounded overflow-hidden shrink-0 border border-stone-200 shadow-sm">
          <img
            src={imageAttachment.url}
            alt="Preview"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-bold text-blue-600 mb-0.5 flex items-center gap-1">
          <Reply size={9} className="shrink-0" />
          <span className="truncate">{senderName}</span>
        </div>
        <div className="text-[11px] text-stone-700 line-clamp-2 font-medium leading-snug">
          {previewText}
        </div>
      </div>
    </div>
  );
}

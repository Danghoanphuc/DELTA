// apps/customer-frontend/src/features/social/components/SocialChatWindow/MessageItem.tsx


import { 
  Loader2, FileText, Download, File, 
  FileImage, FileVideo, FileSpreadsheet, FileArchive 
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { motion } from "framer-motion";
import { cn } from "@/shared/lib/utils";
import type { ChatMessage } from "@/types/chat";
import { getSenderId, isMyMessage } from "./utils";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/useAuthStore";

interface MessageItemProps {
  message: ChatMessage;
  previousMessage: ChatMessage | null;
  conversation: any;
  currentUserId?: string;
  messageRef?: (el: HTMLDivElement | null) => void;
}

export function MessageItem({
  message,
  previousMessage,
  conversation,
  currentUserId,
  messageRef,
}: MessageItemProps) {
  const msgSenderId = getSenderId(message);
  const isMe = isMyMessage(message, currentUserId);
  const prevSenderId = previousMessage ? getSenderId(previousMessage) : null;
  const isSameSender = previousMessage && prevSenderId === msgSenderId;

  // Lấy attachments
  const attachments = (message.content as any)?.attachments || [];

  // Sender Info (Group Chat)
  const senderInfo = conversation.participants?.find(
    (p: any) => (p.userId?._id || p.userId) === msgSenderId
  )?.userId || {};

  const showSenderInfo = conversation.type === "group" && !isMe && !isSameSender;

  // --- HELPER: Chọn Icon theo đuôi file ---
  const getFileIcon = (format?: string) => {
    if (!format) return <File size={16} />;
    const ext = format.toLowerCase();
    switch (ext) {
      case "pdf":
        return <FileText size={16} className="text-red-600" />;
      case "doc": case "docx":
        return <FileText size={16} className="text-blue-600" />;
      case "xls": case "xlsx": case "csv":
        return <FileSpreadsheet size={16} className="text-green-600" />;
      case "zip": case "rar": case "7z":
        return <FileArchive size={16} className="text-orange-600" />;
      case "ai": case "eps": case "cdr":
        return <FileImage size={16} className="text-purple-600" />;
      case "psd":
        return <FileImage size={16} className="text-blue-800" />;
      default:
        return <File size={16} className="text-gray-600" />;
    }
  };

  // --- HELPER: Chọn màu nền Icon ---
  const getFileIconBg = (format?: string) => {
    if (!format) return "bg-gray-100";
    const ext = format.toLowerCase();
    switch (ext) {
      case "pdf": return "bg-red-100";
      case "doc": case "docx": return "bg-blue-100";
      case "xls": case "xlsx": return "bg-green-100";
      case "zip": case "rar": return "bg-orange-100";
      case "ai": case "eps": return "bg-purple-100";
      case "psd": return "bg-blue-100";
      default: return "bg-gray-100";
    }
  };

  return (
    <motion.div
      key={message._id}
      id={`msg-${message._id}`}
      ref={messageRef}
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={cn("flex flex-col w-full mb-0.5", isMe ? "items-end" : "items-start")}
    >
      {/* Sender Info */}
      {showSenderInfo && (
        <div className="flex items-center gap-2 mb-1 ml-1 mt-3">
          <div className="w-5 h-5 rounded-full overflow-hidden bg-gray-200 border border-white shadow-sm">
            {senderInfo.avatarUrl ? (
              <img src={senderInfo.avatarUrl} className="w-full h-full object-cover" alt="Avatar" />
            ) : (
              <span className="text-[9px] font-bold flex h-full w-full items-center justify-center text-gray-500">
                {(senderInfo.displayName?.[0] || senderInfo.username?.[0] || "?").toUpperCase()}
              </span>
            )}
          </div>
          <span className="text-[10px] text-gray-500 font-medium">
            {senderInfo.displayName || senderInfo.username || "Thành viên"}
          </span>
        </div>
      )}

      {/* Bubble */}
      <div
        className={cn(
          "max-w-[75%] shadow-sm relative group flex flex-col overflow-hidden",
          isMe
            ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white"
            : "bg-white border border-gray-100 text-gray-800",
          isMe
            ? cn("rounded-2xl rounded-tr-sm", isSameSender && "rounded-tr-2xl mt-0.5")
            : cn("rounded-2xl rounded-tl-sm", isSameSender && "rounded-tl-2xl mt-0.5"),
          message.status === "sending" && "opacity-70"
        )}
      >
        {/* 1. ATTACHMENTS */}
        {attachments.length > 0 && (
          <div className={cn("grid gap-1 p-1", attachments.length > 1 ? "grid-cols-2" : "grid-cols-1")}>
            {attachments.map((file: any, index: number) => {
              // Kiểm tra xem có phải ảnh không để hiện preview
              const isImage = file.type === "image" || file.url?.match(/\.(jpeg|jpg|gif|png|webp|heic)$/i);

              // --- RENDER ẢNH ---
              if (isImage) {
                return (
                  <img
                    key={index}
                    src={file.url}
                    alt="Attachment"
                    className={cn(
                      "object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity bg-black/10",
                      attachments.length > 1 ? "aspect-square w-full" : "max-h-[300px] w-auto"
                    )}
                    onClick={() => window.open(file.url, "_blank")}
                  />
                );
              }

              // --- RENDER FILE (PDF, AI, ZIP...) VỚI PROXY DOWNLOAD ---
              return (
                <div
                  key={index}
                  title="Nhấn để tải xuống"
                  className="flex items-center gap-2 p-2 bg-white/10 rounded-lg border border-white/10 backdrop-blur-sm cursor-pointer hover:bg-white/20 transition-colors group"
                  // ✅ CODE MỚI: GỌI QUA PROXY
                  onClick={(e) => {
                    e.stopPropagation();

                    // Lấy token từ store
                    const token = useAuthStore.getState().accessToken;

                    // Lấy API base URL từ env
                    const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

                    // Tạo URL gọi về Backend của mình
                    const downloadUrl = `${API_BASE_URL}/api/chat/download?url=${encodeURIComponent(file.url)}&filename=${encodeURIComponent(file.originalName || file.name || "download")}${token ? `&t=${token}` : ""}`;

                    // Mở link này -> Trình duyệt sẽ tự động tải xuống
                    // '_self' giúp tải mượt mà trên cùng tab
                    window.open(downloadUrl, '_self');
                  }}
                >
                  {/* Icon Container */}
                  <div className={cn(
                    "w-8 h-8 rounded flex items-center justify-center shrink-0 pointer-events-none",
                    isMe ? getFileIconBg(file.format) : "bg-gray-100"
                  )}>
                    {getFileIcon(file.format)}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0 overflow-hidden pointer-events-none">
                    <p className="text-xs font-medium truncate text-inherit">
                      {file.originalName || file.name || "File đính kèm"}
                    </p>
                    <p className="text-[10px] opacity-70">
                      {file.size ? (file.size / 1024 / 1024).toFixed(2) + " MB" : "Unknown"}
                    </p>
                  </div>

                  {/* Download Action Icon */}
                  <Download size={14} className="opacity-70 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
              );
            })}
          </div>
        )}

        {/* 2. TEXT CONTENT */}
        {message.content && "text" in message.content && typeof message.content.text === "string" && (
          <div className={cn("px-4 py-2.5 text-sm whitespace-pre-wrap break-words", attachments.length > 0 && "pt-1")}>
            {message.content.text}
          </div>
        )}

        {/* 3. TIMESTAMP */}
        <div className={cn(
            "text-[9px] px-3 pb-1.5 text-right flex items-center justify-end gap-1 select-none",
            isMe ? "text-blue-100/80" : "text-gray-400"
          )}
        >
          {message.createdAt && formatDistanceToNow(new Date(message.createdAt), { addSuffix: true, locale: vi })}
          {message.status === "sending" && <Loader2 size={8} className="animate-spin" />}
        </div>
      </div>
    </motion.div>
  );
}
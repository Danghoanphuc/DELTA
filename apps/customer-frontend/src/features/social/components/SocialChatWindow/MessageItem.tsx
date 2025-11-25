// apps/customer-frontend/src/features/social/components/SocialChatWindow/MessageItem.tsx
// ✅ FIXED: Click body -> Preview Modal; Click Download -> Tải file
// ✅ FIXED: Download Button stopPropagation triệt để

import React, { useState } from "react";
import { 
  FileText, Download, File, 
  FileImage, FileSpreadsheet, FileArchive,
  FileCode, FileVideo, FileMusic, CheckCheck
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { motion } from "framer-motion";
import { cn } from "@/shared/lib/utils";
import type { ChatMessage } from "@/types/chat";
import { getSenderId, isMyMessage } from "./utils";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/useAuthStore";
import api from "@/shared/lib/axios";
import { FilePreviewModal } from "./FilePreviewModal";

// ... (Giữ nguyên phần CONSTANTS FILE_THEMES như cũ để tiết kiệm chỗ) ...
type FileTheme = { icon: React.ElementType; color: string; bgGradient: string; ringColor: string; };
const FILE_THEMES: Record<string, FileTheme> = {
  pdf: { icon: FileText, color: "text-rose-600", bgGradient: "from-rose-100 to-rose-50", ringColor: "group-hover:ring-rose-200" },
  doc: { icon: FileText, color: "text-blue-600", bgGradient: "from-blue-100 to-blue-50", ringColor: "group-hover:ring-blue-200" },
  docx: { icon: FileText, color: "text-blue-600", bgGradient: "from-blue-100 to-blue-50", ringColor: "group-hover:ring-blue-200" },
  xls: { icon: FileSpreadsheet, color: "text-emerald-600", bgGradient: "from-emerald-100 to-emerald-50", ringColor: "group-hover:ring-emerald-200" },
  xlsx: { icon: FileSpreadsheet, color: "text-emerald-600", bgGradient: "from-emerald-100 to-emerald-50", ringColor: "group-hover:ring-emerald-200" },
  ai: { icon: FileImage, color: "text-amber-600", bgGradient: "from-amber-100 to-amber-50", ringColor: "group-hover:ring-amber-200" },
  psd: { icon: FileImage, color: "text-indigo-600", bgGradient: "from-indigo-100 to-indigo-50", ringColor: "group-hover:ring-indigo-200" },
  zip: { icon: FileArchive, color: "text-slate-600", bgGradient: "from-slate-100 to-slate-50", ringColor: "group-hover:ring-slate-200" },
  rar: { icon: FileArchive, color: "text-slate-600", bgGradient: "from-slate-100 to-slate-50", ringColor: "group-hover:ring-slate-200" },
  mp4: { icon: FileVideo, color: "text-purple-600", bgGradient: "from-purple-100 to-purple-50", ringColor: "group-hover:ring-purple-200" },
  default: { icon: File, color: "text-gray-600", bgGradient: "from-gray-100 to-gray-50", ringColor: "group-hover:ring-gray-200" },
};
const getFileTheme = (fileName: string): FileTheme => {
  const ext = fileName.split(".").pop()?.toLowerCase() || "default";
  return FILE_THEMES[ext] || FILE_THEMES["default"];
};

// --- MAIN COMPONENT ---
interface MessageItemProps {
  message: ChatMessage;
  previousMessage: ChatMessage | null;
  conversation: any;
  currentUserId?: string;
  messageRef?: (el: HTMLDivElement | null) => void;
  onImageClick?: (url: string) => void; 
}

export function MessageItem({
  message,
  conversation,
  currentUserId,
  messageRef,
}: MessageItemProps) {
  const isMe = isMyMessage(message, currentUserId);
  const attachments = (message.content as any)?.attachments || [];
  const [previewFile, setPreviewFile] = useState<any>(null);

  // ✅ LOGIC DOWNLOAD: Ngăn chặn tuyệt đối sự kiện click
  const handleDownload = async (e: React.MouseEvent, file: any) => {
    // ⛔ QUAN TRỌNG: Dừng sự kiện tại đây, không cho lan ra ngoài
    e.stopPropagation();
    e.preventDefault();
    // Dừng ngay cả các listener khác nếu có
    if (e.nativeEvent && typeof (e.nativeEvent as any).stopImmediatePropagation === 'function') {
      (e.nativeEvent as any).stopImmediatePropagation();
    }

    const token = useAuthStore.getState().accessToken;
    if (!token) {
      toast.error("Vui lòng đăng nhập để tải file.");
      return;
    }
    
    const toastId = toast.loading(`Đang tải ${file.originalName || "file"}...`);

    try {
        const isR2File = file.storage === 'r2' || file.fileKey;
        let downloadUrl = "";

        if (isR2File) {
            // ✅ Dùng mode='attachment' để ép download khi user click nút download
            const res = await api.get('/chat/r2/download', {
                params: { 
                  key: file.fileKey, 
                  filename: file.originalName || file.name,
                  mode: 'attachment' // ⛔ Ép download thay vì mở trong tab
                }
            });
            downloadUrl = res.data?.data?.downloadUrl;
            if (!downloadUrl) throw new Error("Không nhận được link download");
        } else {
            const response = await api.get('/chat/download', {
                params: { url: file.url, filename: file.originalName || file.name },
                responseType: 'blob',
                timeout: 60000
            });
            const blob = new Blob([response.data], { 
              type: response.headers['content-type'] || 'application/octet-stream' 
            });
            downloadUrl = window.URL.createObjectURL(blob);
        }

        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = file.originalName || file.name || `file-${Date.now()}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        
        if (!isR2File) {
          window.URL.revokeObjectURL(downloadUrl);
        }
        
        toast.success("Tải thành công!", { id: toastId });
    } catch (error: any) {
        console.error("Download Error:", error);
        const errorMsg = error.response?.status === 401 
          ? "Phiên đăng nhập hết hạn." 
          : error.response?.status === 404
          ? "File không tồn tại."
          : "Tải file thất bại.";
        toast.error(errorMsg, { id: toastId });
    }
  };

  // ✅ LOGIC CLICK ITEM: Quyết định Preview hay Download
  const handleItemClick = (e: React.MouseEvent, file: any) => {
    // Ngăn chặn sự kiện click lan ra ngoài (nếu có cha nào bắt sự kiện)
    e.stopPropagation();

    const ext = (file.originalName || file.name || "").split('.').pop()?.toLowerCase();
    const isImage = file.type === "image" || file.url?.match(/\.(jpeg|jpg|gif|png|webp|heic)$/i);
    const isPdf = ext === 'pdf' || file.url?.endsWith('.pdf');
    const isVideo = ['mp4', 'mov', 'avi'].includes(ext);

    if (isImage || isPdf || isVideo) {
      setPreviewFile(file); // ✅ Mở Modal Preview
    } else {
      // Nếu file không preview được (zip, rar, doc...), tự động download
      handleDownload(e, file);
    }
  };

  return (
    <>
      <motion.div
        ref={messageRef}
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2 }}
        className={cn("flex flex-col w-full mb-1", isMe ? "items-end" : "items-start")}
      >
        <div className={cn(
            "max-w-[80%] md:max-w-[70%] relative shadow-sm flex flex-col overflow-hidden",
            isMe ? "rounded-[20px] rounded-tr-sm bg-blue-600 text-white" : "rounded-[20px] rounded-tl-sm bg-white border border-gray-100 text-gray-800"
        )}>
          {attachments.length > 0 && (
            <div className={cn("p-1.5 grid gap-1.5", attachments.length > 1 ? "grid-cols-2" : "grid-cols-1")}>
              {attachments.map((file: any, index: number) => {
                const isImage = file.type === "image" || file.url?.match(/\.(jpeg|jpg|gif|png|webp|heic)$/i);
                
                // --- IMAGE RENDER ---
                if (isImage) {
                  return (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      className="relative overflow-hidden rounded-xl group cursor-pointer"
                      onClick={(e) => handleItemClick(e, file)}
                    >
                       <img
                        src={file.url}
                        alt="Attachment"
                        className={cn("object-cover w-full bg-gray-100 pointer-events-none", attachments.length > 1 ? "aspect-square h-32" : "max-h-[300px] w-auto")}
                        loading="lazy"
                        draggable={false}
                      />
                      {/* Overlay khi hover để hiển thị rõ là có thể click */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
                    </motion.div>
                  );
                }

                // --- FILE RENDER ---
                const fileName = file.originalName || file.name || "File";
                const fileSize = file.size ? (file.size / 1024 / 1024).toFixed(2) + " MB" : "";
                const theme = getFileTheme(fileName);
                const IconComponent = theme.icon;

                return (
                  <div
                    key={index}
                    onClick={(e) => handleItemClick(e, file)} // ✅ Click vào body -> Preview
                    className={cn(
                      "group relative flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all border",
                      isMe ? "bg-white/10 border-white/10 hover:bg-white/20" : `bg-gray-50 border-gray-100 hover:bg-white ${theme.ringColor} hover:ring-1`
                    )}
                  >
                    {/* Icon Container - pointer-events-none để không chặn click */}
                    <div 
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 pointer-events-none bg-gradient-to-br",
                        isMe ? "from-white/20 to-white/5" : theme.bgGradient
                      )}
                    >
                      {React.createElement(IconComponent, { 
                        size: 18, 
                        className: cn(isMe ? "text-white" : theme.color) 
                      })}
                    </div>

                    {/* Text Container - pointer-events-none để không chặn click */}
                    <div className="flex-1 min-w-0 pointer-events-none">
                      <p className={cn("text-xs font-bold truncate", isMe ? "text-white" : "text-gray-800")}>
                        {fileName}
                      </p>
                      {fileSize && (
                        <p className={cn("text-[10px] mt-0.5", isMe ? "text-blue-100" : "text-gray-500")}>
                          {fileSize} • {fileName.split('.').pop()?.toUpperCase()}
                        </p>
                      )}
                    </div>
                    
                    {/* ✅ DOWNLOAD BUTTON - Tách biệt hoàn toàn với stopPropagation */}
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        // Dừng ngay cả các listener khác nếu có
                        if (e.nativeEvent && typeof (e.nativeEvent as any).stopImmediatePropagation === 'function') {
                          (e.nativeEvent as any).stopImmediatePropagation();
                        }
                        handleDownload(e, file);
                      }}
                      onMouseDown={(e) => {
                        // Ngăn chặn cả mousedown event
                        e.stopPropagation();
                      }}
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 hover:scale-110 z-10 cursor-pointer",
                        isMe ? "bg-white text-blue-600 shadow-sm" : "bg-gray-900 text-white shadow-md"
                      )}
                      title="Tải xuống"
                    >
                      <Download size={14} strokeWidth={2.5} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Text Message */}
          {message.content && "text" in message.content && typeof message.content.text === "string" && (
            <div className={cn("px-4 py-2 text-sm whitespace-pre-wrap break-words", attachments.length > 0 && "pt-1")}>
              {message.content.text}
            </div>
          )}

          {/* Time & Status */}
          <div className={cn("flex items-center justify-end gap-1 px-3 pb-1.5 select-none text-[10px]", isMe ? "text-blue-100" : "text-gray-400")}>
            <span>{message.createdAt && formatDistanceToNow(new Date(message.createdAt), { addSuffix: true, locale: vi })}</span>
            {isMe && <CheckCheck size={12} />}
          </div>
        </div>
      </motion.div>

      {/* ✅ Modal Preview render tại Portal (từ file FilePreviewModal) */}
      <FilePreviewModal 
        isOpen={!!previewFile}
        file={previewFile}
        onClose={() => setPreviewFile(null)}
        onDownload={handleDownload}
      />
    </>
  );
}
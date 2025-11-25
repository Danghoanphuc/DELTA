// apps/customer-frontend/src/features/social/components/SocialChatWindow/MessageItem.tsx

import React, { useState } from "react";
import { 
  FileText, Download, File, FileImage, FileSpreadsheet, FileArchive, FileVideo, CheckCheck,
  type LucideIcon
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { motion } from "framer-motion";
import { cn } from "@/shared/lib/utils";
import type { ChatMessage } from "@/types/chat";
import { isMyMessage } from "./utils";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/useAuthStore";
import api from "@/shared/lib/axios";
import { FilePreviewModal } from "./FilePreviewModal";

// --- Helpers ---
type FileTheme = { icon: LucideIcon; color: string; bgGradient: string; ringColor: string; };
const FILE_THEMES: Record<string, FileTheme> = {
  pdf: { icon: FileText, color: "text-rose-600", bgGradient: "from-rose-100 to-rose-50", ringColor: "group-hover:ring-rose-200" },
  doc: { icon: FileText, color: "text-blue-600", bgGradient: "from-blue-100 to-blue-50", ringColor: "group-hover:ring-blue-200" },
  docx: { icon: FileText, color: "text-blue-600", bgGradient: "from-blue-100 to-blue-50", ringColor: "group-hover:ring-blue-200" },
  xls: { icon: FileSpreadsheet, color: "text-emerald-600", bgGradient: "from-emerald-100 to-emerald-50", ringColor: "group-hover:ring-emerald-200" },
  xlsx: { icon: FileSpreadsheet, color: "text-emerald-600", bgGradient: "from-emerald-100 to-emerald-50", ringColor: "group-hover:ring-emerald-200" },
  ai: { icon: FileImage, color: "text-amber-600", bgGradient: "from-amber-100 to-amber-50", ringColor: "group-hover:ring-amber-200" },
  psd: { icon: FileImage, color: "text-indigo-600", bgGradient: "from-indigo-100 to-indigo-50", ringColor: "group-hover:ring-indigo-200" },
  zip: { icon: FileArchive, color: "text-slate-600", bgGradient: "from-slate-100 to-slate-50", ringColor: "group-hover:ring-slate-200" },
  mp4: { icon: FileVideo, color: "text-purple-600", bgGradient: "from-purple-100 to-purple-50", ringColor: "group-hover:ring-purple-200" },
  default: { icon: File, color: "text-gray-600", bgGradient: "from-gray-100 to-gray-50", ringColor: "group-hover:ring-gray-200" },
};

const getFileTheme = (fileName: string): FileTheme => {
  const ext = fileName.split(".").pop()?.toLowerCase() || "default";
  return FILE_THEMES[ext] || FILE_THEMES["default"];
};

// --- LOGIC GROUPING ---
// Kiểm tra xem tin nhắn trước đó có cùng người gửi và thời gian gần nhau không
const isSameGroup = (current: ChatMessage, prev: ChatMessage | null) => {
    if (!prev) return false;
    const currentSender = typeof current.sender === 'string' ? current.sender : current.sender?._id;
    const prevSender = typeof prev.sender === 'string' ? prev.sender : prev.sender?._id;
    
    if (currentSender !== prevSender) return false;

    // Check time diff < 5 minutes
    const currentTime = new Date(current.createdAt || Date.now()).getTime();
    const prevTime = new Date(prev.createdAt || Date.now()).getTime();
    return (currentTime - prevTime) < 5 * 60 * 1000;
};

interface MessageItemProps {
  message: ChatMessage;
  previousMessage: ChatMessage | null; // Để check grouping
  nextMessage: ChatMessage | null;     // Để check bo góc dưới
  conversation: any;
  currentUserId?: string;
  messageRef?: (el: HTMLDivElement | null) => void;
}

export function MessageItem({
  message,
  previousMessage,
  nextMessage,
  conversation,
  currentUserId,
  messageRef,
}: MessageItemProps) {
  const isMe = isMyMessage(message, currentUserId);
  const attachments = (message.content as any)?.attachments || [];
  const [previewFile, setPreviewFile] = useState<any>(null);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  // Logic Grouping
  const isGroupedWithPrev = isSameGroup(message, previousMessage);
  const isGroupedWithNext = nextMessage ? isSameGroup(nextMessage, message) : false;

  // Lấy Avatar đối phương (nếu không phải là mình)
  const getAvatar = () => {
    if (isMe) return null;
    
    // ✅ Xử lý System Messages: Lấy avatar của admin
    if (message.type === 'system' && conversation.type === 'group') {
      // Tìm admin trong participants
      const adminParticipant = conversation.participants?.find((p: any) => 
        p.role === 'admin' || p.role === 'moderator'
      );
      
      if (adminParticipant) {
        const adminUser = adminParticipant.userId;
        const adminObj = typeof adminUser === 'object' ? adminUser : null;
        if (adminObj) {
          return {
            src: adminObj.avatarUrl || null,
            fallback: (adminObj.displayName?.[0] || adminObj.username?.[0] || "?").toUpperCase()
          };
        }
      }
      
      // Fallback: Tìm creatorId nếu có
      if (conversation.creatorId) {
        const creatorParticipant = conversation.participants?.find((p: any) => {
          const userId = typeof p.userId === 'object' ? p.userId?._id : p.userId;
          return String(userId) === String(conversation.creatorId);
        });
        
        if (creatorParticipant) {
          const creatorUser = creatorParticipant.userId;
          const creatorObj = typeof creatorUser === 'object' ? creatorUser : null;
          if (creatorObj) {
            return {
              src: creatorObj.avatarUrl || null,
              fallback: (creatorObj.displayName?.[0] || creatorObj.username?.[0] || "?").toUpperCase()
            };
          }
        }
      }
    }
    
    // Lấy sender ID (có thể là string hoặc object với _id)
    const senderId = typeof message.sender === 'string' 
      ? message.sender 
      : message.sender?._id;
    
    if (!senderId) return null;
    
    // Nếu sender đã được populated (là object), dùng trực tiếp
    if (typeof message.sender === 'object' && message.sender !== null) {
      return {
        src: message.sender.avatarUrl,
        fallback: (message.sender.displayName?.[0] || message.sender.username?.[0] || "?").toUpperCase()
      };
    }
    
    // Nếu sender là string (ID), tìm trong participants
    if (conversation.type === 'group') {
      // Tìm user trong participants của group
      const participant = conversation.participants?.find((p: any) => {
        const userId = typeof p.userId === 'object' ? p.userId?._id : p.userId;
        // So sánh string để đảm bảo đúng
        return String(userId) === String(senderId);
      });
      
      const user = participant?.userId || null;
      if (user) {
        const userObj = typeof user === 'object' ? user : null;
        return {
          src: userObj?.avatarUrl || null,
          fallback: (userObj?.displayName?.[0] || userObj?.username?.[0] || "?").toUpperCase()
        };
      }
    } else {
      // Peer to Peer: Tìm partner
      const partner = conversation.participants?.find((p: any) => {
        const userId = typeof p.userId === 'object' ? p.userId?._id : p.userId;
        return String(userId) !== String(currentUserId);
      });
      
      const user = partner?.userId || null;
      if (user) {
        const userObj = typeof user === 'object' ? user : null;
        return {
          src: userObj?.avatarUrl || null,
          fallback: (userObj?.displayName?.[0] || userObj?.username?.[0] || "?").toUpperCase()
        };
      }
    }
    
    return null;
  };
  const avatarInfo = getAvatar();

  const handleDownload = async (e: React.MouseEvent, file: any) => {
    e.stopPropagation(); e.preventDefault();
    // ... (Giữ nguyên logic download cũ của bạn)
    const token = useAuthStore.getState().accessToken;
    if (!token) return toast.error("Vui lòng đăng nhập");
    
    const toastId = toast.loading(`Đang tải ${file.originalName}...`);
    try {
        const isR2File = file.storage === 'r2' || file.fileKey;
        let downloadUrl = "";
        if (isR2File) {
            const res = await api.get('/chat/r2/download', {
                params: { key: file.fileKey, filename: file.originalName, mode: 'attachment' }
            });
            downloadUrl = res.data?.data?.downloadUrl;
        } else {
            const response = await api.get('/chat/download', {
                params: { url: file.url, filename: file.originalName },
                responseType: 'blob'
            });
            downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
        }
        const a = document.createElement('a'); a.href = downloadUrl;
        a.download = file.originalName; document.body.appendChild(a); a.click(); a.remove();
        toast.success("Tải thành công!", { id: toastId });
    } catch (e) { toast.error("Lỗi tải file", { id: toastId }); }
  };

  const handleItemClick = (e: React.MouseEvent, file: any) => {
    e.stopPropagation();
    const ext = (file.originalName || "").split('.').pop()?.toLowerCase();
    if (file.type === "image" || ext === 'pdf' || ['mp4','mov'].includes(ext)) {
      setPreviewFile(file);
    } else {
      handleDownload(e, file);
    }
  };

  return (
    <>
      <motion.div
        ref={messageRef}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
            "flex w-full px-2", 
            isMe ? "justify-end" : "justify-start gap-2",
            isGroupedWithPrev ? "mt-[2px]" : "mt-3" // ✅ Margin nhỏ nếu cùng nhóm, lớn nếu khác
        )}
      >
        {/* AVATAR (Chỉ hiện cho tin nhắn cuối cùng của nhóm, bên trái) */}
        {!isMe && (
           <div className="w-8 flex-shrink-0 flex flex-col justify-end">
             {!isGroupedWithNext ? (
                 <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden border border-gray-100">
                    {avatarInfo?.src ? (
                        <img src={avatarInfo.src} className="w-full h-full object-cover" alt="" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-500">
                            {avatarInfo?.fallback || "?"}
                        </div>
                    )}
                 </div>
             ) : (
                 <div className="w-8" /> // Spacer
             )}
           </div>
        )}

        {/* MESSAGE BUBBLE */}
        <div className={cn(
            "max-w-[75%] md:max-w-[65%] relative flex flex-col overflow-hidden shadow-sm border",
            isMe 
                ? "bg-blue-600 text-white border-blue-600" 
                : "bg-white text-gray-900 border-gray-200",
            
            // ✅ Border Radius Magic:
            // Luôn bo tròn 18px (xl).
            // Nếu cùng nhóm: Phía người gửi sẽ vuông góc (hoặc bo ít 4px) để tạo cảm giác liền mạch
            "rounded-2xl",
            isMe && isGroupedWithPrev && "rounded-tr-md",
            isMe && isGroupedWithNext && "rounded-br-md",
            !isMe && isGroupedWithPrev && "rounded-tl-md",
            !isMe && isGroupedWithNext && "rounded-bl-md"
        )}>
          
          {/* File Attachments */}
          {attachments.length > 0 && (
            <div className={cn("p-1.5 grid gap-1.5", attachments.length > 1 ? "grid-cols-2" : "grid-cols-1")}>
               {attachments.map((file: any, index: number) => {
                  const imageUrl = file.url;
                  const isImage = file.type === 'image' || file.url?.match(/\.(jpeg|jpg|png|webp)$/i);
                  const isImageLoaded = loadedImages.has(`${message._id}-${index}`);
                  
                  if (isImage && imageUrl) {
                      return (
                        <div key={index} onClick={(e) => handleItemClick(e, file)} className="cursor-pointer relative overflow-hidden rounded-lg group">
                            <img 
                                src={imageUrl} 
                                className={cn("object-cover w-full h-auto max-h-[300px] transition-opacity", !isImageLoaded && "opacity-0")}
                                onLoad={() => setLoadedImages(prev => new Set(prev).add(`${message._id}-${index}`))}
                            />
                            {!isImageLoaded && <div className="absolute inset-0 bg-gray-100 animate-pulse" />}
                        </div>
                      )
                  }
                  // Render File Card (Code cũ của bạn vẫn tốt, giữ nguyên logic render file icon)
                  const theme = getFileTheme(file.originalName || "");
                  const Icon = theme.icon;
                  return (
                      <div key={index} onClick={(e) => handleItemClick(e, file)} 
                           className={cn("flex items-center gap-2 p-2 rounded-lg cursor-pointer border hover:bg-black/5 transition", isMe ? "border-white/20" : "border-gray-100 bg-gray-50")}>
                          <div className={cn("w-8 h-8 rounded flex items-center justify-center bg-gradient-to-r", theme.bgGradient)}><Icon size={16} className={theme.color}/></div>
                          <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold truncate">{file.originalName}</p>
                              <p className="text-[9px] opacity-70">{(file.size/1024/1024).toFixed(1)} MB</p>
                          </div>
                          <button onClick={(e) => handleDownload(e, file)} className="p-1.5 hover:bg-black/10 rounded-full"><Download size={14}/></button>
                      </div>
                  )
               })}
            </div>
          )}

          {/* Text Content */}
          {message.content && "text" in message.content && typeof message.content.text === "string" && message.content.text && (
            <div className={cn("px-3 py-2 text-[15px] whitespace-pre-wrap break-words leading-relaxed")}>
              {message.content.text}
            </div>
          )}

          {/* Time & Status (Chỉ hiện ở tin nhắn CUỐI CÙNG của nhóm) */}
          {!isGroupedWithNext && (
              <div className={cn("flex items-center justify-end gap-1 px-3 pb-1.5 select-none text-[10px]", isMe ? "text-blue-100" : "text-gray-400")}>
                <span>{message.createdAt && formatDistanceToNow(new Date(message.createdAt), { addSuffix: true, locale: vi })}</span>
                {isMe && <CheckCheck size={12} />}
              </div>
          )}
        </div>
      </motion.div>

      <FilePreviewModal 
        isOpen={!!previewFile} file={previewFile}
        onClose={() => setPreviewFile(null)} onDownload={handleDownload}
      />
    </>
  );
}
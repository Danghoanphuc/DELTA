// apps/customer-frontend/src/features/social/components/SocialChatWindow/SocialChatWindow.tsx
// ✅ FINAL: Tích hợp Smart Upload (Dropzone + Staging Area + Direct Cloudinary)

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/useAuthStore";
import { useIsMobile } from "@/shared/hooks/useMediaQuery";
import { useSocialChatStore } from "@/features/social/hooks/useSocialChatStore";
import { postSocialChatMessage } from "@/features/chat/services/chat.api.service";
import { EditGroupModal } from "../EditGroupModal";
import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { useChatMessages } from "./hooks/useChatMessages";
import { useChatAudio } from "./hooks/useChatAudio";
import { useChatScroll } from "./hooks/useChatScroll";
import { useVisualViewport } from "./hooks/useVisualViewport";
import type { ChatMessage } from "@/types/chat";
import { isMyMessage } from "./utils";

// --- NEW IMPORTS ---
import { useDropzone } from "react-dropzone"; // 📦 Cần: pnpm add react-dropzone
import { useSmartFileUpload } from "./hooks/useSmartFileUpload";
import { FileStagingArea } from "./FileStagingArea";
import { UploadCloud } from "lucide-react";

interface SocialChatWindowProps {
  conversation: any;
  onBack: () => void;
}

export function SocialChatWindow({ conversation, onBack }: SocialChatWindowProps) {
  const [sending, setSending] = useState(false);
  const [isEditGroupOpen, setIsEditGroupOpen] = useState(false);

  const currentUser = useAuthStore((s) => s.user);
  const isMobile = useIsMobile();
  const visualHeight = useVisualViewport();

  const { addMessage, updateMessageId, toggleInfoSidebar, isInfoSidebarOpen } =
    useSocialChatStore();

  // --- CUSTOM HOOKS (Existing) ---
  const { messages, prevMessagesLength } = useChatMessages(conversation._id);
  const { playSendSound, playReceiveSound } = useChatAudio();
  const { scrollRef, containerRef, messageRefs, isReady } = useChatScroll(
    conversation._id,
    messages.length
  );

  // --- NEW HOOK: SMART FILE UPLOAD ---
  const { 
    stagedFiles, 
    addFiles, 
    removeFile, 
    updateFileContext, 
    uploadAllFiles, 
    clearStaging, 
    isUploading 
  } = useSmartFileUpload();

  // --- NEW: DROPZONE CONFIG (Kéo thả toàn màn hình) ---
  const onDrop = useCallback((acceptedFiles: File[]) => {
    addFiles(acceptedFiles);
  }, [addFiles]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    noClick: true, // Click vào vùng chat không mở dialog (chỉ click nút kẹp giấy mới mở)
    noKeyboard: true,
    accept: {
        'image/*': [],
        'application/pdf': [],
        'application/postscript': [], // .ai, .eps
        'application/vnd.adobe.photoshop': [], // .psd
        'application/zip': [],
        'application/x-rar-compressed': []
    }
  });

  // Play receive sound logic
  useEffect(() => {
    if (!isReady || messages.length <= prevMessagesLength.current) return;

    const lastMsg = messages[messages.length - 1];
    if (!isMyMessage(lastMsg, currentUser?._id)) {
      playReceiveSound();
    }
    prevMessagesLength.current = messages.length;
  }, [messages, currentUser?._id, isReady, playReceiveSound, prevMessagesLength]);

  // --- HANDLE SEND (Logic nâng cấp) ---
  const handleSend = async (content: string) => {
    // Chỉ chặn gửi nếu: (không có text VÀ không có file) HOẶC (đang gửi/upload)
    if ((!content.trim() && stagedFiles.length === 0) || sending || isUploading) return;

    playSendSound();
    setSending(true);

    // 1. Upload Files trước (Nếu có trong Staging)
    let uploadedAttachments: any[] = [];
    if (stagedFiles.length > 0) {
        // Upload song song tất cả file
        uploadedAttachments = await uploadAllFiles();
        
        // Nếu có file trong hàng chờ mà upload thất bại toàn bộ -> Dừng lại, không gửi tin nhắn
        if (uploadedAttachments.length === 0 && stagedFiles.length > 0) {
            setSending(false);
            return; 
        }
    }

    // 2. Tạo Optimistic UI Message (Hiển thị ngay lập tức)
    const tempId = `temp-${Date.now()}`;
    const hasFiles = uploadedAttachments.length > 0;
    const tempMsg: ChatMessage = hasFiles ? {
      _id: tempId,
      conversationId: conversation._id,
      senderType: "User",
      sender: currentUser?._id,
      type: "file",
      content: { 
          fileUrl: uploadedAttachments[0]?.url || "",
          fileName: uploadedAttachments[0]?.name || "file",
      },
      createdAt: new Date().toISOString(),
      status: "sending",
    } : {
      _id: tempId,
      conversationId: conversation._id,
      senderType: "User",
      sender: currentUser?._id,
      type: "text",
      content: { 
          text: content,
      },
      createdAt: new Date().toISOString(),
      status: "sending",
    };

    addMessage(conversation._id, tempMsg);
    prevMessagesLength.current += 1;

    setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 50);

    try {
      // 3. Gọi API Backend (Gửi nội dung + mảng file đã upload)
      const res = await postSocialChatMessage(
        content || (uploadedAttachments.length > 0 ? "Đã gửi file" : ""),
        conversation._id,
        uploadedAttachments // ✅ Truyền attachments vào API
      );
      
      if (res) {
        const realMsg: ChatMessage = {
          ...res,
          sender: res.sender ?? currentUser?._id,
          status: "sent",
        };
        updateMessageId(conversation._id, tempId, realMsg);
        
        // Xóa staging sau khi gửi thành công
        clearStaging();
      }
    } catch (e) {
      toast.error("Gửi thất bại");
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      {...getRootProps()}
      className="flex flex-col w-full bg-[#FDFDFD] relative overflow-hidden"
      style={{ height: isMobile && visualHeight ? `${visualHeight}px` : "100%" }}
    >
      {/* Hidden Dropzone Input */}
      <input {...getInputProps()} className="hidden" />

      {/* --- DROP OVERLAY (Hiệu ứng khi kéo file vào) --- */}
      {isDragActive && (
        <div className="absolute inset-0 z-50 bg-blue-50/95 border-2 border-dashed border-blue-400 flex flex-col items-center justify-center backdrop-blur-sm transition-all animate-in fade-in duration-200">
           <div className="p-4 bg-white rounded-full shadow-xl mb-4 text-blue-600 animate-bounce">
              <UploadCloud size={48} />
           </div>
           <h3 className="text-xl font-bold text-blue-600">Thả file vào đây</h3>
           <p className="text-sm text-gray-500 mt-2 font-medium">Hỗ trợ PDF, AI, PSD, Ảnh (Max 50MB)</p>
        </div>
      )}

      {/* Header */}
      <ChatHeader
        conversation={conversation}
        currentUserId={currentUser?._id}
        isInfoSidebarOpen={isInfoSidebarOpen}
        onBack={onBack}
        onToggleInfo={toggleInfoSidebar}
        onEditGroup={() => setIsEditGroupOpen(true)}
      />

      {/* Message List */}
      <MessageList
        messages={messages}
        conversation={conversation}
        currentUserId={currentUser?._id}
        isReady={isReady}
        containerRef={containerRef}
        scrollRef={scrollRef}
        messageRefs={messageRefs}
      />

      {/* --- STAGING AREA (Vùng chờ file) --- */}
      {/* Chỉ hiển thị khi có file trong hàng chờ */}
      <FileStagingArea 
         files={stagedFiles} 
         onRemove={removeFile} 
         onContextChange={updateFileContext}
      />

      {/* Input Area */}
      <ChatInput 
        onSend={handleSend} 
        sending={sending || isUploading}
        onFileClick={open} 
      />

      {/* Edit Group Modal */}
      <EditGroupModal
        isOpen={isEditGroupOpen}
        onClose={() => setIsEditGroupOpen(false)}
        conversation={conversation}
      />
    </div>
  );
}
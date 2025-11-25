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

  // --- HANDLE SEND (Logic Gửi Siêu Nhanh - Optimistic UI) ---
  const handleSend = async (content: string) => {
    // 1. Kiểm tra điều kiện gửi
    const filesToProcess = stagedFiles.length > 0;
    
    if ((!content.trim() && !filesToProcess) || sending || isUploading) return;

    playSendSound();
    setSending(true);

    // 2. Tạo ID tạm thời và Message Optimistic
    const tempId = `temp-${Date.now()}`;
    const tempMsg: ChatMessage = {
      _id: tempId,
      conversationId: conversation._id,
      senderType: "User",
      sender: currentUser?._id,
      type: filesToProcess ? "file" : "text", 
      content: filesToProcess ? {
          // Pass Blob URL và File Data vào đây để MessageItem có thể hiển thị
          text: content || (stagedFiles[0]?.context === 'PRINT_FILE' ? "Đã gửi file in" : "Đã gửi file đính kèm"),
          attachments: stagedFiles.map(f => ({
              url: f.previewUrl, // <<-- Dùng Blob URL local
              originalName: f.file.name,
              type: f.fileType,
              format: f.file.name.split('.').pop()?.toLowerCase(),
              size: f.file.size
          })),
      } : { text: content },
      createdAt: new Date().toISOString(),
      status: "sending",
    } as ChatMessage;

    // 3. THÊM MESSAGE VÀO UI NGAY LẬP TỨC (OPTIMISTIC)
    addMessage(conversation._id, tempMsg);
    prevMessagesLength.current += 1;
    setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    
    // 🔥 FIX CẤP THIẾT: Xóa Staging Area ngay để tránh sự cố "Load đúp"
    clearStaging(); 


    // 4. **BẮT ĐẦU PROCESS NẶNG (ASYNC)**
    let uploadedAttachments: any[] = [];
    try {
      // 4a. Upload Files (chạy ngầm)
      if (filesToProcess) {
          // GỌI UPLOAD: Quá trình này đã được tách khỏi UI
          uploadedAttachments = await uploadAllFiles(); 
          
          if (uploadedAttachments.length === 0 && stagedFiles.length > 0) {
              setSending(false);
              toast.error("Tải file thất bại. Vui lòng thử lại.");
              return; 
          }
      }

      // 4b. Chuẩn bị nội dung cuối cùng
      const finalContent = content || (uploadedAttachments.length > 0 ? "Đã gửi file" : "");

      // 4c. Gửi API Backend với URLs thật
      const res = await postSocialChatMessage(
        finalContent,
        conversation._id,
        filesToProcess ? uploadedAttachments : [] // Truyền attachments thật
      );
      
      if (res) {
        const realMsg: ChatMessage = {
          ...res,
          sender: res.sender ?? currentUser?._id,
          status: "sent",
        };
        // 4d. Cập nhật Message ID tạm thành ID thật
        updateMessageId(conversation._id, tempId, realMsg);
      }
    } catch (e) {
      toast.error("Gửi thất bại.");
      // TODO: Thêm logic cập nhật tin nhắn tạm thành status: 'failed'
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
      <FileStagingArea 
         files={stagedFiles} 
         onRemove={removeFile} 
         onContextChange={updateFileContext}
      />

      {/* Input Area */}
      <ChatInput 
        onSend={handleSend} 
        sending={sending}
        onFileClick={open} 
        hasFiles={stagedFiles.length > 0} 
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
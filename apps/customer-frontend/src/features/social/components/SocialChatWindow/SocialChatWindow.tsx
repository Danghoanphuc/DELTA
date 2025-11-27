// apps/customer-frontend/src/features/social/components/SocialChatWindow/SocialChatWindow.tsx

import { useState, useEffect, useCallback } from "react";
import { toast } from "@/shared/utils/toast";
import { useAuthStore } from "@/stores/useAuthStore";
import { useIsMobile } from "@/shared/hooks/useMediaQuery";
import { useSocialChatStore } from "@/features/social/hooks/useSocialChatStore";
import { postSocialChatMessage } from "@/features/chat/services/chat.api.service";
import { EditGroupModal } from "../EditGroupModal";
import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { ChatInput } from "@/features/chat/components/ChatInput";
import { useChatMessages } from "./hooks/useChatMessages";
import { useChatAudio } from "./hooks/useChatAudio";
import { useChatScroll } from "./hooks/useChatScroll";
import { useVisualViewport } from "./hooks/useVisualViewport";
import type { ChatMessage } from "@/types/chat";
import { isMyMessage } from "./utils";

import { useDropzone } from "react-dropzone";
import { useSmartFileUpload } from "./hooks/useSmartFileUpload";
import { FileStagingArea } from "./FileStagingArea";
import { UploadCloud } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion"; 

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

  const { addMessage, updateMessageId, toggleInfoSidebar, isInfoSidebarOpen, unreadCounts, markAsRead } =
    useSocialChatStore();

  const { messages, prevMessagesLength } = useChatMessages(conversation._id);
  const { playSendSound, playReceiveSound } = useChatAudio();
  const { scrollRef, containerRef, messageRefs, isReady } = useChatScroll(
    conversation._id,
    messages.length
  );

  // Hook xử lý file staging (Queue đợi gửi)
  const { 
    stagedFiles, 
    addFiles, 
    removeFile, 
    addLink,
    updateFileContext, 
    uploadAllFiles, 
    clearStaging, 
    isUploading 
  } = useSmartFileUpload();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    addFiles(acceptedFiles);
  }, [addFiles]);

  // ✅ FIX: Lấy hàm 'open' từ useDropzone để truyền xuống ChatInput
  // Hàm này sẽ kích hoạt dialog chọn file của trình duyệt
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    noClick: true, // Tắt click trên vùng container (để tránh conflict click message)
    noKeyboard: true,
    accept: {
        'image/*': [],
        'application/pdf': [],
        'application/postscript': [],
        'application/vnd.adobe.photoshop': [],
        'application/zip': [],
        'application/x-rar-compressed': []
    }
  });

  // Effect: Play sound & Scroll logic
  useEffect(() => {
    if (!isReady || messages.length <= prevMessagesLength.current) return;
    const lastMsg = messages[messages.length - 1];
    if (!isMyMessage(lastMsg, currentUser?._id)) {
      playReceiveSound();
    }
    prevMessagesLength.current = messages.length;
  }, [messages, currentUser?._id, isReady, playReceiveSound, prevMessagesLength]);

  // Handle Send Message
  const handleSend = async (content: string) => {
    const filesToProcess = stagedFiles.length > 0;
    
    // Validate: Không gửi nếu rỗng và không có file
    if ((!content.trim() && !filesToProcess) || sending || isUploading) return;

    playSendSound();
    setSending(true);

    // 1. Tạo tin nhắn tạm (Optimistic UI)
    const tempId = `temp-${Date.now()}`;
    const tempMsg: ChatMessage = {
      _id: tempId,
      conversationId: conversation._id,
      senderType: "User",
      sender: currentUser?._id,
      type: filesToProcess ? "file" : "text", 
      content: filesToProcess ? {
          text: content || (stagedFiles[0]?.context === 'PRINT_FILE' ? "Đã gửi file in" : "Đã gửi file đính kèm"),
          attachments: stagedFiles.filter(f => f.file).map(f => ({
              url: f.previewUrl,
              originalName: f.file!.name,
              type: f.fileType,
              format: f.file!.name.split('.').pop()?.toLowerCase(),
              size: f.file!.size
          })),
      } : { text: content },
      createdAt: new Date().toISOString(),
      status: "sending",
    } as ChatMessage;

    addMessage(conversation._id, tempMsg);
    prevMessagesLength.current += 1;
    
    // Scroll xuống dưới
    setTimeout(() => {
      if (scrollRef.current && containerRef.current) {
        scrollRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 50);

    let uploadedAttachments: any[] = [];
    try {
      // 2. Upload Files (Nếu có)
      if (filesToProcess) {
          uploadedAttachments = await uploadAllFiles(); 
          if (uploadedAttachments.length === 0 && stagedFiles.length > 0) {
              setSending(false);
              toast.error("Tải file thất bại. Vui lòng thử lại.");
              return; 
          }
      }

      const finalContent = content || (uploadedAttachments.length > 0 ? "Đã gửi file" : "");

      // 3. Gọi API gửi tin nhắn thật
      const res = await postSocialChatMessage(
        finalContent,
        conversation._id,
        filesToProcess ? uploadedAttachments : []
      );
      
      if (res) {
        // Update tin nhắn thật từ server
        const realMsg: ChatMessage = {
          ...res,
          sender: res.sender ?? currentUser?._id,
          status: "sent",
        };
        updateMessageId(conversation._id, tempId, realMsg);
        clearStaging(); // Xóa queue file
      }
    } catch (e) {
      toast.error("Gửi thất bại.");
      clearStaging();
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
      <input {...getInputProps()} className="hidden" />

      {/* OVERLAY KHI KÉO FILE VÀO */}
      <AnimatePresence>
        {isDragActive && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-[100] flex items-center justify-center bg-white/60 backdrop-blur-md"
          >
             <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="w-[80%] max-w-md aspect-video border-2 border-dashed border-blue-500 rounded-3xl bg-blue-50/50 flex flex-col items-center justify-center shadow-2xl shadow-blue-500/10"
             >
                 <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    className="p-5 bg-white rounded-full shadow-lg mb-4 text-blue-600"
                 >
                    <UploadCloud size={48} strokeWidth={1.5} />
                 </motion.div>
                 <h3 className="text-2xl font-bold text-blue-700 tracking-tight">Thả file ngay</h3>
                 <p className="text-blue-500/80 font-medium mt-1">AI, PDF, PSD, Ảnh (Max 50MB)</p>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ChatHeader
        conversation={conversation}
        currentUserId={currentUser?._id}
        isInfoSidebarOpen={isInfoSidebarOpen}
        onBack={onBack}
        onToggleInfo={toggleInfoSidebar}
        onEditGroup={() => setIsEditGroupOpen(true)}
      />

      <MessageList
        messages={messages}
        conversation={conversation}
        currentUserId={currentUser?._id}
        isReady={isReady}
        containerRef={containerRef}
        scrollRef={scrollRef}
        messageRefs={messageRefs}
        onScroll={() => {}}
        showScrollButton={false}
        onScrollToBottom={() => {
          if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
          }
        }}
        unreadCount={unreadCounts[conversation._id] || 0}
      />

      {/* Khu vực hiển thị file đang chờ gửi */}
      <FileStagingArea 
         files={stagedFiles} 
         onRemove={removeFile} 
         onContextChange={updateFileContext}
      />

      {/* Input Chat */}
      <ChatInput 
        isLoading={sending}
        onSendText={handleSend}
        
        // --- Props cho tính năng Social (External Queue) ---
        hasFiles={stagedFiles.length > 0} 
        onPasteFile={addFiles}
        onAddLink={addLink}
        onAddDriveFile={addFiles}
        
        // ✅ QUAN TRỌNG: Truyền hàm 'open' vào đây
        // Khi user bấm nút kẹp ghim/ảnh trong ChatInput -> gọi hàm này -> mở File Dialog
        onFileClick={open}
      />

      <EditGroupModal
        isOpen={isEditGroupOpen}
        onClose={() => setIsEditGroupOpen(false)}
        conversation={conversation}
      />
    </div>
  );
}
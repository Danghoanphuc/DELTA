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
import { ChatInput } from "./ChatInput";
import { useChatMessages } from "./hooks/useChatMessages";
import { useChatAudio } from "./hooks/useChatAudio";
import { useChatScroll } from "./hooks/useChatScroll";
import { useVisualViewport } from "./hooks/useVisualViewport";
import { useReplyMessage } from "./hooks/useReplyMessage";
import type { ChatMessage } from "@/types/chat";
import { isMyMessage } from "./utils";
import { useDropzone } from "react-dropzone";
import { useSmartFileUpload } from "./hooks/useSmartFileUpload";
import { UploadCloud } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SocialChatWindowProps {
  conversation: any;
  onBack: () => void;
}

export function SocialChatWindow({
  conversation,
  onBack,
}: SocialChatWindowProps) {
  const [sending, setSending] = useState(false);
  const [isEditGroupOpen, setIsEditGroupOpen] = useState(false);

  const currentUser = useAuthStore((s) => s.user);
  const isMobile = useIsMobile();
  const visualHeight = useVisualViewport();

  const {
    addMessage,
    updateMessageId,
    toggleInfoSidebar,
    isInfoSidebarOpen,
    unreadCounts,
  } = useSocialChatStore();

  const { messages, prevMessagesLength } = useChatMessages(conversation._id);
  const { playSendSound, playReceiveSound } = useChatAudio();
  const { scrollRef, containerRef, messageRefs, isReady } = useChatScroll(
    conversation._id,
    messages.length
  );
  const { replyingTo, startReply, cancelReply, getReplyPreview } =
    useReplyMessage();

  const { scrollToMessageId, setScrollToMessageId } = useSocialChatStore();

  useEffect(() => {
    if (scrollToMessageId && messageRefs.current[scrollToMessageId]) {
      const element = messageRefs.current[scrollToMessageId];
      element?.scrollIntoView({ behavior: "smooth", block: "center" });
      element?.classList.add("ring-2", "ring-primary", "ring-offset-2");
      setTimeout(() => {
        element?.classList.remove("ring-2", "ring-primary", "ring-offset-2");
      }, 2000);
      setTimeout(() => {
        setScrollToMessageId(null);
      }, 2500);
    }
  }, [scrollToMessageId, messageRefs, setScrollToMessageId]);

  const {
    stagedFiles,
    addFiles,
    removeFile,
    addLink,
    updateFileContext,
    uploadAllFiles,
    clearStaging,
    isUploading,
  } = useSmartFileUpload();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      addFiles(acceptedFiles);
    },
    [addFiles]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
    accept: {
      "image/*": [],
      "application/pdf": [],
      "application/postscript": [],
      "application/vnd.adobe.photoshop": [],
      "application/zip": [],
      "application/x-rar-compressed": [],
    },
  });

  useEffect(() => {
    if (!isReady || messages.length <= prevMessagesLength.current) return;
    const lastMsg = messages[messages.length - 1];
    if (!isMyMessage(lastMsg, currentUser?._id)) {
      playReceiveSound();
    }
    prevMessagesLength.current = messages.length;
  }, [
    messages,
    currentUser?._id,
    isReady,
    playReceiveSound,
    prevMessagesLength,
  ]);

  const handleSend = async (content: string) => {
    const filesToProcess = stagedFiles.length > 0;
    if ((!content.trim() && !filesToProcess) || sending || isUploading) return;

    playSendSound();
    setSending(true);

    const tempId = `temp-${Date.now()}`;
    const tempMsg: ChatMessage = {
      _id: tempId,
      conversationId: conversation._id,
      senderType: "User",
      sender: currentUser?._id,
      type: filesToProcess ? "file" : "text",
      content: filesToProcess
        ? {
            text:
              content ||
              (stagedFiles[0]?.context === "PRINT_FILE"
                ? "Đã gửi file in"
                : "Đã gửi file đính kèm"),
            attachments: stagedFiles
              .filter((f) => f.file)
              .map((f) => ({
                url: f.previewUrl,
                originalName: f.file!.name,
                type: f.fileType,
                format: f.file!.name.split(".").pop()?.toLowerCase(),
                size: f.file!.size,
              })),
          }
        : { text: content },
      createdAt: new Date().toISOString(),
      status: "sending",
      replyToId: replyingTo?._id,
      replyTo: replyingTo,
    } as ChatMessage;

    addMessage(conversation._id, tempMsg);
    prevMessagesLength.current += 1;
    clearStaging();

    // Scroll to new message
    setTimeout(() => {
      if (scrollRef.current && containerRef.current) {
        scrollRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 50);

    let uploadedAttachments: any[] = [];
    try {
      if (filesToProcess) {
        uploadedAttachments = await uploadAllFiles();
        if (uploadedAttachments.length === 0 && stagedFiles.length > 0) {
          setSending(false);
          toast.error("Tải file thất bại. Vui lòng thử lại.");
          return;
        }
      }

      const finalContent =
        content || (uploadedAttachments.length > 0 ? "Đã gửi file" : "");

      const res = await postSocialChatMessage(
        finalContent,
        conversation._id,
        filesToProcess ? uploadedAttachments : [],
        replyingTo?._id
      );

      if (res) {
        const realMsg: ChatMessage = {
          ...res,
          sender: res.sender ?? currentUser?._id,
          status: "sent",
        };
        updateMessageId(conversation._id, tempId, realMsg);
        cancelReply(); // Clear reply after successful send
      }
    } catch (e) {
      toast.error("Gửi thất bại.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      {...getRootProps()}
      className="flex flex-col w-full bg-[#FFFFFF] relative overflow-hidden"
      style={{
        height: isMobile && visualHeight ? `${visualHeight}px` : "100%",
      }}
    >
      <input {...getInputProps()} className="hidden" />

      {/* DRAG OVERLAY */}
      <AnimatePresence>
        {isDragActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-blue-500 rounded-3xl bg-blue-50"
            >
              <UploadCloud size={64} className="text-blue-500 mb-4" />
              <h3 className="text-2xl font-bold text-blue-700">
                Thả file vào đây
              </h3>
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
        onReply={startReply}
      />

      {/* ✅ FLOATING FOOTER */}
      <div className="absolute bottom-0 left-0 w-full z-30 px-4 pb-4 pt-12 pointer-events-none flex flex-col items-center justify-end bg-gradient-to-t from-white via-white/95 to-transparent">
        <div className="w-full max-w-[800px] pointer-events-auto">
          <ChatInput
            isLoading={sending}
            onSendText={handleSend}
            stagedFiles={stagedFiles}
            onRemoveFile={removeFile}
            onContextChange={updateFileContext}
            onPasteFile={addFiles}
            onAddLink={addLink}
            onAddDriveFile={addFiles}
            onFileClick={open}
            replyingTo={replyingTo}
            replyPreviewText={
              replyingTo ? getReplyPreview(replyingTo) : undefined
            }
            onCancelReply={cancelReply}
          />
        </div>
      </div>

      <EditGroupModal
        isOpen={isEditGroupOpen}
        onClose={() => setIsEditGroupOpen(false)}
        conversation={conversation}
      />
    </div>
  );
}

// apps/customer-frontend/src/features/social/components/SocialChatWindow/MessageItem.tsx

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/shared/lib/utils";
import type { ChatMessage } from "@/types/chat";
import { isMyMessage } from "./utils";
import { FilePreviewModal } from "./FilePreviewModal";
import { ImagePreviewModal } from "./ImagePreviewModal";
import { MessageActions } from "./MessageActions";
import { MessageBubble } from "./MessageBubble";
import { ApprovalCard } from "./ApprovalCard";
import { useMessageActions } from "./hooks/useMessageActions";

// --- Helpers ---
const isSameGroup = (current: ChatMessage, prev: ChatMessage | null) => {
  if (!prev) return false;
  const currentSender =
    typeof current.sender === "string" ? current.sender : current.sender?._id;
  const prevSender =
    typeof prev.sender === "string" ? prev.sender : prev.sender?._id;
  if (currentSender !== prevSender) return false;
  return (
    new Date(current.createdAt || Date.now()).getTime() -
      new Date(prev.createdAt || Date.now()).getTime() <
    2 * 60 * 1000
  );
};

interface MessageItemProps {
  message: ChatMessage;
  previousMessage: ChatMessage | null;
  nextMessage: ChatMessage | null;
  conversation: any;
  currentUserId?: string;
  messageRef?: (el: HTMLDivElement | null) => void;
  onReply?: (message: ChatMessage) => void;
}

export function MessageItem({
  message,
  previousMessage,
  nextMessage,
  conversation,
  currentUserId,
  messageRef,
  onReply,
}: MessageItemProps) {
  const isMe = isMyMessage(message, currentUserId);
  const [previewFile, setPreviewFile] = useState<any>(null);
  const [previewImage, setPreviewImage] = useState<{
    url: string;
    name: string;
  } | null>(null);

  // Use message actions hook
  const {
    isCopied,
    handleCopy,
    handleReply,
    handleDownloadAttachment,
    handleDeleteMessage,
  } = useMessageActions({
    conversationId: conversation._id,
    currentUserId,
    onReply,
  });

  // Grouping
  const isGroupedWithPrev = isSameGroup(message, previousMessage);
  const isGroupedWithNext = nextMessage
    ? isSameGroup(nextMessage, message)
    : false;

  const isGroupChat = conversation.type === "group";
  const showAvatar = isGroupChat && !isMe && !isGroupedWithNext;
  const showName = isGroupChat && !isMe && !isGroupedWithPrev;

  // Content checks
  const attachments = (message.content as any)?.attachments || [];
  const hasText = !!(message.content as any)?.text;
  const hasAttachments = attachments.length > 0;

  // Sender Info
  const getSenderInfo = () => {
    if (typeof message.sender === "object" && message.sender) {
      return {
        name:
          message.sender.displayName || message.sender.username || "Người dùng",
        avatar: message.sender.avatarUrl,
        initial: (message.sender.displayName ||
          message.sender.username ||
          "?")[0].toUpperCase(),
      };
    }
    const senderId = message.sender;
    const participant = conversation.participants?.find(
      (p: any) => (p.userId._id || p.userId) === senderId
    );
    const user = participant?.userId || {};
    return {
      name: user.displayName || user.username || "Người dùng",
      avatar: user.avatarUrl,
      initial: (user.displayName || user.username || "?")[0].toUpperCase(),
    };
  };
  const senderInfo = getSenderInfo();

  const isApprovalMsg =
    (message as any).type === "design_approval" ||
    (message.content as any)?.type === "approval";

  return (
    <>
      <motion.div
        ref={messageRef}
        data-message-id={message._id}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "group relative flex w-full gap-2 px-2 md:px-4",
          isMe ? "justify-end" : "justify-start",
          isGroupedWithPrev ? "mt-[2px]" : "mt-3"
        )}
      >
        {isGroupChat && !isMe && (
          <div className="flex w-8 flex-col justify-end shrink-0">
            {showAvatar ? (
              <div className="h-8 w-8 overflow-hidden rounded-full border border-stone-100 bg-stone-200 shadow-sm">
                {senderInfo.avatar ? (
                  <img
                    src={senderInfo.avatar}
                    className="h-full w-full object-cover"
                    alt={senderInfo.name}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-stone-500">
                    {senderInfo.initial}
                  </div>
                )}
              </div>
            ) : (
              <div className="w-8" />
            )}
          </div>
        )}

        <div
          className={cn(
            "flex max-w-[85%] md:max-w-[70%] flex-col relative",
            isMe ? "items-end" : "items-start"
          )}
        >
          {showName && (
            <span className="mb-1 ml-1 text-[10px] font-bold uppercase tracking-wider text-stone-400">
              {senderInfo.name}
            </span>
          )}

          {isApprovalMsg ? (
            <ApprovalCard message={message} onPreview={setPreviewFile} />
          ) : (
            <MessageBubble
              message={message}
              isMe={isMe}
              isGroupedWithPrev={isGroupedWithPrev}
              isGroupedWithNext={isGroupedWithNext}
              onImageClick={(url, name) => setPreviewImage({ url, name })}
              onFileClick={setPreviewFile}
              onReplyClick={(messageId) => {
                // Scroll to replied message with smooth animation
                const element = document.querySelector(
                  `[data-message-id="${messageId}"]`
                ) as HTMLElement;

                if (element) {
                  // Scroll into view
                  element.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  });

                  // Add highlight animation
                  element.style.transition = "all 0.3s ease";
                  element.classList.add(
                    "ring-2",
                    "ring-blue-500",
                    "ring-offset-2",
                    "bg-blue-50/20"
                  );

                  // Remove highlight after animation
                  setTimeout(() => {
                    element.classList.remove(
                      "ring-2",
                      "ring-blue-500",
                      "ring-offset-2",
                      "bg-blue-50/20"
                    );
                  }, 2000);
                }
              }}
            />
          )}

          {/* Message Actions */}
          <MessageActions
            message={message}
            isMe={isMe}
            isCopied={isCopied}
            hasText={hasText}
            hasAttachments={hasAttachments}
            onCopy={() => handleCopy(message)}
            onReply={() => handleReply(message)}
            onDownload={() => handleDownloadAttachment(message)}
            onDelete={(deleteForEveryone) =>
              handleDeleteMessage(message, deleteForEveryone)
            }
          />
        </div>
      </motion.div>

      {/* Image Preview Modal */}
      <ImagePreviewModal
        isOpen={!!previewImage}
        imageUrl={previewImage?.url || ""}
        imageName={previewImage?.name}
        onClose={() => setPreviewImage(null)}
      />

      {/* File Preview Modal */}
      <FilePreviewModal
        isOpen={!!previewFile}
        file={previewFile}
        onClose={() => setPreviewFile(null)}
        onDownload={() => {}}
      />
    </>
  );
}

// apps/customer-frontend/src/features/social/components/SocialChatWindow/MessageList.tsx
// ✅ Component cho message list container

import { AnimatePresence } from "framer-motion";
import { cn } from "@/shared/lib/utils";
import type { ChatMessage } from "@/types/chat";
import { MessageItem } from "./MessageItem";

interface MessageListProps {
  messages: ChatMessage[];
  conversation: any;
  currentUserId?: string;
  isReady: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  messageRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
}

export function MessageList({
  messages,
  conversation,
  currentUserId,
  isReady,
  containerRef,
  scrollRef,
  messageRefs,
}: MessageListProps) {
  return (
    <div
      ref={containerRef}
      className={cn(
        "flex-1 overflow-y-auto p-4 space-y-1 transition-opacity duration-200 custom-scrollbar",
        isReady ? "opacity-100" : "opacity-0",
        "pb-24"
      )}
      style={{ scrollBehavior: "smooth" }}
    >
      <AnimatePresence initial={false}>
        {messages.map((msg, index) => {
          const previousMessage = index > 0 ? messages[index - 1] : null;
          return (
            <MessageItem
              key={msg._id}
              message={msg}
              previousMessage={previousMessage}
              conversation={conversation}
              currentUserId={currentUserId}
              messageRef={(el) => {
                if (msg._id) {
                  messageRefs.current[msg._id] = el;
                }
              }}
            />
          );
        })}
      </AnimatePresence>
      <div ref={scrollRef} className="h-px w-full" />
    </div>
  );
}


import { useCallback, useRef } from "react";
import { useChatSocket } from "./useChatSocket";
import { useMessageState } from "./useMessageState";
import { useConversationState } from "./useConversationState";
import { ChatMessage } from "@/types/chat";

export const useChatSync = () => {
  const messageState = useMessageState();
  const conversationState = useConversationState();

  const chunkBufferRef = useRef<Record<string, string>>({});
  const flushTimerRef = useRef<Record<string, NodeJS.Timeout>>({});

  const handleStreamStart = useCallback(
    (data: { messageId: string; conversationId: string }) => {
      console.log("[Sync] Stream start:", data);

      const allMessages = messageState.messages;
      const placeholder = [...allMessages]
        .reverse()
        .find((m) => m.senderType === "AI" && (m.metadata as any)?.tempId);

      if (placeholder) {
        console.log(
          `[Sync] Replacing temp ${placeholder._id} with ${data.messageId}`
        );
        messageState.replaceTempId(
          placeholder._id,
          data.messageId,
          data.conversationId
        );
      } else {
        console.log("[Sync] No placeholder, creating new message");
        messageState.addMessage({
          _id: data.messageId,
          conversationId: data.conversationId,
          senderType: "AI",
          type: "text",
          content: { text: "" },
          createdAt: new Date().toISOString(),
          metadata: { status: "streaming" },
        });
      }
    },
    [messageState]
  );

  const handleStreamChunk = useCallback(
    (data: { messageId: string; text: string }) => {
      const { messageId, text } = data;
      console.log(
        "[Sync] 📝 Chunk:",
        text.substring(0, 20),
        "length:",
        text.length
      );
      messageState.appendStreamContent(messageId, text);
    },
    [messageState]
  );

  const handleMessageNew = useCallback(
    (message: ChatMessage) => {
      console.log("[Sync] New message:", {
        id: message._id,
        type: message.senderType,
        convId: message.conversationId,
        currentConvId: conversationState.currentConversationId,
        isThinking: (message.content as any)?.isThinking,
        status: (message.metadata as any)?.status,
        isFinished: (message as any).isFinished,
      });

      if (message.senderType === "AI") {
        const existingMsg = messageState.messages.find(
          (m) => m._id === message._id
        );

        // Cleanup
        delete chunkBufferRef.current[message._id];
        if (flushTimerRef.current[message._id]) {
          clearTimeout(flushTimerRef.current[message._id]);
          delete flushTimerRef.current[message._id];
        }

        // ✅ Xóa placeholder cũ nếu message mới là thinking hoặc final
        if (!existingMsg) {
          const placeholder = messageState.messages.find(
            (m) =>
              m.senderType === "AI" &&
              ((m.metadata as any)?.tempId ||
                (m.metadata as any)?.status === "pending")
          );
          if (placeholder) {
            console.log("[Sync] Removing old placeholder:", placeholder._id);
            messageState.removeMessage(placeholder._id);
          }
        }

        if (existingMsg) {
          console.log("[Sync] Finalizing existing message:", message._id);

          if ((existingMsg.metadata as any)?.status === "sent") {
            console.log("[Sync] Message already finalized, skipping");
            return;
          }

          messageState.updateMessage(message._id, {
            content: message.content as any,
            type: message.type,
            conversationId: message.conversationId,
            metadata: {
              ...(message.metadata || {}),
              status: "sent",
              tempId: undefined,
            } as any,
          });
        } else {
          console.log("[Sync] Adding new message:", message._id);
          messageState.addMessage(message);
        }

        if (
          conversationState.currentConversationId?.startsWith("temp") &&
          message.conversationId
        ) {
          console.log(
            "[Sync] Switching from temp to real conversation:",
            message.conversationId
          );
          conversationState.selectConversation(message.conversationId);
        }

        // ✅ Chỉ tắt generating khi message hoàn chỉnh (không phải thinking)
        const isThinking = (message.content as any)?.isThinking === true;
        if (!isThinking) {
          messageState.setGenerating(false);
        }
      }
    },
    [messageState, conversationState]
  );

  const handleConversationCreated = useCallback(
    (data: any) => {
      console.log("[Sync] Conversation created/updated:", data);

      if (data._id || data.conversationId) {
        const convId = data._id || data.conversationId;
        const convData = {
          _id: convId,
          title: data.title || "Cuộc trò chuyện mới",
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
          type: data.type || "customer-bot",
          ...data,
        };

        conversationState.addConversation(convData);

        if (conversationState.currentConversationId?.startsWith("temp")) {
          conversationState.selectConversation(convId);
        }
      }
    },
    [conversationState]
  );

  useChatSocket({
    conversationId: conversationState.currentConversationId,
    onStreamStart: handleStreamStart,
    onStreamChunk: handleStreamChunk,
    onMessageNew: handleMessageNew,
    onConversationCreated: handleConversationCreated,
  });

  return {};
};

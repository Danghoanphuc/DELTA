// apps/customer-frontend/src/features/chat/hooks/useChat.enterprise.ts
// ✅ ENTERPRISE: Enhanced useChat with Reliability, Presence & Sync
//
// This file extends the base useChat with:
// 1. Offline Queue & Auto-Retry
// 2. Optimistic UI with status tracking
// 3. Typing Indicator
// 4. Cross-Tab Synchronization
// 5. Read Receipts & Socket ACK
//
// Usage: Import this instead of the base useChat when Enterprise features are needed

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { AiApiResponse, ChatMessage, TypingState, QueuedMessage } from "@/types/chat";
import { useAuthStore } from "@/stores/useAuthStore";
import { useSocket } from "@/contexts/SocketProvider";
import * as chatApi from "../services/chat.api.service";

// Import utilities
import { messageQueue } from "../utils/messageQueue";
import { crossTabSync } from "../utils/crossTabSync";

// Import base hooks
import { useMessageState, WELCOME_ID } from "./useMessageState";
import { useConversationState } from "./useConversationState";

export { WELCOME_ID };

// ✅ ENTERPRISE: Debounce utility for typing indicator
function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current !== undefined) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
}

export const useChat = () => {
  // ===================================
  // BASE STATE
  // ===================================
  const messageState = useMessageState();
  const conversationState = useConversationState();
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isChatExpanded, setIsChatExpanded] = useState(true);
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const socket = useSocket();

  // ===================================
  // ENTERPRISE STATE
  // ===================================
  const [typingState, setTypingState] = useState<TypingState | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // ===================================
  // HELPER: Send Queued Message
  // ===================================
  const sendQueuedMessage = useCallback(async (queuedMessage: QueuedMessage): Promise<boolean> => {
    try {
      // Update UI status to "sending"
      messageState.updateMessageStatus(queuedMessage.tempId, "sending");

      const response = await chatApi.postChatMessage(
        queuedMessage.message,
        queuedMessage.conversationId,
        queuedMessage.latitude,
        queuedMessage.longitude,
        queuedMessage.type,
        queuedMessage.metadata
      );

      // Success: Update status to "sent" with real ID
      messageState.updateMessageStatus(queuedMessage.tempId, "sent", {
        realId: response.newConversation?._id || queuedMessage.conversationId || uuidv4(),
      });

      // Broadcast to other tabs
      crossTabSync.postMessage("UPDATE_MESSAGE", {
        messageId: queuedMessage.tempId,
        updates: { status: "sent", _id: response.newConversation?._id },
      });

      return true;
    } catch (error) {
      console.error("[useChat] Failed to send queued message:", error);
      
      // Update UI with error status
      messageState.updateMessageStatus(queuedMessage.tempId, "error", {
        error: error instanceof Error ? error.message : "Không thể gửi tin nhắn",
        retryCount: queuedMessage.retryCount + 1,
      });

      return false;
    }
  }, [messageState]);

  // ===================================
  // EFFECT 1: Online/Offline Detection & Queue Processing
  // ===================================
  useEffect(() => {
    const handleOnline = () => {
      console.log("[useChat] 🟢 Back online, processing queue");
      setIsOnline(true);
      toast.success("Đã kết nối lại. Đang gửi tin nhắn chờ...");
      
      // Process pending messages
      messageQueue.processQueue(sendQueuedMessage);
    };

    const handleOffline = () => {
      console.log("[useChat] 🔴 Offline detected");
      setIsOnline(false);
      toast.warning("Mất kết nối. Tin nhắn sẽ được gửi khi có mạng.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [sendQueuedMessage]);

  // ===================================
  // EFFECT 2: Socket Event Listeners
  // ===================================
  useEffect(() => {
    if (!socket?.socket) return;

    // Listen for typing events
    const handlePartnerTyping = (data: { conversationId: string; userId: string; userName: string }) => {
      if (data.conversationId === conversationState.currentConversationId) {
        setTypingState({
          conversationId: data.conversationId,
          userId: data.userId,
          userName: data.userName,
          isTyping: true,
          timestamp: Date.now(),
        });

        // Auto-clear after 3 seconds
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
          setTypingState(null);
        }, 3000);
      }
    };

    const handleTypingStop = (data: { conversationId: string }) => {
      if (data.conversationId === conversationState.currentConversationId) {
        setTypingState(null);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      }
    };

    // Listen for message delivery acknowledgement
    const handleMessageDelivered = (data: { messageId: string; tempId: string }) => {
      console.log("[useChat] Message delivered:", data);
      messageState.updateMessageStatus(data.tempId || data.messageId, "delivered", {
        realId: data.messageId,
      });
    };

    // Listen for read receipts
    const handleMessageRead = (data: { messageId: string; userId: string }) => {
      console.log("[useChat] Message read:", data);
      messageState.markMessageAsRead(data.messageId, data.userId);
    };

    // ✅ REAL-TIME: Listen for new messages from socket (URL preview worker, AI responses, etc.)
    const handleNewMessage = (socketMessage: any) => {
      try {
        console.log("[useChat Enterprise] 🔔 Received socket message:", {
          messageId: socketMessage._id,
          conversationId: socketMessage.conversationId,
          senderType: socketMessage.senderType,
          type: socketMessage.type,
        });

        // ✅ Chỉ nhận messages cho conversation hiện tại
        if (
          socketMessage.conversationId &&
          conversationState.currentConversationId &&
          socketMessage.conversationId !== conversationState.currentConversationId
        ) {
          console.log(
            `[useChat Enterprise] ⏭️ Skipping message - different conversation. Current: ${conversationState.currentConversationId}, Message: ${socketMessage.conversationId}`
          );
          return;
        }

        // ✅ Kiểm tra message đã tồn tại chưa (tránh duplicate)
        const exists = messageState.messages.some((msg) => msg._id === socketMessage._id);
        if (exists) {
          console.log(`[useChat Enterprise] ⏭️ Message ${socketMessage._id} already exists, skipping...`);
          return;
        }

        // ✅ Convert socket message format sang ChatMessage format
        let chatMessage: ChatMessage;

        if (socketMessage.type === "text") {
          // ✅ Text message (có thể có fileUrl từ URL preview)
          chatMessage = {
            _id: socketMessage._id,
            senderType: socketMessage.senderType || "AI",
            sender: socketMessage.sender || null,
            type: "text",
            conversationId: socketMessage.conversationId?.toString() || conversationState.currentConversationId || "",
            content: socketMessage.content || { text: "" },
            metadata: socketMessage.metadata || null,
            createdAt: socketMessage.createdAt || new Date().toISOString(),
            updatedAt: socketMessage.updatedAt || new Date().toISOString(),
          } as ChatMessage;
        } else {
          // ✅ Fallback cho các loại message khác
          console.warn(`[useChat Enterprise] ⚠️ Unknown message type: ${socketMessage.type}, using text type`);
          chatMessage = {
            _id: socketMessage._id,
            senderType: socketMessage.senderType || "AI",
            sender: socketMessage.sender || null,
            type: "text",
            conversationId: socketMessage.conversationId?.toString() || conversationState.currentConversationId || "",
            content: socketMessage.content || { text: "" },
            metadata: socketMessage.metadata || null,
            createdAt: socketMessage.createdAt || new Date().toISOString(),
            updatedAt: socketMessage.updatedAt || new Date().toISOString(),
          } as ChatMessage;
        }

        // ✅ Thêm message vào state
        console.log(`[useChat Enterprise] ✅ Adding message ${chatMessage._id} to conversation ${chatMessage.conversationId}`);
        messageState.setMessages((prev: ChatMessage[]) => {
          // Kiểm tra lại tránh duplicate trong cùng một render cycle
          const alreadyExists = prev.some((msg) => msg._id === chatMessage._id);
          if (alreadyExists) {
            console.log(`[useChat Enterprise] ⏭️ Message ${chatMessage._id} already in state, skipping...`);
            return prev;
          }
          return [...prev, chatMessage];
        });

        // ✅ Tắt loading khi nhận được message (có thể đang chờ AI response)
        setIsLoadingAI(false);

        // ✅ ENTERPRISE: Sync across tabs
        crossTabSync.postMessage("NEW_MESSAGE", chatMessage);

        console.log(`[useChat Enterprise] ✅ Message ${chatMessage._id} added successfully`);
      } catch (error: any) {
        console.error("[useChat Enterprise] ❌ Error processing socket message:", error);
        console.error("[useChat Enterprise] Error details:", {
          message: error?.message,
          stack: error?.stack,
          socketMessage,
        });
      }
    };

    socket.socket.on("partner_typing", handlePartnerTyping);
    socket.socket.on("typing_stop", handleTypingStop);
    socket.socket.on("message_delivered", handleMessageDelivered);
    socket.socket.on("message_read", handleMessageRead);
    // ✅ REAL-TIME: Listen cho cả 2 event names (backend emit cả 2 để đảm bảo)
    socket.socket.on("chat:message:new", handleNewMessage);
    socket.socket.on("new_message", handleNewMessage);

    return () => {
      if (socket?.socket) {
        socket.socket.off("partner_typing", handlePartnerTyping);
        socket.socket.off("typing_stop", handleTypingStop);
        socket.socket.off("message_delivered", handleMessageDelivered);
        socket.socket.off("message_read", handleMessageRead);
        socket.socket.off("chat:message:new", handleNewMessage);
        socket.socket.off("new_message", handleNewMessage);
      }
    };
  }, [socket, conversationState.currentConversationId, messageState, setIsLoadingAI]);

  // ===================================
  // EFFECT 3: Cross-Tab Synchronization
  // ===================================
  useEffect(() => {
    const unsubscribeNewMessage = crossTabSync.subscribe("NEW_MESSAGE", (payload: ChatMessage) => {
      console.log("[useChat] Cross-tab sync: NEW_MESSAGE", payload);
      // Check if message already exists
      const exists = messageState.messages.some((msg) => msg._id === payload._id);
      if (!exists) {
        messageState.setMessages((prev: ChatMessage[]) => [...prev, payload]);
      }
    });

    const unsubscribeUpdateMessage = crossTabSync.subscribe("UPDATE_MESSAGE", (payload: { messageId: string; updates: Partial<ChatMessage> }) => {
      console.log("[useChat] Cross-tab sync: UPDATE_MESSAGE", payload);
      messageState.setMessages((prev: ChatMessage[]) =>
        prev.map((msg) => (msg._id === payload.messageId ? { ...msg, ...payload.updates } as ChatMessage : msg))
      );
    });

    return () => {
      unsubscribeNewMessage();
      unsubscribeUpdateMessage();
    };
  }, [messageState]);

  // ===================================
  // ENTERPRISE: Emit Typing Events
  // ===================================
  const emitTypingStart = useCallback(() => {
    if (socket?.socket && conversationState.currentConversationId) {
      socket.socket.emit("typing_start", {
        conversationId: conversationState.currentConversationId,
        userId: user?._id,
        userName: user?.displayName || user?.username,
      });
      console.log("[useChat] Emitted typing_start");
    }
  }, [socket, conversationState.currentConversationId, user]);

  const emitTypingStop = useCallback(() => {
    if (socket?.socket && conversationState.currentConversationId) {
      socket.socket.emit("typing_stop", {
        conversationId: conversationState.currentConversationId,
        userId: user?._id,
      });
      console.log("[useChat] Emitted typing_stop");
    }
  }, [socket, conversationState.currentConversationId, user]);

  // Debounced typing stop
  const debouncedTypingStop = useDebounce(emitTypingStop, 2000);

  // ===================================
  // ENTERPRISE: Handle Typing (for ChatInput)
  // ===================================
  const handleTyping = useCallback(() => {
    emitTypingStart();
    debouncedTypingStop();
  }, [emitTypingStart, debouncedTypingStop]);

  // ===================================
  // ACTION: Send Text Message (with Optimistic UI & Queue)
  // ===================================
  const onSendText = useCallback(
    async (text: string, latitude?: number, longitude?: number, type?: ChatMessage["type"], metadata?: any) => {
      const tempId = uuidv4();
      
      // 1. Optimistic UI: Add message immediately with "sending" status
      const userMessage = messageState.addUserMessage(text, conversationState.currentConversationId, {
        tempId,
        status: "pending",
        type,
        metadata,
      });

      // 2. Clear typing indicator
      emitTypingStop();

      // 3. Broadcast to other tabs
      crossTabSync.postMessage("NEW_MESSAGE", userMessage);

      // 4. Check if online
      if (!isOnline) {
        // Add to queue immediately
        messageQueue.add({
          tempId,
          message: text,
          conversationId: conversationState.currentConversationId,
          latitude,
          longitude,
          type,
          metadata,
        });

        messageState.updateMessageStatus(tempId, "pending", {
          error: "Chờ kết nối mạng...",
        });

        toast.info("Tin nhắn sẽ được gửi khi có mạng");
        return;
      }

      // 5. Try to send immediately
      setIsLoadingAI(true);

      try {
        messageState.updateMessageStatus(tempId, "sending");

        const aiResponse = await chatApi.postChatMessage(
          text,
          conversationState.currentConversationId,
          latitude,
          longitude,
          type,
          metadata
        );

        // Success: Update status
        const realId = aiResponse.newConversation?._id || conversationState.currentConversationId || uuidv4();
        messageState.updateMessageStatus(tempId, "sent", { realId });

        // Add AI response
        const aiMessage = messageState.addAiMessage(aiResponse, conversationState.currentConversationId);

        // Broadcast AI message to other tabs
        crossTabSync.postMessage("NEW_MESSAGE", aiMessage);

        // Handle new conversation
        if (aiResponse.newConversation) {
          conversationState.addConversation(aiResponse.newConversation);
        }
      } catch (error) {
        console.error("[useChat] Send failed:", error);
        
        // Add to queue for retry
        messageQueue.add({
          tempId,
          message: text,
          conversationId: conversationState.currentConversationId,
          latitude,
          longitude,
          type,
          metadata,
        });

        messageState.updateMessageStatus(tempId, "error", {
          error: "Gửi thất bại. Đang thử lại...",
          retryCount: 0,
        });

        // Auto-retry
        messageQueue.processQueue(sendQueuedMessage);
      } finally {
        setIsLoadingAI(false);
      }
    },
    [
      messageState,
      conversationState,
      isOnline,
      emitTypingStop,
      sendQueuedMessage,
    ]
  );

  // ===================================
  // ACTION: Retry Failed Message
  // ===================================
  const retryMessage = useCallback(
    async (tempId: string) => {
      const queuedMessage = messageQueue.get(tempId);
      if (!queuedMessage) {
        toast.error("Không tìm thấy tin nhắn để gửi lại");
        return;
      }

      messageState.updateMessageStatus(tempId, "sending");
      await messageQueue.retryMessage(tempId, sendQueuedMessage);
    },
    [messageState, sendQueuedMessage]
  );

  // ===================================
  // RETURN: Export all functions & state
  // ===================================
  return {
    // Messages
    messages: messageState.messages,
    quickReplies: messageState.quickReplies,
    hasMoreMessages: messageState.hasMoreMessages,
    totalMessages: messageState.messages.length,

    // Conversations
    conversations: conversationState.conversations,
    currentConversationId: conversationState.currentConversationId,

    // UI State
    isLoadingAI,
    isChatExpanded,
    setIsChatExpanded,

    // ✅ ENTERPRISE: New state
    isOnline,
    typingState,

    // Actions
    onSendText,
    onSendQuickReply: (text: string, payload: string) => onSendText(payload || text),
    onFileUpload: async (file: File) => {
      // TODO: Implement file upload with queue support
      console.log("File upload not implemented yet:", file);
    },
    handleNewChat: conversationState.clearCurrentConversation,
    handleSelectConversation: async (conversationId: string) => {
      conversationState.selectConversation(conversationId);
      const historyData = await chatApi.fetchChatHistory(conversationId, 1, 30);
      messageState.setMessagesFromHistory(historyData.messages, {
        currentPage: historyData.currentPage,
        totalPages: historyData.totalPages,
      });
    },
    handleLoadMoreMessages: async () => {
      if (!conversationState.currentConversationId || !messageState.hasMoreMessages) return;
      await messageState.loadMoreMessages(conversationState.currentConversationId, chatApi.fetchChatHistory);
    },
    handleRenameConversation: conversationState.updateConversationTitle,
    handleDeleteConversation: conversationState.removeConversation,

    // ✅ ENTERPRISE: New actions
    handleTyping,
    retryMessage,
    emitTypingStop,
  };
};


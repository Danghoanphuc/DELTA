// apps/customer-frontend/src/features/chat/hooks/useChatSender.enhanced.ts
/**
 * 🔥 ENHANCED CHAT SENDER - WITH RETRY & ERROR HANDLING
 */

import { useCallback, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "@/shared/utils/toast";
import * as chatApi from "../services/chat.api.service";
import { useMessageState } from "./useMessageState";
import { useConversationState } from "./useConversationState";
import { useChatContextManager } from "./useChatContextManager";
import { useEnhancedChatStore } from "../stores/useChatStore.enhanced";
import {
  handleChatError,
  RetryManager,
  offlineQueue,
  ChatErrorCode,
} from "../lib";

export const useEnhancedChatSender = () => {
  const messageState = useMessageState();
  const conversationState = useConversationState();
  const { getContext } = useChatContextManager();
  const enhancedStore = useEnhancedChatStore();

  // Retry manager instance
  const retryManagerRef = useRef<RetryManager>(
    new RetryManager({
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 10000,
    })
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      retryManagerRef.current.cancelAll();
    };
  }, []);

  /**
   * Send text message với retry logic
   */
  const onSendText = useCallback(
    async (text: string) => {
      if (!text?.trim()) return;

      const currentConvId = conversationState.currentConversationId;
      const userMsgId = uuidv4();
      const clientSideId = `client_${userMsgId}`;

      console.log("[EnhancedSender] Sending message:", {
        text,
        currentConvId,
        userMsgId,
        clientSideId,
      });

      // 1. Add optimistic user message
      const userMessage = {
        _id: userMsgId,
        conversationId: currentConvId || "temp",
        senderType: "User" as const,
        type: "text" as const,
        content: { text },
        createdAt: new Date().toISOString(),
        clientSideId,
        status: "sending" as const,
        metadata: {},
      };

      enhancedStore.addOptimisticMessage(currentConvId || "temp", userMessage);
      messageState.addMessage(userMessage);

      // 2. Add temporary AI response placeholder
      const aiTempId = `temp_ai_${Date.now()}`;
      const aiPlaceholder = {
        _id: aiTempId,
        conversationId: currentConvId || "temp",
        senderType: "AI" as const,
        type: "text" as const,
        content: { text: "" },
        createdAt: new Date().toISOString(),
        tempId: aiTempId,
        status: "pending" as const,
        metadata: {},
      };

      messageState.addMessage(aiPlaceholder);
      messageState.setGenerating(true);

      try {
        // 3. Send với retry logic
        const response = await retryManagerRef.current.execute(
          clientSideId,
          async () => {
            const context = getContext();
            return await chatApi.postChatMessage(
              text,
              currentConvId && !currentConvId.startsWith("temp")
                ? currentConvId
                : null,
              undefined,
              undefined,
              undefined,
              { ...context, clientSideId },
              undefined,
              clientSideId
            );
          },
          (attempt, delay, error) => {
            console.log(
              `[EnhancedSender] Retry attempt ${attempt}, waiting ${delay}ms`,
              error
            );
            // Update UI to show retrying
            messageState.updateMessage(userMsgId, {
              status: "retrying",
              retryCount: attempt,
            });
          }
        );

        console.log("[EnhancedSender] API response:", response);

        // 4. Confirm optimistic message
        enhancedStore.confirmOptimisticMessage(
          currentConvId || "temp",
          userMsgId,
          {
            ...userMessage,
            _id: response.savedToHistory ? userMsgId : `confirmed_${userMsgId}`,
            status: "sent",
          }
        );

        messageState.updateMessage(userMsgId, {
          status: "sent",
          metadata: { ...userMessage.metadata, confirmed: true },
        });

        // 5. Handle new conversation
        if (response?.newConversation) {
          const newId = response.newConversation._id;
          console.log("[EnhancedSender] New conversation created:", newId);

          conversationState.addConversation(response.newConversation);
          conversationState.selectConversation(newId);

          messageState.updateMessage(userMsgId, { conversationId: newId });
          messageState.updateMessage(aiTempId, { conversationId: newId });
        }

        // 6. Success - remove from offline queue if exists
        offlineQueue.remove(clientSideId);
      } catch (error: any) {
        console.error("[EnhancedSender] Error:", error);

        // Parse error
        const chatError = handleChatError(
          error,
          {
            action: "send_message",
            conversationId: currentConvId || undefined,
            messageId: userMsgId,
          },
          { silent: false }
        );

        // Mark message as failed
        enhancedStore.markMessageAsFailed(
          currentConvId || "temp",
          userMsgId,
          chatError.message,
          chatError.code
        );

        messageState.updateMessage(userMsgId, {
          status: "failed",
          error: chatError.message,
          errorCode: chatError.code,
        });

        // Remove AI placeholder
        messageState.removeMessage(aiTempId);
        messageState.setGenerating(false);

        // Add to offline queue if network error
        if (
          chatError.code === ChatErrorCode.NETWORK_ERROR ||
          chatError.code === ChatErrorCode.TIMEOUT
        ) {
          offlineQueue.add({
            tempId: clientSideId,
            message: text,
            conversationId: currentConvId,
            metadata: { clientSideId },
          });
          toast.info("💾 Tin nhắn đã lưu, sẽ gửi khi có mạng");
        }

        // Show error message in chat
        messageState.addMessage({
          _id: `error_${Date.now()}`,
          conversationId: currentConvId || "temp",
          senderType: "AI",
          type: "error",
          content: { text: chatError.userMessage },
          createdAt: new Date().toISOString(),
          status: "sent",
          metadata: { errorCode: chatError.code },
        });
      }
    },
    [conversationState, messageState, getContext, enhancedStore]
  );

  /**
   * Retry failed message
   */
  const retryMessage = useCallback(
    async (messageId: string, conversationId: string) => {
      const message = enhancedStore.getMessageById(conversationId, messageId);
      if (!message || message.senderType !== "User") {
        console.warn("[EnhancedSender] Cannot retry non-user message");
        return;
      }

      const text =
        typeof message.content === "string"
          ? message.content
          : (message.content as any).text;

      if (!text) {
        console.warn("[EnhancedSender] Cannot retry message without text");
        return;
      }

      console.log("[EnhancedSender] Retrying message:", messageId);

      // Move from failed to retrying
      enhancedStore.retryFailedMessage(conversationId, messageId);

      // Retry send
      await onSendText(text);
    },
    [enhancedStore, onSendText]
  );

  /**
   * Cancel failed message
   */
  const cancelFailedMessage = useCallback(
    (messageId: string, conversationId: string) => {
      enhancedStore.removeFailedMessage(conversationId, messageId);
      messageState.removeMessage(messageId);
      toast.info("Đã hủy tin nhắn");
    },
    [enhancedStore, messageState]
  );

  /**
   * File upload (placeholder)
   */
  const onFileUpload = useCallback(async (file: File) => {
    toast.info("Tính năng đang cập nhật");
  }, []);

  /**
   * Flush offline queue
   */
  const flushOfflineQueue = useCallback(async () => {
    const queueSize = offlineQueue.size();
    if (queueSize === 0) return;

    console.log(`[EnhancedSender] Flushing ${queueSize} offline messages...`);
    toast.info(`📤 Đang gửi ${queueSize} tin nhắn đã lưu...`);

    const result = await offlineQueue.flush(async (queuedMessage) => {
      await chatApi.postChatMessage(
        queuedMessage.message,
        queuedMessage.conversationId,
        undefined,
        undefined,
        queuedMessage.type,
        queuedMessage.metadata
      );
    });

    if (result.success > 0) {
      toast.success(`✅ Đã gửi ${result.success} tin nhắn`);
    }
    if (result.failed > 0) {
      toast.warning(`⚠️ ${result.failed} tin nhắn gửi thất bại`);
    }
  }, []);

  return {
    onSendText,
    onFileUpload,
    retryMessage,
    cancelFailedMessage,
    flushOfflineQueue,
  };
};

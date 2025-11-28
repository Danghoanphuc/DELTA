// apps/customer-frontend/src/features/chat/hooks/useChat.ts
import { useState, useEffect, useCallback } from "react";
import { toast } from "@/shared/utils/toast";
import { v4 as uuidv4 } from "uuid";
import { ChatMessage } from "@/types/chat";
import { useAuthStore } from "@/stores/useAuthStore";
import { useSocket } from "@/contexts/SocketProvider";
import * as chatApi from "../services/chat.api.service";
import { useMessageState, WELCOME_ID } from "./useMessageState";
import { useConversationState } from "./useConversationState";
import { parseThinkingContent } from "../utils/textParser";
import { translateLogToThought } from "../utils/logTranslator";
import type { LogStep } from "../stores/useChatStore";

export { WELCOME_ID };

export const useChat = () => {
  // --- 1. STATE & HOOKS ---
  const messageState = useMessageState();
  const conversationState = useConversationState();
  const { user } = useAuthStore();
  const { pusher } = useSocket();

  const [chatStatus, setChatStatus] = useState<"idle" | "sending" | "thinking" | "streaming" | "error">("idle");
  const [thinkingLogs, setThinkingLogs] = useState<LogStep[]>([]);
  const [isChatExpanded, setIsChatExpanded] = useState(true);

  // --- 2. SOCKET HANDLERS ---
  const handleThinkingLog = useCallback((data: { text?: string; type?: string }) => {
    if (!data?.text) return;
    setChatStatus("thinking");
    setThinkingLogs((prev) => [...prev, {
      id: uuidv4(),
      text: translateLogToThought(data.text || ""),
      type: (data.type as any) || "process",
      timestamp: Date.now(),
    }]);
  }, []);

  const handleStreamStart = useCallback((data: any) => {
    if (data.conversationId !== conversationState.currentConversationId) return;
    setChatStatus("streaming");
    messageState.setMessages(prev => {
      if (prev.some(m => m._id === data.messageId)) return prev;
      return [...prev, {
        _id: data.messageId,
        conversationId: data.conversationId,
        senderType: "AI" as const,
        type: "text" as const,
        content: { text: "" },
        metadata: { status: "streaming" } as any,
        createdAt: new Date().toISOString()
      } as ChatMessage];
    });
  }, [conversationState.currentConversationId, messageState.setMessages]);

  const handleStreamChunk = useCallback((data: { messageId: string, text: string }) => {
    messageState.setMessages(prev => {
      const index = prev.findIndex(m => m._id === data.messageId);
      if (index === -1) return prev;
      const updated = [...prev];
      const msg = updated[index];
      const currentText = (msg.content as any).text || "";
      updated[index] = {
        ...msg,
        content: { ...msg.content, text: currentText + data.text } as any,
        metadata: { ...msg.metadata, status: "streaming" } as any
      } as ChatMessage;
      return updated;
    });
  }, [messageState.setMessages]);

  const handleNewMessage = useCallback((socketMessage: any) => {
    if (socketMessage.conversationId && conversationState.currentConversationId && socketMessage.conversationId !== conversationState.currentConversationId) return;
    
    let rawText = typeof socketMessage.content === 'string' ? socketMessage.content : socketMessage.content?.text || "";
    const { content } = parseThinkingContent(rawText);
    
    const chatMessage: ChatMessage = {
      ...socketMessage,
      content: { ...socketMessage.content, text: content }
    };

    const isThinkingMsg = (chatMessage.metadata as any)?.status === "thinking";
    
    messageState.setMessages((prev) => {
      const existingIdx = prev.findIndex(m => m._id === chatMessage._id);
      if (existingIdx !== -1) {
        const updated = [...prev];
        updated[existingIdx] = chatMessage;
        return updated;
      }
      return [...prev, chatMessage];
    });

    if (!isThinkingMsg && chatMessage.senderType === "AI") setChatStatus("idle");
  }, [conversationState.currentConversationId, messageState.setMessages]);

  // --- 3. SETUP LISTENER ---
  useEffect(() => {
    if (!pusher || !user?._id) return;
    const channelName = `private-user-${user._id}`;
    const channel = pusher.subscribe(channelName);

    channel.bind("ai:thinking:log", handleThinkingLog);
    channel.bind("ai:stream:start", handleStreamStart);
    channel.bind("ai:stream:chunk", handleStreamChunk);
    channel.bind("chat:message:new", handleNewMessage);
    channel.bind("ai:message", handleNewMessage);

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(channelName);
    };
  }, [pusher, user?._id, handleThinkingLog, handleStreamStart, handleStreamChunk, handleNewMessage]);

  // --- 4. CORE ACTIONS ---
  const onSendText = useCallback(async (text: string, lat?: number, lng?: number) => {
    if (!text.trim()) return;

    // 1. Optimistic UI: Hiện tin nhắn user ngay
    const userMessage = messageState.addUserMessage(text, conversationState.currentConversationId);
    setChatStatus("sending");
    setThinkingLogs([]);
    setIsChatExpanded(true);

    try {
      // 2. Gọi API
      const response = await chatApi.postChatMessage(
        text,
        conversationState.currentConversationId,
        lat,
        lng
      );

      messageState.updateMessageStatus(userMessage._id, "sent");

      // =========================================================
      // 🚀 CHỐT CHẶN 1: CẬP NHẬT SIDEBAR NGAY LẬP TỨC
      // Nếu API trả về conversation mới -> Nhét thẳng vào Sidebar
      // =========================================================
      if (response && response.newConversation) {
          console.log("🚀 [useChat] Updating Sidebar Optimistically:", response.newConversation);
          
          // Thêm vào Sidebar ngay (không chờ Socket)
          conversationState.addConversation(response.newConversation);
          
          // Nếu đang ở chat tạm (null ID), switch sang ID thật
          if (!conversationState.currentConversationId) {
             conversationState.selectConversation(response.newConversation._id);
          }
      }
      
    } catch (error) {
      console.error("Send failed:", error);
      setChatStatus("error");
      toast.error("Gửi tin nhắn thất bại");
      messageState.updateMessageStatus(userMessage._id, "error");
    }
  }, [conversationState, messageState]);

  const onFileUpload = useCallback(async (file: File) => {
    if (!file) return;
    setChatStatus("sending");
    try {
      const response = await chatApi.uploadChatFile(file, conversationState.currentConversationId);
      
      // Cập nhật Sidebar nếu tạo chat mới từ file
      if (response && response.newConversation) {
          conversationState.addConversation(response.newConversation);
          if (!conversationState.currentConversationId) {
             conversationState.selectConversation(response.newConversation._id);
          }
      }
      toast.success("Đã gửi file thành công");
      setChatStatus("idle");
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Gửi file thất bại");
      setChatStatus("error");
    }
  }, [conversationState, messageState]);

  return {
    status: chatStatus,
    isLoadingAI: chatStatus === "sending" || chatStatus === "thinking" || chatStatus === "streaming",
    thinkingLogs,
    isChatExpanded,
    setIsChatExpanded,
    onSendText,
    onFileUpload,
    onSendQuickReply: (text: string, payload: string) => onSendText(payload),
    handleNewChat: () => {
      messageState.resetToWelcome();
      conversationState.clearCurrentConversation();
      setThinkingLogs([]);
      setChatStatus("idle");
    },
    handleSelectConversation: conversationState.selectConversation,
    ...messageState,
    ...conversationState
  };
};
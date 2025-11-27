// apps/customer-frontend/src/features/chat/hooks/useChatVercel.ts

import { useEffect, useCallback, useState } from "react";
import { useChat } from "ai/react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useConversationState } from "./useConversationState";
import { useStatusStore } from "@/stores/useStatusStore";
import { toast } from "@/shared/utils/toast";
import { v4 as uuidv4 } from "uuid";
import { ChatMessage } from "@/types/chat";
import { parseThinkingContent } from "../utils/textParser";
import { WELCOME_MESSAGE } from "./useMessageState";
import * as chatApi from "../services/chat.api.service";

// Map message từ Vercel format sang Printz format
const mapVercelMessageToPrintz = (m: any): ChatMessage => {
  const rawContent = typeof m.content === "string" 
    ? m.content 
    : Array.isArray(m.content)
    ? m.content.map((c: any) => typeof c === "string" ? c : c.text || "").join("")
    : "";
  
  const { content } = parseThinkingContent(rawContent);

  return {
    _id: m.id || uuidv4(),
    conversationId: "current", 
    senderType: m.role === "user" ? "User" : "AI",
    type: "text",
    content: { text: content || "" },
    createdAt: m.createdAt?.toString() || new Date().toISOString(),
    metadata: {
      status: "sent",
    },
  };
};

export const useChatVercel = () => {
  const { user, accessToken } = useAuthStore();
  const conversationState = useConversationState();
  const { showStatus } = useStatusStore();

  const [currentThought, setCurrentThought] = useState<{ icon: string; text: string } | null>(null);
  const [isChatExpanded, setIsChatExpanded] = useState(true);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);

  // 🚀 CORE: Vercel AI Hook
  const {
    messages,
    input: vercelInput,
    handleInputChange: vercelHandleInputChange,
    append,
    isLoading,
    setMessages: setVercelMessages,
    reload 
  } = useChat({
    api: "/api/chat/stream",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: {
      conversationId: conversationState.currentConversationId,
    },
    onFinish: async (message) => {
      setCurrentThought(null);
      
      const currentConvo = conversationState.conversations.find(c => c._id === conversationState.currentConversationId);
      const isNewChat = !currentConvo || currentConvo.title === "Đoạn chat mới" || !currentConvo.title;

      if (messages.length <= 2 && conversationState.currentConversationId && isNewChat) {
         console.log("Triggering auto-title for:", conversationState.currentConversationId);
         const newTitle = await chatApi.generateConversationTitle(conversationState.currentConversationId);
         if (newTitle) {
            conversationState.updateConversationTitle(conversationState.currentConversationId, newTitle);
         }
      }
    },
    onError: (error: Error) => {
      let msg = error.message;
      try {
        const json = JSON.parse(error.message);
        if (json.error) msg = json.error;
      } catch (e) {}
      toast.error("Zin gặp sự cố: " + msg);
      setCurrentThought(null);
    },
  });

  const loadConversationMessages = useCallback(async (conversationId: string) => {
    try {
      const history = await chatApi.fetchChatHistory(conversationId, 1, 50);
      if (history.messages && history.messages.length > 0) {
        const vercelMessages = history.messages.map((msg: ChatMessage) => ({
          id: msg._id,
          role: (msg.senderType === "User" ? "user" : "assistant") as "user" | "assistant",
          content: typeof msg.content === "string" ? msg.content : (msg.content as any)?.text || "",
          createdAt: msg.createdAt ? new Date(msg.createdAt) : new Date(),
        }));
        setVercelMessages(vercelMessages);
      } else {
        setVercelMessages([]);
      }
    } catch (error) {
      console.error("Failed to load conversation messages:", error);
      toast.error("Không thể tải tin nhắn");
      setVercelMessages([]);
    }
  }, [setVercelMessages]);

  useEffect(() => {
    if (!user || !accessToken) return;
    const loadData = async () => {
      setIsLoadingConversations(true);
      try {
        // 🔥 CẬP NHẬT QUAN TRỌNG: Chỉ load các cuộc trò chuyện loại 'customer-bot' (Chat AI)
        const loadedConversations = await conversationState.loadConversations({ type: 'customer-bot' });
        
        const savedConversationId = localStorage.getItem("currentChatConversationId");
        if (savedConversationId) {
          const exists = loadedConversations.some((c) => c._id === savedConversationId);
          if (exists) {
            conversationState.selectConversation(savedConversationId);
            await loadConversationMessages(savedConversationId);
          } else {
            localStorage.removeItem("currentChatConversationId");
            conversationState.clearCurrentConversation();
            setVercelMessages([]);
          }
        }
      } catch (error) {
        console.error("Failed to load conversations:", error);
      } finally {
        setIsLoadingConversations(false);
      }
    };
    loadData();
  }, [user, accessToken]);


  // 1. Chuyển đổi Messages cho UI
  const uiMessages = messages.map(mapVercelMessageToPrintz);
  const isLoadingAI = isLoading;
  
  // Logic phát hiện Thinking
  useEffect(() => {
    if (!isLoadingAI || messages.length === 0) {
      setCurrentThought(null);
      return;
    }
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.role === "assistant") {
      const content = (lastMsg as any).content;
      const raw = Array.isArray(content) 
        ? content.map((c: any) => typeof c === "string" ? c : c.text || "").join("")
        : typeof content === "string" ? content : "";

      if (raw.includes("<think>") && !raw.includes("</think>")) {
        setCurrentThought({ icon: "🧠", text: "Zin đang suy luận..." });
      } else {
        setCurrentThought(null);
      }
    }
  }, [messages, isLoadingAI]);

  // --- ACTIONS ---

  const onSendText = useCallback(async (text: string) => {
      if (!text.trim()) return;
      append({
        role: "user",
        content: text,
      });
  }, [append]);

  const onSendQuickReply = useCallback((text: string, payload: string) => {
      onSendText(payload); 
  }, [onSendText]);

  const onFileUpload = (file: File) => {
    toast.info("Tính năng gửi file đang được nâng cấp");
  };

  const handleNewChat = useCallback(() => {
    conversationState.clearCurrentConversation();
    setVercelMessages([]);
    localStorage.removeItem("currentChatConversationId");
  }, [conversationState, setVercelMessages]);

  const handleSelectConversation = useCallback(async (id: string) => {
    conversationState.selectConversation(id);
    localStorage.setItem("currentChatConversationId", id);
    await loadConversationMessages(id);
  }, [conversationState, loadConversationMessages]);

  const handleRenameConversation = useCallback(async (id: string, newTitle: string) => {
    conversationState.updateConversationTitle(id, newTitle);
    try {
      const success = await chatApi.renameConversation(id, newTitle);
      if (!success) {
         console.warn("Rename API failed, reloading...");
         await conversationState.loadConversations({ type: 'customer-bot' });
      }
    } catch (error) {
      console.error("Rename failed:", error);
      await conversationState.loadConversations({ type: 'customer-bot' });
    }
  }, [conversationState]);

  const handleDeleteConversation = useCallback(async (id: string) => {
    conversationState.removeConversation(id);
    if (conversationState.currentConversationId === id) {
       handleNewChat();
    }
    try {
      const success = await chatApi.deleteConversation(id);
      if (success) {
         showStatus('success', 'Đã xóa cuộc trò chuyện');
      } else {
         showStatus('error', 'Không thể xóa, vui lòng thử lại');
         await conversationState.loadConversations({ type: 'customer-bot' });
      }
    } catch (error) {
       console.error("Delete failed:", error);
       showStatus('error', 'Lỗi khi xóa cuộc trò chuyện');
       await conversationState.loadConversations({ type: 'customer-bot' });
    }
  }, [conversationState, handleNewChat, showStatus]);

  return {
    messages: uiMessages.length > 0 ? uiMessages : [WELCOME_MESSAGE],
    quickReplies: [],
    conversations: conversationState.conversations,
    currentConversationId: conversationState.currentConversationId,
    isLoadingAI,
    isLoadingConversations,
    currentThought,
    isChatExpanded,
    onSendText,
    onSendQuickReply,
    onFileUpload,
    handleNewChat,
    handleSelectConversation,
    handleRenameConversation,
    handleDeleteConversation,
    // Expose helpers for ChatBotSync
    loadConversations: conversationState.loadConversations, 
    removeConversation: conversationState.removeConversation,
    addConversation: conversationState.addConversation,
    updateConversationTitle: conversationState.updateConversationTitle,
    input: vercelInput,
    handleInputChange: vercelHandleInputChange,
    hasMoreMessages: false,
    handleLoadMoreMessages: () => {},
    setIsChatExpanded,
  };
};
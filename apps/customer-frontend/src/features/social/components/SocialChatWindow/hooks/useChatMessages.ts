// apps/customer-frontend/src/features/social/components/SocialChatWindow/hooks/useChatMessages.ts
// ✅ Custom hook để quản lý messages và data fetching

import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchChatHistory } from "@/features/chat/services/chat.api.service";
import { useSocialChatStore } from "@/features/social/hooks/useSocialChatStore";
import type { ChatMessage } from "@/types/chat";

export function useChatMessages(conversationId: string) {
  const { messagesByConversation, setMessages } = useSocialChatStore();
  const lastConversationIdRef = useRef<string | null>(null);
  const prevMessagesLengthRef = useRef<number>(0);

  const { data, refetch } = useQuery({
    queryKey: ["socialMsg", conversationId],
    queryFn: () => fetchChatHistory(conversationId, 1, 50),
    staleTime: 0,
    refetchOnWindowFocus: true,
    enabled: !!conversationId,
  });

  // Refetch khi conversationId thay đổi
  useEffect(() => {
    if (conversationId && lastConversationIdRef.current !== conversationId) {
      lastConversationIdRef.current = conversationId;
      refetch();
    }
  }, [conversationId, refetch]);

  // Update messages khi có data mới
  useEffect(() => {
    if (data?.messages) {
      setMessages(conversationId, data.messages);
      prevMessagesLengthRef.current = data.messages.length;
    }
  }, [data, conversationId, setMessages]);

  const messages: ChatMessage[] = messagesByConversation[conversationId] || [];

  return {
    messages,
    prevMessagesLength: prevMessagesLengthRef,
  };
}


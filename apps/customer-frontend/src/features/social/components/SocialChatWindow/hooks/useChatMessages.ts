// apps/customer-frontend/src/features/social/components/SocialChatWindow/hooks/useChatMessages.ts
// ✅ Custom hook để quản lý messages và data fetching
// ✅ FIXED: Luôn enable query để có thể refetch khi có tin nhắn mới

import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchChatHistory } from "@/features/chat/services/chat.api.service";
import { useSocialChatStore } from "@/features/social/hooks/useSocialChatStore";
import type { ChatMessage } from "@/types/chat";

export function useChatMessages(conversationId: string) {
  const { messagesByConversation, setMessages } = useSocialChatStore();
  const lastConversationIdRef = useRef<string | null>(null);
  const prevMessagesLengthRef = useRef<number>(0);

  // ✅ Check xem đã có messages trong store chưa (đã preload)
  const cachedMessages = messagesByConversation[conversationId];
  const hasCachedMessages = cachedMessages && cachedMessages.length > 0;

  // ✅ FIXED: Luôn enable query để có thể refetch khi invalidate
  // Dùng staleTime để tránh fetch không cần thiết, nhưng vẫn cho phép refetch khi invalidate
  const { data, refetch, isFetching } = useQuery({
    queryKey: ["socialMsg", conversationId],
    queryFn: () => fetchChatHistory(conversationId, 1, 50),
    staleTime: hasCachedMessages ? 5 * 60 * 1000 : 0, // ✅ Nếu đã có cached, dùng 5 phút, nếu chưa thì fetch ngay
    refetchOnWindowFocus: false, // ✅ Không refetch khi focus để tránh giật
    enabled: !!conversationId, // ✅ Luôn enable để có thể refetch khi invalidate
  });

  // ✅ FIXED: Luôn refetch khi conversationId thay đổi để đảm bảo có data mới nhất
  // Nhưng nếu đã có cached, query sẽ dùng staleTime để tránh fetch không cần thiết
  useEffect(() => {
    if (conversationId && lastConversationIdRef.current !== conversationId) {
      lastConversationIdRef.current = conversationId;
      // ✅ Luôn refetch để đảm bảo có data mới nhất
      // staleTime sẽ quyết định có thực sự fetch hay không
      refetch();
    }
  }, [conversationId, refetch]);

  // ✅ FIXED: Update messages khi có data mới từ API
  // Chỉ update khi fetch xong (không phải đang fetch) để tránh overwrite với stale data
  useEffect(() => {
    if (data?.messages && data.messages.length > 0 && !isFetching) {
      // ✅ Luôn update store với data từ API
      // Store sẽ merge với socket messages tự động qua handleSocketMessage
      setMessages(conversationId, data.messages);
      prevMessagesLengthRef.current = data.messages.length;
    }
  }, [data, conversationId, setMessages, isFetching]);

  // ✅ Luôn dùng messages từ store (đã được update bởi socket hoặc API)
  const messages: ChatMessage[] = messagesByConversation[conversationId] || [];

  return {
    messages,
    prevMessagesLength: prevMessagesLengthRef,
  };
}


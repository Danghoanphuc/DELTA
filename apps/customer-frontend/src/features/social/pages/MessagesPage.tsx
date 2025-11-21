// apps/customer-frontend/src/features/social/pages/MessagesPage.tsx
// ✅ CHUYÊN GIA FIX: Layout Calculation & Container Sizing

import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  fetchChatConversations,
  fetchConversationById,
  createPeerConversation,
} from "../../chat/services/chat.api.service";
import { useSocialChatStore } from "../hooks/useSocialChatStore";
import { ConversationList } from "../components/ConversationList";
import { SocialChatWindow } from "../components/SocialChatWindow";
import { MessageCircle, Loader2 } from "lucide-react";
import { useSocket } from "@/contexts/SocketProvider";

export default function MessagesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const targetUserId = searchParams.get("userId");
  const urlConversationId = searchParams.get("conversationId");

  const { socket } = useSocket();
  const {
    conversations,
    setConversations,
    activeConversationId,
    setActiveConversation,
  } = useSocialChatStore();
  const [isCreating, setIsCreating] = useState(false);

  // 1. Fetch Conversations
  const { data, isLoading } = useQuery({
    queryKey: ["socialConversations"],
    queryFn: async () => {
      const res = await fetchChatConversations();
      return res.filter((c: any) =>
        ["peer-to-peer", "customer-printer", "group"].includes(c.type)
      );
    },
    // Giữ data fresh lâu hơn vì đã có socket update
    staleTime: 60000,
  });

  useEffect(() => {
    if (data) setConversations(data);
  }, [data, setConversations]);

  // 2. Logic chọn hội thoại (URL hoặc auto select)
  useEffect(() => {
    if (isLoading) return;

    // CASE A: Có Conversation ID trên URL
    if (urlConversationId) {
      const exists = conversations.find((c) => c._id === urlConversationId);
      if (exists) {
        if (activeConversationId !== urlConversationId)
          setActiveConversation(urlConversationId);
      } else {
        // Fetch lẻ nếu chưa có trong list (ví dụ click từ noti)
        fetchConversationById(urlConversationId)
          .then((conv) => {
            if (conv) {
              setConversations([conv, ...conversations]);
              setActiveConversation(conv._id);
            }
          })
          .catch(() => setSearchParams({}));
      }
      return;
    }

    // CASE B: Có User ID (bấm nút Chat từ profile)
    if (targetUserId && !isCreating) {
      const existing = conversations.find((c) =>
        c.participants?.some?.(
          (p: any) => (p.userId?._id || p.userId) === targetUserId
        )
      );
      if (existing) {
        selectConv(existing._id);
      } else {
        setIsCreating(true);
        createPeerConversation(targetUserId)
          .then((res) => {
            if (res.data?.conversation) {
              setConversations([res.data.conversation, ...conversations]);
              selectConv(res.data.conversation._id);
            }
          })
          .finally(() => setIsCreating(false));
      }
    }
  }, [urlConversationId, targetUserId, isLoading, conversations]);

  const selectConv = (id: string) => {
    setActiveConversation(id);
    setSearchParams({ conversationId: id }); // Clear userId param cho sạch URL
  };

  const activeConv = conversations.find((c) => c._id === activeConversationId);

  // ✅ FIX LAYOUT:
  // h-[calc(100vh-4rem-1px)]:
  // - 100vh: Full chiều cao
  // - 4rem (64px): Chiều cao Header (GlobalHeader)
  // - 1px: Border top nếu có
  return (
    <div className="flex w-full bg-white lg:h-[calc(100vh-4.5rem)] h-[calc(100vh-4rem)] overflow-hidden relative">
      {/* Sidebar */}
      <div
        className={`${
          activeConversationId ? "hidden lg:flex" : "flex"
        } w-full lg:w-80 xl:w-96 flex-col border-r border-gray-200 h-full`}
      >
        <ConversationList
          conversations={conversations}
          activeId={activeConversationId}
          onSelect={selectConv}
          isLoading={isLoading}
        />
      </div>

      {/* Main Chat Window */}
      <div
        className={`${
          activeConversationId ? "flex" : "hidden lg:flex"
        } flex-1 flex-col bg-gray-50 h-full min-w-0`}
      >
        {isCreating ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="animate-spin text-blue-600" />
          </div>
        ) : activeConv ? (
          <SocialChatWindow
            conversation={activeConv}
            onBack={() => {
              setActiveConversation(null);
              setSearchParams({});
            }}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <MessageCircle size={64} className="opacity-20 mb-4" />
            <p>Chọn một cuộc trò chuyện để bắt đầu</p>
          </div>
        )}
      </div>
    </div>
  );
}

// apps/customer-frontend/src/features/social/pages/MessagesPage.tsx
// ✅ FIXED: Auto-open latest conversation on fresh login

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import {
  fetchChatConversations,
  createPeerConversation,
  fetchConversationById,
} from "../../chat/services/chat.api.service";
import { useSocialChatStore } from "../hooks/useSocialChatStore";
import { ConversationList } from "../components/ConversationList";
import { SocialChatWindow } from "../components/SocialChatWindow";
import { MessageCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useSocket } from "@/contexts/SocketProvider";

export default function MessagesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const targetUserId = searchParams.get("userId");
  const urlConversationId = searchParams.get("conversationId");

  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);
  const { socket } = useSocket();

  const {
    conversations,
    setConversations,
    activeConversationId,
    setActiveConversation,
  } = useSocialChatStore();

  // 1. Load danh sách chat
  const { data, isLoading } = useQuery({
    queryKey: ["socialConversations"],
    queryFn: async () => {
      const allConversations = await fetchChatConversations();
      return allConversations.filter((conv) =>
        conv.type && ["individual", "group", "ai"].includes(conv.type)
      );
    },
    refetchInterval: 10000,
  });

  // 2. Sync danh sách vào Store
  useEffect(() => {
    if (data) {
      if (
        activeConversationId &&
        !data.find((c) => c._id === activeConversationId)
      ) {
        const current = conversations.find(
          (c) => c._id === activeConversationId
        );
        if (current) {
          setConversations([current, ...data]);
          return;
        }
      }
      setConversations(data);
    }
  }, [data, setConversations, activeConversationId]);

  // 3. Lắng nghe socket
  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () =>
      queryClient.invalidateQueries({ queryKey: ["socialConversations"] });
    socket.on("new_message", handleUpdate);
    return () => {
      socket.off("new_message", handleUpdate);
    };
  }, [socket, queryClient]);

  // 4. ✅ LOGIC ĐIỀU HƯỚNG & AUTO-SELECT
  useEffect(() => {
    if (isLoading) return;

    // CASE 1: URL có ID -> Ưu tiên cao nhất
    if (urlConversationId) {
      const existsInStore = conversations.some(
        (c) => c._id === urlConversationId
      );
      if (existsInStore) {
        if (activeConversationId !== urlConversationId) {
          setActiveConversation(urlConversationId);
        }
      } else {
        // Gọi API cứu hộ
        if (!isRecovering) {
          setIsRecovering(true);
          fetchConversationById(urlConversationId)
            .then((conv) => {
              if (conv) {
                setConversations([conv, ...conversations]);
                setActiveConversation(conv._id);
              } else {
                setSearchParams({});
              }
            })
            .catch(() => setSearchParams({}))
            .finally(() => setIsRecovering(false));
        }
      }
      return;
    }

    // CASE 2: Bấm nút Nhắn tin (UserId)
    if (targetUserId && !isCreatingConversation) {
      handleUserIdParam();
      return;
    }

    // CASE 3 (MỚI): Tự động mở hội thoại gần nhất nếu chưa chọn gì
    // Điều kiện: Không có URL ID, không có Target User, Store chưa Active, và Danh sách có dữ liệu
    if (
      !urlConversationId &&
      !targetUserId &&
      !activeConversationId &&
      conversations.length > 0
    ) {
      const mostRecent = conversations[0]; // Phần tử đầu tiên là mới nhất (do Backend sort)
      selectConversation(mostRecent._id);
    }
  }, [
    urlConversationId,
    targetUserId,
    isLoading,
    conversations,
    activeConversationId,
    isRecovering,
  ]);

  const handleUserIdParam = async () => {
    if (!targetUserId) return;
    
    const existingConv = conversations.find((conv) => {
      if ((conv.type === "individual" || conv.type === "group") && conv.participants) {
        return conv.participants.some(
          (p: any) =>
            p.userId?._id === targetUserId || p.userId === targetUserId
        );
      }
      return false;
    });

    if (existingConv) {
      selectConversation(existingConv._id);
    } else {
      setIsCreatingConversation(true);
      try {
        const response = await createPeerConversation(targetUserId!);
        if (response.success && response.data?.conversation) {
          const conv = response.data.conversation;
          if (!conversations.some((c) => c._id === conv._id)) {
            setConversations([conv, ...conversations]);
          }
          selectConversation(conv._id);
        }
      } catch (e) {
        toast.error("Lỗi tạo chat");
      } finally {
        setIsCreatingConversation(false);
      }
    }
  };

  const selectConversation = (id: string) => {
    setActiveConversation(id);
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set("conversationId", id);
      newParams.delete("userId");
      return newParams;
    });
  };

  const handleBack = () => {
    setActiveConversation(null);
    setSearchParams({});
  };

  const activeConversation = conversations.find(
    (c) => c._id === activeConversationId
  );
  const showLoading = isLoading || isCreatingConversation || isRecovering;

  return (
    <div className="h-screen w-full flex flex-col lg:flex-row overflow-hidden">
      <div
        className={`${
          activeConversationId ? "hidden lg:flex" : "flex"
        } lg:w-80 xl:w-96 flex-shrink-0 border-r border-gray-200 bg-white flex-col h-full`}
      >
        <ConversationList
          conversations={conversations}
          activeId={activeConversationId}
          onSelect={selectConversation}
          isLoading={isLoading}
        />
      </div>

      <div
        className={`${
          activeConversationId ? "flex" : "hidden lg:flex"
        } flex-1 w-full min-w-0 bg-gray-50 h-full flex-col`}
      >
        {showLoading ? (
          <LoadingState />
        ) : activeConversation ? (
          <SocialChatWindow
            conversation={activeConversation}
            onBack={handleBack}
          />
        ) : (
          // Nếu danh sách rỗng thật sự thì mới hiện Empty State
          <EmptyState />
        )}
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex-1 flex items-center justify-center p-6 text-center h-full w-full">
      <Loader2 size={40} className="animate-spin text-blue-600" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center p-6 text-center h-full w-full">
      <div className="text-gray-400">
        <MessageCircle size={64} className="mx-auto mb-4 opacity-50" />
        <p>Bạn chưa có cuộc trò chuyện nào.</p>
        <p className="text-sm">Hãy kết bạn để bắt đầu nhắn tin!</p>
      </div>
    </div>
  );
}

// apps/customer-frontend/src/features/social/pages/MessagesPage.tsx
// ✅ FIXED: Full Logic - Cleanup Active ID on Unmount, Auto-select from URL

import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  fetchChatConversations, 
  fetchConversationById, 
  createPeerConversation 
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
  const queryClient = useQueryClient();
  
  // Lấy state và actions từ Store
  const { 
    conversations, 
    setConversations, 
    activeConversationId, 
    setActiveConversation 
  } = useSocialChatStore();
  
  const [isCreating, setIsCreating] = useState(false);

  // 1. Fetch Danh sách hội thoại (Lấy dữ liệu ban đầu)
  const { data, isLoading } = useQuery({
    queryKey: ["socialConversations"],
    queryFn: async () => {
      const res = await fetchChatConversations();
      // Chỉ lấy các loại hội thoại Social, bỏ qua Chatbot cũ nếu cần
      return res.filter((c: any) => ["peer-to-peer", "customer-printer", "group"].includes(c.type));
    },
    // Giữ cache lâu một chút vì đã có SocialChatSync cập nhật realtime
    staleTime: 60000, 
  });

  // Sync dữ liệu từ React Query vào Zustand Store
  useEffect(() => {
    if (data) {
      setConversations(data);
    }
  }, [data, setConversations]);

  // 2. Logic chọn hội thoại từ URL (Deep linking)
  useEffect(() => {
    if (isLoading) return;

    // CASE A: Có Conversation ID trên URL (Ưu tiên cao nhất)
    if (urlConversationId) {
      const exists = conversations.find(c => c._id === urlConversationId);
      
      if (exists) {
        // Nếu đã có trong list -> Set Active luôn
        if (activeConversationId !== urlConversationId) {
          setActiveConversation(urlConversationId);
        }
      } else {
        // Nếu chưa có trong list (ví dụ click từ thông báo) -> Fetch lẻ
        fetchConversationById(urlConversationId)
          .then(conv => {
            if (conv) {
              setConversations([conv, ...conversations]);
              setActiveConversation(conv._id);
            }
          })
          .catch(() => {
            // ID rác hoặc không quyền -> Xóa param để về màn hình trống
            setSearchParams({});
          });
      }
      return;
    }

    // CASE B: Có User ID (Bấm nút "Nhắn tin" từ Profile/Search)
    if (targetUserId && !isCreating) {
      // Kiểm tra xem đã có hội thoại với người này chưa
      const existing = conversations.find(c => 
        c.participants.some((p: any) => (p.userId?._id || p.userId) === targetUserId)
      );

      if (existing) {
        selectConv(existing._id);
      } else {
        // Chưa có -> Tạo mới
        setIsCreating(true);
        createPeerConversation(targetUserId)
          .then(res => {
            if (res.data?.conversation) {
              setConversations([res.data.conversation, ...conversations]);
              selectConv(res.data.conversation._id);
            }
          })
          .catch(() => {
            // Lỗi tạo -> Xóa param
            setSearchParams({});
          })
          .finally(() => setIsCreating(false));
      }
    }
  }, [urlConversationId, targetUserId, isLoading, conversations]); // Bỏ activeConversationId khỏi dep để tránh loop

  // 🔥 3. FIX QUAN TRỌNG: Reset Active ID khi rời trang
  // Giúp hệ thống biết user không còn xem tin nhắn -> Badge thông báo sẽ nhảy số
  useEffect(() => {
    return () => {
      console.log("👋 [MessagesPage] Unmounting - Resetting active conversation");
      setActiveConversation(null); 
    };
  }, [setActiveConversation]);

  // Hàm chọn hội thoại và update URL
  const selectConv = (id: string) => {
    setActiveConversation(id);
    // Xóa userId thừa, chỉ giữ conversationId
    setSearchParams({ conversationId: id }); 
  };

  // Tìm object hội thoại hiện tại để truyền vào Window
  const activeConv = conversations.find(c => c._id === activeConversationId);

  // Tính toán chiều cao: Full màn hình trừ đi Header (64px/4rem)
  return (
    <div className="flex w-full bg-white lg:h-[calc(100vh-4.5rem)] h-[calc(100vh-4rem)] overflow-hidden relative">
      
      {/* SIDEBAR: Danh sách hội thoại */}
      <div className={`
        ${activeConversationId ? "hidden lg:flex" : "flex"} 
        w-full lg:w-80 xl:w-96 flex-col border-r border-gray-200 h-full bg-white z-10
      `}>
        <ConversationList 
          conversations={conversations} 
          activeId={activeConversationId} 
          onSelect={selectConv} 
          isLoading={isLoading} 
        />
      </div>

      {/* MAIN AREA: Cửa sổ chat */}
      <div className={`
        ${activeConversationId ? "flex" : "hidden lg:flex"} 
        flex-1 flex-col bg-gray-50 h-full min-w-0
      `}>
        {isCreating ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="animate-spin text-blue-600 w-8 h-8"/>
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
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-4 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <MessageCircle size={40} className="opacity-20 text-gray-500"/>
            </div>
            <h3 className="font-semibold text-gray-600 mb-1">Tin nhắn của bạn</h3>
            <p className="text-sm max-w-xs">
              Chọn một cuộc trò chuyện hoặc tìm kiếm bạn bè để bắt đầu nhắn tin.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
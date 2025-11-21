// apps/customer-frontend/src/features/social/pages/MessagesPage.tsx
// ✅ MESSAGES V2: Slide Animation for Mobile Chat (Zalo/Messenger Style)

import { useState, useEffect, useMemo, useRef } from "react";
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
import { ChatInfoSidebar } from "../components/ChatInfoSidebar";
import { SocialNavSidebar } from "../components/SocialNavSidebar";
import { MessageCircle, Loader2 } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { toast } from "sonner";
import { useIsMobile } from "@/shared/hooks/useMediaQuery";
// ✅ Import Animation Libraries
import { motion, AnimatePresence } from "framer-motion"; 

export default function MessagesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const targetUserId = searchParams.get("userId");
  const urlConversationId = searchParams.get("conversationId");
  
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  
  const { 
    conversations: storeConversations, 
    syncConversations,
    activeConversationId, 
    setActiveConversation,
    isInfoSidebarOpen,
    setInfoSidebarOpen,
    addConversation, 
  } = useSocialChatStore();

  const [isCreating, setIsCreating] = useState(false);
  const fetchingConversationRef = useRef<Set<string>>(new Set());
  const creatingConversationRef = useRef<Set<string>>(new Set());

  // --- 1. Data Fetching (Giữ nguyên logic chuẩn) ---
  const { data, isLoading } = useQuery({
    queryKey: ["socialConversations"],
    queryFn: async () => {
      const res = await fetchChatConversations();
      return res.filter((c: any) => ["peer-to-peer", "customer-printer", "group"].includes(c.type));
    },
    staleTime: 60000, 
  });
  
  const conversations = useMemo(() => {
    if (!data) return storeConversations;
    const merged = [...data];
    const apiIds = new Set(data.map((c) => c._id));
    storeConversations.forEach((storeConv) => {
      if (!apiIds.has(storeConv._id) && 
          ["peer-to-peer", "customer-printer", "group"].includes(storeConv.type || "")) {
        merged.push(storeConv);
      }
    });
    return merged.sort((a, b) => {
        const tA = new Date(a.lastMessageAt || a.createdAt || 0).getTime();
        const tB = new Date(b.lastMessageAt || b.createdAt || 0).getTime();
        return tB - tA;
    });
  }, [data, storeConversations]);

  useEffect(() => {
    if (data) syncConversations(data);
  }, [data, syncConversations]);

  // --- 2. Logic Sync URL & Store (Giữ nguyên fix UX Loop) ---
  useEffect(() => {
    if (isLoading) return;
    if (urlConversationId) {
        if (activeConversationId !== urlConversationId) {
            setActiveConversation(urlConversationId);
        }
    } else if (activeConversationId) {
        setActiveConversation(null);
    }
  }, [urlConversationId, activeConversationId, isLoading, setActiveConversation]);

  // --- 3. Logic Create (Giữ nguyên) ---
  useEffect(() => {
    if (targetUserId && !isCreating && !creatingConversationRef.current.has(targetUserId) && !urlConversationId) {
        const existing = conversations.find((c: any) => 
            c.participants && c.participants.some((p: any) => (p.userId?._id || p.userId) === targetUserId)
        );
        if (existing) {
            setSearchParams({ conversationId: existing._id });
        } else {
            setIsCreating(true);
            creatingConversationRef.current.add(targetUserId);
            createPeerConversation(targetUserId).then(res => {
                if (res.data?.conversation) {
                    addConversation(res.data.conversation);
                    setSearchParams({ conversationId: res.data.conversation._id });
                    queryClient.invalidateQueries({ queryKey: ["socialConversations"] });
                }
            }).finally(() => {
                setIsCreating(false);
                creatingConversationRef.current.delete(targetUserId);
            });
        }
    }
  }, [targetUserId, conversations, isCreating, addConversation, setSearchParams, queryClient, urlConversationId]);

  const activeConv = conversations.find(c => c._id === activeConversationId);

  // ============================================================
  // ✅ RENDER LAYOUT (Tách biệt Mobile & Desktop để Animation ngon hơn)
  // ============================================================

  // --- MOBILE VIEW (Slide Animation) ---
  if (isMobile) {
    return (
      <div className="relative w-full h-[calc(100vh-3.5rem)] bg-white overflow-hidden">
        {/* 1. Danh sách (Luôn nằm dưới) */}
        <div className="absolute inset-0 w-full h-full bg-white z-0">
           <ConversationList 
              conversations={conversations} 
              activeId={activeConversationId} 
              onSelect={(id) => setSearchParams({ conversationId: id })} 
              isLoading={isLoading} 
            />
        </div>

        {/* 2. Chat Window Overlay (Trượt vào/ra) */}
        <AnimatePresence>
          {activeConversationId && (
            <motion.div
              key="mobile-chat-window"
              initial={{ x: "100%" }} // Bắt đầu từ bên phải màn hình
              animate={{ x: 0 }}      // Trượt vào giữa
              exit={{ x: "100%" }}    // Trượt ra phải khi đóng
              transition={{ type: "spring", damping: 25, stiffness: 200 }} // Hiệu ứng lò xo mượt mà
              className="fixed inset-0 z-50 bg-white h-[100dvh] w-full flex flex-col" // Full màn hình đè lên tất cả
            >
               {isCreating ? (
                  <div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-blue-600"/></div>
                ) : activeConv ? (
                  <div className="flex-1 h-full relative">
                     <SocialChatWindow 
                        conversation={activeConv} 
                        onBack={() => { 
                            setActiveConversation(null); 
                            setSearchParams({}); 
                        }} 
                      />
                      
                      {/* Info Sidebar Overlay cho Mobile (nếu mở) */}
                      {isInfoSidebarOpen && (
                        <div className="absolute inset-0 z-[60] bg-white">
                           <ChatInfoSidebar conversation={activeConv} onClose={() => setInfoSidebarOpen(false)} />
                        </div>
                      )}
                  </div>
                ) : (
                  // Fallback nếu có ID nhưng ko tìm thấy conv (hiếm gặp)
                  <div className="flex-1 flex items-center justify-center">
                     <Loader2 className="animate-spin"/>
                  </div>
                )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // --- DESKTOP VIEW (Split Layout - Giữ nguyên) ---
  return (
    <div className="flex w-full bg-white h-[calc(100vh-4.5rem)] overflow-hidden relative">
      <SocialNavSidebar />

      {/* List */}
      <div className="w-80 xl:w-80 flex-col border-r border-gray-200 h-full bg-white z-10 flex">
        <ConversationList 
          conversations={conversations} 
          activeId={activeConversationId} 
          onSelect={(id) => setSearchParams({ conversationId: id })} 
          isLoading={isLoading} 
        />
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex-col bg-gray-50 h-full min-w-0 transition-all duration-300 relative flex">
        {activeConv ? (
          <SocialChatWindow 
            conversation={activeConv} 
            onBack={() => { 
              setActiveConversation(null); 
              setSearchParams({}); 
            }} 
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-4">
            <MessageCircle size={48} className="mb-4 opacity-20"/>
            <p>Chọn hội thoại để bắt đầu</p>
          </div>
        )}
      </div>

      {/* Info Sidebar */}
      {activeConv && isInfoSidebarOpen && (
        <div className="w-80 border-l border-gray-200 h-full bg-white flex-shrink-0">
            <ChatInfoSidebar conversation={activeConv} onClose={() => setInfoSidebarOpen(false)} />
        </div>
      )}
    </div>
  );
}
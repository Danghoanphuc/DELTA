// apps/customer-frontend/src/features/social/pages/MessagesPage.tsx
// ✅ FIXED UI: Dùng fixed positioning để neo chặt layout vào khung màn hình
// Khắc phục triệt để lỗi hở trên/hở dưới

import { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  fetchChatConversations, 
  createPeerConversation 
} from "@/features/chat/services/chat.api.service";
import { useSocialChatStore } from "@/features/social/hooks/useSocialChatStore";
import { ConversationList } from "@/features/social/components/ConversationList";
import { SocialChatWindow } from "@/features/social/components/SocialChatWindow";
import { ChatInfoSidebar } from "@/features/social/components/ChatInfoSidebar";
import { SocialNavSidebar } from "@/features/social/components/SocialNavSidebar";
import { MessageCircle, Loader2 } from "lucide-react";
import { useIsMobile } from "@/shared/hooks/useMediaQuery";
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
  const creatingConversationRef = useRef<Set<string>>(new Set());

  // 1. Data Fetching
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

  useEffect(() => { if (data) syncConversations(data); }, [data, syncConversations]);

  // 2. Sync URL
  useEffect(() => {
    if (isLoading) return;
    if (urlConversationId && activeConversationId !== urlConversationId) {
        setActiveConversation(urlConversationId);
    } else if (!urlConversationId && activeConversationId) {
        setActiveConversation(null);
    }
  }, [urlConversationId, activeConversationId, isLoading, setActiveConversation]);

  // 3. Auto Create
  useEffect(() => {
    if (targetUserId && !isCreating && !creatingConversationRef.current.has(targetUserId) && !urlConversationId) {
        const existing = conversations.find((c: any) => 
            c.participants?.some((p: any) => (p.userId?._id || p.userId) === targetUserId)
        );
        if (existing) {
            setSearchParams({ conversationId: existing._id }, { replace: true });
        } else {
            setIsCreating(true);
            creatingConversationRef.current.add(targetUserId);
            createPeerConversation(targetUserId).then(res => {
                if (res.data?.conversation) {
                    addConversation(res.data.conversation);
                    setSearchParams({ conversationId: res.data.conversation._id }, { replace: true });
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

  // === MOBILE VIEW ===
  if (isMobile) {
    return (
      // Mobile giữ nguyên logic tính toán calc
      <div className="relative w-full h-[calc(100dvh-4rem)] bg-white overflow-hidden flex flex-col"> 
        <div className="flex-1 relative w-full h-full">
           <div className="absolute inset-0 pb-16">
              <ConversationList 
                  conversations={conversations} 
                  activeId={activeConversationId} 
                  onSelect={(id) => setSearchParams({ conversationId: id }, { replace: true })} 
                  isLoading={isLoading} 
              />
           </div>
        </div>

        <AnimatePresence>
          {activeConversationId && (
            <motion.div
              key="mobile-chat-window"
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-0 z-[100] bg-white h-[100dvh] w-full flex flex-col"
            >
               {isCreating ? (
                  <div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-blue-600"/></div>
                ) : activeConv ? (
                  <div className="flex-1 h-full relative flex flex-col">
                     <SocialChatWindow 
                        conversation={activeConv} 
                        onBack={() => { 
                            setActiveConversation(null); 
                            setSearchParams({}, { replace: true }); 
                        }} 
                      />
                      {isInfoSidebarOpen && (
                        <div className="absolute inset-0 z-[110] bg-white">
                           <ChatInfoSidebar conversation={activeConv} onClose={() => setInfoSidebarOpen(false)} />
                        </div>
                      )}
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin"/></div>
                )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // === DESKTOP VIEW (FIXED LAYOUT) ===
  return (
    // 1. Dùng FIXED để neo vào khung hình
    // top-16: Bắt đầu ngay dưới Header (64px)
    // bottom-0: Kéo dài tới tận đáy
    // left-0 right-0: Full chiều ngang
    <div className="fixed top-16 bottom-0 left-0 right-0 flex bg-white overflow-hidden z-0">
      
      {/* Sidebar bên trái */}
      <SocialNavSidebar />

      <div className="flex flex-1 h-full min-w-0">
        
        <div className="w-80 xl:w-96 flex-col border-r border-gray-200 h-full bg-white z-10 flex flex-shrink-0">
          <ConversationList 
            conversations={conversations} 
            activeId={activeConversationId} 
            onSelect={(id) => setSearchParams({ conversationId: id }, { replace: true })} 
            isLoading={isLoading} 
          />
        </div>

        <div className="flex-1 flex flex-col bg-gray-50 h-full min-w-0 relative">
          {activeConv ? (
            <SocialChatWindow 
              conversation={activeConv} 
              onBack={() => { 
                  setActiveConversation(null); 
                  setSearchParams({}, { replace: true }); 
              }} 
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-300 select-none">
              <MessageCircle size={64} strokeWidth={1} className="mb-4"/>
              <p className="text-lg font-medium">Chọn cuộc trò chuyện để bắt đầu</p>
            </div>
          )}
        </div>

        {activeConv && isInfoSidebarOpen && (
          <div className="w-80 border-l border-gray-200 h-full bg-white flex-shrink-0">
              <ChatInfoSidebar conversation={activeConv} onClose={() => setInfoSidebarOpen(false)} />
          </div>
        )}
      </div>
    </div>
  );
}
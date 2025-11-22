// apps/customer-frontend/src/features/social/pages/MessagesPage.tsx
import { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  fetchChatConversations, 
  createPeerConversation 
} from "../../chat/services/chat.api.service";
import { useSocialChatStore } from "../hooks/useSocialChatStore";
import { ConversationList } from "../components/ConversationList";
import { SocialChatWindow } from "../components/SocialChatWindow";
import { ChatInfoSidebar } from "../components/ChatInfoSidebar";
import { SocialNavSidebar } from "../components/SocialNavSidebar";
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

  // === MOBILE VIEW ===
  if (isMobile) {
    return (
      <div className="relative w-full h-[100dvh] bg-white overflow-hidden flex flex-col pt-[var(--header-height,0px)]"> 
        {/* Mobile có thể cần hoặc không cần padding tùy layout mobile app của bạn */}
        <div className="flex-1 relative w-full h-full">
           <div className="absolute inset-0 pb-16">
              <ConversationList 
                  conversations={conversations} 
                  activeId={activeConversationId} 
                  onSelect={(id) => setSearchParams({ conversationId: id })} 
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
                        onBack={() => { setActiveConversation(null); setSearchParams({}); }} 
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

  // === DESKTOP VIEW ===
  return (
    <div className="flex w-full bg-white h-[100dvh] overflow-hidden relative">
      {/* Sidebar bên trái giữ nguyên full height */}
      <SocialNavSidebar />

      {/* ✅ FIX: Wrap phần content bên phải và thêm pt-16 để tránh Header chính */}
      <div className="flex flex-1 h-full pt-16 min-w-0">
        
        <div className="w-80 xl:w-96 flex-col border-r border-gray-200 h-full bg-white z-10 flex flex-shrink-0">
          <ConversationList 
            conversations={conversations} 
            activeId={activeConversationId} 
            onSelect={(id) => setSearchParams({ conversationId: id })} 
            isLoading={isLoading} 
          />
        </div>

        <div className="flex-1 flex flex-col bg-gray-50 h-full min-w-0 relative">
          {activeConv ? (
            <SocialChatWindow 
              conversation={activeConv} 
              onBack={() => { setActiveConversation(null); setSearchParams({}); }} 
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
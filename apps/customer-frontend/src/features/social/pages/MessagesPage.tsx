// apps/customer-frontend/src/features/social/pages/MessagesPage.tsx
// ✅ UPGRADE: Empty State phong cách "Industrial Print" (Tối giản & Tinh tế)

import { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  fetchChatConversations, 
  createPeerConversation,
  fetchChatHistory
} from "@/features/chat/services/chat.api.service";
import { useSocialChatStore } from "@/features/social/hooks/useSocialChatStore";
import { useMessagesPageStore } from "@/stores/useMessagesPageStore";
import { ConversationList } from "@/features/social/components/ConversationList";
import { SocialChatWindow } from "@/features/social/components/SocialChatWindow";
import { ChatInfoSidebar } from "@/features/social/components/ChatInfoSidebar";
import { SocialNavSidebar } from "@/features/social/components/SocialNavSidebar";
import { 
  MessageSquare, Loader2, ArrowRight, FileUp, Users, Shield
} from "lucide-react"; 
import { useIsMobile } from "@/shared/hooks/useMediaQuery";
import { motion, AnimatePresence } from "framer-motion";
import PageLoader from "@/components/PageLoader"; 
import { cn } from "@/shared/lib/utils";

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
    setMessages,
  } = useSocialChatStore();

  const { hasLoadedMessagesPage, setHasLoadedMessagesPage } = useMessagesPageStore();
  const [isPreloading, setIsPreloading] = useState(false);
  const [showPageLoader, setShowPageLoader] = useState(false);
  const preloadStartTimeRef = useRef<number>(0);
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
    const apiIds = new Set(data.map((c: any) => c._id));
    storeConversations.forEach((storeConv) => {
      if (!apiIds.has(storeConv._id) && 
          ["peer-to-peer", "customer-printer", "group"].includes(storeConv.type || "")) {
        merged.push(storeConv);
      }
    });
    return merged.sort((a: any, b: any) => {
        const tA = new Date(a.lastMessageAt || a.createdAt || 0).getTime();
        const tB = new Date(b.lastMessageAt || b.createdAt || 0).getTime();
        return tB - tA;
    });
  }, [data, storeConversations]);

  useEffect(() => { if (data) syncConversations(data); }, [data, syncConversations]);

  // Preload Logic
  useEffect(() => {
    if (!data || hasLoadedMessagesPage || isPreloading || isLoading) return;

    const preloadMessages = async () => {
      setIsPreloading(true);
      setShowPageLoader(true);
      preloadStartTimeRef.current = Date.now();

      const preloadPromises = data.map(async (conv: any) => {
        try {
          const history = await fetchChatHistory(conv._id, 1, 50);
          if (history.messages && history.messages.length > 0) {
            setMessages(conv._id, history.messages);
            queryClient.setQueryData(["socialMsg", conv._id], history);
          }
        } catch (error) {
          console.warn(`[Preload] Failed: ${conv._id}`, error);
        }
      });

      await Promise.allSettled(preloadPromises);
      
      const elapsed = Date.now() - preloadStartTimeRef.current;
      const remainingTime = Math.max(0, 1500 - elapsed); 

      await new Promise(resolve => setTimeout(resolve, remainingTime));

      setShowPageLoader(false);
      setIsPreloading(false);
      setHasLoadedMessagesPage(true);
    };

    preloadMessages();
  }, [data, hasLoadedMessagesPage, isPreloading, isLoading, setMessages, queryClient, setHasLoadedMessagesPage]);

  // Sync URL
  useEffect(() => {
    if (isLoading) return;
    if (urlConversationId && activeConversationId !== urlConversationId) {
        setActiveConversation(urlConversationId);
    } else if (!urlConversationId && activeConversationId) {
        setActiveConversation(null);
    }
  }, [urlConversationId, activeConversationId, isLoading, setActiveConversation]);

  // Auto Create
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

  if (showPageLoader) {
    return <PageLoader mode="splash" isLoading={true} />;
  }

  // === MOBILE VIEW ===
  if (isMobile) {
    return (
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
               {activeConv ? (
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
    <div className="fixed top-16 bottom-0 left-0 right-0 flex bg-white overflow-hidden z-0">
      <SocialNavSidebar />
      <div className="flex flex-1 h-full min-w-0">
        
        <div className="w-72 lg:w-80 flex-col border-r border-gray-200 h-full bg-white z-10 flex flex-shrink-0 transition-all duration-300">
          <ConversationList 
            conversations={conversations} 
            activeId={activeConversationId} 
            onSelect={(id) => setSearchParams({ conversationId: id }, { replace: true })} 
            isLoading={isLoading} 
          />
        </div>

        <div className="flex-1 flex flex-col bg-white h-full min-w-0 relative">
          {activeConv ? (
            <SocialChatWindow 
              conversation={activeConv} 
              onBack={() => { 
                  setActiveConversation(null); 
                  setSearchParams({}, { replace: true }); 
              }} 
            />
          ) : (
            // ✅ UPGRADED EMPTY STATE: "Industrial Minimalist"
            // Sử dụng class .bg-tech-grid từ globals.css để tạo nền lưới kỹ thuật
            <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden bg-gray-50/30 bg-tech-grid">
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                // Sử dụng .card-tech để tạo hiệu ứng "Phiếu in" với 4 dấu xén
                className="card-tech max-w-md w-full p-10 flex flex-col items-center text-center bg-white/80 backdrop-blur-sm shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
              >
                 {/* Logo / Icon Minimal */}
                 <div className="w-16 h-16 rounded-2xl bg-gray-900 text-white flex items-center justify-center mb-6 shadow-lg shadow-gray-200">
                    <MessageSquare size={32} strokeWidth={1.5} />
                 </div>

                 {/* Typography: Yrsa (Font Heading) */}
                 <h2 className="text-3xl font-heading font-bold text-gray-900 mb-3 tracking-tight">
                    Printz Workspace
                 </h2>
                 <p className="text-gray-500 mb-8 text-[15px] leading-relaxed font-sans">
                    Nền tảng trao đổi thiết kế và quản lý in ấn tập trung. <br/>
                    Chọn một hội thoại để bắt đầu.
                 </p>

                 {/* Feature List: Minimal Grid */}
                 <div className="w-full grid gap-3 text-left">
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-transparent hover:border-blue-100 hover:bg-blue-50/50 transition-all group">
                       <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                          <FileUp size={16} />
                       </div>
                       <div>
                          <div className="text-sm font-bold text-gray-800">File in ấn</div>
                          <div className="text-xs text-gray-500">Gửi file AI, PDF, PSD dung lượng lớn</div>
                       </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-lg border border-transparent hover:border-purple-100 hover:bg-purple-50/50 transition-all group">
                       <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                          <Users size={16} />
                       </div>
                       <div>
                          <div className="text-sm font-bold text-gray-800">Làm việc nhóm</div>
                          <div className="text-xs text-gray-500">Duyệt mẫu và phản hồi trực tiếp</div>
                       </div>
                    </div>
                 </div>

                 {/* Footer Hint */}
                 <div className="mt-8 pt-6 border-t border-gray-100 w-full flex justify-center">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full">
                       <Shield size={12} /> Dữ liệu được mã hóa & bảo vệ
                    </div>
                 </div>

                 {/* CMYK Accent Dots (Tinh tế) */}
                 <div className="absolute bottom-4 right-4 flex gap-1 opacity-40">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#06b6d4]" /> {/* Cyan */}
                    <div className="w-1.5 h-1.5 rounded-full bg-[#d946ef]" /> {/* Magenta */}
                    <div className="w-1.5 h-1.5 rounded-full bg-[#eab308]" /> {/* Yellow */}
                    <div className="w-1.5 h-1.5 rounded-full bg-[#1e293b]" /> {/* Key */}
                 </div>

              </motion.div>
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
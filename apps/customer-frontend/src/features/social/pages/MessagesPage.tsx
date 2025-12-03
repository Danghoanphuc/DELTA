// apps/customer-frontend/src/features/social/pages/MessagesPage.tsx
import { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchChatConversations,
  createPeerConversation,
  fetchChatHistory,
} from "@/features/chat/services/chat.api.service";
import { useSocialChatStore } from "@/features/social/hooks/useSocialChatStore";
import { useMessagesPageStore } from "@/stores/useMessagesPageStore";
import { ConversationList } from "@/features/social/components/ConversationList";
import { SocialChatWindow } from "@/features/social/components/SocialChatWindow";
import { ChatInfoSidebar } from "@/features/social/components/ChatInfoSidebar";
import { SocialNavSidebar } from "@/features/social/components/SocialNavSidebar";
import { Loader2, Users, Search, Sparkles } from "lucide-react";
import { Logo } from "@/shared/components/ui/Logo";
import { useIsMobile } from "@/shared/hooks/useMediaQuery";
import { motion, AnimatePresence } from "framer-motion";
import PageLoader from "@/components/PageLoader";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "@/shared/utils/toast";

export default function MessagesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const targetUserId = searchParams.get("userId");
  const urlConversationId = searchParams.get("conversationId");

  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

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

  const { hasLoadedMessagesPage, setHasLoadedMessagesPage } =
    useMessagesPageStore();
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
      return res.filter((c: any) =>
        ["peer-to-peer", "customer-printer", "group"].includes(c.type)
      );
    },
    staleTime: 60000,
  });

  const conversations = useMemo(() => {
    if (!data) return storeConversations;

    // Merge API data with store data (for optimistic updates)
    const merged = [...data];
    const apiIds = new Set(data.map((c: any) => c._id));

    // Add store-only conversations (newly created, not yet in API response)
    storeConversations.forEach((storeConv) => {
      if (
        !apiIds.has(storeConv._id) &&
        ["peer-to-peer", "customer-printer", "group"].includes(
          storeConv.type || ""
        )
      ) {
        merged.push(storeConv);
      }
    });

    // Deduplicate by _id (keep first occurrence)
    const seen = new Set<string>();
    const unique = merged.filter((conv) => {
      if (seen.has(conv._id)) return false;
      seen.add(conv._id);
      return true;
    });

    // Sort by lastMessageAt or createdAt
    return unique.sort((a: any, b: any) => {
      const tA = new Date(a.lastMessageAt || a.createdAt || 0).getTime();
      const tB = new Date(b.lastMessageAt || b.createdAt || 0).getTime();
      return tB - tA;
    });
  }, [data, storeConversations]);

  useEffect(() => {
    if (data) syncConversations(data);
  }, [data, syncConversations]);

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

      await new Promise((resolve) => setTimeout(resolve, remainingTime));

      setShowPageLoader(false);
      setIsPreloading(false);
      setHasLoadedMessagesPage(true);
    };

    preloadMessages();
  }, [
    data,
    hasLoadedMessagesPage,
    isPreloading,
    isLoading,
    setMessages,
    queryClient,
    setHasLoadedMessagesPage,
  ]);

  // Sync URL
  useEffect(() => {
    if (isLoading) return;
    if (urlConversationId && activeConversationId !== urlConversationId) {
      setActiveConversation(urlConversationId);
    } else if (!urlConversationId && activeConversationId) {
      setActiveConversation(null);
    }
  }, [
    urlConversationId,
    activeConversationId,
    isLoading,
    setActiveConversation,
  ]);

  // Auto Create
  useEffect(() => {
    if (
      targetUserId &&
      !isCreating &&
      !creatingConversationRef.current.has(targetUserId) &&
      !urlConversationId
    ) {
      const existing = conversations.find((c: any) =>
        c.participants?.some(
          (p: any) => (p.userId?._id || p.userId) === targetUserId
        )
      );
      if (existing) {
        setSearchParams({ conversationId: existing._id }, { replace: true });
      } else {
        setIsCreating(true);
        creatingConversationRef.current.add(targetUserId);
        createPeerConversation(targetUserId)
          .then((res) => {
            if (res.data?.conversation) {
              addConversation(res.data.conversation);
              setSearchParams(
                { conversationId: res.data.conversation._id },
                { replace: true }
              );
              queryClient.invalidateQueries({
                queryKey: ["socialConversations"],
              });
            }
          })
          .finally(() => {
            setIsCreating(false);
            creatingConversationRef.current.delete(targetUserId);
          });
      }
    }
  }, [
    targetUserId,
    conversations,
    isCreating,
    addConversation,
    setSearchParams,
    queryClient,
    urlConversationId,
  ]);

  const activeConv = conversations.find((c) => c._id === activeConversationId);

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
              onSelect={(id) =>
                setSearchParams({ conversationId: id }, { replace: true })
              }
              isLoading={isLoading}
            />
          </div>
        </div>
        <AnimatePresence>
          {activeConversationId && (
            <motion.div
              key="mobile-chat-window"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
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
                      <ChatInfoSidebar
                        conversation={activeConv}
                        onClose={() => setInfoSidebarOpen(false)}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <Loader2 className="animate-spin" />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // === DESKTOP VIEW (FIXED LAYOUT - WORKSPACE MODE) ===
  return (
    // ✅ FIXED: inset-0 để full màn hình, bỏ top-16/64px vì đã kill Header
    <div className="fixed inset-0 flex bg-white overflow-hidden z-0">
      <SocialNavSidebar />
      <div className="flex flex-1 h-full min-w-0">
        {/* Sidebar Danh sách hội thoại */}
        <div className="w-72 lg:w-80 flex-col border-r border-stone-200 h-full bg-white z-10 flex flex-shrink-0 transition-all duration-300">
          <ConversationList
            conversations={conversations}
            activeId={activeConversationId}
            onSelect={(id) =>
              setSearchParams({ conversationId: id }, { replace: true })
            }
            isLoading={isLoading}
          />
        </div>

        {/* Main Content Area */}
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
            // ✨ THE CREATIVE LOBBY
            <div className="relative flex flex-1 flex-col items-center justify-center bg-[#FAFAF9] overflow-hidden">
              <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-multiply pointer-events-none" />

              <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-stone-200/30 blur-3xl mix-blend-multiply filter" />
              <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-orange-100/30 blur-3xl mix-blend-multiply filter" />

              <div className="z-10 flex w-full max-w-3xl flex-col items-center px-6 text-center">
                <div className="mb-8 flex h-32 w-32 items-center justify-center rounded-[32px] bg-white shadow-2xl shadow-stone-200/50 ring-1 ring-stone-100">
                  <Logo variant="symbol" className="scale-150" />
                </div>

                <h2 className="mb-3 font-serif text-4xl font-medium text-stone-900 md:text-5xl tracking-tight">
                  Xin chào, {user?.displayName?.split(" ").pop() || "Bạn mới"}
                </h2>
                <p className="mb-12 max-w-lg font-sans text-lg font-light text-stone-500 leading-relaxed">
                  Chào mừng trở lại{" "}
                  <span className="font-medium text-stone-800">
                    Printz Workspace
                  </span>
                  .
                  <br /> Hôm nay chúng ta sẽ kiến tạo điều gì?
                </p>

                <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
                  <button
                    onClick={() =>
                      document
                        .querySelector<HTMLButtonElement>(
                          '[data-action="create-group"]'
                        )
                        ?.click() ||
                      toast.info("Vui lòng dùng menu bên trái để tạo nhóm")
                    }
                    className="group flex flex-col items-center justify-center gap-3 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-stone-300 hover:shadow-lg"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-50 text-stone-600 transition-colors group-hover:bg-stone-900 group-hover:text-white">
                      <Users size={20} />
                    </div>
                    <div className="text-center">
                      <h3 className="font-bold text-stone-900 text-sm">
                        Tạo nhóm mới
                      </h3>
                      <p className="text-xs text-stone-400 mt-1">
                        Thảo luận & Duyệt mẫu
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => navigate("/friends")}
                    className="group flex flex-col items-center justify-center gap-3 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-stone-300 hover:shadow-lg"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-50 text-stone-600 transition-colors group-hover:bg-primary group-hover:text-white">
                      <Search size={20} />
                    </div>
                    <div className="text-center">
                      <h3 className="font-bold text-stone-900 text-sm">
                        Tìm đối tác
                      </h3>
                      <p className="text-xs text-stone-400 mt-1">
                        Mở rộng mạng lưới
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => navigate("/chat")}
                    className="group flex flex-col items-center justify-center gap-3 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-amber-200 hover:shadow-lg"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600 transition-colors group-hover:bg-amber-500 group-hover:text-white">
                      <Sparkles size={20} />
                    </div>
                    <div className="text-center">
                      <h3 className="font-bold text-stone-900 text-sm">
                        Zin Assistant
                      </h3>
                      <p className="text-xs text-stone-400 mt-1">
                        Hỗ trợ ý tưởng 24/7
                      </p>
                    </div>
                  </button>
                </div>

                <div className="mt-16 flex items-center gap-3 opacity-40 mix-blend-luminosity">
                  <span className="h-px w-12 bg-stone-400"></span>
                  <span className="font-serif text-xs italic text-stone-500">
                    "Design is intelligence made visible."
                  </span>
                  <span className="h-px w-12 bg-stone-400"></span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Thông tin hội thoại */}
        {activeConv && isInfoSidebarOpen && (
          <div className="w-[350px] border-l border-stone-200 h-full bg-white flex-shrink-0 shadow-xl z-20">
            <ChatInfoSidebar
              conversation={activeConv}
              onClose={() => setInfoSidebarOpen(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

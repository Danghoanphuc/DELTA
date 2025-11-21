// apps/customer-frontend/src/features/social/components/SocialChatWindow.tsx
// ✅ FIXED: Header mới, nút Info toggle sidebar

import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Send, Paperclip, Loader2, Info, Phone, Video } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  fetchChatHistory,
  postSocialChatMessage,
} from "../../chat/services/chat.api.service";
import { useSocialChatStore } from "../hooks/useSocialChatStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/shared/lib/utils";
import { toast } from "sonner";
import type { ChatMessage } from "@/types/chat";

export function SocialChatWindow({
  conversation,
  onBack,
}: {
  conversation: any;
  onBack: () => void;
}) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const currentUser = useAuthStore((s) => s.user);

  const {
    messagesByConversation,
    setMessages,
    addMessage,
    updateMessageId,
    markAsRead,
    toggleInfoSidebar, // ✅ Lấy hàm toggle
    isInfoSidebarOpen,
    scrollToMessageId,
    setScrollToMessageId, // ✅ Lấy hàm để clear scrollToMessageId sau khi scroll
  } = useSocialChatStore();

  // 1. Lấy tin nhắn
  const messages: ChatMessage[] =
    messagesByConversation[conversation._id] || [];

  // 2. Fetch lịch sử
  const { data, isLoading: isLoadingHistory, refetch } = useQuery({
    queryKey: ["socialMsg", conversation._id],
    queryFn: () => fetchChatHistory(conversation._id, 1, 50),
    staleTime: 0, // ✅ FIXED: Set về 0 để luôn refetch khi conversation thay đổi
    refetchOnWindowFocus: true, // ✅ FIXED: Refetch khi focus lại tab
    refetchOnMount: true, // ✅ FIXED: Refetch khi component mount
    enabled: !!conversation._id, // ✅ FIXED: Chỉ fetch khi có conversationId
  });
  
  // ✅ FIXED: Refetch messages khi conversation thay đổi
  // Sử dụng ref để tránh refetch liên tục
  const lastConversationIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (conversation._id && lastConversationIdRef.current !== conversation._id) {
      lastConversationIdRef.current = conversation._id;
      // ✅ FIXED: Luôn refetch khi conversation thay đổi để đảm bảo có data mới nhất
      refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation._id]); // ✅ Loại bỏ refetch khỏi dependencies để tránh loop

  useEffect(() => {
    if (data?.messages) {
      setMessages(conversation._id, data.messages);
    }
  }, [data, conversation._id, setMessages]);

  // 3. Scroll Logic
  useLayoutEffect(() => {
    setIsReady(false);
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "auto" });
    }
    const t = setTimeout(() => setIsReady(true), 50);
    return () => clearTimeout(t);
  }, [conversation._id]);

  useEffect(() => {
    if (isReady && messages.length > 0) {
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
    markAsRead(conversation._id);
  }, [messages.length, conversation._id, markAsRead, isReady]);

  // ✅ NEW: Scroll to message khi scrollToMessageId thay đổi
  useEffect(() => {
    if (scrollToMessageId && messageRefs.current[scrollToMessageId]) {
      const messageElement = messageRefs.current[scrollToMessageId];
      if (messageElement) {
        setTimeout(() => {
          messageElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
          // Highlight message briefly
          messageElement.classList.add("ring-2", "ring-blue-500", "ring-offset-2");
          setTimeout(() => {
            messageElement.classList.remove("ring-2", "ring-blue-500", "ring-offset-2");
          }, 2000);
        }, 100);
        // Clear scrollToMessageId sau khi scroll
        setScrollToMessageId(null);
      }
    }
  }, [scrollToMessageId, setScrollToMessageId]);

  // Handle Send
  const handleSend = async () => {
    if (!text.trim() || sending) return;
    const content = text.trim();
    setText("");
    setSending(true);

    const tempId = `temp-${Date.now()}`;
    const tempMsg: ChatMessage = {
      _id: tempId,
      conversationId: conversation._id,
      senderType: "User",
      sender: currentUser?._id,
      type: "text",
      content: { text: content },
      createdAt: new Date().toISOString(),
      status: "sending",
    };

    addMessage(conversation._id, tempMsg);
    setTimeout(
      () => scrollRef.current?.scrollIntoView({ behavior: "smooth" }),
      50
    );

    try {
      const res = await postSocialChatMessage(content, conversation._id);
      if (res) {
        const realMsg: ChatMessage = {
          ...res,
          sender: res.sender ?? currentUser?._id,
          status: "sent",
        };
        updateMessageId(conversation._id, tempId, realMsg);
      }
    } catch (e) {
      toast.error("Gửi thất bại");
      setText(content);
    } finally {
      setSending(false);
    }
  };

  // ✅ FIXED: Xử lý cả group chat và peer-to-peer
  const isGroup = conversation.type === "group";
  const partner = isGroup
    ? null // Group không có partner duy nhất
    : conversation.participants.find(
        (p: any) => (p.userId?._id || p.userId) !== currentUser?._id
      )?.userId || {};

  return (
    <div className="flex flex-col h-full w-full bg-white relative">
      {/* Header Cải tiến */}
      <div className="flex-shrink-0 h-16 px-4 border-b flex items-center justify-between bg-white shadow-sm z-20">
        <div className="flex items-center gap-3">
          {/* Nút Back (Mobile) */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden -ml-2 text-gray-600"
            onClick={onBack}
          >
            <ArrowLeft />
          </Button>
          
          {/* ✅ FIXED: Avatar cho group hoặc peer */}
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center overflow-hidden ring-2",
            isGroup 
              ? "bg-gradient-to-br from-orange-400 to-pink-500 ring-orange-100" 
              : "bg-blue-100 ring-blue-50"
          )}>
            {isGroup ? (
              <span className="text-white font-bold text-sm">
                {conversation.title?.[0]?.toUpperCase() || "G"}
              </span>
            ) : partner?.avatarUrl ? (
              <img
                src={partner.avatarUrl}
                className="w-full h-full object-cover"
                alt="Avatar"
              />
            ) : (
              <span className="font-bold text-blue-600">
                {partner?.username?.[0] || "?"}
              </span>
            )}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm sm:text-base">
              {isGroup 
                ? conversation.title || "Nhóm chat"
                : partner?.displayName || partner?.username || "Người dùng"}
            </h3>
            {!isGroup && (
              <div className="flex items-center gap-1.5 text-xs text-green-600">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />{" "}
                Đang hoạt động
              </div>
            )}
            {isGroup && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                {conversation.participants?.length || 0} thành viên
              </div>
            )}
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-1">
           <Button variant="ghost" size="icon" className="text-blue-600 hidden sm:flex hover:bg-blue-50">
               <Phone size={20} />
           </Button>
           <Button variant="ghost" size="icon" className="text-blue-600 hidden sm:flex hover:bg-blue-50">
               <Video size={20} />
           </Button>
           <div className="w-px h-6 bg-gray-200 mx-1 hidden sm:block"/>
           
           {/* ✅ Toggle Info Sidebar */}
           <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleInfoSidebar}
              className={cn("text-gray-500 hover:bg-blue-50 hover:text-blue-600", isInfoSidebarOpen && "bg-blue-50 text-blue-600")}
            >
               <Info size={20} />
           </Button>
        </div>
      </div>

      {/* Message List */}
      <div
        ref={containerRef}
        className={cn(
          "flex-1 min-h-0 overflow-y-auto p-4 space-y-4 bg-gray-50/50 transition-opacity duration-200",
          isReady ? "opacity-100" : "opacity-0"
        )}
      >
        {messages.map((msg: any) => {
          const isMe = (msg.sender?._id || msg.sender) === currentUser?._id;
          return (
            <div
              key={msg._id}
              ref={(el) => {
                if (msg._id) {
                  messageRefs.current[msg._id] = el;
                }
              }}
              className={cn(
                "flex w-full transition-all duration-300",
                isMe ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[75%] px-4 py-2 rounded-2xl text-sm shadow-sm whitespace-pre-wrap break-words group relative",
                  isMe
                    ? "bg-blue-600 text-white rounded-tr-sm"
                    : "bg-white border border-gray-200 text-gray-900 rounded-tl-sm",
                  msg.status === "sending" && "opacity-70"
                )}
              >
                {msg.content?.text}
                <div
                  className={cn(
                    "text-[10px] mt-1 text-right flex items-center justify-end gap-1",
                    isMe ? "text-blue-200" : "text-gray-400"
                  )}
                >
                  {msg.createdAt &&
                    formatDistanceToNow(new Date(msg.createdAt), {
                      addSuffix: true,
                      locale: vi,
                    })}
                  {msg.status === "sending" && (
                    <Loader2 size={8} className="animate-spin" />
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} className="h-px w-full" />
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 p-3 bg-white border-t">
        <div className="flex items-end gap-2 bg-gray-100 p-2 rounded-2xl border border-transparent focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition-all">
          <Button
            size="icon"
            variant="ghost"
            className="text-gray-400 hover:text-gray-600 rounded-full h-9 w-9"
          >
            <Paperclip size={18} />
          </Button>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" &&
              !e.shiftKey &&
              (e.preventDefault(), handleSend())
            }
            placeholder="Nhập tin nhắn..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 max-h-32 resize-none"
            rows={1}
            style={{ minHeight: "36px" }}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!text.trim() || sending}
            className={cn(
              "rounded-full h-9 w-9 transition-all",
              text.trim()
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-gray-300 text-gray-500"
            )}
          >
            {sending ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Send size={16} />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
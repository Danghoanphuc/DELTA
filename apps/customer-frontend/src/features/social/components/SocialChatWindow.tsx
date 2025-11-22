// apps/customer-frontend/src/features/social/components/SocialChatWindow.tsx
import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Send, Paperclip, Loader2, Info, Phone, Video, Smile } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { fetchChatHistory, postSocialChatMessage } from "../../chat/services/chat.api.service";
import { useSocialChatStore } from "../hooks/useSocialChatStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/shared/lib/utils";
import { toast } from "sonner";
import type { ChatMessage } from "@/types/chat";
import { motion, AnimatePresence } from "framer-motion";

// ✅ SOUND ASSETS
const SOUND_SEND = "/sounds/message-send-.mp3";
const SOUND_RECEIVE = "/sounds/happy.mp3";

// ✅ Hook mới: Xử lý chiều cao viewport động cho Mobile Keyboard
function useVisualViewport() {
  const [viewportHeight, setViewportHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return;

    const handleResize = () => {
      setViewportHeight(window.visualViewport?.height);
    };

    window.visualViewport.addEventListener('resize', handleResize);
    handleResize();

    return () => window.visualViewport?.removeEventListener('resize', handleResize);
  }, []);

  return viewportHeight;
}

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
  
  // ✅ Refs cho Audio
  const sendAudioRef = useRef<HTMLAudioElement | null>(null);
  const receiveAudioRef = useRef<HTMLAudioElement | null>(null);
  
  // ✅ Ref để theo dõi số lượng tin nhắn (để biết khi nào có tin mới)
  const prevMessagesLengthRef = useRef<number>(0);

  const visualHeight = useVisualViewport();
  const currentUser = useAuthStore((s) => s.user);

  const {
    messagesByConversation,
    setMessages,
    addMessage,
    updateMessageId,
    markAsRead,
    toggleInfoSidebar,
    isInfoSidebarOpen,
    scrollToMessageId,
    setScrollToMessageId,
  } = useSocialChatStore();

  const messages: ChatMessage[] = messagesByConversation[conversation._id] || [];

  // ✅ Init Audio
  useEffect(() => {
    sendAudioRef.current = new Audio(SOUND_SEND);
    sendAudioRef.current.volume = 0.5;
    
    receiveAudioRef.current = new Audio(SOUND_RECEIVE);
    receiveAudioRef.current.volume = 0.6;
  }, []);

  const { data, refetch } = useQuery({
    queryKey: ["socialMsg", conversation._id],
    queryFn: () => fetchChatHistory(conversation._id, 1, 50),
    staleTime: 0,
    refetchOnWindowFocus: true,
    enabled: !!conversation._id,
  });
  
  const lastConversationIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (conversation._id && lastConversationIdRef.current !== conversation._id) {
      lastConversationIdRef.current = conversation._id;
      refetch();
    }
  }, [conversation._id]);

  useEffect(() => {
    if (data?.messages) {
      setMessages(conversation._id, data.messages);
      // Reset ref đếm tin nhắn khi load lại hội thoại khác
      prevMessagesLengthRef.current = data.messages.length;
    }
  }, [data, conversation._id, setMessages]);

  useLayoutEffect(() => {
    setIsReady(false);
    if (scrollRef.current) scrollRef.current.scrollIntoView({ behavior: "auto" });
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

  // ✅ NEW: Effect xử lý âm thanh nhận tin nhắn
  useEffect(() => {
    if (!isReady) return; // Không phát khi mới load trang

    // Nếu số lượng tin nhắn tăng lên
    if (messages.length > prevMessagesLengthRef.current) {
        const lastMsg = messages[messages.length - 1];
        
        // Kiểm tra: Nếu tin nhắn mới KHÔNG PHẢI của mình -> Phát âm thanh nhận
        const senderId = typeof lastMsg.sender === 'string' ? lastMsg.sender : lastMsg.sender?._id;
        const isMe = senderId === currentUser?._id;
        if (!isMe) {
            receiveAudioRef.current?.play().catch(() => {});
        }
    }
    
    // Update ref
    prevMessagesLengthRef.current = messages.length;
  }, [messages, currentUser?._id, isReady]);


  useEffect(() => {
    if (scrollToMessageId && messageRefs.current[scrollToMessageId]) {
      const messageElement = messageRefs.current[scrollToMessageId];
      if (messageElement) {
        setTimeout(() => {
          messageElement.scrollIntoView({ behavior: "smooth", block: "center" });
          messageElement.classList.add("ring-2", "ring-blue-500", "ring-offset-2");
          setTimeout(() => messageElement.classList.remove("ring-2", "ring-blue-500", "ring-offset-2"), 2000);
        }, 100);
        setScrollToMessageId(null);
      }
    }
  }, [scrollToMessageId, setScrollToMessageId]);

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    
    // ✅ NEW: Phát âm thanh gửi
    sendAudioRef.current?.play().catch(() => {});

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
    
    // Cập nhật ref ngay để tránh effect "nhận tin" phát âm thanh nhầm (dù đã có check isMe)
    prevMessagesLengthRef.current += 1; 

    setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 50);

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

  const isGroup = conversation.type === "group";
  const partner = isGroup
    ? null
    : conversation.participants.find(
        (p: any) => (p.userId?._id || p.userId) !== currentUser?._id
      )?.userId || {};

  return (
    <div 
      className="flex flex-col w-full bg-[#FDFDFD] relative overflow-hidden"
      style={{ height: visualHeight ? `${visualHeight}px` : '100%' }}
    >
      
      {/* === HEADER (Sticky) === */}
      <div className="flex-shrink-0 h-16 px-4 border-b border-gray-100 flex items-center justify-between bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="icon" className="lg:hidden -ml-2 text-gray-600 hover:bg-gray-100 rounded-full shrink-0" onClick={onBack}>
            <ArrowLeft size={22} />
          </Button>
          
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center overflow-hidden ring-2 shadow-sm shrink-0",
            isGroup 
              ? "bg-gradient-to-br from-orange-400 to-pink-500 ring-orange-100" 
              : "bg-blue-50 ring-blue-50"
          )}>
            {isGroup ? (
              <span className="text-white font-bold text-sm">{conversation.title?.[0]?.toUpperCase() || "G"}</span>
            ) : partner?.avatarUrl ? (
              <img src={partner.avatarUrl} className="w-full h-full object-cover" alt="Avatar" />
            ) : (
              <span className="font-bold text-blue-600">{partner?.username?.[0] || "?"}</span>
            )}
          </div>
          
          <div className="cursor-pointer min-w-0 flex-1" onClick={toggleInfoSidebar}>
            <h3 className="font-bold text-gray-900 text-sm sm:text-base hover:text-blue-600 transition-colors truncate">
              {isGroup ? conversation.title || "Nhóm chat" : partner?.displayName || partner?.username || "Người dùng"}
            </h3>
            {!isGroup && (
              <div className="flex items-center gap-1.5 text-xs text-green-600 truncate">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Đang hoạt động
              </div>
            )}
            {isGroup && <div className="text-xs text-gray-500 truncate">{conversation.participants?.length || 0} thành viên</div>}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
           <Button variant="ghost" size="icon" className="text-blue-600 hidden sm:flex hover:bg-blue-50 rounded-full"><Phone size={20} /></Button>
           <Button variant="ghost" size="icon" className="text-blue-600 hidden sm:flex hover:bg-blue-50 rounded-full"><Video size={20} /></Button>
           <div className="w-px h-6 bg-gray-200 mx-1 hidden sm:block"/>
           <Button 
              variant="ghost" size="icon" onClick={toggleInfoSidebar}
              className={cn("text-gray-500 hover:bg-blue-50 hover:text-blue-600 rounded-full transition-all", isInfoSidebarOpen && "bg-blue-50 text-blue-600 shadow-inner")}
            >
               <Info size={20} />
           </Button>
        </div>
      </div>

      {/* === MESSAGE LIST === */}
      <div
        ref={containerRef}
        className={cn(
          "flex-1 overflow-y-auto p-4 space-y-1 transition-opacity duration-200 custom-scrollbar",
          isReady ? "opacity-100" : "opacity-0",
          "pb-24" 
        )}
        style={{ scrollBehavior: "smooth" }}
      >
        <AnimatePresence initial={false}>
        {messages.map((msg: any, index) => {
          const msgSenderId = typeof msg.sender === 'string' ? msg.sender : msg.sender?._id;
          const isMe = msgSenderId === currentUser?._id;
          const prevMsg = messages[index - 1];
          const prevSenderId = prevMsg ? (typeof prevMsg.sender === 'string' ? prevMsg.sender : prevMsg.sender?._id) : null;
          const isSameSender = prevMsg && prevSenderId === msgSenderId;

          return (
            <motion.div
              key={msg._id}
              id={`msg-${msg._id}`}
              ref={(el) => { if (msg._id) messageRefs.current[msg._id] = el; }}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.2 }}
              className={cn("flex w-full", isMe ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[75%] px-4 py-2.5 text-sm shadow-sm whitespace-pre-wrap break-words relative group",
                  isMe
                    ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white"
                    : "bg-white border border-gray-100 text-gray-800",
                  isMe 
                    ? cn("rounded-2xl rounded-tr-sm", isSameSender && "rounded-tr-2xl") 
                    : cn("rounded-2xl rounded-tl-sm", isSameSender && "rounded-tl-2xl"),
                  msg.status === "sending" && "opacity-70"
                )}
              >
                {msg.content?.text}
                <div className={cn(
                    "text-[9px] mt-1 text-right flex items-center justify-end gap-1 select-none",
                    isMe ? "text-blue-100/80" : "text-gray-400"
                  )}>
                  {msg.createdAt && formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true, locale: vi })}
                  {msg.status === "sending" && <Loader2 size={8} className="animate-spin" />}
                </div>
              </div>
            </motion.div>
          );
        })}
        </AnimatePresence>
        <div ref={scrollRef} className="h-px w-full" />
      </div>

      {/* === INPUT AREA (Absolute Bottom) === */}
      <div className="absolute bottom-0 left-0 right-0 z-40 p-3 bg-gradient-to-t from-white via-white/95 to-transparent pt-6">
        <div className="flex items-end gap-2 bg-white p-2 pr-3 rounded-[24px] shadow-[0_4px_20px_rgb(0,0,0,0.08)] border border-gray-200 ring-1 ring-gray-100">
          
          <div className="flex gap-1">
             <Button size="icon" variant="ghost" className="text-blue-500 hover:bg-blue-50 rounded-full h-10 w-10 transition-colors">
               <Paperclip size={20} />
             </Button>
             <Button size="icon" variant="ghost" className="text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 rounded-full h-10 w-10 hidden sm:flex transition-colors">
               <Smile size={20} />
             </Button>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
            placeholder="Nhập tin nhắn..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-3 max-h-32 resize-none placeholder:text-gray-400"
            rows={1}
            style={{ minHeight: "44px" }}
          />
          
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!text.trim() || sending}
            className={cn(
              "rounded-full h-10 w-10 transition-all duration-300 shadow-md",
              text.trim()
                ? "bg-blue-600 hover:bg-blue-700 text-white hover:scale-105"
                : "bg-gray-100 text-gray-400"
            )}
          >
            {sending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} className={cn(text.trim() && "ml-0.5")} />}
          </Button>
        </div>
      </div>
    </div>
  );
}
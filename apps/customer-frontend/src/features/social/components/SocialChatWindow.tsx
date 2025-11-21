// apps/customer-frontend/src/features/social/components/SocialChatWindow.tsx
// ✅ FIXED: Scroll Glitch & Real-time Update (Passive Mode)

import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Send, Paperclip, Loader2 } from "lucide-react";
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
  const [isReady, setIsReady] = useState(false); // ✅ Trạng thái sẵn sàng hiển thị

  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentUser = useAuthStore((s) => s.user);

  const {
    messagesByConversation,
    setMessages,
    addMessage,
    updateMessageId,
    markAsRead,
  } = useSocialChatStore();

  // 1. Lấy tin nhắn từ Store (Đã được Sync cập nhật realtime)
  const messages: ChatMessage[] =
    messagesByConversation[conversation._id] || [];

  // 2. Fetch lịch sử (Fetch ngầm để backfill dữ liệu cũ)
  const { data } = useQuery({
    queryKey: ["socialMsg", conversation._id],
    queryFn: () => fetchChatHistory(conversation._id, 1, 50),
    staleTime: Infinity, // Không bao giờ tự refetch cũ đè mới
    refetchOnWindowFocus: false,
  });

  // Merge lịch sử vào Store
  useEffect(() => {
    if (data?.messages) {
      setMessages(conversation._id, data.messages);
    }
  }, [data, conversation._id, setMessages]);

  // 3. XỬ LÝ CUỘN THÔNG MINH (FIX LỖI NHẢY)

  // A. Khi mới vào hoặc đổi conversation: Cuộn xuống đáy NGAY LẬP TỨC (không animation)
  useLayoutEffect(() => {
    setIsReady(false); // Tạm ẩn để tính toán
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "auto" });
    }
    // Sau 50ms mới hiện ra để user thấy là đã ở đáy rồi -> Cảm giác mượt
    const t = setTimeout(() => setIsReady(true), 50);
    return () => clearTimeout(t);
  }, [conversation._id]);

  // B. Khi có tin nhắn mới: Cuộn mượt (Smooth)
  useEffect(() => {
    if (isReady && messages.length > 0) {
      // Chỉ cuộn nếu user đang ở gần đáy (tránh user đang đọc tin cũ bị kéo xuống)
      // Hoặc đơn giản là luôn cuộn khi có tin mới (như Messenger)
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
    // Mark read luôn chạy khi list thay đổi
    markAsRead(conversation._id);
  }, [messages.length, conversation._id, markAsRead, isReady]);

  // --- Logic Gửi tin (Giữ nguyên) ---
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

    // Force scroll khi mình gửi
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

  const partner =
    conversation.participants.find(
      (p: any) => (p.userId?._id || p.userId) !== currentUser?._id
    )?.userId || {};

  return (
    <div className="flex flex-col h-full w-full bg-white">
      {/* Header */}
      <div className="flex-shrink-0 h-16 px-4 border-b flex items-center gap-3 bg-white shadow-sm z-10">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onBack}
        >
          <ArrowLeft />
        </Button>
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
          {partner.avatarUrl ? (
            <img
              src={partner.avatarUrl}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="font-bold text-blue-600">
              {partner.username?.[0]}
            </span>
          )}
        </div>
        <div>
          <h3 className="font-bold text-gray-900">
            {partner.displayName || partner.username}
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-green-600">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />{" "}
            Đang hoạt động
          </div>
        </div>
      </div>

      {/* Message List - Thêm ref container */}
      <div
        ref={containerRef}
        className={cn(
          "flex-1 min-h-0 overflow-y-auto p-4 space-y-4 bg-gray-50/50 transition-opacity duration-200",
          isReady ? "opacity-100" : "opacity-0" // ✅ FIX: Ẩn khi đang tính toán cuộn
        )}
      >
        {messages.map((msg: any) => {
          const isMe = (msg.sender?._id || msg.sender) === currentUser?._id;
          return (
            <div
              key={msg._id}
              className={cn(
                "flex w-full",
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
        {/* Ref để cuộn xuống đáy */}
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

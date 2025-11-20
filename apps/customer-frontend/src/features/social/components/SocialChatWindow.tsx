// apps/customer-frontend/src/features/social/components/SocialChatWindow.tsx
// ✅ FIXED: Smart Merge Messages (Fix lỗi mất tin nhắn mới khi quay lại)

import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import type { ChatConversation, ChatMessage } from "@/types/chat";
import {
  fetchChatHistory,
  postChatMessage,
} from "../../chat/services/chat.api.service";
import { useSocialChatStore } from "../hooks/useSocialChatStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useSocket } from "@/contexts/SocketProvider";
import { toast } from "sonner";
import { cn } from "@/shared/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface SocialChatWindowProps {
  conversation: ChatConversation;
  onBack: () => void;
}

export function SocialChatWindow({
  conversation,
  onBack,
}: SocialChatWindowProps) {
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentUser = useAuthStore((state) => state.user);
  const { socket } = useSocket();

  const {
    messagesByConversation,
    setMessages,
    addMessage,
    markAsRead,
    typingUsers,
    setTyping,
  } = useSocialChatStore();

  const messages = messagesByConversation[conversation._id] || [];
  const typingInThisConv = typingUsers[conversation._id] || [];

  // 1. Load messages từ API
  const { data, isLoading } = useQuery({
    queryKey: ["socialMessages", conversation._id],
    queryFn: () => fetchChatHistory(conversation._id, 1, 50),
    enabled: !!conversation._id,
    staleTime: 0, // ✅ Luôn coi dữ liệu là cũ để fetch mới nhất khi quay lại
  });

  // 2. Sync messages (Giờ dùng hàm Merge thông minh trong Store)
  useEffect(() => {
    if (data?.messages) {
      setMessages(conversation._id, data.messages);
      markAsRead(conversation._id);
    }
  }, [data, conversation._id, setMessages, markAsRead]);

  // 3. Socket Listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: ChatMessage) => {
      if (message.conversationId === conversation._id) {
        // Store đã có check trùng, cứ add thoải mái
        addMessage(conversation._id, message);
        markAsRead(conversation._id);
        scrollToBottom();
      }
    };

    const handlePartnerTyping = (data: any) => {
      if (
        data.conversationId === conversation._id &&
        data.userId !== currentUser?._id
      ) {
        setTyping(
          conversation._id,
          data.userId,
          data.userName || "Người dùng",
          data.isTyping
        );
      }
    };

    socket.on("new_message", handleNewMessage);
    socket.on("partner_typing", handlePartnerTyping);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("partner_typing", handlePartnerTyping);
    };
  }, [
    socket,
    conversation._id,
    currentUser?._id,
    addMessage,
    markAsRead,
    setTyping,
  ]);

  // 4. Auto scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 5. Typing Logic
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const handleTyping = () => {
    if (!socket || !conversation.participants || !currentUser?._id) return;
    const recipient = conversation.participants.find(
      (p: any) => {
        const userId = typeof p.userId === "object" ? p.userId?._id : p.userId;
        return userId !== currentUser._id;
      }
    ) as any;
    const recipientId = recipient 
      ? (typeof recipient.userId === "object" ? recipient.userId?._id : recipient.userId)
      : null;
    if (!recipientId) return;
    socket.emit("typing_start", {
      conversationId: conversation._id,
      recipientId,
    });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing_stop", {
        conversationId: conversation._id,
        recipientId,
      });
    }, 2000);
  };

  // 6. Handle Send
  const handleSend = async () => {
    if (!inputValue.trim() || isSending) return;
    const messageText = inputValue.trim();
    setInputValue("");
    setIsSending(true);

    try {
      const response = await postChatMessage(messageText, conversation._id);
      if (response) {
        const newMessage: ChatMessage = {
          ...response,
          senderType: "User",
          createdAt: new Date().toISOString(),
          status: "sent",
        } as ChatMessage;
        addMessage(conversation._id, newMessage);
        scrollToBottom();
      }

      // Stop typing
      if (socket && conversation.participants && currentUser?._id) {
        const recipient = conversation.participants.find(
          (p: any) => {
            const userId = typeof p.userId === "object" ? p.userId?._id : p.userId;
            return userId !== currentUser._id;
          }
        ) as any;
        const recipientId = recipient 
          ? (typeof recipient.userId === "object" ? recipient.userId?._id : recipient.userId)
          : null;
        if (recipientId) {
          socket.emit("typing_stop", {
            conversationId: conversation._id,
            recipientId,
          });
        }
      }
    } catch (error: any) {
      toast.error("Gửi lỗi");
      setInputValue(messageText);
    } finally {
      setIsSending(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white flex-shrink-0">
        <button
          onClick={onBack}
          className="lg:hidden p-2 -ml-2 hover:bg-gray-100 rounded-full transition"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-bold">
          {conversation.title?.[0]?.toUpperCase() || "?"}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-gray-900 truncate">
            {conversation.title}
          </h2>
          <p className="text-xs text-gray-500">
            {typingInThisConv.length > 0
              ? `${typingInThisConv[0].userName} đang gõ...`
              : conversation.type === "ai"
              ? "AI Assistant"
              : "Đang hoạt động"}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 w-full">
        {isLoading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 size={32} className="animate-spin text-gray-400" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            Bắt đầu trò chuyện!
          </div>
        ) : (
          messages.map((message) => {
            // ChatMessage không có sender property, dùng senderType để xác định
            const isMe = message.senderType === "User";
            const otherParticipant = conversation.participants?.find(
              (p: any) => p.userId?._id !== currentUser?._id
            );
            return (
              <div
                key={message._id || Math.random()}
                className={cn(
                  "flex gap-2 w-full",
                  isMe ? "justify-end" : "justify-start"
                )}
              >
                {!isMe && (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center text-xs overflow-hidden">
                    {otherParticipant?.avatarUrl ? (
                      <img
                        src={otherParticipant.avatarUrl}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>?</span>
                    )}
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-4 py-2 break-words shadow-sm",
                    isMe
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-gray-100 text-gray-900 rounded-bl-none"
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">
                    {message.type === "text" && "text" in message.content
                      ? message.content.text
                      : message.type === "image"
                      ? "Đã gửi một ảnh"
                      : message.type === "file"
                      ? "Đã gửi một file"
                      : ""}
                  </p>
                  <div
                    className={cn(
                      "flex items-center gap-1 mt-1 text-[10px] justify-end",
                      isMe ? "text-blue-100" : "text-gray-500"
                    )}
                  >
                    <span>
                      {message.createdAt &&
                        formatDistanceToNow(new Date(message.createdAt), {
                          addSuffix: true,
                          locale: vi,
                        })}
                    </span>
                    {isMe && message.status === "read" && <span>✓✓</span>}
                    {isMe && message.status === "sent" && <span>✓</span>}
                  </div>
                </div>
              </div>
            );
          })
        )}
        {typingInThisConv.length > 0 && (
          <div className="flex justify-start animate-in fade-in">
            <div className="bg-gray-100 rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4 bg-white flex-shrink-0">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              handleTyping();
            }}
            onKeyPress={handleKeyPress}
            placeholder="Nhập tin nhắn..."
            disabled={isSending}
            autoFocus
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50 transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isSending}
            className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition disabled:opacity-50 active:scale-95"
          >
            {isSending ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

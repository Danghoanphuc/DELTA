// apps/admin-frontend/src/components/order-detail/OrderChatWidget.tsx
// ✅ Order Chat Widget - Sidebar chat for order discussions

import { useState, useEffect, useRef, memo } from "react";
import { MessageSquare, Send, X, Minimize2, Maximize2 } from "lucide-react";
import { useAdminOrderChat } from "../../hooks/useAdminOrderChat";

interface OrderMessage {
  _id: string;
  senderId: string;
  senderName: string;
  senderRole: "admin" | "customer" | "shipper";
  content: string;
  createdAt: string;
}

interface OrderChatWidgetProps {
  orderId: string;
  orderNumber: string;
}

const OrderChatWidgetComponent = ({
  orderId,
  orderNumber,
}: OrderChatWidgetProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, isLoading, isSending, sendMessage, unreadCount } =
    useAdminOrderChat(orderId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized]);

  const handleSend = async () => {
    if (!message.trim() || isSending) return;

    await sendMessage(message);
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center group"
      >
        <MessageSquare className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-6 right-6 bg-white rounded-lg shadow-2xl border border-gray-200 transition-all ${
        isMinimized ? "w-80 h-14" : "w-96 h-[600px]"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          <div>
            <h3 className="font-semibold text-sm">Thảo luận đơn hàng</h3>
            <p className="text-xs opacity-90">{orderNumber}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-white/20 rounded"
          >
            {isMinimized ? (
              <Maximize2 className="w-4 h-4" />
            ) : (
              <Minimize2 className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-white/20 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 h-[calc(600px-140px)]">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <MessageSquare className="w-12 h-12 mb-2" />
                <p className="text-sm">Chưa có tin nhắn nào</p>
                <p className="text-xs">Bắt đầu cuộc trò chuyện!</p>
              </div>
            ) : (
              messages.map((msg: OrderMessage) => {
                const isAdmin = msg.senderRole === "admin";
                return (
                  <div
                    key={msg._id}
                    className={`flex ${
                      isAdmin ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[75%] rounded-lg px-3 py-2 ${
                        isAdmin
                          ? "bg-gradient-to-br from-purple-600 to-blue-600 text-white"
                          : msg.senderRole === "customer"
                          ? "bg-blue-100 text-blue-900"
                          : "bg-green-100 text-green-900"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium opacity-90">
                          {msg.senderName}
                        </span>
                        <span className="text-xs opacity-75">
                          {new Date(msg.createdAt).toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {msg.content}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t bg-gray-50">
            <div className="flex gap-2">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập tin nhắn..."
                rows={2}
                className="flex-1 px-3 py-2 border rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={isSending}
              />
              <button
                onClick={handleSend}
                disabled={!message.trim() || isSending}
                className="px-4 py-2 bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export const OrderChatWidget = memo(OrderChatWidgetComponent);

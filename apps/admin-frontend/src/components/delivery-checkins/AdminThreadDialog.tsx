// apps/admin-frontend/src/components/delivery-checkins/AdminThreadDialog.tsx
/**
 * Admin Thread Dialog Component
 * Allows admin to view and participate in delivery check-in discussions
 */

import { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  Send,
  Loader2,
  X,
  User,
  Truck,
  Shield,
} from "lucide-react";
import { useAdminDeliveryThread } from "@/hooks/useAdminDeliveryThread";
import type { ThreadMessage } from "@/services/admin.delivery-thread.service";

interface AdminThreadDialogProps {
  checkinId: string | null;
  orderNumber: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ROLE_CONFIG: Record<
  string,
  {
    label: string;
    icon: any;
    color: string;
    textColor: string;
    bgColor: string;
  }
> = {
  customer: {
    label: "Khách hàng",
    icon: User,
    color: "bg-blue-500",
    textColor: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  shipper: {
    label: "Shipper",
    icon: Truck,
    color: "bg-green-500",
    textColor: "text-green-600",
    bgColor: "bg-green-50",
  },
  admin: {
    label: "Admin",
    icon: Shield,
    color: "bg-purple-500",
    textColor: "text-purple-600",
    bgColor: "bg-purple-50",
  },
};

export function AdminThreadDialog({
  checkinId,
  orderNumber,
  open,
  onOpenChange,
}: AdminThreadDialogProps) {
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, isLoading, isSending, sendMessage } =
    useAdminDeliveryThread(checkinId);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!messageInput.trim() || isSending) return;

    await sendMessage(messageInput);
    setMessageInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl h-[85vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b bg-gradient-to-r from-purple-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
                <MessageSquare className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Thảo luận giao hàng
                </h2>
                <p className="text-sm text-gray-600">#{orderNumber}</p>
              </div>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Đang tải tin nhắn...</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">
                  Chưa có tin nhắn nào
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Hãy bắt đầu cuộc trò chuyện
                </p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => {
                const roleConfig =
                  ROLE_CONFIG[message.senderRole] || ROLE_CONFIG.customer;
                const RoleIcon = roleConfig.icon;

                return (
                  <div key={message._id} className="flex gap-3">
                    {/* Avatar */}
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-full ${roleConfig.color} flex items-center justify-center`}
                    >
                      <RoleIcon className="w-5 h-5 text-white" />
                    </div>

                    {/* Message */}
                    <div className="flex-1 min-w-0">
                      {/* Sender info */}
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-medium ${roleConfig.textColor}`}>
                          {message.senderName}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${roleConfig.bgColor} ${roleConfig.textColor}`}
                        >
                          {roleConfig.label}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(message.createdAt).toLocaleTimeString(
                            "vi-VN",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                      </div>

                      {/* Message bubble */}
                      <div
                        className={`inline-block px-4 py-2 rounded-2xl ${roleConfig.bgColor} max-w-2xl`}
                      >
                        <p className="text-gray-800 whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t bg-white">
          <div className="flex gap-3">
            <textarea
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập tin nhắn... (Enter để gửi, Shift+Enter để xuống dòng)"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={2}
              disabled={isSending}
            />
            <button
              onClick={handleSend}
              disabled={!messageInput.trim() || isSending}
              className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium"
            >
              {isSending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
              Gửi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

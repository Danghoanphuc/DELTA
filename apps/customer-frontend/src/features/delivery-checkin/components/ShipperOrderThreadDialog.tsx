// apps/customer-frontend/src/features/delivery-checkin/components/ShipperOrderThreadDialog.tsx
/**
 * Shipper Order Thread Dialog - Chat dialog for shipper to communicate about orders
 * Reuses thread dialog logic but for shipper context
 */

import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { Send, Loader2, MessageCircle, Users } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import api from "@/shared/lib/axios";

interface ShipperOrderThreadDialogProps {
  orderId: string;
  orderNumber: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShipperOrderThreadDialog({
  orderId,
  orderNumber,
  open,
  onOpenChange,
}: ShipperOrderThreadDialogProps) {
  const [messageInput, setMessageInput] = useState("");
  const [thread, setThread] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch thread when dialog opens
  useEffect(() => {
    if (open && orderId) {
      fetchThread();
    }
  }, [open, orderId]);

  const fetchThread = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/order-threads/${orderId}`);
      const fetchedThread = res.data?.data?.thread;
      setThread(fetchedThread);
      setMessages(fetchedThread?.messages || []);
    } catch (error) {
      console.error("Failed to fetch thread:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || isSending || !thread) return;

    try {
      setIsSending(true);
      const res = await api.post(`/order-threads/${thread._id}/messages`, {
        content: messageInput.trim(),
      });
      const updatedThread = res.data?.data?.thread;
      setMessages(updatedThread?.messages || []);
      setMessageInput("");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "customer":
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
            Khách hàng
          </span>
        );
      case "admin":
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
            Admin
          </span>
        );
      case "shipper":
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
            Shipper
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100">
              <MessageCircle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <div className="text-lg font-semibold">
                Chat đơn hàng {orderNumber}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 font-normal">
                <Users className="w-4 h-4" />
                <span>{thread?.participants?.length || 0} người tham gia</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                  Shipper
                </span>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <MessageCircle className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-base font-medium">Chưa có tin nhắn nào</p>
              <p className="text-sm mt-1">
                Bắt đầu cuộc trò chuyện với khách hàng và admin!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg: any) => {
                const isSystem = msg.messageType === "system";
                const isMe = msg.senderRole === "shipper";

                return (
                  <div
                    key={msg._id}
                    className={`flex ${
                      isSystem
                        ? "justify-center"
                        : isMe
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    {isSystem ? (
                      <div className="bg-gray-100 text-gray-600 text-sm px-4 py-2 rounded-full">
                        {msg.content}
                      </div>
                    ) : (
                      <div className="max-w-[70%]">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-700">
                            {msg.senderName}
                          </span>
                          {msg.senderRole && getRoleBadge(msg.senderRole)}
                        </div>
                        <div
                          className={`rounded-lg px-4 py-2 ${
                            isMe
                              ? "bg-orange-500 text-white"
                              : "bg-gray-100 text-gray-900"
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {format(new Date(msg.createdAt), "HH:mm dd/MM", {
                            locale: vi,
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t px-6 py-4">
          <div className="flex gap-3">
            <Textarea
              placeholder="Nhập tin nhắn..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 min-h-[60px] max-h-[120px] resize-none"
              disabled={isSending || isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!messageInput.trim() || isSending || isLoading}
              className="bg-orange-500 hover:bg-orange-600 self-end"
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// src/features/chat/components/ChatHistorySidebar.tsx (TỆP MỚI)

import { NativeScrollArea } from "@/shared/components/ui/NativeScrollArea";
import { Button } from "@/shared/components/ui/button";
import { ChatConversation } from "@/types/chat";
import { MessageSquarePlus, Clock } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface ChatHistorySidebarProps {
  conversations: ChatConversation[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
}

export function ChatHistorySidebar({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewChat,
}: ChatHistorySidebarProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* 1. Header (Nút Chat Mới) */}
      <div className="p-4 border-b">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={onNewChat}
        >
          <MessageSquarePlus size={18} className="mr-2" />
          Chat mới
        </Button>
      </div>

      {/* 2. Danh sách lịch sử (Giống ảnh) */}
      <NativeScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          <h3 className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1.5">
            <Clock size={14} />
            Lịch sử chat gần đây
          </h3>
          {conversations.length === 0 ? (
            <p className="text-sm text-gray-400 p-2 italic">
              Chưa có lịch sử chat.
            </p>
          ) : (
            conversations.map((convo) => (
              <Button
                key={convo._id}
                variant="ghost"
                onClick={() => onSelectConversation(convo._id)}
                className={cn(
                  "w-full justify-start text-left h-auto py-2",
                  currentConversationId === convo._id
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600"
                )}
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium truncate">
                    {convo.title}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatDate(convo.updatedAt)}
                  </span>
                </div>
              </Button>
            ))
          )}
        </div>
      </NativeScrollArea>
    </div>
  );
}

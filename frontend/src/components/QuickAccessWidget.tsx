// src/components/QuickAccessWidget.tsx (ĐÃ SỬA)

// 👈 SỬA LỖI TS6133: Xóa 'useState' vì không được sử dụng
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  MessageSquarePlus,
  ShoppingBag,
  History,
  PanelRightOpen,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "@/types/chat";

interface QuickAccessWidgetProps {
  recentMessages: ChatMessage[];
  onNewChat: () => void;
}

export function QuickAccessWidget({
  recentMessages,
  onNewChat,
}: QuickAccessWidgetProps) {
  return (
    <HoverCard openDelay={100} closeDelay={150}>
      <HoverCardTrigger asChild>
        <button
          className="fixed top-6 right-0 z-40 bg-white px-3 py-2 rounded-l-lg shadow-md border border-r-0 border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm font-medium text-gray-700"
          aria-label="Mở tiện ích truy cập nhanh"
        >
          <PanelRightOpen size={18} />
          <span>Truy cập nhanh</span>
        </button>
      </HoverCardTrigger>
      <HoverCardContent
        side="left"
        align="end"
        className="w-72 p-3 bg-white rounded-lg shadow-xl border border-gray-100"
        sideOffset={5}
      >
        <div className="flex flex-col space-y-2">
          <h4 className="font-semibold text-sm text-gray-800 px-1 mb-1">
            Truy cập nhanh
          </h4>
          {/* Nút Chat Mới */}
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-700 hover:bg-blue-50 hover:text-blue-700"
            onClick={onNewChat}
          >
            <MessageSquarePlus size={18} className="mr-2" />
            Chat mới
          </Button>
          {/* Nút Đơn Hàng */}
          <Button
            variant="ghost"
            asChild
            className="w-full justify-start text-gray-700 hover:bg-blue-50 hover:text-blue-700"
          >
            <Link to="/orders">
              <ShoppingBag size={18} className="mr-2" />
              Đơn hàng của tôi
            </Link>
          </Button>
          <hr className="my-1 border-gray-100" />
          {/* Lịch sử chat */}
          <div className="px-1">
            <h5 className="font-semibold text-xs text-gray-500 mb-2 flex items-center">
              <History size={14} className="mr-1.5" />
              Lịch sử chat gần đây
            </h5>
            {recentMessages.length > 0 ? (
              <ScrollArea className="h-24 pr-2">
                <div className="space-y-1.5 text-xs">
                  {recentMessages.map((msg) => (
                    <p
                      key={msg._id}
                      className="text-gray-600 truncate"
                      title={msg.content.text}
                    >
                      <span
                        className={
                          msg.senderType === "User"
                            ? "font-medium text-blue-700"
                            : "text-purple-700"
                        }
                      >
                        {msg.senderType === "User" ? "Bạn: " : "AI: "}
                      </span>
                      {msg.content.text}
                    </p>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <p className="text-xs text-gray-400 italic">
                Chưa có lịch sử chat.
              </p>
            )}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

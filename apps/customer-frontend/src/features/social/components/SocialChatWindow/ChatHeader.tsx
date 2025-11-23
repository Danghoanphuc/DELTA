// apps/customer-frontend/src/features/social/components/SocialChatWindow/ChatHeader.tsx
// ✅ Header component cho chat window

import { ArrowLeft, Info } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { getPartnerInfo } from "./utils";

interface ChatHeaderProps {
  conversation: any;
  currentUserId?: string;
  isInfoSidebarOpen: boolean;
  onBack: () => void;
  onToggleInfo: () => void;
  onEditGroup?: () => void;
}

export function ChatHeader({
  conversation,
  currentUserId,
  isInfoSidebarOpen,
  onBack,
  onToggleInfo,
  onEditGroup,
}: ChatHeaderProps) {
  const isGroup = conversation.type === "group";
  const partner = getPartnerInfo(conversation, currentUserId);
  const isPartnerOnline = partner && typeof partner === "object" ? partner.isOnline === true : false;

  const handleHeaderClick = () => {
    if (isGroup && onEditGroup) {
      onEditGroup();
    } else {
      onToggleInfo();
    }
  };

  return (
    <div className="flex-shrink-0 h-16 px-4 border-b border-gray-100 flex items-center justify-between bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-3 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden -ml-2 text-gray-600 hover:bg-gray-100 rounded-full shrink-0"
          onClick={onBack}
        >
          <ArrowLeft size={22} />
        </Button>

        {/* Avatar */}
        <div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center overflow-hidden ring-2 shadow-sm shrink-0",
            isGroup
              ? "bg-gradient-to-br from-orange-400 to-pink-500 ring-orange-100"
              : "bg-blue-50 ring-blue-50"
          )}
        >
          {isGroup ? (
            conversation.avatarUrl ? (
              <img src={conversation.avatarUrl} className="w-full h-full object-cover" alt="Group" />
            ) : (
              <span className="text-white font-bold text-sm">
                {conversation.title?.[0]?.toUpperCase() || "G"}
              </span>
            )
          ) : partner?.avatarUrl ? (
            <img src={partner.avatarUrl} className="w-full h-full object-cover" alt="Avatar" />
          ) : (
            <span className="font-bold text-blue-600">{partner?.username?.[0] || "?"}</span>
          )}
        </div>

        {/* Name & Status */}
        <div
          className="cursor-pointer min-w-0 flex-1 group"
          onClick={handleHeaderClick}
        >
          <h3 className="font-bold text-gray-900 text-sm sm:text-base group-hover:text-blue-600 transition-colors truncate flex items-center gap-2">
            {isGroup
              ? conversation.title || "Nhóm chat"
              : partner?.displayName || partner?.username || "Người dùng"}
            {isGroup && <Info size={14} className="text-gray-400 group-hover:text-blue-500" />}
          </h3>
          {!isGroup && (
            <div
              className={cn(
                "flex items-center gap-1.5 text-xs truncate transition-colors",
                isPartnerOnline ? "text-green-600" : "text-gray-400"
              )}
            >
              {isPartnerOnline ? (
                <>
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  Đang hoạt động
                </>
              ) : (
                <>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-gray-300"></span>
                  Ngoại tuyến
                </>
              )}
            </div>
          )}
          {isGroup && (
            <div className="text-xs text-gray-500 truncate">
              {conversation.participants?.length || 0} thành viên
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleInfo}
          className={cn(
            "text-gray-500 hover:bg-blue-50 hover:text-blue-600 rounded-full transition-all",
            isInfoSidebarOpen && "bg-blue-50 text-blue-600 shadow-inner"
          )}
        >
          <Info size={20} />
        </Button>
      </div>
    </div>
  );
}


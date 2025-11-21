// apps/customer-frontend/src/features/social/components/ChatInfoSidebar/QuickActions.tsx
// ✅ Component hiển thị quick actions (Mute, Search, Block)

import { Bell, BellOff, Ban, Search, Loader2 } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface QuickActionsProps {
  isMuted: boolean;
  isBlocked: boolean;
  isGroup: boolean;
  isMuting: boolean;
  isBlocking: boolean;
  onMuteToggle: () => void;
  onSearchClick: () => void;
  onBlockToggle: () => void;
}

export function QuickActions({
  isMuted,
  isBlocked,
  isGroup,
  isMuting,
  isBlocking,
  onMuteToggle,
  onSearchClick,
  onBlockToggle,
}: QuickActionsProps) {
  return (
    <div className="p-2 grid grid-cols-3 gap-2 border-b border-gray-100">
      {/* Mute Toggle */}
      <div
        onClick={onMuteToggle}
        className={cn(
          "flex flex-col items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition group",
          isMuting && "opacity-50 cursor-not-allowed"
        )}
      >
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mb-1 group-hover:bg-gray-200">
          {isMuting ? (
            <Loader2 size={16} className="text-gray-600 animate-spin" />
          ) : isMuted ? (
            <BellOff size={16} className="text-gray-600" />
          ) : (
            <Bell size={16} className="text-gray-600" />
          )}
        </div>
        <span className="text-[10px] font-medium text-gray-600">
          {isMuted ? "Bật thông báo" : "Tắt thông báo"}
        </span>
      </div>

      {/* Search */}
      <div
        onClick={onSearchClick}
        className="flex flex-col items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition group"
      >
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mb-1 group-hover:bg-gray-200">
          <Search size={16} className="text-gray-600" />
        </div>
        <span className="text-[10px] font-medium text-gray-600">Tìm tin nhắn</span>
      </div>

      {/* Block Toggle (chỉ hiển thị cho peer-to-peer) */}
      {!isGroup && (
        <div
          onClick={onBlockToggle}
          className={cn(
            "flex flex-col items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition group",
            isBlocking && "opacity-50 cursor-not-allowed"
          )}
        >
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center mb-1",
              isBlocked
                ? "bg-gray-100 group-hover:bg-gray-200"
                : "bg-red-100 group-hover:bg-red-200"
            )}
          >
            {isBlocking ? (
              <Loader2
                size={16}
                className={cn(
                  "animate-spin",
                  isBlocked ? "text-gray-600" : "text-red-600"
                )}
              />
            ) : (
              <Ban
                size={16}
                className={cn(isBlocked ? "text-gray-600" : "text-red-600")}
              />
            )}
          </div>
          <span
            className={cn(
              "text-[10px] font-medium",
              isBlocked ? "text-gray-600" : "text-red-600"
            )}
          >
            {isBlocked ? "Bỏ chặn" : "Chặn"}
          </span>
        </div>
      )}
    </div>
  );
}


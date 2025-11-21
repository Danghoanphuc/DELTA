// apps/customer-frontend/src/features/social/components/ChatInfoSidebar/ProfileSection.tsx
// ✅ Component hiển thị profile section (avatar, name, status)

import { cn } from "@/shared/lib/utils";

interface ProfileSectionProps {
  conversation: any;
  partner: any;
  isGroup: boolean;
}

export function ProfileSection({
  conversation,
  partner,
  isGroup,
}: ProfileSectionProps) {
  return (
    <div className="p-6 flex flex-col items-center text-center border-b border-gray-100">
      <div
        className={cn(
          "w-24 h-24 rounded-full mb-4 overflow-hidden ring-4 ring-white shadow-lg",
          isGroup
            ? "bg-gradient-to-br from-orange-400 to-pink-500"
            : "bg-gray-100"
        )}
      >
        {isGroup ? (
          <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-white">
            {conversation.title?.[0]?.toUpperCase() || "G"}
          </div>
        ) : partner?.avatarUrl ? (
          <img
            src={partner.avatarUrl}
            className="w-full h-full object-cover"
            alt="Avatar"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-400 bg-gray-100">
            {partner?.displayName?.[0] || partner?.username?.[0] || "?"}
          </div>
        )}
      </div>
      <h2 className="text-lg font-bold text-gray-900">
        {isGroup
          ? conversation.title || "Nhóm chat"
          : partner?.displayName || partner?.username || "Người dùng"}
      </h2>
      {!isGroup && <p className="text-sm text-gray-500">@{partner?.username}</p>}
      {isGroup && (
        <p className="text-sm text-gray-500">
          {conversation.participants?.length || 0} thành viên
        </p>
      )}
      {!isGroup && (
        <div className="flex items-center gap-2 mt-2">
          <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
            Online
          </span>
        </div>
      )}
    </div>
  );
}


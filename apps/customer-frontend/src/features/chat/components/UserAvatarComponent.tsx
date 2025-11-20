// src/features/chat/components/UserAvatarComponent.tsx
// Dumb component - chỉ render user avatar

import { UserAvatar } from "@/components/UserAvatar";
import { useAuthStore } from "@/stores/useAuthStore";

export function UserAvatarComponent() {
  const user = useAuthStore((s) => s.user);

  return (
    <UserAvatar
      name={user?.displayName || user?.username || "U"}
      src={user?.avatarUrl}
      size={32}
      fallbackClassName="bg-gray-400 text-white"
    />
  );
}

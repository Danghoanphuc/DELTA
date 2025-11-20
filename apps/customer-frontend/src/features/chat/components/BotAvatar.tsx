// src/features/chat/components/BotAvatar.tsx
// Dumb component - chỉ render bot avatar

import zinAvatar from "@/assets/img/zin-avatar.svg";

export function BotAvatar() {
  return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
      <img
        src={zinAvatar}
        alt="Zin AI Avatar"
        className="w-full h-full object-cover"
      />
    </div>
  );
}

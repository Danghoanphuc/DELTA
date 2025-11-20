// src/features/chat/components/QuickReplyButtons.tsx
// Dumb component - chỉ render quick reply buttons

import { QuickReply } from "@/types/chat";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

interface QuickReplyButtonsProps {
  quickReplies: QuickReply[];
  onQuickReplyClick: (text: string, payload: string) => void;
}

export function QuickReplyButtons({ quickReplies, onQuickReplyClick }: QuickReplyButtonsProps) {
  const handleClick = (reply: QuickReply) => {
    onQuickReplyClick(reply.text, reply.payload);
  };

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {quickReplies.map((reply, index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          onClick={() => handleClick(reply)}
          className={cn(
            "text-xs px-3 py-1 h-auto",
            "hover:bg-blue-50 hover:border-blue-200",
            "transition-colors duration-200"
          )}
        >
          {reply.text}
        </Button>
      ))}
    </div>
  );
}

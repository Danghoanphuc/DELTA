// apps/customer-frontend/src/features/social/components/SocialChatWindow/ChatInput.tsx
// ✅ Component cho chat input area

import { useState } from "react";
import { Send, Paperclip, Smile, Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

interface ChatInputProps {
  onSend: (text: string) => Promise<void>;
  sending: boolean;
  onFileClick?: () => void;
}

export function ChatInput({ onSend, sending, onFileClick }: ChatInputProps) {
  const [text, setText] = useState("");

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    const content = text.trim();
    setText("");
    await onSend(content);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 z-40 p-3 bg-gradient-to-t from-white via-white/95 to-transparent pt-6">
      <div className="flex items-end gap-2 bg-white p-2 pr-3 rounded-[24px] shadow-[0_4px_20px_rgb(0,0,0,0.08)] border border-gray-200 ring-1 ring-gray-100">
        {/* Action Buttons */}
        <div className="flex gap-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={onFileClick}
            className="text-blue-500 hover:bg-blue-50 rounded-full h-10 w-10 transition-colors"
          >
            <Paperclip size={20} />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 rounded-full h-10 w-10 hidden sm:flex transition-colors"
          >
            <Smile size={20} />
          </Button>
        </div>

        {/* Text Input */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nhập tin nhắn..."
          className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-3 max-h-32 resize-none placeholder:text-gray-400"
          rows={1}
          style={{ minHeight: "44px" }}
        />

        {/* Send Button */}
        <Button
          size="icon"
          onClick={handleSend}
          disabled={!text.trim() || sending}
          className={cn(
            "rounded-full h-10 w-10 transition-all duration-300 shadow-md",
            text.trim()
              ? "bg-blue-600 hover:bg-blue-700 text-white hover:scale-105"
              : "bg-gray-100 text-gray-400"
          )}
        >
          {sending ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <Send size={18} className={cn(text.trim() && "ml-0.5")} />
          )}
        </Button>
      </div>
    </div>
  );
}


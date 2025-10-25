// frontend/src/components/Chatbar.tsx (RESPONSIVE)
import { Paperclip, Image, Send } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { ChatMessage } from "../types/chat";
import { ChatMessages } from "./ChatMessages";

interface ChatBarProps {
  messages: ChatMessage[];
  isLoadingAI: boolean;
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  onSendMessage: (
    text: string,
    latitude?: number,
    longitude?: number
  ) => Promise<void>;
}

export function ChatBar({
  messages,
  isLoadingAI,
  isExpanded,
  setIsExpanded,
  onSendMessage,
}: ChatBarProps) {
  const [message, setMessage] = useState("");
  const chatRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  };

  const suggestedPrompts = [
    { text: "Làm 100 card visit", color: "blue" },
    { text: "In poster 60x90cm", color: "pink" },
  ];

  useEffect(() => {
    const handleOutside = (event: Event) => {
      if (chatRef.current && !chatRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, [setIsExpanded]);

  const handleSend = async () => {
    if (!message.trim() || isLoadingAI) return;

    setIsExpanded(true);
    const textToSend = message.trim();
    setMessage("");
    if (textareaRef.current) textareaRef.current.style.height = "40px";

    try {
      const position = await new Promise<GeolocationPosition | null>(
        (resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve(pos),
            () => resolve(null)
          );
        }
      );

      await onSendMessage(
        textToSend,
        position?.coords.latitude,
        position?.coords.longitude
      );
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "AI đang gặp lỗi!");
    }
  };

  return (
    <div
      ref={chatRef}
      className={`w-full max-w-4xl mx-auto rounded-2xl md:rounded-3xl transition-all duration-500
        hover:border-gray-300 hover:shadow-lg hover:shadow-gray-200
        ${isExpanded ? "h-[450px] md:h-[590px]" : "h-[250px] md:h-[290px]"} 
      `}
    >
      <div className="relative bg-white/90 backdrop-blur-lg rounded-2xl md:rounded-3xl shadow-xl border border-gray-200/50 p-4 md:p-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-start gap-2 md:gap-3 mb-3 md:mb-4">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
            <span className="text-base md:text-lg">🤖</span>
          </div>
          <div>
            <p className="text-sm md:text-base text-gray-700 mb-1">
              Xin chào! Tôi là{" "}
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent font-semibold">
                PrintZ
              </span>{" "}
              👋
            </p>
            {messages.length === 0 && (
              <p className="text-xs text-gray-500 hidden md:block">
                Tôi là trợ lý in ấn thông minh. Bạn cần in gì?
              </p>
            )}
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-hidden mb-2 md:mb-3 -mx-4 md:-mx-6 px-2">
          <ChatMessages messages={messages} isLoadingAI={isLoadingAI} />
        </div>

        {/* Suggested Prompts - Hidden on mobile when expanded */}
        {messages.length === 0 && message.length === 0 && (
          <div className="flex flex-wrap gap-2 mb-2 md:mb-3">
            {suggestedPrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => {
                  setMessage(prompt.text);
                  setIsExpanded(true);
                  textareaRef.current?.focus();
                }}
                className={`px-2 py-1 md:px-3 md:py-1.5 rounded-full text-xs border transition-all
                  bg-${prompt.color}-50 hover:bg-${prompt.color}-100 text-${prompt.color}-700 border-${prompt.color}-200
                  hover:shadow-md
                `}
              >
                {prompt.text}
              </button>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div className="flex-shrink-0 border-gray-200 pt-2 md:pt-3">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInput}
            onFocus={() => setIsExpanded(true)}
            placeholder="Bạn muốn in gì?"
            className="w-full border rounded-2xl md:rounded-3xl px-3 py-2 mb-2 outline-none text-sm md:text-base placeholder:text-gray-400 overflow-hidden disabled:bg-gray-50"
            style={{ minHeight: "30px", maxHeight: "130px" }}
            disabled={isLoadingAI}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3">
              <button
                className="p-1.5 md:p-2 rounded-lg text-gray-400 opacity-50 cursor-not-allowed"
                disabled
                title="Đính kèm (sắp có)"
              >
                <Paperclip size={18} className="md:w-5 md:h-5" />
              </button>
              <button
                className="p-1.5 md:p-2 rounded-lg text-gray-400 opacity-50 cursor-not-allowed"
                disabled
                title="Gửi ảnh (sắp có)"
              >
                <Image size={18} className="md:w-5 md:h-5" />
              </button>
            </div>
            <button
              onClick={handleSend}
              className="px-4 py-2 md:px-6 md:py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl md:rounded-2xl flex items-center gap-2 shadow-md hover:shadow-blue-200 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm md:text-base"
              disabled={isLoadingAI || !message.trim()}
            >
              {isLoadingAI ? (
                "Đang nghĩ..."
              ) : (
                <>
                  <Send size={14} className="md:w-[18px] md:h-[18px]" />
                  <span className="hidden sm:inline">Gửi</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

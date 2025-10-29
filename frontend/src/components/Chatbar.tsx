import { Paperclip, Image, Send, Sparkles } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { ChatMessage } from "../types/chat";
import { ChatMessages } from "./ChatMessages";
import { motion } from "motion/react";
import { Badge } from "./ui/badge";

interface ChatBarProps {
  messages: ChatMessage[];
  isLoadingAI: boolean;
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  onAddUserMessage: (text: string) => ChatMessage;
  onGetAIResponse: (
    userMessage: ChatMessage,
    latitude?: number,
    longitude?: number
  ) => Promise<void>;
}

export function ChatBar({
  messages,
  isLoadingAI,
  isExpanded,
  setIsExpanded,
  onAddUserMessage,
  onGetAIResponse,
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
    { text: "Làm 100 card visit", variant: "outline" as const },
    { text: "In poster 60x90cm", variant: "outline" as const },
    { text: "Thiết kế brochure", variant: "outline" as const },
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

  const handleSend = () => {
    if (!message.trim() || isLoadingAI) return;

    setIsExpanded(true);
    const textToSend = message.trim();
    setMessage("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "40px";
    }

    const userMessage = onAddUserMessage(textToSend);
    textareaRef.current?.focus();

    new Promise<GeolocationPosition | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve(pos),
        () => resolve(null) // Don't reject, just resolve with null
      );
    })
      .then((position) => {
        onGetAIResponse(
          userMessage,
          position?.coords.latitude,
          position?.coords.longitude
        );
      })
      .catch((err) => {
        console.error("Error in geolocation promise:", err);
        toast.error("Lỗi khi lấy vị trí.");
        onGetAIResponse(userMessage);
      });
  };

  return (
    <motion.div
      ref={chatRef}
      className="w-full mx-auto relative"
      animate={{
        maxWidth: isExpanded ? "900px" : "700px",
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl md:rounded-3xl shadow-xl md:shadow-2xl shadow-indigo-200/20 md:shadow-indigo-200/30 border border-slate-200/60 overflow-hidden">
        {/* Chat Messages Area */}
        <motion.div
          initial={false}
          animate={{
            height: isExpanded ? "340px" : "110px",
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="overflow-y-auto px-3 md:px-6 pt-3 md:pt-6"
        >
          {/* Bot Message Header */}
          {messages.length === 0 && (
            <div className="flex gap-2 md:gap-3 mb-3 md:mb-4">
              <div className="w-7 h-7 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                <span className="text-white text-sm md:text-lg">🤖</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5 md:mb-1">
                  <span className="text-xs md:text-sm leading-tight">
                    Xin chào! Tôi là{" "}
                    <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      PrintZ
                    </span>{" "}
                  </span>
                </div>
                <p className="text-[11px] md:text-xs text-slate-500 leading-tight">
                  Tôi là trợ lý in ấn thông minh. Bạn cần in gì?
                </p>
              </div>
            </div>
          )}

          {/* Chat Messages Component */}
          {messages.length > 0 && (
            <div className="mb-4">
              <ChatMessages messages={messages} isLoadingAI={isLoadingAI} />
            </div>
          )}

          {/* Quick Action Tags */}
          {messages.length === 0 && message.length === 0 && (
            <div className="flex gap-1.5 md:gap-2 flex-wrap mb-3 md:mb-4">
              {suggestedPrompts.map((action, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <Badge
                    variant={action.variant}
                    className="cursor-pointer active:scale-95 hover:scale-105 transition-transform text-[11px] md:text-xs py-1 md:py-1.5 px-2 md:px-3"
                    onClick={() => {
                      setMessage(action.text);
                      setIsExpanded(true);
                      textareaRef.current?.focus();
                    }}
                  >
                    {action.text}
                  </Badge>
                </motion.div>
              ))}
            </div>
          )}

          {/* Expanded Content - Hints */}
          {isExpanded && messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="space-y-2 md:space-y-3 mb-3 md:mb-4"
            >
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl md:rounded-2xl p-2.5 md:p-4 border border-indigo-100">
                <p className="text-[11px] md:text-xs text-slate-700 mb-1.5 md:mb-2">
                  💡 Gợi ý cho bạn:
                </p>
                <ul className="text-[11px] md:text-xs text-slate-600 space-y-1 md:space-y-1.5 ml-3 md:ml-4">
                  <li>• "Tôi cần in 500 card visit 2 mặt"</li>
                  <li>• "Thiết kế poster quảng cáo sự kiện"</li>
                  <li>• "In brochure giới thiệu công ty"</li>
                </ul>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Input Area */}
        <div className="px-3 md:px-6 pb-3 md:pb-6 pt-2 md:pt-3">
          <div className="bg-slate-50/80 backdrop-blur-sm rounded-xl md:rounded-2xl border border-slate-200/80 overflow-hidden hover:border-indigo-300 transition-colors focus-within:border-indigo-500 focus-within:ring-2 md:focus-within:ring-4 focus-within:ring-indigo-100">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleInput}
              onFocus={() => setIsExpanded(true)}
              placeholder="Bạn muốn in gì?"
              className="w-full bg-transparent px-3 md:px-4 pt-2.5 md:pt-4 pb-1.5 md:pb-2 outline-none resize-none text-sm md:text-base text-slate-700 placeholder:text-slate-400 disabled:opacity-50"
              style={{ minHeight: "36px", maxHeight: "120px" }}
              rows={isExpanded ? 2 : 1}
              disabled={isLoadingAI}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <div className="flex items-center justify-between px-2.5 md:px-4 pb-2.5 md:pb-3">
              <div className="flex gap-1.5 md:gap-2">
                <button
                  className="w-9 h-9 md:w-8 md:h-8 rounded-lg hover:bg-slate-200/50 active:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed touch-manipulation"
                  disabled
                  title="Đính kèm (sắp có)"
                >
                  <Paperclip className="w-[18px] h-[18px] md:w-4 md:h-4" />
                </button>
                <button
                  className="w-9 h-9 md:w-8 md:h-8 rounded-lg hover:bg-slate-200/50 active:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed touch-manipulation"
                  disabled
                  title="Gửi ảnh (sắp có)"
                >
                  <Image className="w-[18px] h-[18px] md:w-4 md:h-4" />
                </button>
              </div>
              <button
                onClick={handleSend}
                disabled={isLoadingAI || !message.trim()}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 md:px-5 py-2.5 md:py-2 rounded-xl hover:shadow-lg hover:shadow-indigo-200 transition-all active:scale-95 hover:scale-105 flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 touch-manipulation min-h-[44px] md:min-h-0"
              >
                {isLoadingAI ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span className="hidden sm:inline">Đang nghĩ...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span className="hidden sm:inline">Gửi</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick access hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isExpanded ? 0 : 1 }}
        className="text-center mt-2 md:mt-3 text-[10px] md:text-xs text-slate-400 px-2"
      >
        <span className="hidden md:inline">
          Nhấn vào để mở rộng chat • Nhấn bên ngoài để thu nhỏ
        </span>
        <span className="md:hidden">Chạm để mở rộng</span>
      </motion.div>
    </motion.div>
  );
}

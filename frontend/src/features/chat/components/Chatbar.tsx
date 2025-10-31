// src/components/Chatbar.tsx (CẬP NHẬT TOÀN DIỆN)
import { cn } from "@/shared/lib/utils"; // ✅✅✅ ĐÂY LÀ DÒNG BỊ THIẾU ✅✅✅
import { Paperclip, Send, X } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { ChatMessage, QuickReply } from "@/types/chat";
import { ChatMessages } from "./ChatMessages";
import { motion } from "motion/react";
import { Badge } from "@/shared/components/ui/badge";
import zinAvatar from "@/assets/img/zin-avatar.png";
import { useDropzone } from "react-dropzone";
import { useAuthStore } from "@/stores/useAuthStore";
import { LoginPopup } from "@/components/auth/LoginPopup";

interface ChatBarProps {
  messages: ChatMessage[];
  isLoadingAI: boolean;
  isExpanded: boolean;
  quickReplies: QuickReply[];
  setIsExpanded: (expanded: boolean) => void;
  onSendText: (text: string, latitude?: number, longitude?: number) => void;
  onSendQuickReply: (text: string, payload: string) => void;
  onFileUpload: (file: File) => void;
}

export function ChatBar({
  messages,
  isLoadingAI,
  isExpanded,
  quickReplies,
  setIsExpanded,
  onSendText,
  onSendQuickReply,
  onFileUpload,
}: ChatBarProps) {
  const [message, setMessage] = useState("");
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { accessToken } = useAuthStore();

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  };
  const suggestedPrompts = [
    { text: "Làm 100 card visit", payload: "Làm 100 card visit" },
    { text: "In poster 60x90cm", payload: "In poster 60x90cm" },
    { text: "Thiết kế brochure", payload: "/tim brochure" },
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
    if (isLoadingAI) return;

    if (fileToUpload) {
      onFileUpload(fileToUpload);
      setFileToUpload(null);
      setMessage("");
    } else if (message.trim()) {
      setIsExpanded(true);
      const textToSend = message.trim();

      new Promise<GeolocationPosition | null>((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve(pos),
          () => resolve(null)
        );
      }).then((position) => {
        onSendText(
          textToSend,
          position?.coords.latitude,
          position?.coords.longitude
        );
      });
    }

    setMessage("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "40px";
    }
    textareaRef.current?.focus();
  };

  const handleQuickReply = (reply: QuickReply) => {
    if (isLoadingAI) return;
    setIsExpanded(true);
    onSendQuickReply(reply.text, reply.payload);
    textareaRef.current?.focus();
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (!accessToken) {
        setShowLoginPopup(true);
        return;
      }
      const file = acceptedFiles[0];
      if (file) {
        if (file.size > 10 * 1024 * 1024) {
          // 10MB
          toast.error("File quá lớn, vui lòng chọn file dưới 10MB.");
          return;
        }
        setFileToUpload(file);
        setMessage(file.name);
        setIsExpanded(true);
        textareaRef.current?.focus();
      }
    },
    [accessToken, onFileUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
    multiple: false,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/webp": [".webp"],
      "application/pdf": [".pdf"],
    },
  });

  const handleAttachClick = () => {
    if (!accessToken) {
      setShowLoginPopup(true);
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onDrop([file]);
    }
  };

  const handleTextAreaFocus = () => {
    setIsExpanded(true);
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      setTimeout(() => {
        if (chatRef.current) {
          chatRef.current.scrollIntoView({
            behavior: "smooth",
            block: "end",
          });
        }
      }, 300);
    }
  };

  return (
    <>
      <LoginPopup
        isOpen={showLoginPopup}
        onClose={() => setShowLoginPopup(false)}
        message="Vui lòng đăng nhập để gửi file"
      />

      <motion.div
        {...getRootProps()}
        ref={chatRef}
        className="w-full mx-auto relative"
        animate={{ maxWidth: isExpanded ? "900px" : "700px" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {isDragActive && (
          <div className="absolute inset-0 bg-blue-500/30 backdrop-blur-sm z-50 rounded-2xl md:rounded-3xl flex items-center justify-center">
            <p className="text-white font-bold text-lg">Thả file để tải lên</p>
          </div>
        )}

        <div className="bg-gradient-to-r from-blue-400 to-cyan-500 rounded-2xl md:rounded-3xl p-[1.5px] shadow-xl shadow-blue-400/30">
          <div className="bg-white rounded-2xl md:rounded-3xl overflow-hidden">
            <motion.div
              initial={false}
              animate={{ height: isExpanded ? "340px" : "110px" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={`overflow-y-auto px-3 md:px-6 pt-3 md:pt-6 ${
                !isExpanded ? "cursor-pointer" : ""
              }`}
              onClick={() => {
                if (!isExpanded) {
                  setIsExpanded(true);
                  textareaRef.current?.focus();
                }
              }}
            >
              {messages.length === 0 && (
                <div className="flex gap-2 md:gap-3 mb-3 md:mb-4">
                  <div className="w-7 h-7 md:w-10 md:h-10 rounded-xl md:rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0 shadow-lg">
                    <img
                      src={zinAvatar}
                      alt="Zin AI Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <span className="text-xs md:text-sm leading-tight">
                      Xin chào! Tôi là{" "}
                      <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        PrintZ
                      </span>{" "}
                    </span>
                    <p className="text-[11px] md:text-xs text-slate-500 leading-tight">
                      Tôi là trợ lý in ấn. Bạn cần in gì?
                    </p>
                  </div>
                </div>
              )}
              {messages.length > 0 && (
                <div className="mb-4">
                  <ChatMessages messages={messages} isLoadingAI={isLoadingAI} />
                </div>
              )}
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
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuickReply({
                            text: action.text,
                            payload: action.payload,
                          });
                        }}
                      >
                        {action.text}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              )}
              {isExpanded && messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="space-y-2 md:space-y-3 mb-3 md:mb-4"
                >
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl md:rounded-2xl p-2.5 md:p-4 border border-indigo-100">
                    <p className="text-[11px] md:text-xs text-slate-700 mb-1.5 md:mb-2">
                      💡 Gợi ý (Slash Commands):
                    </p>
                    <ul className="text-[11px] md:text-xs text-slate-600 space-y-1 md:space-y-1.5 ml-3 md:ml-4">
                      <li>• Gõ `/tim card visit` để tìm sản phẩm</li>
                      <li>• Gõ `/datlai` để xem đơn hàng cũ</li>
                      <li>• Kéo thả file PDF/ảnh vào đây để upload</li>
                    </ul>
                  </div>
                </motion.div>
              )}
            </motion.div>

            {quickReplies.length > 0 && !isLoadingAI && (
              <div className="px-3 md:px-6 pt-2 flex gap-2 flex-wrap">
                {quickReplies.map((reply, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Badge
                      variant="outline"
                      className="cursor-pointer active:scale-95 hover:scale-105 transition-transform text-[11px] md:text-xs py-1.5 px-3 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickReply(reply);
                      }}
                    >
                      {reply.text}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Input Area */}
            {/* Đây là dòng 332 gây lỗi */}
            <div className="px-3 md:px-6 pb-3 md:pb-6 pt-3">
              <div
                className={cn(
                  // <--- LỖI XẢY RA Ở ĐÂY VÌ `cn` CHƯA ĐƯỢC IMPORT
                  "bg-slate-50/80 backdrop-blur-sm rounded-xl md:rounded-2xl border border-slate-200/80 overflow-hidden hover:border-indigo-300 transition-colors focus-within:border-indigo-500 focus-within:ring-2 md:focus-within:ring-4 focus-within:ring-indigo-100",
                  fileToUpload && "border-blue-500 ring-2 ring-blue-100"
                )}
              >
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={handleInput}
                  onFocus={handleTextAreaFocus}
                  placeholder={
                    fileToUpload
                      ? "Bạn có muốn thêm ghi chú cho file này?"
                      : "Gõ /tim để tìm, hoặc kéo thả file vào đây..."
                  }
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
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelected}
                      className="hidden"
                      accept="image/png, image/jpeg, image/webp, application/pdf"
                    />
                    <button
                      onClick={handleAttachClick}
                      className="w-9 h-9 md:w-8 md:h-8 rounded-lg hover:bg-slate-200/50 active:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed touch-manipulation"
                      title="Đính kèm file (ảnh, PDF)"
                    >
                      <Paperclip className="w-[18px] h-[18px] md:w-4 md:h-4" />
                    </button>
                  </div>

                  {fileToUpload && !isLoadingAI && (
                    <button
                      onClick={() => {
                        setFileToUpload(null);
                        setMessage("");
                      }}
                      className="bg-gray-200 text-gray-600 px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-sm"
                    >
                      <X size={14} /> Xóa file
                    </button>
                  )}

                  <button
                    onClick={handleSend}
                    disabled={isLoadingAI || (!message.trim() && !fileToUpload)}
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
                        <span className="hidden sm:inline">
                          {fileToUpload ? "Gửi file" : "Gửi"}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}

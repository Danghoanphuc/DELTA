// src/components/Chatbar.tsx (ĐÃ CẬP NHẬT 3 LỖI)

import { cn } from "@/shared/lib/utils";
import { Paperclip, Send, X } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { ChatMessage, QuickReply } from "@/types/chat";
import { ChatMessages } from "./ChatMessages";
import { motion } from "framer-motion";
import { Badge } from "@/shared/components/ui/badge";
import zinAvatar from "@/assets/img/zin-avatar.png";
import { useDropzone } from "react-dropzone";
import { useAuthStore } from "@/stores/useAuthStore";
import { LoginPopup } from "@/features/auth/components/LoginPopup";

// (Interface và các hàm khác giữ nguyên)
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
  // (Tất cả state và refs giữ nguyên)
  const [message, setMessage] = useState("");
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { accessToken } = useAuthStore();

  // (handleInput và suggestedPrompts giữ nguyên)
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

  // (Logic handleOutside đã sửa ở lượt trước - giữ nguyên)
  useEffect(() => {
    const handleOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Element;
      if (chatRef.current && chatRef.current.contains(target)) {
        return;
      }
      if (target.closest("[data-radix-dialog-content]")) {
        return;
      }
      setIsExpanded(false);
    };
    document.addEventListener("mousedown", handleOutside as EventListener);
    document.addEventListener("touchstart", handleOutside as EventListener);
    return () => {
      document.removeEventListener("mousedown", handleOutside as EventListener);
      document.removeEventListener(
        "touchstart",
        handleOutside as EventListener
      );
    };
  }, [setIsExpanded]);

  // (Tất cả các hàm handler khác: handleSend, handleQuickReply, onDrop, v.v... giữ nguyên)
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
      textareaRef.current.style.height = "24px";
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
        setIsExpanded(true);
        textareaRef.current?.focus();
      }
    },
    [accessToken]
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

  // (JSX return)
  return (
    <>
      <LoginPopup
        isOpen={showLoginPopup}
        onClose={() => setShowLoginPopup(false)}
        message="Vui lòng đăng nhập để gửi file"
      />

      <motion.div
        {...(getRootProps() as any)}
        ref={chatRef}
        className="w-full mx-auto relative"
        animate={{ maxWidth: isExpanded ? "900px" : "700px" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* ✅ FIX 1: DND FLICKERING - Thêm pointer-events-none */}
        {isDragActive && (
          <div className="absolute inset-0 bg-blue-500/30 backdrop-blur-sm z-50 rounded-2xl md:rounded-3xl flex items-center justify-center pointer-events-none">
            <p className="text-white font-bold text-lg">Thả file để tải lên</p>
          </div>
        )}

        <div className="bg-gradient-to-r from-blue-400 to-cyan-500 rounded-2xl md:rounded-3xl p-[1.5px] shadow-xl shadow-blue-400/30">
          <div className="bg-white rounded-2xl md:rounded-3xl overflow-hidden">
            <motion.div
              initial={false}
              animate={{ height: isExpanded ? "340px" : "110px" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              // ✅ FIX 2: SPACING - Thêm mb-2
              // ✅ FIX 1 (Phụ): Thêm pointer-events-none khi drag
              className={cn(
                `overflow-y-auto px-3 md:px-6 pt-3 md:pt-6 mb-2`,
                !isExpanded ? "cursor-pointer" : "",
                isDragActive && "pointer-events-none"
              )}
              onClick={() => {
                if (!isExpanded) {
                  setIsExpanded(true);
                  textareaRef.current?.focus();
                }
              }}
            >
              {messages.length > 0 && (
                <div className="mb-4">
                  <ChatMessages messages={messages} isLoadingAI={isLoadingAI} />
                </div>
              )}
            </motion.div>

            {/* ✅ FIX 2: SPACING - Thêm mb-2 */}
            {quickReplies.length > 0 && !isLoadingAI && (
              <div className="px-3 md:px-6 pt-2 pb-2 flex gap-2 flex-wrap mb-2">
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

            {/* ======================================== */}
            {/* ✅ FIX 3: ALIGNMENT - CẤU TRÚC LẠI HOÀN TOÀN */}
            {/* ======================================== */}
            <div className="px-3 md:px-6 pb-3 md:pb-6 pt-3 flex items-end gap-2 md:gap-3">
              {/* --- 1. Nút ghim file (đã tách riêng) --- */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelected}
                className="hidden"
                accept="image/png, image/jpeg, image/webp, application/pdf"
              />
              <button
                onClick={handleAttachClick}
                className="w-10 h-10 rounded-xl border border-slate-200/80 bg-slate-50/80 backdrop-blur-sm flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed touch-manipulation flex-shrink-0"
                title="Đính kèm file (ảnh, PDF)"
                style={{ minWidth: "40px" }} // Đảm bảo không bị co lại
              >
                <Paperclip className="w-5 h-5" />
              </button>

              {/* --- 2. Khung nhập liệu (flex-1) --- */}
              <div
                className={cn(
                  "bg-slate-50/80 backdrop-blur-sm rounded-xl md:rounded-2xl border border-slate-200/80 overflow-hidden hover:border-indigo-300 transition-colors focus-within:border-indigo-500 focus-within:ring-2 md:focus-within:ring-4 focus-within:ring-indigo-100",
                  "flex-1 flex flex-col justify-center", // <-- flex-col và justify-center
                  "min-h-10", // <-- Căn chiều cao tối thiểu 40px
                  "p-2.5 md:p-3" // <-- Padding bên trong
                )}
                // Kích hoạt focus cho textarea khi click vào vùng container
                onClick={() => textareaRef.current?.focus()}
              >
                {/* 2.1. Badge xem trước file (nếu có) */}
                {fileToUpload && !isLoadingAI && (
                  <div className="flex mb-1.5">
                    <button
                      onClick={() => {
                        setFileToUpload(null);
                        setMessage("");
                      }}
                      className="bg-gray-200 text-gray-600 px-2 py-1 rounded-md flex items-center gap-1.5 text-xs"
                    >
                      <X size={14} />
                      <span className="truncate max-w-[150px] md:max-w-xs">
                        {fileToUpload.name}
                      </span>
                    </button>
                  </div>
                )}

                {/* 2.2. Vùng chứa Textarea */}
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={handleInput}
                  onFocus={handleTextAreaFocus}
                  placeholder={
                    fileToUpload
                      ? "Thêm ghi chú cho file..."
                      : "Gõ yêu cầu của bạn..."
                  }
                  className="w-full bg-transparent p-0 outline-none resize-none text-sm md:text-base text-slate-700 placeholder:text-slate-400 disabled:opacity-50"
                  style={{ minHeight: "24px", maxHeight: "120px" }} // minHeight chỉ là của textarea
                  rows={1}
                  disabled={isLoadingAI}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
              </div>

              {/* --- 3. Nút Gửi (đã tách riêng) --- */}
              <button
                onClick={handleSend}
                disabled={isLoadingAI || (!message.trim() && !fileToUpload)}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-200 transition-all active:scale-95 hover:scale-105 flex items-center justify-center text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 touch-manipulation flex-shrink-0"
                style={{ height: "40px", width: "40px", padding: 0 }}
              >
                {isLoadingAI ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span className="sr-only">
                  {fileToUpload ? "Gửi file" : "Gửi"}
                </span>
              </button>
              {/* ======================================== */}
              {/* ✅ KẾT THÚC CẬP NHẬT INPUT AREA */}
              {/* ======================================== */}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}

// src/features/chat/pages/ChatPage.tsx (CẬP NHẬT)

import { ChatHistorySidebar } from "@/features/chat/components/ChatHistorySidebar";
import { ChatMessages } from "@/features/chat/components/ChatMessages";
import { ChatProvider, useChatContext } from "../context/ChatProvider";
import { cn } from "@/shared/lib/utils";
import { ChatWelcome } from "../components/ChatWelcome";
import { WELCOME_ID } from "../hooks/useChat"; // Import ID

// Import UI từ Chatbar
import { Paperclip, Send, X, Loader2 } from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Badge } from "@/shared/components/ui/badge";
import { useDropzone } from "react-dropzone";
import { useAuthStore } from "@/stores/useAuthStore";
import { LoginPopup } from "@/features/auth/components/LoginPopup";

/**
 * Component con chứa UI chat (Dựa trên UI của Chatbar.tsx)
 */
const ChatView = () => {
  const {
    messages,
    quickReplies,
    isLoadingAI,
    onSendText,
    onSendQuickReply,
    onFileUpload,
    conversations,
    currentConversationId,
    handleSelectConversation,
    handleNewChat,
  } = useChatContext();

  const showWelcome =
    messages.length === 0 ||
    (messages.length === 1 && messages[0]._id === WELCOME_ID);

  // === Logic Input từ Chatbar.tsx ===
  const [message, setMessage] = useState("");
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { accessToken } = useAuthStore();

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    // Auto-resize textarea (nếu cần)
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  };

  const handleSend = () => {
    if (isLoadingAI) return;
    if (fileToUpload) {
      onFileUpload(fileToUpload);
      setFileToUpload(null);
      setMessage("");
    } else if (message.trim()) {
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

  const handleQuickReply = (reply: any) => {
    if (isLoadingAI) return;
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
          toast.error("File quá lớn, vui lòng chọn file dưới 10MB.");
          return;
        }
        setFileToUpload(file);
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
  // === Kết thúc logic Input ===

  return (
    <>
      <LoginPopup
        isOpen={showLoginPopup}
        onClose={() => setShowLoginPopup(false)}
        message="Vui lòng đăng nhập để gửi file"
      />
      {/* ❌ GỠ BỎ: GlobalHeader */}
      <div
        className={cn("flex-1 flex overflow-hidden", "pt-16")} // Giữ pt-16 từ AppLayout
        style={{ height: "100vh" }}
      >
        {/* --- Cột lịch sử chat --- */}
        <div className="hidden lg:block h-full border-r bg-white w-64 flex-shrink-0">
          <ChatHistorySidebar
            conversations={conversations}
            currentConversationId={currentConversationId}
            onSelectConversation={handleSelectConversation}
            onNewChat={handleNewChat}
          />
        </div>

        {/* --- Giao diện chat chính (Full-width, full-height) --- */}
        <div
          {...getRootProps()}
          className="flex-1 flex flex-col h-full bg-white relative overflow-hidden"
        >
          {isDragActive && (
            <div className="absolute inset-0 bg-blue-500/30 backdrop-blur-sm z-50 flex items-center justify-center pointer-events-none">
              <p className="text-white font-bold text-lg">
                Thả file để tải lên
              </p>
            </div>
          )}

          {/* Khu vực nội dung (ChatMessages hoặc Welcome) */}
          <div className="flex-1 overflow-y-auto flex flex-col">
            {showWelcome ? (
              <ChatWelcome onPromptClick={onSendText} />
            ) : (
              <div className="max-w-3xl mx-auto w-full h-full">
                <ChatMessages messages={messages} isLoadingAI={isLoadingAI} />
              </div>
            )}
          </div>

          {/* Khu vực Quick Replies (nếu có) */}
          {quickReplies.length > 0 && !isLoadingAI && (
            <div className="px-3 md:px-6 py-2 flex gap-2 flex-wrap max-w-3xl mx-auto w-full">
              {quickReplies.map((reply, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Badge
                    variant="outline"
                    className="cursor-pointer active:scale-95 hover:scale-105 transition-transform text-xs md:text-sm py-1.5 px-3 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
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

          {/* Khu vực input (Lấy từ Chatbar) */}
          <div className="flex-shrink-0 border-t">
            <div className="max-w-3xl mx-auto w-full">
              {/* === Layout Input Area (Từ Chatbar) === */}
              <div className="px-3 md:px-6 pb-3 md:pb-6 pt-3 flex items-end gap-2 md:gap-3">
                {/* --- 1. Nút ghim file --- */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelected}
                  className="hidden"
                />
                <button
                  onClick={handleAttachClick}
                  className="w-10 h-10 rounded-xl border border-slate-200/80 bg-slate-50/80 backdrop-blur-sm flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed touch-manipulation flex-shrink-0"
                  title="Đính kèm file (ảnh, PDF)"
                  style={{ minWidth: "40px" }}
                >
                  <Paperclip className="w-5 h-5" />
                </button>

                {/* --- 2. Khung nhập liệu --- */}
                <div
                  className={cn(
                    "bg-slate-50/80 backdrop-blur-sm rounded-xl md:rounded-2xl border border-slate-200/80 overflow-hidden hover:border-indigo-300 transition-colors focus-within:border-indigo-500 focus-within:ring-2 md:focus-within:ring-4 focus-within:ring-indigo-100",
                    "flex-1 flex flex-col justify-center",
                    "min-h-10",
                    "p-2.5 md:p-3"
                  )}
                  onClick={() => textareaRef.current?.focus()}
                >
                  {fileToUpload && !isLoadingAI && (
                    <div className="flex mb-1.5">
                      <button
                        onClick={() => setFileToUpload(null)}
                        className="bg-gray-200 text-gray-600 px-2 py-1 rounded-md flex items-center gap-1.5 text-xs"
                      >
                        <X size={14} />
                        <span className="truncate max-w-[150px] md:max-w-xs">
                          {fileToUpload.name}
                        </span>
                      </button>
                    </div>
                  )}
                  <textarea
                    ref={textareaRef}
                    value={message}
                    onChange={handleInput}
                    placeholder={
                      fileToUpload
                        ? "Thêm ghi chú cho file..."
                        : "Gõ yêu cầu của bạn..."
                    }
                    className="w-full bg-transparent p-0 outline-none resize-none text-sm md:text-base text-slate-700 placeholder:text-slate-400 disabled:opacity-50"
                    style={{ minHeight: "24px", maxHeight: "120px" }}
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

                {/* --- 3. Nút Gửi --- */}
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
              </div>
              {/* === Kết thúc Layout Input Area === */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

/**
 * Component cha, bọc Provider
 */
export default function ChatPage() {
  return (
    <ChatProvider>
      <ChatView />
    </ChatProvider>
  );
}

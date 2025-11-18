// src/features/chat/components/ChatInput.tsx (SMOOTH EXPANSION FIX)

import { useState, useRef, useCallback, useEffect } from "react";
import { Send, X, Loader2, Image as ImageIcon, Paperclip } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useAuthStore } from "@/stores/useAuthStore";
import { LoginPopup } from "@/features/auth/components/LoginPopup";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { cn } from "@/shared/lib/utils";

interface ChatInputProps {
  isLoading: boolean;
  onSendText: (text: string, latitude?: number, longitude?: number) => void;
  onFileUpload: (file: File) => void;
}

export function ChatInput({
  isLoading,
  onSendText,
  onFileUpload,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { accessToken } = useAuthStore();

  // ✅ FIX: Smooth Expansion Logic
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height tạm thời để lấy scrollHeight chính xác khi xóa bớt text
      textarea.style.height = '40px'; // Chiều cao cơ sở (1 dòng)
      
      const scrollHeight = textarea.scrollHeight;
      
      // Nếu có nội dung, set height bằng scrollHeight, tối đa 120px
      if (message.trim()) {
          textarea.style.height = `${Math.min(scrollHeight, 120)}px`;
      } else {
          textarea.style.height = '40px'; // Reset về mặc định nếu rỗng
      }
    }
  }, [message]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  const handleSend = () => {
    if (isLoading) return;
    if (!message.trim() && !fileToUpload) return;

    if (fileToUpload) {
      onFileUpload(fileToUpload);
      setFileToUpload(null);
    } 
    
    if (message.trim()) {
      const textToSend = message.trim();
      setMessage("");
      // Focus và reset height ngay lập tức
      if (textareaRef.current) {
          textareaRef.current.style.height = '40px'; 
          textareaRef.current.focus();
      }

      new Promise<GeolocationPosition | null>((resolve) => {
        if (navigator.geolocation) {
           navigator.geolocation.getCurrentPosition(
            (pos) => resolve(pos),
            () => resolve(null),
            { timeout: 5000 }
          );
        } else resolve(null);
      }).then((position) => {
        onSendText(
          textToSend,
          position?.coords.latitude,
          position?.coords.longitude
        );
      });
    }
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
          toast.error("File quá lớn (Max 10MB).");
          return;
        }
        setFileToUpload(file);
        textareaRef.current?.focus();
      }
    },
    [accessToken]
  );

  const { getRootProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
    multiple: false,
    accept: { 'image/*': [], 'application/pdf': [] }
  });

  const handleAttachClick = () => {
    if (!accessToken) {
      setShowLoginPopup(true);
      return;
    }
    fileInputRef.current?.click();
  };

  const isReadyToSend = message.trim().length > 0 || fileToUpload !== null;

  return (
    <>
      <LoginPopup
        isOpen={showLoginPopup}
        onClose={() => setShowLoginPopup(false)}
        message="Vui lòng đăng nhập để gửi file"
      />
      
      <div {...getRootProps()} className="relative flex flex-col w-full transition-all duration-300">
        {isDragActive && (
          <div className="absolute inset-0 -top-10 bg-blue-500/90 z-50 rounded-2xl flex items-center justify-center backdrop-blur-sm animate-in fade-in">
            <p className="text-white font-bold text-lg">Thả file vào đây</p>
          </div>
        )}

        {/* Preview File */}
        {fileToUpload && !isLoading && (
          <div className="px-1 pb-2 animate-in slide-in-from-bottom-2">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 rounded-lg px-3 py-1.5 text-xs font-medium shadow-sm">
              <ImageIcon size={14} />
              <span className="truncate max-w-[200px]">{fileToUpload.name}</span>
              <button onClick={() => setFileToUpload(null)} className="ml-1 p-0.5 hover:bg-blue-200 rounded-full transition-colors">
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        {/* AREA NHẬP LIỆU CHÍNH */}
        <div className="flex items-end gap-2 w-full">
           <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => { if(e.target.files?.[0]) onDrop([e.target.files[0]]); }}
            className="hidden"
            accept="image/*,.pdf"
          />
          
          {/* Nút Ghim */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleAttachClick}
            disabled={isLoading}
            className="flex-shrink-0 h-11 w-11 rounded-xl text-gray-500 hover:bg-gray-100 active:bg-gray-200 transition-colors"
            title="Đính kèm file"
          >
            <Paperclip size={22} />
          </Button>

          {/* Ô Textarea */}
          <div className="flex-1 min-w-0 bg-gray-100/80 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-[20px] px-4 py-2.5 focus-within:border-blue-400 focus-within:bg-white dark:focus-within:bg-gray-800 focus-within:ring-4 focus-within:ring-blue-100 dark:focus-within:ring-blue-900/20 transition-all duration-300 shadow-sm">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={handleInput}
                placeholder={fileToUpload ? "Thêm ghi chú..." : "Nhập tin nhắn..."}
                // ✅ FIX: Thêm transition-all ease-out duration-200 để animation mượt
                className="w-full max-h-[120px] min-h-[24px] bg-transparent border-none focus:outline-none resize-none text-[15px] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 leading-relaxed py-0 transition-all duration-200 ease-out"
                rows={1}
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
          </div>
          
          {/* Nút Gửi */}
          <Button
            size="icon"
            onClick={handleSend}
            disabled={isLoading || !isReadyToSend}
            className={cn(
                "flex-shrink-0 h-11 w-11 rounded-xl transition-all duration-300 shadow-md",
                isReadyToSend 
                    ? "bg-gradient-to-br from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white translate-x-0 opacity-100 rotate-0" 
                    : "bg-gray-100 text-gray-300 translate-x-4 opacity-0 rotate-45 pointer-events-none hidden" 
            )}
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send size={20} className="ml-0.5" strokeWidth={2.5} />}
          </Button>
        </div>
      </div>
    </>
  );
}
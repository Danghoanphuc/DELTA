// src/features/chat/components/ChatInput.tsx (TẠO MỚI)
import { useState, useRef, useCallback } from "react";
import { Paperclip, Send, X, Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
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

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  const handleSend = () => {
    if (isLoading) return;
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
    textareaRef.current?.focus();
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      // (Tương tự logic drop của ChatBar.tsx)
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
    [accessToken]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
    multiple: false,
    // (Thêm accept types nếu cần)
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

  return (
    <>
      <LoginPopup
        isOpen={showLoginPopup}
        onClose={() => setShowLoginPopup(false)}
        message="Vui lòng đăng nhập để gửi file"
      />
      {/* Vùng Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          "relative p-4 border-t bg-white",
          isDragActive && "bg-blue-50"
        )}
      >
        {isDragActive && (
          <div className="absolute inset-0 bg-blue-500/30 backdrop-blur-sm z-50 rounded-t-lg flex items-center justify-center pointer-events-none">
            <p className="text-white font-bold text-lg">Thả file để tải lên</p>
          </div>
        )}

        {/* Badge xem trước file */}
        {fileToUpload && !isLoading && (
          <div className="mb-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setFileToUpload(null)}
            >
              <X size={14} className="mr-2" />
              <span className="truncate max-w-xs">{fileToUpload.name}</span>
            </Button>
          </div>
        )}

        {/* Thanh Input chính */}
        <div className="flex items-end gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelected}
            className="hidden"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={handleAttachClick}
            disabled={isLoading}
            className="flex-shrink-0"
          >
            <Paperclip size={18} />
          </Button>

          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleInput}
            placeholder={
              fileToUpload
                ? "Thêm ghi chú cho file..."
                : "Hỏi Zin bất cứ điều gì..."
            }
            className="flex-1 resize-none bg-gray-100 border-none focus-visible:ring-blue-500"
            rows={1}
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            style={{ maxHeight: "150px" }} // Cho phép mở rộng tối đa
          />

          <Button
            size="icon"
            onClick={handleSend}
            disabled={isLoading || (!message.trim() && !fileToUpload)}
            className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-purple-600"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </Button>
        </div>
      </div>
    </>
  );
}

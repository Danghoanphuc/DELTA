// src/features/chat/components/ChatInput.tsx

import { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import {
  Send,
  Loader2,
  Plus,
  FileUp,
  Image as ImageIcon,
  Link as LinkIcon,
  Paperclip,
  X,
  FileText,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { useAuthStore } from "@/stores/useAuthStore";
import { LoginPopup } from "@/features/auth/components/LoginPopup";
import { cn } from "@/shared/lib/utils";
// useFileUpload không dùng nữa - files được quản lý bởi external staging
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";

import { AddLinkModal } from "@/shared/components/ui/AddLinkModal";
import { useGoogleDrive } from "@/shared/hooks/useGoogleDrive";

interface ChatInputProps {
  isLoading: boolean;
  onSendText: (text: string) => void;
  // Social chat props
  hasFiles?: boolean;
  onPasteFile?: (files: File[]) => void;
  onAddLink?: (url: string, type: "canva" | "drive" | "general") => void;
  onAddDriveFile?: (files: File[]) => void;
  onFileClick?: () => void;
}

// Component Thumbnail - MOBILE OPTIMIZED
const FileThumbnail = ({
  file,
  onRemove,
}: {
  file: File;
  onRemove: () => void;
}) => {
  const isImage = file.type.startsWith("image/");
  const [preview, setPreview] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (isImage) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file, isImage]);

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8, width: 0 }}
        className="relative group flex-shrink-0"
      >
        <div
          className="w-20 h-20 rounded-2xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800 relative shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95"
          onClick={() => isImage && preview && setShowPreview(true)}
        >
          {isImage && preview ? (
            <img
              src={preview}
              alt="preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-2 bg-gradient-to-br from-blue-50 to-indigo-50">
              <FileText className="w-7 h-7 text-blue-600 mb-1" />
              <span className="text-[9px] text-gray-600 truncate w-full text-center px-1 font-bold uppercase">
                {file.name.split(".").pop()}
              </span>
            </div>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="absolute top-1 right-1 bg-gray-900/70 hover:bg-red-500 text-white p-1 rounded-full opacity-100 group-hover:opacity-100 transition-all active:scale-90 touch-manipulation"
          >
            <X size={12} />
          </button>
          {/* File size badge */}
          <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm rounded text-[8px] text-white font-bold">
            {(file.size / 1024 / 1024).toFixed(1)}MB
          </div>
        </div>
      </motion.div>

      {/* Image Preview Modal */}
      {showPreview && preview && (
        <ImagePreviewModal
          imageUrl={preview}
          fileName={file.name}
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  );
};

// Simple Image Preview Modal
const ImagePreviewModal = ({
  imageUrl,
  fileName,
  onClose,
}: {
  imageUrl: string;
  fileName: string;
  onClose: () => void;
}) => {
  return ReactDOM.createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10 touch-manipulation"
      >
        <X size={24} />
      </button>
      <div className="max-w-4xl max-h-[90vh] w-full h-full flex flex-col items-center justify-center">
        <img
          src={imageUrl}
          alt={fileName}
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />
        <p className="mt-4 text-white text-sm font-medium truncate max-w-full px-4">
          {fileName}
        </p>
      </div>
    </motion.div>,
    document.body
  );
};

export function ChatInput({
  isLoading,
  onSendText,
  hasFiles,
  onPasteFile,
  onAddLink,
  onAddDriveFile,
  onFileClick,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  // State cho Menu & Modal
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkType, setLinkType] = useState<"canva" | "drive">("canva");
  const [isMobile, setIsMobile] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { accessToken } = useAuthStore();

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Không dùng internal file queue nữa, dùng external staging area

  // ✅ Tích hợp Google Drive
  const { openDrivePicker } = useGoogleDrive({
    onPick: (driveFiles) => {
      if (accessToken && onAddDriveFile) {
        onAddDriveFile(driveFiles);
        setIsMenuOpen(false);
      } else if (!accessToken) {
        setShowLoginPopup(true);
      }
    },
  });

  // Auto-resize
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    if (message.trim()) {
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    } else {
      textarea.style.height = "44px";
    }
  }, [message]);

  // Dropzone Logic cho vùng Input
  const {
    getRootProps,
    getInputProps,
    isDragActive: isInputDragActive,
  } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (accessToken && onPasteFile) {
        onPasteFile(acceptedFiles);
      } else if (!accessToken) {
        setShowLoginPopup(true);
      }
    },
    noClick: true,
    noKeyboard: true,
    multiple: true,
  });

  const isAnyDragActive = isInputDragActive;

  // Xử lý gửi - Files được quản lý bởi external staging area
  const handleSend = () => {
    if (isLoading) return;
    if (!message.trim() && !hasFiles) return;

    const textToSend = message.trim();

    // Clear input
    setMessage("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "44px";
      textareaRef.current.focus();
    }

    // Gửi text (files sẽ được gửi bởi parent component)
    if (textToSend || hasFiles) {
      onSendText(textToSend);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    const pastedFiles: File[] = [];
    for (const item of items) {
      if (item.type.indexOf("image") !== -1) {
        const blob = item.getAsFile();
        if (blob) {
          const file = new File([blob], `pasted-image-${Date.now()}.png`, {
            type: blob.type,
          });
          pastedFiles.push(file);
        }
      }
    }
    if (pastedFiles.length > 0) {
      e.preventDefault();
      if (accessToken && onPasteFile) {
        onPasteFile(pastedFiles);
      } else if (!accessToken) {
        setShowLoginPopup(true);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Sub-component Menu Item
  const MenuItem = ({ icon: Icon, title, desc, onClick, colorClass }: any) => (
    <button
      onClick={onClick}
      className="w-full flex items-start gap-3 p-2.5 hover:bg-gray-50 rounded-xl transition-all text-left group"
    >
      <div
        className={cn(
          "w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors shadow-sm",
          colorClass
        )}
      >
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0 mt-0.5">
        <h4 className="text-xs font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
          {title}
        </h4>
        <p className="text-[10px] text-gray-500 font-medium truncate">{desc}</p>
      </div>
    </button>
  );

  const isReadyToSend = message.trim().length > 0 || hasFiles;

  return (
    <>
      <LoginPopup
        isOpen={showLoginPopup}
        onClose={() => setShowLoginPopup(false)}
        message="Vui lòng đăng nhập để sử dụng tính năng này"
      />

      {/* Wrapper chính */}
      <div
        className={cn(
          "flex flex-col w-full transition-all duration-300 rounded-[28px] border relative bg-white",
          isAnyDragActive
            ? "border-blue-400 border-dashed bg-blue-50/50 shadow-lg scale-[1.01]"
            : "border-gray-200 hover:border-gray-300 shadow-sm"
        )}
      >
        {/* Dropzone được quản lý bởi parent component */}

        {/* OVERLAY KHI KÉO FILE */}
        <AnimatePresence>
          {isAnyDragActive && (
            <motion.div
              initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
              animate={{ opacity: 1, backdropFilter: "blur(2px)" }}
              exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
              className="absolute inset-0 z-50 bg-white/80 rounded-[26px] flex items-center justify-center"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="text-blue-600 font-bold text-sm flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full shadow-sm"
              >
                <Paperclip size={18} /> Thả file vào đây
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Files được hiển thị ở FileStagingArea bên ngoài */}

        {/* 2. INPUT BAR */}
        <div
          {...getRootProps()} // Dropzone local cho vùng input
          className="flex items-end gap-2 p-1.5 relative z-10"
        >
          <input {...getInputProps()} className="hidden" />

          {/* Action Button (Plus) - Desktop: Popover, Mobile: Bottom Sheet */}
          {isMobile ? (
            <button
              type="button"
              onClick={() => {
                if (!accessToken) {
                  setShowLoginPopup(true);
                } else {
                  setIsMenuOpen(!isMenuOpen);
                }
              }}
              className={cn(
                "rounded-full h-9 w-9 transition-all duration-300 touch-manipulation flex items-center justify-center mb-0.5",
                isMenuOpen
                  ? "bg-blue-600 text-white rotate-45 shadow-md"
                  : "text-gray-400 hover:text-blue-600 hover:bg-blue-50"
              )}
            >
              <Plus size={22} strokeWidth={2.5} />
            </button>
          ) : (
            <Popover open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  onClick={() => !accessToken && setShowLoginPopup(true)}
                  disabled={!accessToken}
                  className={cn(
                    "rounded-full h-9 w-9 transition-all duration-300 flex items-center justify-center mb-0.5",
                    isMenuOpen
                      ? "bg-blue-600 text-white rotate-45 shadow-md"
                      : "text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                  )}
                >
                  <Plus size={22} strokeWidth={2.5} />
                </button>
              </PopoverTrigger>
              {accessToken && (
                <PopoverContent
                  side="top"
                  align="start"
                  className="w-64 p-1.5 rounded-2xl shadow-2xl border-gray-100 mb-2"
                >
                  <div className="grid gap-0.5">
                    <div className="px-2 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Tải lên
                    </div>
                    <MenuItem
                      icon={FileUp}
                      title="File thiết kế"
                      desc="PDF, AI, PSD, CDR"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onFileClick?.();
                      }}
                      colorClass="bg-blue-50 text-blue-600"
                    />
                    <MenuItem
                      icon={ImageIcon}
                      title="Thư viện ảnh"
                      desc="JPG, PNG, HEIC"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onFileClick?.();
                      }}
                      colorClass="bg-purple-50 text-purple-600"
                    />

                    <div className="h-px bg-gray-100 my-1" />

                    <div className="px-2 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Liên kết
                    </div>
                    <MenuItem
                      icon={LinkIcon}
                      title="Link Canva"
                      desc="Chia sẻ thiết kế"
                      onClick={() => {
                        setIsMenuOpen(false);
                        setLinkType("canva");
                        setIsLinkModalOpen(true);
                      }}
                      colorClass="bg-indigo-50 text-indigo-600"
                    />
                    <MenuItem
                      icon={() => (
                        <span className="font-extrabold text-[9px]">GD</span>
                      )}
                      title="Google Drive"
                      desc="Chọn từ Drive"
                      onClick={() => {
                        setIsMenuOpen(false);
                        openDrivePicker();
                      }}
                      colorClass="bg-green-50 text-green-600"
                    />
                  </div>
                </PopoverContent>
              )}
            </Popover>
          )}

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={hasFiles ? "Thêm tin nhắn..." : "Nhắn tin..."}
            className="flex-1 bg-transparent border-none outline-none focus:ring-0 focus:outline-none text-[15px] py-2.5 px-1 max-h-[150px] resize-none placeholder:text-gray-400 leading-relaxed text-gray-800 font-medium overflow-y-auto scrollbar-hide"
            rows={1}
            style={{ minHeight: "40px" }}
            disabled={isLoading}
          />

          {/* Send Button */}
          <div className="flex-shrink-0 h-9 w-9 mb-0.5 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                </motion.div>
              ) : isReadyToSend ? (
                <motion.button
                  key="send"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSend}
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-md shadow-blue-200"
                >
                  <Send size={16} strokeWidth={2.5} className="ml-0.5" />
                </motion.button>
              ) : (
                <div className="w-9 h-9" />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Menu Modal - Mobile Only */}
      <AnimatePresence>
        {isMobile && isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-4 pb-8 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6" />

              <div className="grid gap-2">
                <div className="px-2 py-1 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Tải lên
                </div>
                <MenuItem
                  icon={FileUp}
                  title="File thiết kế"
                  desc="PDF, AI, PSD, CDR"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onFileClick?.();
                  }}
                  colorClass="bg-blue-50 text-blue-600"
                />
                <MenuItem
                  icon={ImageIcon}
                  title="Thư viện ảnh"
                  desc="JPG, PNG, HEIC"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onFileClick?.();
                  }}
                  colorClass="bg-purple-50 text-purple-600"
                />

                <div className="h-px bg-gray-100 my-2" />

                <div className="px-2 py-1 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Liên kết
                </div>
                <MenuItem
                  icon={LinkIcon}
                  title="Link Canva"
                  desc="Chia sẻ thiết kế"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setLinkType("canva");
                    setIsLinkModalOpen(true);
                  }}
                  colorClass="bg-indigo-50 text-indigo-600"
                />
                <MenuItem
                  icon={() => (
                    <span className="font-extrabold text-[9px]">GD</span>
                  )}
                  title="Google Drive"
                  desc="Chọn từ Drive"
                  onClick={() => {
                    setIsMenuOpen(false);
                    openDrivePicker();
                  }}
                  colorClass="bg-green-50 text-green-600"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Link */}
      <AddLinkModal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        type={linkType}
        onAdd={(url) => {
          if (onAddLink) onAddLink(url, linkType);
          else {
            setMessage((prev) => prev + (prev ? "\n" : "") + url);
          }
        }}
      />
    </>
  );
}

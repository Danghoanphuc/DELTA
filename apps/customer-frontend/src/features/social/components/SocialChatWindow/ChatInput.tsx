// src/features/chat/components/ChatInput.tsx

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Loader2, Plus, FileUp, Image as ImageIcon, Link as LinkIcon, Paperclip, X, FileText } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { useAuthStore } from "@/stores/useAuthStore";
import { LoginPopup } from "@/features/auth/components/LoginPopup";
import { cn } from "@/shared/lib/utils";
import { useFileUpload } from "@/features/chat/hooks/useFileUpload";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";

import { AddLinkModal } from "@/shared/components/ui/AddLinkModal";
import { useGoogleDrive } from "@/shared/hooks/useGoogleDrive";

interface ChatInputProps {
  isLoading: boolean;
  onSendText: (text: string) => void;
  onFileUpload: (file: File) => void;
  // ✅ Optional Props để hỗ trợ Social/Advanced features
  onAddLink?: (url: string, type: 'canva' | 'drive' | 'general') => void;
}

// Component Thumbnail (Giữ nguyên vẻ đẹp)
const FileThumbnail = ({ file, onRemove }: { file: File; onRemove: () => void }) => {
  const isImage = file.type.startsWith("image/");
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (isImage) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file, isImage]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8, width: 0 }}
      className="relative group flex-shrink-0"
    >
      <div className="w-14 h-14 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800 relative shadow-sm">
        {isImage && preview ? (
          <img src={preview} alt="preview" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-1 bg-gray-50">
            <FileText className="w-5 h-5 text-blue-500 mb-0.5" />
            <span className="text-[8px] text-gray-500 truncate w-full text-center px-1 font-medium">
              {file.name.split('.').pop()?.toUpperCase()}
            </span>
          </div>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="absolute top-0.5 right-0.5 bg-gray-900/60 hover:bg-red-500 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-all"
        >
          <X size={10} />
        </button>
      </div>
    </motion.div>
  );
};

export function ChatInput({
  isLoading,
  onSendText,
  onFileUpload,
  onAddLink
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  
  // State cho Popover & Modal
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkType, setLinkType] = useState<'canva' | 'drive'>('canva');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { accessToken } = useAuthStore();

  // Hook xử lý file (Đã có queue)
  const { files, addFiles, removeFile, clearFiles, isDragActive, dropzoneConfig } = useFileUpload({
    isLoading,
  });

  // ✅ Tích hợp Google Drive
  const { openDrivePicker } = useGoogleDrive({
    onPick: (driveFiles) => {
      if (accessToken) {
        addFiles(driveFiles); // Thêm trực tiếp vào hàng đợi
        setIsPopoverOpen(false);
      } else {
        setShowLoginPopup(true);
      }
    }
  });

  // Auto-resize
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    if (message.trim()) {
        textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    } else {
        textarea.style.height = '44px';
    }
  }, [message]);

  // Dropzone Logic cho vùng Input
  const { getRootProps, getInputProps, isDragActive: isInputDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
        if(accessToken) addFiles(acceptedFiles);
        else setShowLoginPopup(true);
    },
    noClick: true,
    noKeyboard: true,
    multiple: true,
  });

  // Combine drag states
  const isAnyDragActive = isDragActive || isInputDragActive;

  // Xử lý gửi
  const handleSend = () => {
    if (isLoading) return;
    if (!message.trim() && files.length === 0) return;

    const filesToSend = [...files];
    const textToSend = message.trim();

    clearFiles();
    if (textToSend) {
        setMessage("");
        if (textareaRef.current) {
            textareaRef.current.style.height = '44px';
            textareaRef.current.focus();
        }
    }

    // Gửi từng file (Backward compatibility với Bot API)
    // Sau này có thể refactor để gửi 1 mảng files
    filesToSend.forEach(file => onFileUpload(file));
    
    if (textToSend) onSendText(textToSend);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    const pastedFiles: File[] = [];
    for (const item of items) {
      if (item.type.indexOf("image") !== -1) {
        const blob = item.getAsFile();
        if (blob) {
             const file = new File([blob], `pasted-image-${Date.now()}.png`, { type: blob.type });
             pastedFiles.push(file);
        }
      }
    }
    if (pastedFiles.length > 0) {
        e.preventDefault();
        if (accessToken) addFiles(pastedFiles);
        else setShowLoginPopup(true);
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
    <button onClick={onClick} className="w-full flex items-start gap-3 p-2.5 hover:bg-gray-50 rounded-xl transition-all text-left group">
        <div className={cn("w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors shadow-sm", colorClass)}>
            <Icon size={18} />
        </div>
        <div className="flex-1 min-w-0 mt-0.5">
            <h4 className="text-xs font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{title}</h4>
            <p className="text-[10px] text-gray-500 font-medium truncate">{desc}</p>
        </div>
    </button>
  );

  const isReadyToSend = message.trim().length > 0 || files.length > 0;

  return (
    <>
      <LoginPopup
        isOpen={showLoginPopup}
        onClose={() => setShowLoginPopup(false)}
        message="Vui lòng đăng nhập để sử dụng tính năng này"
      />
      
      {/* Wrapper chính */}
      <div className={cn(
          "flex flex-col w-full transition-all duration-300 rounded-[28px] border relative bg-white",
          isAnyDragActive 
            ? "border-blue-400 border-dashed bg-blue-50/50 shadow-lg scale-[1.01]" 
            : "border-gray-200 hover:border-gray-300 shadow-sm focus-within:shadow-[0_8px_30px_rgba(0,0,0,0.04)] focus-within:border-blue-100 focus-within:ring-4 focus-within:ring-blue-50/50"
      )}>
        
        {/* Input ẩn cho Dropzone toàn cục (nếu dùng) */}
        <div {...dropzoneConfig.getRootProps()} className="absolute inset-0 z-0 pointer-events-none">
            <input {...dropzoneConfig.getInputProps()} />
        </div>

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

        {/* 1. HÀNG ĐỢI FILE (Thumbnail Queue) */}
        <AnimatePresence>
          {files.length > 0 && (
            <motion.div 
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 8 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="px-2 pt-2 overflow-hidden"
            >
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-200">
                {files.map((file, index) => (
                    <FileThumbnail 
                        key={`${file.name}-${index}`} 
                        file={file} 
                        onRemove={() => removeFile(index)} 
                    />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 2. INPUT BAR */}
        <div 
            {...getRootProps()} // Dropzone local cho vùng input
            className="flex items-end gap-2 p-1.5 relative z-10"
        >
            <input {...getInputProps()} className="hidden" />

            {/* Action Button (Plus) - Tích hợp Menu */}
            <div className="flex gap-1 mb-0.5">
                <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                    <PopoverTrigger asChild>
                        <Button 
                            size="icon" 
                            variant="ghost" 
                            onClick={() => { if(!accessToken) setShowLoginPopup(true); }}
                            className={cn(
                                "rounded-full h-9 w-9 transition-all duration-300", 
                                isPopoverOpen 
                                    ? "bg-blue-600 text-white rotate-45 shadow-md" 
                                    : "text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                            )}
                        >
                            <Plus size={22} strokeWidth={2.5} />
                        </Button>
                    </PopoverTrigger>
                    
                    {accessToken && (
                        <PopoverContent side="top" align="start" className="w-64 p-1.5 rounded-2xl shadow-2xl border-gray-100 mb-2">
                            <div className="grid gap-0.5">
                                <div className="px-2 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tải lên</div>
                                <MenuItem 
                                    icon={FileUp} title="File thiết kế" desc="PDF, AI, PSD, CDR" 
                                    onClick={() => { setIsPopoverOpen(false); dropzoneConfig.open(); }} 
                                    colorClass="bg-blue-50 text-blue-600" 
                                />
                                <MenuItem 
                                    icon={ImageIcon} title="Thư viện ảnh" desc="JPG, PNG, HEIC" 
                                    onClick={() => { setIsPopoverOpen(false); dropzoneConfig.open(); }} 
                                    colorClass="bg-purple-50 text-purple-600" 
                                />
                                
                                <div className="h-px bg-gray-100 my-1"/>
                                
                                <div className="px-2 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Liên kết</div>
                                <MenuItem 
                                    icon={LinkIcon} title="Link Canva" desc="Chia sẻ thiết kế" 
                                    onClick={() => { setIsPopoverOpen(false); setLinkType('canva'); setIsLinkModalOpen(true); }} 
                                    colorClass="bg-indigo-50 text-indigo-600" 
                                />
                                <MenuItem 
                                    icon={({size}: {size?: number}) => <span className="font-extrabold text-[9px]">GD</span>} 
                                    title="Google Drive" desc="Chọn từ Drive" 
                                    onClick={openDrivePicker} 
                                    colorClass="bg-green-50 text-green-600" 
                                />
                            </div>
                        </PopoverContent>
                    )}
                </Popover>
            </div>

            {/* Textarea */}
            <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                placeholder={files.length > 0 ? `Gửi ${files.length} file này...` : "Hỏi Zin ngay..."}
                className="flex-1 bg-transparent border-none focus:ring-0 text-[15px] py-2.5 px-1 max-h-[150px] resize-none placeholder:text-gray-400 leading-relaxed custom-scrollbar text-gray-800 font-medium"
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
                            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                        >
                            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                        </motion.div>
                    ) : isReadyToSend ? (
                        <motion.button
                            key="send"
                            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
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

      {/* Modal Link */}
      <AddLinkModal 
          isOpen={isLinkModalOpen} 
          onClose={() => setIsLinkModalOpen(false)} 
          type={linkType}
          onAdd={(url) => {
              if (onAddLink) onAddLink(url, linkType); // Callback nếu có
              else {
                  // Fallback nếu chưa implement onAddLink: Thêm vào text
                  setMessage(prev => prev + (prev ? "\n" : "") + url);
              }
          }}
      />
    </>
  );
}
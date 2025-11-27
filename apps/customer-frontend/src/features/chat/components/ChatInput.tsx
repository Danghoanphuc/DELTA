import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Loader2, Plus, FileUp, Image as ImageIcon, Link as LinkIcon, Paperclip, X, FileText, HardDrive, Palette } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { useAuthStore } from "@/stores/useAuthStore";
import { LoginPopup } from "@/features/auth/components/LoginPopup";
import { cn } from "@/shared/lib/utils";
import { useFileUpload } from "../hooks/useFileUpload";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";

// Import các tính năng mở rộng
import { AddLinkModal } from "@/shared/components/ui/AddLinkModal";
import { useGoogleDrive } from "@/shared/hooks/useGoogleDrive";

interface ChatInputProps {
  isLoading: boolean;
  onSendText: (text: string) => void | Promise<void>;
  
  // Props cho Bot (Internal Queue)
  onFileUpload?: (file: File) => void; 

  // Props cho Social (External Queue)
  hasFiles?: boolean;
  onFileClick?: () => void;
  onPasteFile?: (files: File[]) => void;
  onAddLink?: (url: string, type: 'canva' | 'drive' | 'general') => void;
  onAddDriveFile?: (files: File[]) => void;
}

// ----------------------------------------------------------------------
// 1. SUB-COMPONENT: THUMBNAIL (Cho Bot Mode)
// ----------------------------------------------------------------------
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
    <motion.div layout initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8, width: 0 }} className="relative group flex-shrink-0">
      <div className="w-14 h-14 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800 relative shadow-sm">
        {isImage && preview ? (
          <img src={preview} alt="preview" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-1 bg-gray-50">
            <FileText className="w-5 h-5 text-blue-500 mb-0.5" />
            <span className="text-[8px] text-gray-500 truncate w-full text-center px-1 font-medium">{file.name.split('.').pop()?.toUpperCase()}</span>
          </div>
        )}
        <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="absolute top-0.5 right-0.5 bg-gray-900/60 hover:bg-red-500 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-all"><X size={10} /></button>
      </div>
    </motion.div>
  );
};

// ----------------------------------------------------------------------
// 2. SUB-COMPONENT: ATTACHMENT MENU
// ----------------------------------------------------------------------
function ChatAttachmentMenu({
  children, onUploadFile, onUploadImage, onLinkCanva, onGoogleDrive, disabled
}: { children: React.ReactNode; onUploadFile: () => void; onUploadImage: () => void; onLinkCanva: () => void; onGoogleDrive: () => void; disabled?: boolean; }) {
  const [isOpen, setIsOpen] = useState(false);

  const MenuItem = ({ icon: Icon, label, desc, onClick, colorClass, bgClass }: any) => (
    <button 
      onClick={(e) => { e.stopPropagation(); setIsOpen(false); onClick(); }}
      disabled={disabled}
      className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-all text-left group disabled:opacity-50"
    >
      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-sm border border-transparent", bgClass, colorClass)}>
        <Icon size={18} strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-gray-800 group-hover:text-gray-900 leading-tight">{label}</h4>
        <p className="text-[11px] text-gray-500 font-medium truncate mt-0.5">{desc}</p>
      </div>
    </button>
  );

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen} modal={false}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent side="top" align="start" sideOffset={10} className="w-72 p-2 rounded-2xl shadow-2xl border-gray-100 bg-white/95 backdrop-blur-md z-[9999]">
        <div className="grid gap-1">
          <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider select-none">Tải lên từ máy</div>
          <MenuItem icon={FileUp} label="Tệp tài liệu" desc="PDF, AI, PSD, CDR (Max 50MB)" onClick={onUploadFile} colorClass="text-blue-600" bgClass="bg-blue-50 border-blue-100" />
          <MenuItem icon={ImageIcon} label="Thư viện ảnh" desc="JPG, PNG, HEIC (Gửi nguyên gốc)" onClick={onUploadImage} colorClass="text-purple-600" bgClass="bg-purple-50 border-purple-100" />
          <div className="h-px bg-gray-100 my-1 mx-2" />
          <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider select-none">Liên kết Cloud</div>
          <MenuItem icon={Palette} label="Canva Design" desc="Dán liên kết chia sẻ thiết kế" onClick={onLinkCanva} colorClass="text-[#7D2AE8]" bgClass="bg-[#F5F7FF] border-[#E6E6FA]" />
          <MenuItem icon={HardDrive} label="Google Drive" desc="Chọn tệp trực tiếp từ Drive" onClick={onGoogleDrive} colorClass="text-[#1FA463]" bgClass="bg-[#F0FDF4] border-[#DCFCE7]" />
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ----------------------------------------------------------------------
// 3. MAIN COMPONENT: CHAT INPUT
// ----------------------------------------------------------------------
export function ChatInput({
  isLoading,
  onSendText,
  onFileUpload,
  hasFiles = false,
  onFileClick,
  onPasteFile,
  onAddLink,
  onAddDriveFile
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkType, setLinkType] = useState<'canva' | 'drive'>('canva');
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { accessToken } = useAuthStore();
  const isBotMode = !!onFileUpload; 

  // Hook xử lý file (Internal)
  const { files: internalFiles, addFiles: addInternalFiles, removeFile: removeInternalFile, clearFiles: clearInternalFiles, dropzoneConfig } = useFileUpload({
    isLoading,
  });

  const { openDrivePicker } = useGoogleDrive({
    onPick: (files) => {
        if (!accessToken) return setShowLoginPopup(true);
        if (isBotMode) addInternalFiles(files);
        else if (onAddDriveFile) onAddDriveFile(files);
    }
  });

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    if (message) textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    else textarea.style.height = '40px';
  }, [message]);

  const handleDrop = useCallback((acceptedFiles: File[]) => {
    if (!accessToken) return setShowLoginPopup(true);
    if (isBotMode) addInternalFiles(acceptedFiles);
    else if (onPasteFile) onPasteFile(acceptedFiles);
  }, [accessToken, isBotMode, addInternalFiles, onPasteFile]);

  // Dropzone cho vùng Input (Drag & Drop)
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    noClick: true,
    noKeyboard: true,
    multiple: true
  });

  const handleSend = async () => {
    if (isLoading) return;
    if (!message.trim() && !hasFiles && internalFiles.length === 0) return;

    const textToSend = message.trim();
    setMessage("");
    
    if (textareaRef.current) {
        textareaRef.current.style.height = '40px';
        textareaRef.current.focus();
    }

    if (isBotMode) {
        internalFiles.forEach(f => onFileUpload && onFileUpload(f));
        clearInternalFiles();
        if (textToSend) onSendText(textToSend);
    } else {
        await onSendText(textToSend);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    const pastedFiles: File[] = [];
    for (const item of items) {
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file) pastedFiles.push(file);
      }
    }
    if (pastedFiles.length > 0) {
        e.preventDefault();
        handleDrop(pastedFiles);
    }
  };

  const handleOpenLinkModal = (type: 'canva' | 'drive') => {
      if (!accessToken) return setShowLoginPopup(true);
      setLinkType(type);
      setIsLinkModalOpen(true);
  };

  const isReadyToSend = message.trim().length > 0 || hasFiles || internalFiles.length > 0;

  return (
    <>
      <LoginPopup isOpen={showLoginPopup} onClose={() => setShowLoginPopup(false)} message="Vui lòng đăng nhập" />
      
      <div className="p-3 bg-white relative z-20">
        <div 
            {...getRootProps()} 
            className={cn(
                "flex items-end gap-2 p-1.5 rounded-[26px] border transition-all duration-200 ease-in-out relative",
                !isDragActive && "bg-gray-100/80 border-transparent hover:bg-gray-100",
                !isDragActive && "focus-within:bg-white focus-within:border-gray-200 focus-within:shadow-sm",
                isDragActive && "bg-blue-50 border-2 border-dashed border-blue-400"
            )}
        >
            {/* INPUT 1: Cho Drag & Drop vào vùng ChatBox */}
            <input {...getInputProps()} className="hidden" />

            {/* ✅ FIX QUAN TRỌNG: INPUT 2: Cho Nút Bấm "Tải Lên" (Bot Mode) */}
            <input {...dropzoneConfig.getInputProps()} className="hidden" />

            <AnimatePresence>
                {isDragActive && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 bg-white/90 backdrop-blur-sm rounded-[26px] flex items-center justify-center pointer-events-none">
                        <span className="text-blue-600 font-bold text-sm flex items-center gap-2"><Paperclip size={18} className="animate-bounce" /> Thả file vào đây</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Internal Queue (Bot Mode) */}
            <AnimatePresence>
                {isBotMode && internalFiles.length > 0 && (
                    <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: "auto", opacity: 1 }} exit={{ width: 0, opacity: 0 }} className="flex gap-1 overflow-hidden pr-1">
                        {internalFiles.map((f, i) => <FileThumbnail key={i} file={f} onRemove={() => removeInternalFile(i)} />)}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ACTION BUTTON */}
            <div className="flex gap-1 mb-0.5">
                <ChatAttachmentMenu
                    disabled={isLoading}
                    onUploadFile={() => { 
                        if (!accessToken) return setShowLoginPopup(true);
                        // Bot Mode: Dùng dropzone nội bộ. Social Mode: Gọi hàm cha
                        isBotMode ? dropzoneConfig.open() : onFileClick?.(); 
                    }}
                    onUploadImage={() => { 
                        if (!accessToken) return setShowLoginPopup(true);
                        isBotMode ? dropzoneConfig.open() : onFileClick?.(); 
                    }}
                    onLinkCanva={() => handleOpenLinkModal('canva')}
                    onGoogleDrive={openDrivePicker}
                >
                    <Button 
                        size="icon" 
                        variant="ghost" 
                        className={cn(
                            "rounded-full h-9 w-9 transition-all text-gray-500 hover:text-blue-600 hover:bg-blue-50/50",
                            "data-[state=open]:bg-blue-50 data-[state=open]:text-blue-600 data-[state=open]:rotate-45"
                        )}
                    >
                        <Plus size={22} strokeWidth={2.5} />
                    </Button>
                </ChatAttachmentMenu>
            </div>

            {/* TEXTAREA (Sạch sẽ, không viền) */}
            <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                placeholder={hasFiles || internalFiles.length > 0 ? "Thêm mô tả..." : "Nhập tin nhắn..."}
                className={cn(
                    "flex-1 w-full bg-transparent",
                    "[&::-webkit-scrollbar]:hidden", 
                    "text-[15px] py-2.5 px-2 max-h-[150px] overflow-y-auto leading-relaxed text-gray-800 font-medium placeholder:text-gray-400"
                )}
                style={{
                    resize: "none", minHeight: "40px",
                    scrollbarWidth: "none", msOverflowStyle: "none", outline: "none", border: "none", boxShadow: "none"
                }}
                rows={1}
                disabled={isLoading}
                spellCheck={false}
            />

            {/* SEND BUTTON */}
            <div className="flex-shrink-0 h-9 w-9 mb-0.5 flex items-center justify-center">
                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <motion.div key="loading" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Loader2 className="w-5 h-5 animate-spin text-blue-600" /></motion.div>
                    ) : (
                        <motion.button 
                            key="send" 
                            initial={{ scale: isReadyToSend ? 0 : 1, opacity: isReadyToSend ? 0 : 1 }} 
                            animate={{ scale: 1, opacity: 1 }} 
                            exit={{ scale: 0, opacity: 0 }} 
                            onClick={handleSend} 
                            disabled={!isReadyToSend} 
                            whileHover={{ scale: 1.05 }} 
                            whileTap={{ scale: 0.95 }} 
                            className={cn(
                                "w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-sm", 
                                isReadyToSend 
                                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200/50" 
                                    : "bg-gray-100 text-gray-300 cursor-not-allowed"
                            )}
                        >
                            <Send size={16} strokeWidth={2.5} className={cn(isReadyToSend && "ml-0.5")} />
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>
        </div>
      </div>

      <AddLinkModal isOpen={isLinkModalOpen} onClose={() => setIsLinkModalOpen(false)} type={linkType} onAdd={(url) => {
          if (onAddLink) onAddLink(url, linkType);
          else setMessage(prev => prev + (prev ? "\n" : "") + url);
      }} />
    </>
  );
}
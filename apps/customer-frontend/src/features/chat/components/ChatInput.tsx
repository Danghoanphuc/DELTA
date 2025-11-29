// apps/customer-frontend/src/features/chat/components/ChatInput.tsx
import { useState } from "react";
import {
  Send,
  Plus,
  Image as ImageIcon,
  FileUp,
  Palette,
  HardDrive,
  X,
  FileText,
} from "lucide-react";
import { useSmartChatInput } from "../hooks/useSmartChatInput";
import { useFileUpload } from "../hooks/useFileUpload"; // ✅ Updated Hook
import { SlashCommandMenu } from "./SlashCommandMenu";
import { AnimatePresence, motion } from "framer-motion";
import { useGoogleDrive } from "@/shared/hooks/useGoogleDrive";
import { useInputIntelligence } from "../hooks/useInputIntelligence";
import { AddLinkModal } from "@/shared/components/ui/AddLinkModal";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

// --- SUB COMPONENT (Menu đính kèm) ---
function ChatAttachmentMenu({
  onUploadFile,
  onUploadImage,
  onLinkCanva,
  onGoogleDrive,
}: any) {
  const [isOpen, setIsOpen] = useState(false);

  const handleAction = (action: () => void) => {
    setIsOpen(false);
    action();
  };

  const MenuItem = ({ icon: Icon, label, onClick, colorClass }: any) => (
    <button
      onClick={(e) => {
        e.stopPropagation();
        handleAction(onClick);
      }}
      className="w-full flex items-center gap-3 p-2.5 hover:bg-gray-50 rounded-lg text-left transition-colors group"
    >
      <div
        className={cn(
          "p-1.5 rounded-md bg-white border border-gray-100 shadow-sm group-hover:border-gray-200",
          colorClass
        )}
      >
        <Icon size={16} />
      </div>
      <span className="text-sm text-gray-700 font-medium">{label}</span>
    </button>
  );

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="rounded-full h-9 w-9 text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
        >
          <Plus size={22} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        className="w-56 p-1.5 shadow-xl border-gray-100 rounded-xl"
      >
        <MenuItem
          icon={FileUp}
          label="Tệp tài liệu"
          onClick={onUploadFile}
          colorClass="text-blue-600"
        />
        <MenuItem
          icon={ImageIcon}
          label="Ảnh"
          onClick={onUploadImage}
          colorClass="text-purple-600"
        />
        <MenuItem
          icon={Palette}
          label="Canva Design"
          onClick={onLinkCanva}
          colorClass="text-pink-600"
        />
        <MenuItem
          icon={HardDrive}
          label="Google Drive"
          onClick={onGoogleDrive}
          colorClass="text-green-600"
        />
      </PopoverContent>
    </Popover>
  );
}

// --- MAIN COMPONENT ---
export function ChatInput({ isLoading, onSendText, onFileUpload }: any) {
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkType, setLinkType] = useState<"canva" | "drive">("canva");

  // ✅ HOOK MỚI: Không block UI khi loading, chỉ quản lý state file
  const { files, addFiles, removeFile, clearFiles, dropzoneConfig } =
    useFileUpload({ isLoading: false }); // False vì ta muốn cho phép chọn file lúc nào cũng được

  const { openDrivePicker } = useGoogleDrive({
    onPick: (driveFiles) => addFiles(driveFiles),
  });

  const {
    message,
    setMessage,
    links,
    showSlashMenu,
    executeSlashCommand,
    addLink,
    removeLink,
    handleInputChange,
    handlePaste,
    handleKeyDown,
    handleSend,
    textareaRef,
  } = useSmartChatInput({
    onSendRaw: async (text) => {
      // ✅ LOGIC ĐỒNG BỘ:
      // 1. Nếu có file -> Gửi file trước (Loop qua mảng files từ useFileUpload)
      if (files.length > 0) {
        // Lưu ý: onFileUpload là prop truyền từ ChatInterface (gọi API)
        // Ta cần gửi từng file một hoặc gửi batch tùy API.
        // Ở đây giả định gửi từng file để đơn giản.
        const uploadPromises = files.map((f: File) => onFileUpload?.(f));
        await Promise.all(uploadPromises);
        clearFiles(); // Xóa UI sau khi gửi
      }

      // 2. Gửi text sau (nếu có)
      if (text.trim()) {
        await onSendText(text);
      }
    },
    triggerActions: {
      openCanva: () => {
        setLinkType("canva");
        setIsLinkModalOpen(true);
      },
      openDrive: () => openDrivePicker(),
      openUpload: () => dropzoneConfig.open(),
    },
  });

  const { analyzeInput } = useInputIntelligence();
  const onInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleInputChange(e);
    analyzeInput(e.target.value, e.target.selectionStart);
  };

  // Override handlePaste của SmartInput để nhận diện file từ clipboard
  const onPasteWrapper = (e: React.ClipboardEvent) => {
    const result = handlePaste(e);
    if (!result.handled) {
      // Nếu SmartInput không xử lý (tức là không phải text/link), check xem có phải file không
      const items = e.clipboardData.items;
      const pastedFiles: File[] = [];
      for (const item of items) {
        if (item.kind === "file") {
          const file = item.getAsFile();
          if (file) pastedFiles.push(file);
        }
      }
      if (pastedFiles.length > 0) {
        e.preventDefault();
        addFiles(pastedFiles);
      }
    }
  };

  const isReadyToSend =
    message.trim().length > 0 || files.length > 0 || links.length > 0;

  return (
    <div className="relative p-3 bg-white z-20">
      {/* Hidden Input cho Dropzone */}
      <input {...dropzoneConfig.getInputProps()} className="hidden" />

      {/* Menu lệnh nhanh (Slash Command) */}
      <SlashCommandMenu
        isOpen={showSlashMenu}
        onSelect={executeSlashCommand}
        onClose={() => {}}
      />

      <div
        className={cn(
          "flex items-end gap-2 p-1.5 rounded-[26px] border transition-all duration-300",
          "bg-gray-100/80 focus-within:bg-white focus-within:shadow-[0_2px_12px_rgba(0,0,0,0.05)] focus-within:border-blue-200"
        )}
      >
        {/* Nút cộng Attachment */}
        <div className="flex-shrink-0">
          <ChatAttachmentMenu
            onUploadFile={dropzoneConfig.open}
            onUploadImage={dropzoneConfig.open}
            onLinkCanva={() => {
              setLinkType("canva");
              setIsLinkModalOpen(true);
            }}
            onGoogleDrive={openDrivePicker}
          />
        </div>

        {/* Vùng hiển thị Thumbnails (File & Link) - Có Animation */}
        <div className="flex-1 min-w-0">
          {(files.length > 0 || links.length > 0) && (
            <div className="flex gap-2 flex-wrap px-1 mb-2 animate-in fade-in slide-in-from-bottom-2">
              {/* File Thumbnails */}
              {files.map((f: File, i: number) => (
                <div
                  key={`file-${i}`}
                  className="relative group flex items-center gap-2 bg-gray-50 border border-gray-200 pr-2 pl-2 py-1.5 rounded-xl"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600">
                    {f.type.startsWith("image/") ? (
                      <ImageIcon size={14} />
                    ) : (
                      <FileText size={14} />
                    )}
                  </div>
                  <div className="max-w-[100px] truncate">
                    <div className="text-[11px] font-medium text-gray-700 truncate">
                      {f.name}
                    </div>
                    <div className="text-[9px] text-gray-400">
                      {(f.size / 1024).toFixed(0)}KB
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(i)}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-gray-400 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}

              {/* Link Thumbnails */}
              {links.map((l: any) => (
                <div
                  key={l.id}
                  className="relative group flex items-center gap-1.5 bg-blue-50 border border-blue-100 px-2 py-1.5 rounded-xl text-blue-700"
                >
                  <span className="text-[10px] font-bold bg-white/50 px-1 rounded uppercase tracking-wider">
                    {l.type}
                  </span>
                  <span className="text-xs font-medium max-w-[100px] truncate">
                    {l.title}
                  </span>
                  <button
                    onClick={() => removeLink(l.id)}
                    className="ml-1 w-4 h-4 hover:bg-blue-200 text-blue-600 rounded-full flex items-center justify-center transition-colors"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Input chính */}
          <textarea
            ref={textareaRef}
            value={message}
            onChange={onInputChange}
            onKeyDown={handleKeyDown}
            onPaste={onPasteWrapper}
            placeholder="Nhập yêu cầu..."
            className="w-full bg-transparent max-h-[150px] overflow-y-auto py-2 px-2 text-[15px] outline-none resize-none placeholder:text-gray-400 min-h-[40px] leading-[24px]"
            rows={1}
            style={{ height: "auto", minHeight: "40px" }}
            // Auto-resize logic có thể thêm vào đây hoặc dùng library
          />
        </div>

        {/* Nút Gửi */}
        <div className="flex-shrink-0 h-9 w-9 mb-0.5 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </motion.div>
            ) : (
              <motion.button
                key="send"
                onClick={handleSend}
                disabled={!isReadyToSend}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: isReadyToSend ? 1 : 0.4 }}
                whileTap={{ scale: 0.9 }}
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-sm",
                  isReadyToSend
                    ? "bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                )}
              >
                <Send size={16} className={cn(isReadyToSend && "ml-0.5")} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Modal thêm link */}
      <AddLinkModal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        type={linkType}
        onAdd={(url) => {
          addLink(url);
          setIsLinkModalOpen(false);
        }}
      />
    </div>
  );
}

// apps/customer-frontend/src/features/chat/components/ChatInput.tsx
import { useState } from "react";
import {
  Send,
  Plus,
  Image as ImageIcon,
  FileText,
  X,
  Paperclip,
} from "lucide-react";
import { useSmartChatInput } from "../hooks/useSmartChatInput";
import { useFileUpload } from "../hooks/useFileUpload";
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

// ... [Giữ nguyên ChatAttachmentMenu, chỉ đổi icon Plus -> Paperclip cho giống Claude] ...
function ChatAttachmentMenu({
  onUploadFile,
  onUploadImage,
  onLinkCanva,
  onGoogleDrive,
}: any) {
  // ... (Logic giữ nguyên)
  // Thay icon Plus thành Paperclip
  return (
    <Popover>
      {/* ... */}
      <Button
        size="icon"
        variant="ghost"
        className="rounded-lg h-8 w-8 text-stone-500 hover:bg-stone-100 transition-colors"
      >
        <Paperclip size={18} />
      </Button>
      {/* ... */}
    </Popover>
  );
}

// --- MAIN COMPONENT ---
export function ChatInput({ isLoading, onSendText, onFileUpload }: any) {
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkType, setLinkType] = useState<"canva" | "drive">("canva");

  const { files, addFiles, removeFile, clearFiles, dropzoneConfig } =
    useFileUpload({ isLoading: false });

  const { openDrivePicker } = useGoogleDrive({
    onPick: (driveFiles) => addFiles(driveFiles),
  });

  const {
    message,
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
      if (files.length > 0) {
        const uploadPromises = files.map((f: File) => onFileUpload?.(f));
        await Promise.all(uploadPromises);
        clearFiles();
      }
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

  const onPasteWrapper = (e: React.ClipboardEvent) => {
    const result = handlePaste(e);
    if (!result.handled) {
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
    <div className="relative z-20">
      <input {...dropzoneConfig.getInputProps()} className="hidden" />

      <SlashCommandMenu
        isOpen={showSlashMenu}
        onSelect={executeSlashCommand}
        onClose={() => {}}
      />

      {/* 🔥 CLAUDE STYLE: Floating Container, White bg, Deep Shadow, Rounded-2xl */}
      <div
        className={cn(
          "flex flex-col p-3 rounded-2xl transition-all duration-300 border",
          "bg-white dark:bg-zinc-800",
          "shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.12)]",
          "border-stone-200 dark:border-zinc-700 focus-within:border-stone-300 dark:focus-within:border-zinc-600"
        )}
      >
        {/* Vùng hiển thị Thumbnails */}
        {(files.length > 0 || links.length > 0) && (
          <div className="flex gap-2 flex-wrap px-1 mb-3 animate-in fade-in slide-in-from-bottom-1">
            {files.map((f: File, i: number) => (
              <div
                key={`file-${i}`}
                className="relative group flex items-center gap-2 bg-stone-50 border border-stone-200 pr-2 pl-2 py-1.5 rounded-lg"
              >
                <div className="w-6 h-6 rounded bg-white border border-stone-100 flex items-center justify-center text-stone-600">
                  {f.type.startsWith("image/") ? (
                    <ImageIcon size={12} />
                  ) : (
                    <FileText size={12} />
                  )}
                </div>
                <div className="max-w-[120px] truncate text-[11px] font-medium text-stone-700">
                  {f.name}
                </div>
                <button
                  onClick={() => removeFile(i)}
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-stone-400 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-stone-600"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
            {/* Links rendering giữ nguyên logic nhưng đổi màu sang stone/gray */}
            {links.map((l: any) => (
              <div
                key={l.id}
                className="relative group flex items-center gap-1.5 bg-stone-50 border border-stone-200 px-2 py-1.5 rounded-lg text-stone-700"
              >
                <span className="text-[10px] font-bold bg-white px-1 rounded uppercase border border-stone-100">
                  {l.type}
                </span>
                <span className="text-xs font-medium max-w-[100px] truncate">
                  {l.title}
                </span>
                <button
                  onClick={() => removeLink(l.id)}
                  className="ml-1 w-4 h-4 hover:bg-stone-200 rounded-full flex items-center justify-center"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2">
          {/* Attachment Button */}
          <div className="flex-shrink-0 mb-0.5">
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

          {/* Input chính */}
          <textarea
            ref={textareaRef}
            value={message}
            onChange={onInputChange}
            onKeyDown={handleKeyDown}
            onPaste={onPasteWrapper}
            placeholder="Hỏi Zin bất cứ điều gì..."
            className="flex-1 bg-transparent py-2.5 px-1 text-[16px] outline-none resize-none placeholder:text-stone-400 text-stone-800 dark:text-stone-200 min-h-[44px] leading-[24px] font-sans"
            rows={1}
            style={{ height: "auto", minHeight: "44px" }}
          />

          {/* Nút Gửi (Square/Rounded style của Claude) */}
          <div className="flex-shrink-0 mb-1">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="w-8 h-8 flex items-center justify-center"
                >
                  <div className="w-5 h-5 border-2 border-stone-400 border-t-stone-800 rounded-full animate-spin" />
                </motion.div>
              ) : (
                <motion.button
                  key="send"
                  onClick={handleSend}
                  disabled={!isReadyToSend}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: isReadyToSend ? 1 : 0.3 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                    isReadyToSend
                      ? "bg-stone-900 text-white hover:bg-black"
                      : "bg-stone-200 text-stone-400 cursor-not-allowed"
                  )}
                >
                  <Send size={16} className={cn(isReadyToSend && "ml-0.5")} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

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

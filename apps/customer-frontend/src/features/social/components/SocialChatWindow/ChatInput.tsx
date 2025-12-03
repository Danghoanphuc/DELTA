import { useState, useRef, useEffect } from "react";
import {
  Send,
  Paperclip,
  Zap,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  Type,
  Plus,
  Palette,
  Reply,
  X,
} from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { cn } from "@/shared/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { LoginPopup } from "@/features/auth/components/LoginPopup";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { Button } from "@/shared/components/ui/button";
import { FileStagingArea } from "./FileStagingArea";
import type { StagedFile, FileContextType } from "./hooks/useSmartFileUpload";

const QUICK_TEMPLATES = [
  {
    id: "quote",
    label: "Báo giá",
    icon: "💰",
    content:
      "<b>BÁO GIÁ:</b><br/>- Đơn giá: ...<br/>- Số lượng: ...<br/>- <b>Thành tiền: ...</b>",
  },
  {
    id: "vat",
    label: "VAT Info",
    icon: "🧾",
    content: "Vui lòng cung cấp: <b>Tên Cty, MST, Địa chỉ</b> để xuất hóa đơn.",
  },
  {
    id: "bank",
    label: "Bank Info",
    icon: "💳",
    content: "<b>VIETCOMBANK</b><br/>STK: 999888<br/>CTK: PRINTZ GLOBAL",
  },
];

const TEXT_COLORS = [
  { color: "#1c1917", label: "Đen" },
  { color: "#dc2626", label: "Đỏ" },
  { color: "#16a34a", label: "Lá" },
  { color: "#2563eb", label: "Dương" },
  { color: "#d97706", label: "Cam" },
  { color: "#7c3aed", label: "Tím" },
];

type AlignType = "justifyLeft" | "justifyCenter" | "justifyRight";

interface ChatInputProps {
  isLoading: boolean;
  onSendText: (text: string) => void;
  stagedFiles?: StagedFile[];
  onRemoveFile?: (id: string) => void;
  onContextChange?: (id: string, context: FileContextType) => void;
  onPasteFile?: (files: File[]) => void;
  onFileClick?: () => void;
  onAddLink?: any;
  onAddDriveFile?: any;
  replyingTo?: any;
  replyPreviewText?: string;
  onCancelReply?: () => void;
}

export function ChatInput({
  isLoading,
  onSendText,
  stagedFiles = [],
  onRemoveFile,
  onPasteFile,
  onFileClick,
  replyingTo,
  replyPreviewText,
  onCancelReply,
}: ChatInputProps) {
  const [htmlContent, setHtmlContent] = useState("");
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  // States cho Toolbar
  const [currentColor, setCurrentColor] = useState("#1c1917");
  const [currentAlign, setCurrentAlign] = useState<AlignType>("justifyLeft");

  const editorRef = useRef<HTMLDivElement>(null);
  const { accessToken } = useAuthStore();

  // Auto-focus input when replying
  useEffect(() => {
    if (replyingTo && editorRef.current) {
      editorRef.current.focus();
      // Move cursor to end
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(editorRef.current);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [replyingTo]);

  // Handle paste event for images
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    const imageFiles: File[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf("image") !== -1) {
        const file = item.getAsFile();
        if (file) {
          imageFiles.push(file);
        }
      }
    }

    if (imageFiles.length > 0) {
      e.preventDefault();
      if (!accessToken) {
        setShowLoginPopup(true);
        return;
      }
      if (onPasteFile) {
        onPasteFile(imageFiles);
      }
    }
  };

  const exec = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  // Logic Toggle Align: Left -> Center -> Right -> Left
  const toggleAlign = () => {
    const nextAlign =
      currentAlign === "justifyLeft"
        ? "justifyCenter"
        : currentAlign === "justifyCenter"
        ? "justifyRight"
        : "justifyLeft";
    setCurrentAlign(nextAlign);
    exec(nextAlign);
  };

  const getAlignIcon = () => {
    switch (currentAlign) {
      case "justifyCenter":
        return AlignCenter;
      case "justifyRight":
        return AlignRight;
      default:
        return AlignLeft;
    }
  };

  const AlignIcon = getAlignIcon();

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const val = e.currentTarget.innerHTML;
    setHtmlContent(val);
    if (e.currentTarget.innerText.trim() === "/") setShowTemplates(true);
    else setShowTemplates(false);
  };

  const handleSelectTemplate = (content: string) => {
    if (editorRef.current) {
      editorRef.current.innerHTML =
        editorRef.current.innerHTML.replace("/", "") + content;
      setHtmlContent(editorRef.current.innerHTML);
      // Move caret logic...
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(editorRef.current);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
    setShowTemplates(false);
  };

  const handleSend = () => {
    if (isLoading) return;
    const cleanText = editorRef.current?.innerText.trim();
    if (!cleanText && stagedFiles.length === 0 && !htmlContent.includes("<img"))
      return;

    onSendText(htmlContent);

    // Reset UI ngay lập tức (Optimistic)
    if (editorRef.current) editorRef.current.innerHTML = "";
    setHtmlContent("");
    setShowTemplates(false);
    onCancelReply?.(); // Clear reply state
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === "Escape") {
      if (showTemplates) {
        setShowTemplates(false);
      } else if (replyingTo && onCancelReply) {
        onCancelReply();
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (accessToken && onPasteFile) onPasteFile(acceptedFiles);
      else setShowLoginPopup(true);
    },
    noClick: true,
    noKeyboard: true,
  });

  const hasFiles = stagedFiles.length > 0;
  const hasContent = htmlContent.trim().length > 0 || hasFiles;

  return (
    <>
      <LoginPopup
        isOpen={showLoginPopup}
        onClose={() => setShowLoginPopup(false)}
        message="Đăng nhập để chat"
      />

      {/* WRAPPER */}
      <div
        className={cn(
          "relative w-full transition-all duration-200",
          isDragActive && "scale-[1.02]"
        )}
        {...getRootProps()}
      >
        <input {...getInputProps()} className="hidden" />

        {/* TEMPLATES POPUP */}
        <AnimatePresence>
          {showTemplates && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute bottom-full mb-3 left-0 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden z-50"
            >
              <div className="bg-stone-50/50 px-3 py-2 border-b border-stone-100 flex items-center gap-2">
                <Zap size={14} className="text-amber-500 fill-amber-500" />
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                  Quick Reply
                </span>
              </div>
              <div className="max-h-60 overflow-y-auto p-1.5 space-y-1">
                {QUICK_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => handleSelectTemplate(tpl.content)}
                    className="w-full text-left flex items-center gap-3 p-2 hover:bg-stone-50 rounded-xl transition-all border border-transparent hover:border-stone-100"
                  >
                    <span className="text-lg">{tpl.icon}</span>
                    <span className="font-medium text-sm text-stone-700">
                      {tpl.label}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MAIN INPUT CONTAINER */}
        <div
          className={cn(
            "flex flex-col w-full rounded-[26px] overflow-hidden transition-colors duration-200",
            // FIXED STYLE: Nền kem nhẹ (stone-50), bóng nhẹ (shadow-sm), viền mỏng
            "bg-stone-50 border border-stone-200 shadow-sm"
          )}
        >
          {/* 0. REPLY PREVIEW (if replying) */}
          <AnimatePresence>
            {replyingTo && replyPreviewText && onCancelReply && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="px-3 pt-3"
              >
                <div className="flex items-center gap-2.5 px-3 py-2.5 bg-gradient-to-r from-blue-50 to-blue-50/50 border-l-4 border-blue-500 rounded-lg shadow-sm">
                  {/* Thumbnail if image */}
                  {(() => {
                    const attachments =
                      (replyingTo.content as any)?.attachments || [];
                    const imageAttachment = attachments.find(
                      (att: any) =>
                        att.type === "image" ||
                        att.url?.match(/\.(jpeg|jpg|png|webp|heic)$/i)
                    );
                    return imageAttachment ? (
                      <div className="w-10 h-10 rounded overflow-hidden shrink-0 border-2 border-blue-200">
                        <img
                          src={imageAttachment.url}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : null;
                  })()}

                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-bold text-blue-700 mb-1 uppercase tracking-wider flex items-center gap-1">
                      <Reply size={10} />
                      <span>Đang trả lời</span>
                    </div>
                    <div className="text-xs text-stone-700 truncate font-medium">
                      {replyPreviewText}
                    </div>
                  </div>
                  <button
                    onClick={onCancelReply}
                    className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full hover:bg-blue-100 text-stone-400 hover:text-red-500 transition-all active:scale-95"
                    title="Hủy trả lời (Esc)"
                  >
                    <X size={14} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 1. STAGING AREA (Embedded) */}
          {hasFiles && onRemoveFile && (
            <div className="px-3 pt-3">
              <FileStagingArea files={stagedFiles} onRemove={onRemoveFile} />
            </div>
          )}

          {/* 2. EDITOR AREA */}
          <div className="flex w-full min-h-[48px]">
            {/* Left Action (Plus/Attach) */}
            <div className="flex items-end pb-3 pl-3 shrink-0">
              <button
                onClick={() =>
                  !accessToken ? setShowLoginPopup(true) : onFileClick?.()
                }
                className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-200/50 hover:bg-stone-300 text-stone-600 transition-colors"
              >
                <Plus size={18} strokeWidth={2.5} />
              </button>
            </div>

            {/* Content Editable */}
            <div className="flex-1 relative py-3.5 px-3">
              <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                className={cn(
                  "w-full max-h-[200px] overflow-y-auto outline-none text-[15px] leading-relaxed text-stone-800 custom-scrollbar empty:before:content-[attr(placeholder)] empty:before:text-stone-400 cursor-text",
                  "prose prose-sm max-w-none prose-p:my-0 prose-ul:my-0 prose-li:my-0"
                )}
                data-placeholder={
                  hasFiles ? "Thêm ghi chú..." : "Nhập tin nhắn..."
                }
                spellCheck={false}
              />
            </div>
          </div>

          {/* 3. TOOLBAR & SEND (Always Visible) */}
          <div className="px-3 pb-2 flex items-center justify-between gap-2 border-t border-stone-100/50 pt-1">
            {/* Toolkit */}
            <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-hide py-1">
              <ToolBtn
                icon={Bold}
                onClick={() => exec("bold")}
                tooltip="In đậm"
              />
              <ToolBtn
                icon={Italic}
                onClick={() => exec("italic")}
                tooltip="In nghiêng"
              />
              <ToolBtn
                icon={Underline}
                onClick={() => exec("underline")}
                tooltip="Gạch chân"
              />

              <div className="w-px h-3 bg-stone-300 mx-1.5 opacity-40" />

              <ToolBtn
                icon={List}
                onClick={() => exec("insertUnorderedList")}
                tooltip="Danh sách"
              />

              {/* Toggle Align Button */}
              <ToolBtn
                icon={AlignIcon}
                onClick={toggleAlign}
                tooltip="Căn lề (Click để đổi)"
                active={true}
              />

              <div className="w-px h-3 bg-stone-300 mx-1.5 opacity-40" />

              {/* Text Size */}
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className="w-7 h-7 flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 rounded-lg transition-all"
                    title="Cỡ chữ"
                  >
                    <Type size={16} strokeWidth={2.5} />
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-1 flex gap-1 bg-white shadow-xl rounded-xl border-stone-100"
                  align="start"
                  side="top"
                >
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => exec("fontSize", "1")}
                    className="text-xs h-8 w-8 px-0 rounded-lg"
                  >
                    A
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => exec("fontSize", "3")}
                    className="text-sm h-8 w-8 px-0 font-bold rounded-lg"
                  >
                    A
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => exec("fontSize", "5")}
                    className="text-lg h-8 w-8 px-0 font-bold rounded-lg"
                  >
                    A
                  </Button>
                </PopoverContent>
              </Popover>

              {/* Text Color (Fixed Opacity Issue) */}
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className="w-7 h-7 flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 rounded-lg transition-all relative"
                    title="Màu chữ"
                  >
                    <Palette size={16} strokeWidth={2.5} />
                    {/* Color Indicator Dot */}
                    <span
                      className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full border border-white ring-1 ring-stone-100"
                      style={{ backgroundColor: currentColor }}
                    />
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-2 grid grid-cols-6 gap-2 bg-white shadow-xl rounded-xl border-stone-100"
                  align="start"
                  side="top"
                >
                  {TEXT_COLORS.map((c) => (
                    <button
                      key={c.color}
                      onClick={() => {
                        exec("foreColor", c.color);
                        setCurrentColor(c.color);
                      }}
                      className="w-6 h-6 rounded-full border border-stone-200 hover:scale-125 transition-transform shadow-sm ring-1 ring-transparent hover:ring-stone-200"
                      style={{ backgroundColor: c.color }}
                      title={c.label}
                    />
                  ))}
                </PopoverContent>
              </Popover>
            </div>

            {/* Send Button */}
            <AnimatePresence>
              {hasContent && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="shrink-0"
                >
                  <button
                    onClick={handleSend}
                    disabled={isLoading}
                    // Màu đỏ đất (red-700 / #be1e2d)
                    className="w-9 h-9 flex items-center justify-center rounded-full shadow-md transition-all active:scale-95 bg-[#C63321] hover:bg-[#9f281a] text-white hover:shadow-lg"
                  >
                    <Send size={16} className="ml-0.5" strokeWidth={2.5} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
}

const ToolBtn = ({ icon: Icon, onClick, tooltip, active }: any) => (
  <button
    onClick={(e) => {
      e.preventDefault();
      onClick();
    }}
    className={cn(
      "w-7 h-7 flex items-center justify-center rounded-lg transition-all",
      active
        ? "text-stone-600 bg-stone-200/50"
        : "text-stone-400 hover:text-stone-700 hover:bg-stone-200/50"
    )}
    title={tooltip}
  >
    <Icon size={16} strokeWidth={2.5} />
  </button>
);

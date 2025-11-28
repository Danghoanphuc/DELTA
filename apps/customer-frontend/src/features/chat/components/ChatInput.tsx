import { useState, useRef, useEffect } from "react";
import { Send, X, FileText, Link as LinkIcon, Plus, Image as ImageIcon, FileUp, Palette, HardDrive, Hash, AtSign, Zap, Package } from "lucide-react";
import { useSmartChatInput, LinkAttachment } from "../hooks/useSmartChatInput";
import { useFileUpload } from "../hooks/useFileUpload";
import { SlashCommandMenu } from "./SlashCommandMenu";
import { AnimatePresence, motion } from "framer-motion";
import { useGoogleDrive } from "@/shared/hooks/useGoogleDrive";
import { useInputIntelligence } from "../hooks/useInputIntelligence";
import { AddLinkModal } from "@/shared/components/ui/AddLinkModal";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

interface ChatInputProps {
  isLoading: boolean;
  onSendText: (text: string) => void;
  onFileUpload?: (file: File) => void;
  // Props cho tính năng Social (External Queue)
  hasFiles?: boolean;
  onPasteFile?: (files: File[]) => void;
  onAddLink?: (url: string, type: 'canva' | 'drive' | 'general', title?: string) => void;
  onAddDriveFile?: (files: File[]) => void;
  onFileClick?: () => void;
}

// ----------------------------------------------------------------------
// 1. SUB-COMPONENT: ATTACHMENT MENU (NÚT CỘNG +)
// ----------------------------------------------------------------------
function ChatAttachmentMenu({
  onUploadFile, onUploadImage, onLinkCanva, onGoogleDrive, disabled
}: { onUploadFile: () => void; onUploadImage: () => void; onLinkCanva: () => void; onGoogleDrive: () => void; disabled?: boolean; }) {
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
      <PopoverTrigger asChild>
        <Button 
            size="icon" 
            variant="ghost" 
            className={cn(
                "rounded-full h-9 w-9 flex-shrink-0 transition-all text-gray-500 hover:text-blue-600 hover:bg-blue-50/50 mb-0.5",
                isOpen && "bg-blue-50 text-blue-600 rotate-45"
            )}
        >
            <Plus size={22} strokeWidth={2.5} />
        </Button>
      </PopoverTrigger>
      <PopoverContent side="top" align="start" sideOffset={10} className="w-72 p-2 rounded-2xl shadow-2xl border-gray-100 bg-white/95 backdrop-blur-md z-[50]">
        <div className="grid gap-1">
          <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider select-none">Tải lên</div>
          <MenuItem icon={FileUp} label="Tệp tài liệu" desc="PDF, AI, PSD (Max 50MB)" onClick={onUploadFile} colorClass="text-blue-600" bgClass="bg-blue-50 border-blue-100" />
          <MenuItem icon={ImageIcon} label="Ảnh" desc="JPG, PNG" onClick={onUploadImage} colorClass="text-purple-600" bgClass="bg-purple-50 border-purple-100" />
          <div className="h-px bg-gray-100 my-1 mx-2" />
          <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider select-none">Liên kết</div>
          <MenuItem icon={Palette} label="Canva Design" desc="Link thiết kế Canva" onClick={onLinkCanva} colorClass="text-[#7D2AE8]" bgClass="bg-[#F5F7FF] border-[#E6E6FA]" />
          <MenuItem icon={HardDrive} label="Google Drive" desc="File từ Drive" onClick={onGoogleDrive} colorClass="text-[#1FA463]" bgClass="bg-[#F0FDF4] border-[#DCFCE7]" />
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ----------------------------------------------------------------------
// 2. SUB-COMPONENT: SUGGESTION POPUP (Hiện khi gõ @ hoặc #)
// ----------------------------------------------------------------------
const SuggestionPopup = ({ 
  items, 
  type, 
  onSelect 
}: { 
  items: Array<{ id: string; name: string; status?: string }>; 
  type: 'product' | 'order'; 
  onSelect: (item: any) => void;
}) => {
  if (!items.length) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="absolute bottom-full left-0 mb-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50"
    >
      <div className="bg-gray-50 px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
        {type === 'product' ? <Package size={12} /> : <Hash size={12} />}
        {type === 'product' ? 'Sản phẩm' : 'Đơn hàng gần đây'}
      </div>
      <div className="max-h-48 overflow-y-auto p-1">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item)}
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors text-sm flex flex-col"
          >
            <span className="font-medium text-gray-800">{item.name}</span>
            {type === 'order' && item.status && (
              <span className="text-[10px] text-gray-400">#{item.id} • {item.status}</span>
            )}
          </button>
        ))}
      </div>
    </motion.div>
  );
};

// ----------------------------------------------------------------------
// 3. SUB-COMPONENT: INTENT CHIPS (Hiện khi phát hiện ý định)
// ----------------------------------------------------------------------
const IntentActions = ({ 
  intent, 
  onAppend 
}: { 
  intent: string; 
  onAppend: (text: string) => void;
}) => {
  // Định nghĩa các thông số nhanh cho từng loại intent
  const actions = intent === 'business_card' ? [
    { label: "5 hộp", val: "số lượng 5 hộp" },
    { label: "Giấy C300", val: "giấy C300 cán mờ" },
    { label: "Bo góc", val: "có bo 4 góc" },
    { label: "In 2 mặt", val: "in 2 mặt" }
  ] : intent === 'flyer' ? [
    { label: "A4", val: "kích thước A4" },
    { label: "A5", val: "kích thước A5" },
    { label: "1000 tờ", val: "số lượng 1000 tờ" }
  ] : [];

  if (actions.length === 0) return null;

  return (
    <div className="flex items-center gap-2 px-1 pb-2 overflow-x-auto no-scrollbar">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 mr-1 bg-blue-50 px-2 py-1 rounded-md">
        <Zap size={12} className="fill-blue-600" />
        Gợi ý in ấn:
      </div>
      {actions.map((act, idx) => (
        <button
          key={idx}
          onClick={() => onAppend(act.val)}
          className="flex-shrink-0 text-xs px-2.5 py-1 rounded-full bg-white border border-gray-200 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all shadow-sm"
        >
          + {act.label}
        </button>
      ))}
    </div>
  );
};

// ----------------------------------------------------------------------
// 4. THUMBNAIL COMPONENTS (GIỮ NGUYÊN)
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
      <div className="w-14 h-14 rounded-xl border border-gray-200 overflow-hidden bg-white relative shadow-sm">
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

const LinkThumbnail = ({ attachment, onRemove }: { attachment: LinkAttachment; onRemove: () => void }) => {
    // Theme màu sắc dựa trên loại link
    const theme = attachment.type === 'canva' 
      ? "from-[#00C4CC] to-[#7D2AE8]" 
      : attachment.type === 'drive'
      ? "from-[#1FA463] to-[#FFD04B]" 
      : "from-slate-400 to-slate-600";
  
    const icon = attachment.type === 'canva' ? <Palette size={14} /> 
               : attachment.type === 'drive' ? <HardDrive size={14} /> 
               : <LinkIcon size={14} />;
  
    return (
      <motion.div layout initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8, width: 0 }} className="relative group flex-shrink-0 select-none">
        <div className="flex items-center gap-2 pl-2 pr-8 py-1.5 rounded-xl bg-gray-50 border border-gray-100 shadow-sm relative overflow-hidden max-w-[160px]">
          <div className={cn("absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b", theme)} />
          <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center text-white bg-gradient-to-br shadow-sm shrink-0", theme)}>
             {icon}
          </div>
          <div className="flex flex-col min-w-0">
               <span className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-0.5">{attachment.type}</span>
               <span className="text-xs font-semibold text-gray-800 truncate leading-none block">{attachment.title}</span>
          </div>
          <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
            <X size={14} />
          </button>
        </div>
      </motion.div>
    );
};

// ----------------------------------------------------------------------
// 5. MAIN COMPONENT (HYBRID MODE + CONTEXT LAYER)
// ----------------------------------------------------------------------
export function ChatInput({ isLoading, onSendText, onFileUpload, ...props }: ChatInputProps) {
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkType, setLinkType] = useState<'canva' | 'drive'>('canva');

  // Hook Upload File
  const { files: internalFiles, addFiles, removeFile, clearFiles, dropzoneConfig } = useFileUpload({ isLoading });

  // Hook Google Drive
  const { openDrivePicker } = useGoogleDrive({
    onPick: (driveFiles) => {
      addFiles(driveFiles);
    }
  });

  const handleOpenLinkModal = (type: 'canva' | 'drive') => {
    setLinkType(type);
    setIsLinkModalOpen(true);
  };

  // ✅ USE THE BRAIN (Hook xử lý logic thông minh)
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
      textareaRef
  } = useSmartChatInput({
      onSendRaw: async (text) => {
          if (internalFiles.length > 0) {
              internalFiles.forEach(f => onFileUpload?.(f));
              clearFiles();
          }
          await onSendText(text);
      },
      // Các action này được gọi khi dùng Slash Command
      triggerActions: {
          openCanva: () => handleOpenLinkModal('canva'),
          openDrive: () => openDrivePicker(),
          openUpload: () => dropzoneConfig.open(),
      }
  });

  // ✅ USE INTELLIGENCE (Hook phát hiện intent, color, suggestions)
  const { 
    suggestions, 
    suggestionType, 
    detectedIntent, 
    detectedColor, 
    analyzeInput, 
    setSuggestionType 
  } = useInputIntelligence();

  // Override handleInputChange để kết nối 2 hook
  const onInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleInputChange(e); // Gọi hook cũ
    const textarea = e.target;
    analyzeInput(textarea.value, textarea.selectionStart); // Gọi hook mới
  };

  const handleSuggestionSelect = (item: any) => {
    // Thay thế từ khóa @... hoặc #... bằng tên đầy đủ
    const words = message.split(" ");
    words.pop(); // Bỏ từ đang gõ dở (@... hoặc #...)
    const prefix = item.id.startsWith("P") ? "@" : "#";
    const newText = [...words, `${prefix}[${item.name}]`].join(" ") + " ";
    
    setMessage(newText);
    setSuggestionType('none');
    textareaRef.current?.focus();
  };

  const handleAppendIntent = (text: string) => {
    setMessage(prev => prev.trim() + ", " + text + " ");
    textareaRef.current?.focus();
  };

  const handleAddLink = (url: string) => {
    addLink(url);
    setIsLinkModalOpen(false);
  };

  const onPasteWrapper = (e: React.ClipboardEvent) => {
      const result = handlePaste(e);
      if (result?.files) {
          addFiles(result.files); 
      }
  };

  // ✅ KIỂM TRA ĐIỀU KIỆN GỬI (Để làm sáng nút gửi)
  const isReadyToSend = message.trim().length > 0 || internalFiles.length > 0 || links.length > 0;

  return (
    <div className="relative p-3 bg-white z-20">
        <input {...dropzoneConfig.getInputProps()} className="hidden" />

        {/* 1. SUGGESTION POPUP (Layer cao nhất) */}
        <AnimatePresence>
          {suggestionType !== 'none' && (
            <SuggestionPopup 
              items={suggestions} 
              type={suggestionType} 
              onSelect={handleSuggestionSelect} 
            />
          )}
        </AnimatePresence>

        {/* 2. CONTEXT AWARE LAYER (Nằm ngay trên input) */}
        {/* Chỉ hiện khi có Intent hoặc Color detected để đỡ rác */}
        <AnimatePresence>
          {(detectedIntent || detectedColor) && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }} 
              animate={{ height: "auto", opacity: 1 }} 
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-2"
            >
              {detectedIntent && (
                <IntentActions intent={detectedIntent} onAppend={handleAppendIntent} />
              )}
              
              {detectedColor && (
                <div className="absolute top-4 right-4 flex items-center gap-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md shadow-lg z-50 pointer-events-none">
                  <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: detectedColor }} />
                  <span>Màu phát hiện: {detectedColor}</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Slash Menu vẫn ở đây nhưng ẩn đi (Power User feature) */}
        <SlashCommandMenu 
            isOpen={showSlashMenu} 
            onSelect={executeSlashCommand} 
            onClose={() => {}} 
        />

        {/* 3. INPUT CONTAINER */}
        <div className={cn(
            "flex items-end gap-2 p-1.5 rounded-[26px] border transition-all duration-200 ease-in-out relative flex-wrap",
            "bg-gray-100/80 border-transparent hover:bg-gray-100",
            "focus-within:bg-white focus-within:border-gray-200 focus-within:shadow-sm"
        )}>
            
            {/* 1. NÚT CỘNG (ATTACHMENT MENU) - TRẢ LẠI CHO USER */}
            <div className="flex-shrink-0">
               <ChatAttachmentMenu 
                 disabled={isLoading}
                 onUploadFile={() => dropzoneConfig.open()}
                 onUploadImage={() => dropzoneConfig.open()}
                 onLinkCanva={() => handleOpenLinkModal('canva')}
                 onGoogleDrive={openDrivePicker}
               />
            </div>

            {/* 2. AREA THUMBNAILS (Nằm trên text input nếu có file) */}
            <div className="w-full flex gap-2 flex-wrap px-1 order-1 empty:hidden mb-1 pl-10"> 
                {/* pl-10 để tránh thụt lề so với nút cộng nếu muốn, hoặc để w-full thì nó nằm dòng trên */}
                <AnimatePresence>
                    {internalFiles.map((f, i) => <FileThumbnail key={`f-${i}`} file={f} onRemove={() => removeFile(i)} />)}
                    {links.map(l => <LinkThumbnail key={l.id} attachment={l} onRemove={() => removeLink(l.id)} />)}
                </AnimatePresence>
            </div>

            {/* 4. INPUT AREA */}
            <textarea
                ref={textareaRef}
                value={message}
                onChange={onInputChange}
                onKeyDown={handleKeyDown}
                onPaste={onPasteWrapper}
                placeholder={internalFiles.length || links.length ? "Thêm ghi chú..." : "Nhập yêu cầu, gõ @ để chọn sp, # để chọn đơn..."}
                className="flex-1 bg-transparent max-h-[150px] overflow-y-auto py-2 px-2 text-[15px] outline-none resize-none placeholder:text-gray-400 min-h-[40px] leading-[24px]"
                rows={1}
                disabled={isLoading}
            />

            {/* Quick Trigger Buttons (Bên phải, cạnh nút gửi - Giúp user biết tính năng ẩn) */}
            <div className="flex items-center gap-1 mb-1 mr-1">
              {!message && (
                <>
                  <button 
                    onClick={() => { 
                      setMessage(prev => prev + "@"); 
                      textareaRef.current?.focus(); 
                    }}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    title="Đề cập sản phẩm (@)"
                  >
                    <AtSign size={16} />
                  </button>
                  <button 
                    onClick={() => { 
                      setMessage(prev => prev + "#"); 
                      textareaRef.current?.focus(); 
                    }}
                    className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
                    title="Đề cập đơn hàng (#)"
                  >
                    <Hash size={16} />
                  </button>
                </>
              )}
            </div>

            {/* 5. SEND BUTTON (VISUAL FEEDBACK) */}
             <div className="flex-shrink-0 h-9 w-9 mb-0.5 flex items-center justify-center">
                 <AnimatePresence mode="wait">
                    {isLoading ? (
                         <motion.div key="loading" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                         </motion.div>
                    ) : (
                        <motion.button 
                            key="send"
                            onClick={handleSend} 
                            disabled={!isReadyToSend} 
                            initial={{ scale: 1 }}
                            animate={{ 
                                scale: isReadyToSend ? 1 : 1,
                                opacity: isReadyToSend ? 1 : 0.5 
                            }}
                            whileHover={isReadyToSend ? { scale: 1.1 } : {}}
                            whileTap={isReadyToSend ? { scale: 0.95 } : {}}
                            className={cn(
                                "w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-sm",
                                isReadyToSend 
                                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-200" // Sáng lên
                                    : "bg-gray-200 text-gray-400 cursor-not-allowed" // Xám ngoét
                            )}
                        >
                           <Send size={16} strokeWidth={2.5} className={cn(isReadyToSend && "ml-0.5")} />
                        </motion.button>
                    )}
                 </AnimatePresence>
             </div>
        </div>
        
        {/* Modals */}
        <AddLinkModal
          isOpen={isLinkModalOpen}
          onClose={() => setIsLinkModalOpen(false)}
          type={linkType}
          onAdd={handleAddLink}
        />
    </div>
  );
}
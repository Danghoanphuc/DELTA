import { useState, ClipboardEvent } from "react";
import { Send, Smile, Loader2, Plus, FileUp, Image as ImageIcon, Link as LinkIcon } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { cn } from "@/shared/lib/utils";
import { AddLinkModal } from "./AddLinkModal"; // Component mới (sẽ tạo ở bước 4)
import { useGoogleDrive } from "./hooks/useGoogleDrive"; // Hook mới (sẽ tạo ở bước 5)

interface ChatInputProps {
  onSend: (text: string) => Promise<void>;
  sending: boolean;
  onFileClick?: () => void;
  hasFiles: boolean;
  onPasteFile?: (files: File[]) => void;
  onAddLink: (url: string, type: 'canva' | 'drive' | 'general') => void; // ✅ Prop mới
  onAddDriveFile: (files: File[]) => void; // ✅ Prop mới
}

export function ChatInput({ onSend, sending, onFileClick, hasFiles, onPasteFile, onAddLink, onAddDriveFile }: ChatInputProps) {
  const [text, setText] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  
  // State quản lý Modal
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkType, setLinkType] = useState<'canva' | 'drive'>('canva');

  // Google Drive Hook
  const { openDrivePicker } = useGoogleDrive({
    onPick: (files) => {
        onAddDriveFile(files);
        setIsPopoverOpen(false);
    }
  });

  const handleSend = async () => {
    if ((!text.trim() && !hasFiles) || sending) return;
    const content = text.trim();
    setText("");
    await onSend(content);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData.items;
    const files: File[] = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].kind === 'file') {
        const file = items[i].getAsFile();
        if (file) files.push(file);
      }
    }
    if (files.length > 0 && onPasteFile) onPasteFile(files);
  };

  const MenuItem = ({ icon: Icon, title, desc, onClick, colorClass }: any) => (
    <button onClick={onClick} className="w-full flex items-start gap-3 p-3 hover:bg-gray-50 rounded-xl transition-all text-left group">
        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors", colorClass)}>
            <Icon size={20} />
        </div>
        <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{title}</h4>
            <p className="text-[10px] text-gray-500 font-medium truncate">{desc}</p>
        </div>
    </button>
  );

  return (
    <>
        <div className="absolute bottom-0 left-0 right-0 z-40 p-3 bg-gradient-to-t from-white via-white/95 to-transparent pt-6">
        <div className="flex items-end gap-2 bg-white p-2 pr-3 rounded-[24px] shadow-[0_4px_20px_rgb(0,0,0,0.08)] border border-gray-200 ring-1 ring-gray-100">
            <div className="flex gap-1">
                <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                    <PopoverTrigger asChild>
                        <Button size="icon" variant="ghost" className={cn("rounded-full h-10 w-10 transition-all duration-300", isPopoverOpen ? "bg-blue-100 text-blue-600 rotate-45" : "text-blue-500 hover:bg-blue-50")}>
                            <Plus size={24} strokeWidth={2.5} />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent side="top" align="start" className="w-72 p-1.5 rounded-2xl shadow-xl border-gray-100 mb-2">
                        <div className="grid gap-0.5">
                            <MenuItem icon={FileUp} title="Tải tệp lên" desc="PDF, AI, PSD, CDR, ZIP" onClick={() => { setIsPopoverOpen(false); onFileClick?.(); }} colorClass="bg-blue-50 text-blue-600 group-hover:bg-blue-100" />
                            <MenuItem icon={ImageIcon} title="Thư viện ảnh" desc="JPG, PNG, HEIC, MP4" onClick={() => { setIsPopoverOpen(false); onFileClick?.(); }} colorClass="bg-purple-50 text-purple-600 group-hover:bg-purple-100" />
                            <div className="h-px bg-gray-100 my-1"/>
                            {/* ✅ OPEN LINK MODAL */}
                            <MenuItem icon={LinkIcon} title="Link Canva" desc="Chia sẻ thiết kế Canva" onClick={() => { setIsPopoverOpen(false); setLinkType('canva'); setIsLinkModalOpen(true); }} colorClass="bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100" />
                            {/* ✅ GOOGLE DRIVE */}
                            <MenuItem icon={({size}: {size?: number}) => <span className="font-bold text-[10px]">GD</span>} title="Thêm từ Drive" desc="Chọn file từ Google Drive" onClick={openDrivePicker} colorClass="bg-green-50 text-green-600 group-hover:bg-green-100" />
                        </div>
                    </PopoverContent>
                </Popover>
                <Button size="icon" variant="ghost" className="text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 rounded-full h-10 w-10 hidden sm:flex transition-colors">
                    <Smile size={20} />
                </Button>
            </div>
            <textarea 
                value={text} onChange={(e) => setText(e.target.value)} onKeyDown={handleKeyDown} onPaste={handlePaste} 
                placeholder="Nhập tin nhắn..." 
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-3 max-h-32 resize-none placeholder:text-gray-400 custom-scrollbar" 
                rows={1} style={{ minHeight: "44px" }} 
            />
            <Button size="icon" onClick={handleSend} disabled={(!text.trim() && !hasFiles) || sending} className={cn("rounded-full h-10 w-10 transition-all duration-300 shadow-md shrink-0", (text.trim() || hasFiles) ? "bg-blue-600 hover:bg-blue-700 text-white hover:scale-105" : "bg-gray-100 text-gray-400")}>
                {sending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} className={cn((text.trim() || hasFiles) && "ml-0.5")} />}
            </Button>
        </div>
        </div>

        {/* ✅ MODAL NHẬP LINK */}
        <AddLinkModal 
            isOpen={isLinkModalOpen} 
            onClose={() => setIsLinkModalOpen(false)} 
            type={linkType}
            onAdd={(url) => onAddLink(url, linkType)}
        />
    </>
  );
}
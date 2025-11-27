import { 
    FileUp, 
    Image as ImageIcon, 
    Link as LinkIcon, 
    HardDrive, 
    Palette,
    FolderOpen 
  } from "lucide-react";
  import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
  import { cn } from "@/shared/lib/utils";
  import { useState } from "react";
  
  interface ChatAttachmentMenuProps {
    children: React.ReactNode; // Nút trigger (dấu +)
    onUploadFile: () => void;
    onUploadImage: () => void;
    onLinkCanva: () => void;
    onGoogleDrive: () => void;
    disabled?: boolean;
  }
  
  export function ChatAttachmentMenu({
    children,
    onUploadFile,
    onUploadImage,
    onLinkCanva,
    onGoogleDrive,
    disabled
  }: ChatAttachmentMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
  
    // Helper render Item
    const MenuItem = ({ 
      icon: Icon, 
      label, 
      desc, 
      onClick, 
      colorClass, 
      bgClass 
    }: { 
      icon: any, label: string, desc: string, onClick: () => void, colorClass: string, bgClass: string 
    }) => (
      <button 
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(false);
          onClick();
        }}
        disabled={disabled}
        className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-sm border border-transparent",
          bgClass,
          colorClass
        )}>
          <Icon size={18} strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-800 group-hover:text-gray-900 leading-tight">
            {label}
          </h4>
          <p className="text-[11px] text-gray-500 font-medium truncate mt-0.5">
            {desc}
          </p>
        </div>
      </button>
    );
  
    return (
      <Popover open={isOpen} onOpenChange={setIsOpen} modal={false}>
        <PopoverTrigger asChild>
          {children}
        </PopoverTrigger>
        
        {/* - modal={false}: FIX LỖI XÊ DỊCH (Không khóa scroll body)
           - align="start": Căn lề trái
           - sideOffset={10}: Cách nút bấm 1 chút
           - z-index cao để đè lên mọi thứ trên mobile
        */}
        <PopoverContent 
          side="top" 
          align="start" 
          sideOffset={10}
          className="w-72 p-2 rounded-2xl shadow-2xl border-gray-100 bg-white/95 backdrop-blur-md z-[9999]"
        >
          <div className="grid gap-1">
            {/* Section: Upload */}
            <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider select-none">
              Tải lên từ máy
            </div>
            
            <MenuItem 
              icon={FileUp} 
              label="Tệp tài liệu" 
              desc="PDF, AI, PSD, CDR (Max 50MB)" 
              onClick={onUploadFile} 
              colorClass="text-blue-600" 
              bgClass="bg-blue-50 border-blue-100"
            />
            
            <MenuItem 
              icon={ImageIcon} 
              label="Thư viện ảnh" 
              desc="JPG, PNG, HEIC (Gửi nguyên gốc)" 
              onClick={onUploadImage} 
              colorClass="text-purple-600" 
              bgClass="bg-purple-50 border-purple-100"
            />
            
            <div className="h-px bg-gray-100 my-1 mx-2" />
            
            {/* Section: Cloud */}
            <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider select-none">
              Liên kết Cloud
            </div>
  
            <MenuItem 
              icon={Palette} 
              label="Canva Design" 
              desc="Dán liên kết chia sẻ thiết kế" 
              onClick={onLinkCanva} 
              colorClass="text-[#7D2AE8]" 
              bgClass="bg-[#F5F7FF] border-[#E6E6FA]" // Màu brand Canva nhẹ
            />
            
            <MenuItem 
              icon={HardDrive} 
              label="Google Drive" 
              desc="Chọn tệp trực tiếp từ Drive" 
              onClick={onGoogleDrive} 
              colorClass="text-[#1FA463]" 
              bgClass="bg-[#F0FDF4] border-[#DCFCE7]" // Màu brand Drive nhẹ
            />
          </div>
        </PopoverContent>
      </Popover>
    );
  }
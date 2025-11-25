// apps/customer-frontend/src/features/social/components/SocialChatWindow/AddLinkModal.tsx

import { useState, useEffect } from "react";
import { 
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Link as LinkIcon, Check, Globe, Info } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface AddLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'canva' | 'drive';
  onAdd: (url: string) => void;
}

export function AddLinkModal({ isOpen, onClose, type, onAdd }: AddLinkModalProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
        setUrl("");
        setError("");
    }
  }, [isOpen]);

  const validateUrl = (val: string) => {
      if (!val) return false;
      if (!val.startsWith("http://") && !val.startsWith("https://")) {
          return "Link phải bắt đầu bằng https://";
      }
      if (type === 'canva' && !val.includes("canva.com")) {
          return "Có vẻ đây không phải link Canva?";
      }
      if (type === 'drive' && !val.includes("google.com")) {
          return "Có vẻ đây không phải link Google Drive?";
      }
      return "";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setUrl(val);
      if (error) setError("");
  };

  const handleSubmit = () => {
    const validationError = validateUrl(url.trim());
    if (validationError) {
        setError(validationError);
        return;
    }
    onAdd(url.trim());
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleSubmit();
  };

  const theme = type === 'canva' ? {
      bg: "bg-[#F5F7FF]",
      iconBg: "bg-gradient-to-br from-[#00C4CC] to-[#7D2AE8]",
      borderFocus: "focus:ring-[#7D2AE8] focus:border-[#7D2AE8]",
      btn: "bg-[#7D2AE8] hover:bg-[#5d1eb5]",
      label: "Canva Design",
      desc: "Dán liên kết chia sẻ thiết kế từ Canva.",
      placeholder: "https://www.canva.com/design/..."
  } : {
      bg: "bg-[#F0FDF4]",
      iconBg: "bg-gradient-to-br from-[#1FA463] to-[#FFD04B]",
      borderFocus: "focus:ring-[#1FA463] focus:border-[#1FA463]",
      btn: "bg-[#1FA463] hover:bg-[#18804c]",
      label: "Google Drive",
      desc: "Dán liên kết tệp hoặc thư mục từ Drive.",
      placeholder: "https://drive.google.com/file/..."
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* DialogContent thường đã có sẵn nút close mặc định */}
      <DialogContent className="sm:max-w-[480px] p-0 gap-0 overflow-hidden bg-white border-0 shadow-2xl rounded-2xl">
        
        {/* 1. Header */}
        <div className={cn("px-6 py-6 flex items-start gap-4 border-b border-gray-100", theme.bg)}>
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shadow-lg shrink-0 text-white", theme.iconBg)}>
                <LinkIcon size={24} strokeWidth={2.5} />
            </div>
            <div className="flex-1">
                <DialogTitle className="text-xl font-bold text-gray-900 mb-1 pr-4">
                    Thêm link {theme.label}
                </DialogTitle>
                <p className="text-sm text-gray-500 font-medium pr-4">
                    {theme.desc}
                </p>
            </div>
            {/* ✅ ĐÃ XÓA: Nút DialogClose thủ công ở đây để tránh bị trùng */}
        </div>

        {/* 2. Input Body */}
        <div className="p-6 bg-white space-y-4">
            <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                    Liên kết (URL)
                </label>
                <div className="relative group">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gray-600 transition-colors">
                        <Globe size={18} />
                    </div>
                    <Input 
                        placeholder={theme.placeholder}
                        value={url}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        autoFocus
                        className={cn(
                            "pl-10 h-12 text-base bg-gray-50 border-gray-200 transition-all shadow-sm rounded-xl", 
                            theme.borderFocus,
                            error && "border-red-300 focus:ring-red-200 focus:border-red-400 bg-red-50"
                        )}
                    />
                </div>
                {error && (
                    <p className="text-xs text-red-500 font-medium ml-1 flex items-center animate-in slide-in-from-left-2">
                        <Info size={12} className="mr-1"/> {error}
                    </p>
                )}
            </div>

            <div className="bg-gray-50 p-3 rounded-lg flex gap-3 items-start border border-gray-100">
                <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
                <div className="text-xs text-gray-600 leading-relaxed">
                    <span className="font-bold text-gray-800">Mẹo:</span> Hãy đảm bảo bạn đã bật quyền truy cập <span className="font-semibold">"Anyone with the link"</span> (Bất kỳ ai có liên kết) để chúng tôi có thể xem và xử lý file.
                </div>
            </div>
        </div>

        {/* 3. Footer */}
        <DialogFooter className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-end gap-3">
            <Button variant="ghost" onClick={onClose} className="rounded-xl font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-200/50">
                Hủy bỏ
            </Button>
            <Button 
                onClick={handleSubmit} 
                disabled={!url.trim()} 
                className={cn(
                    "rounded-xl px-6 font-bold shadow-md transition-all text-white", 
                    theme.btn,
                    !url.trim() && "opacity-50 grayscale"
                )}
            >
                <Check size={18} className="mr-2" strokeWidth={3} />
                Thêm Link
            </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}
// src/features/chat/components/SmartLinkEmbed.tsx
import { ExternalLink, HardDrive, Link as LinkIcon, Palette } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export type LinkType = 'canva' | 'drive' | 'general';

interface SmartLinkEmbedProps {
  url: string;
  type?: LinkType | string;
  title?: string;
}

export function SmartLinkEmbed({ url, type = 'general', title }: SmartLinkEmbedProps) {
  // Chuẩn hóa type
  const safeType = (type || 'general').toLowerCase();

  // Cấu hình giao diện theo loại link (đồng bộ màu với ChatInput của anh)
  const config = {
    canva: {
      icon: Palette,
      bg: "bg-[#F5F7FF] hover:bg-[#EBEFFF]",
      border: "border-[#E6E6FA] hover:border-[#7D2AE8]/30",
      text: "text-[#7D2AE8]",
      label: "Canva Design",
      gradient: "from-[#00C4CC] to-[#7D2AE8]"
    },
    drive: {
      icon: HardDrive,
      bg: "bg-[#F0FDF4] hover:bg-[#DCFCE7]",
      border: "border-[#DCFCE7] hover:border-[#1FA463]/30",
      text: "text-[#1FA463]",
      label: "Google Drive",
      gradient: "from-[#1FA463] to-[#FFD04B]"
    },
    general: {
      icon: LinkIcon,
      bg: "bg-gray-50 hover:bg-gray-100",
      border: "border-gray-200 hover:border-blue-200",
      text: "text-blue-600",
      label: "Liên kết",
      gradient: "from-slate-400 to-slate-600"
    }
  };

  const theme = config[safeType as keyof typeof config] || config.general;
  const Icon = theme.icon;
  
  // Tự động lấy domain làm title nếu không có title
  const displayTitle = title || (tryGetDomain(url) ?? "Chi tiết liên kết");

  return (
    <a 
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "flex items-center gap-3 p-3 mt-2 rounded-xl border transition-all duration-200 group no-underline",
        theme.bg,
        theme.border
      )}
    >
      {/* Icon Box */}
      <div className={cn(
        "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 shadow-sm text-white bg-gradient-to-br",
        theme.gradient
      )}>
        <Icon size={20} strokeWidth={2} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <span className={cn("text-[10px] font-bold uppercase tracking-wider mb-0.5", theme.text)}>
          {theme.label}
        </span>
        <span className="text-sm font-semibold text-gray-800 truncate leading-tight group-hover:text-blue-700 transition-colors">
          {displayTitle}
        </span>
      </div>

      {/* Action Arrow */}
      <div className="text-gray-400 group-hover:text-blue-600 transition-colors">
        <ExternalLink size={16} />
      </div>
    </a>
  );
}

function tryGetDomain(url: string) {
    try {
        return new URL(url).hostname.replace('www.', '');
    } catch {
        return null;
    }
}
import { useState, useEffect } from "react";
import { X, FileText, Image as ImageIcon, Loader2, File, FileImage, FileSpreadsheet, FileArchive, Link as LinkIcon, CheckCircle2 } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { StagedFile, FileContextType } from "./hooks/useSmartFileUpload";
import { motion, AnimatePresence } from "framer-motion";

interface FileStagingAreaProps {
  files: StagedFile[];
  onRemove: (id: string) => void;
  onContextChange: (id: string, context: FileContextType) => void;
}

const getFileIconInfo = (fileName: string, fileType: string, linkType?: string) => {
    if (fileType === 'link') {
        if (linkType === 'canva') return { Icon: () => <span className="font-bold text-[10px] text-blue-600">CANVA</span>, color: 'bg-blue-100 text-blue-600' };
        if (linkType === 'drive') return { Icon: () => <span className="font-bold text-[10px] text-green-600">DRIVE</span>, color: 'bg-green-100 text-green-600' };
        return { Icon: LinkIcon, color: 'bg-gray-100 text-gray-600' };
    }
    if (fileType === 'image') return { Icon: ImageIcon, color: 'bg-purple-100 text-purple-600' };
    
    const ext = fileName.split('.').pop()?.toLowerCase() || "";
    switch (ext) {
      case "pdf": return { Icon: FileText, color: 'bg-red-100 text-red-600' };
      case "ai": case "eps": case "psd": return { Icon: FileImage, color: 'bg-blue-100 text-blue-600' };
      case "zip": case "rar": return { Icon: FileArchive, color: 'bg-orange-100 text-orange-600' };
      case "xls": case "xlsx": return { Icon: FileSpreadsheet, color: 'bg-emerald-100 text-emerald-600' };
      default: return { Icon: File, color: 'bg-gray-100 text-gray-600' };
    }
};

export function FileStagingArea({ files, onRemove, onContextChange }: FileStagingAreaProps) {
  const visibleFiles = files.filter(f => f.status !== 'done' || (f.fileType === 'link'));
  
  // Nếu không có file nào thì ẩn luôn container (quan trọng để không chiếm chỗ)
  if (visibleFiles.length === 0) return null;

  return (
    <div className="w-full px-3 pb-1 bg-white border-t border-transparent animate-in slide-in-from-bottom-2">
        <div className="flex gap-2 overflow-x-auto pb-2 pt-2 custom-scrollbar snap-x">
            <AnimatePresence mode="popLayout">
                {visibleFiles.map((file) => (
                    <FileItem key={file.id} file={file} onRemove={onRemove} />
                ))}
            </AnimatePresence>
        </div>
    </div>
  );
}

// Sub-component cho từng file item
function FileItem({ file, onRemove }: { file: StagedFile, onRemove: (id: string) => void }) {
    const isImage = file.fileType === 'image';
    const { Icon, color } = getFileIconInfo(
        file.file?.name || file.linkMeta?.title || "", 
        file.fileType, 
        file.linkMeta?.type
    );
    const name = file.file?.name || file.linkMeta?.title || "File";
    const size = file.file ? (file.file.size / 1024 / 1024).toFixed(1) + "MB" : "Link";

    return (
        <motion.div 
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, width: 0 }}
            className="relative group flex-shrink-0 w-36 bg-gray-50 rounded-xl border border-gray-200 overflow-hidden snap-start"
        >
            {/* Nút xóa */}
            <button 
                onClick={() => onRemove(file.id)} 
                className="absolute top-1 right-1 z-10 p-0.5 bg-gray-900/50 hover:bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all"
            >
                <X size={12} />
            </button>

            <div className="flex flex-col h-full">
                {/* Preview Area */}
                <div className="h-16 relative bg-white border-b border-gray-100 flex items-center justify-center overflow-hidden">
                    {isImage && file.previewUrl ? (
                        <img src={file.previewUrl} className="w-full h-full object-cover" alt="Preview" />
                    ) : (
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", color)}>
                            <Icon size={16} />
                        </div>
                    )}
                    
                    {/* Loading Overlay */}
                    {file.status === 'uploading' && (
                        <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center">
                            <Loader2 className="animate-spin text-blue-600" size={16} />
                            <span className="text-[8px] font-bold text-blue-600 mt-1">{Math.round(file.progress)}%</span>
                        </div>
                    )}
                    
                    {/* Error Overlay */}
                    {file.status === 'error' && (
                        <div className="absolute inset-0 bg-red-50/90 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-red-600">Lỗi tải</span>
                        </div>
                    )}
                </div>

                {/* Info Area */}
                <div className="p-2">
                    <div className="text-[10px] font-bold text-gray-700 truncate mb-0.5">{name}</div>
                    <div className="text-[9px] text-gray-400 flex justify-between items-center">
                        <span>{size}</span>
                        {file.status === 'done' && <CheckCircle2 size={10} className="text-green-500" />}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
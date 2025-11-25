import { useState, useEffect } from "react";
import { 
    X, FileText, Image as ImageIcon, Printer, Eye, DownloadCloud, Loader2,
    File, FileImage, FileSpreadsheet, FileArchive, Link as LinkIcon 
  } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/shared/components/ui/tooltip";
import { StagedFile, FileContextType } from "./hooks/useSmartFileUpload";

interface FileStagingAreaProps {
  files: StagedFile[];
  onRemove: (id: string) => void;
  onContextChange: (id: string, context: FileContextType) => void;
}

const getFileIconComponent = (fileName: string, fileType: string, linkType?: string) => {
    // ✅ Handle Link Icons
    if (fileType === 'link') {
        if (linkType === 'canva') return { Icon: () => <span className="font-bold text-blue-500 text-xs">Canva</span>, color: 'text-blue-500' };
        if (linkType === 'drive') return { Icon: () => <span className="font-bold text-green-600 text-xs">Drive</span>, color: 'text-green-600' };
        return { Icon: LinkIcon, color: 'text-blue-400' };
    }

    if (fileType === 'image') return { Icon: ImageIcon, color: 'text-gray-400' };
    const ext = fileName.split('.').pop()?.toLowerCase() || "";
    switch (ext) {
      case "pdf": return { Icon: FileText, color: 'text-red-600' };
      case "ai": case "eps": case "cdr": return { Icon: FileImage, color: 'text-purple-600' };
      case "zip": case "rar": case "7z": return { Icon: FileArchive, color: 'text-orange-600' };
      case "psd": return { Icon: FileImage, color: 'text-blue-800' };
      case "xlsx": case "xls": return { Icon: FileSpreadsheet, color: 'text-green-600' };
      default: return { Icon: File, color: 'text-gray-600' };
    }
};

function FilePreviewItem({ file, onRemove, onContextChange }: { file: StagedFile, onRemove: (id: string) => void, onContextChange: (id: string, context: FileContextType) => void }) {
  const isImage = file.fileType === 'image';
  const isLink = file.fileType === 'link';
  const isError = file.status === 'error';

  const [imageLoaded, setImageLoaded] = useState(false);
  useEffect(() => { if (isImage) setImageLoaded(false); }, [file.previewUrl, isImage]);

  const { Icon, color } = getFileIconComponent(
      file.file?.name || file.linkMeta?.title || "", 
      file.fileType,
      file.linkMeta?.type
  );

  const displayName = isLink ? (file.linkMeta?.title || "Liên kết") : (file.file?.name || "File");
  const fileSize = file.file ? (file.file.size / 1024 / 1024).toFixed(1) + " MB" : "Link";

  return (
    <div className="relative group shrink-0 w-36 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col hover:border-blue-300 transition-all">
      <div className="h-20 bg-gray-50 relative flex items-center justify-center overflow-hidden">
        {isImage ? (
          <>
            <img 
              src={file.previewUrl} 
              className={cn("w-full h-full object-cover transition-opacity", imageLoaded ? "opacity-100" : "opacity-0")}
              onLoad={() => setImageLoaded(true)}
            />
            {!imageLoaded && <div className="absolute inset-0 flex items-center justify-center bg-gray-100"><Loader2 className="animate-spin text-gray-300" size={20} /></div>}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-2 text-center w-full">
            {/* ✅ Custom UI cho Link */}
            {isLink ? (
                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center mb-1 bg-white shadow-sm border", 
                    file.linkMeta?.type === 'canva' ? 'border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50' : 'border-green-200 bg-green-50'
                )}>
                    <Icon size={20} className={color} />
                </div>
            ) : (
                <Icon size={24} className={cn("mb-1", color)} />
            )}
            
            <span className="text-[10px] font-bold text-gray-700 truncate w-full px-1">{displayName}</span>
            <span className="text-[9px] text-gray-500 font-medium">{fileSize}</span>
          </div>
        )}

        <button onClick={() => onRemove(file.id)} className="absolute top-1 right-1 bg-black/50 hover:bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all z-10">
          <X size={12} />
        </button>
        {isError && <div className="absolute inset-0 bg-red-50/90 flex items-center justify-center text-red-500 text-xs font-bold"><X size={16} className="mr-1"/> Lỗi</div>}
      </div>

      <div className="p-2 bg-white flex flex-col gap-1">
        <TooltipProvider delayDuration={0}>
          <div className="flex gap-1 mt-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={() => onContextChange(file.id, "PRINT_FILE")} className={cn("flex-1 py-1 rounded text-[10px] font-bold flex items-center justify-center transition-all border", file.context === "PRINT_FILE" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-gray-50 text-gray-400 border-transparent hover:bg-gray-100")}>
                  <Printer size={10} className="mr-1"/> IN
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-[10px]">File in ấn</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={() => onContextChange(file.id, "REFERENCE")} className={cn("flex-1 py-1 rounded text-[10px] font-bold flex items-center justify-center transition-all border", file.context === "REFERENCE" ? "bg-orange-50 text-orange-700 border-orange-200" : "bg-gray-50 text-gray-400 border-transparent hover:bg-gray-100")}>
                  <Eye size={10} className="mr-1"/> MẪU
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-[10px]">Tham khảo</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>
    </div>
  );
}

export function FileStagingArea({ files, onRemove, onContextChange }: FileStagingAreaProps) {
  const visibleFiles = files.filter(f => f.status === 'pending' || f.status === 'error' || (f.fileType === 'link' && f.status === 'done'));
  if (visibleFiles.length === 0) return null;

  return (
    <div className="px-4 pt-3 pb-3 border-t border-blue-100 bg-blue-50/50 backdrop-blur-sm z-30 shadow-inner">
        <h3 className="text-[11px] font-bold text-blue-700 uppercase tracking-widest mb-2 flex items-center gap-1">
            <DownloadCloud size={14} /> Đính kèm ({visibleFiles.length})
        </h3>
        <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
            {visibleFiles.map((file) => (
                <FilePreviewItem key={file.id} file={file} onRemove={onRemove} onContextChange={onContextChange} />
            ))}
        </div>
    </div>
  );
}
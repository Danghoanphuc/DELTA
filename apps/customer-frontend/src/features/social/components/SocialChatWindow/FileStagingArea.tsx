// social/components/SocialChatWindow/FileStagingArea.tsx
import { 
    X, FileText, Image as ImageIcon, CheckCircle2, AlertCircle, Printer, Eye, 
    DownloadCloud, 
    // ✅ THÊM CÁC ICON CỤ THỂ CHO FILE TYPES
    File, FileImage, FileSpreadsheet, FileArchive 
  } from "lucide-react";
  import { cn } from "@/shared/lib/utils";
  import { Progress } from "@/shared/components/ui/progress";
  import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/shared/components/ui/tooltip";
  import { StagedFile, FileContextType } from "./hooks/useSmartFileUpload";
  
  interface FileStagingAreaProps {
    files: StagedFile[];
    onRemove: (id: string) => void;
    onContextChange: (id: string, context: FileContextType) => void;
  }
  
  // --- HELPER: Lấy Icon dựa trên đuôi file ---
  const getFileIconComponent = (fileName: string, fileType: string) => {
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
  
  export function FileStagingArea({ files, onRemove, onContextChange }: FileStagingAreaProps) {
    if (files.length === 0) return null;
  
    return (
      // ✅ FIX: Stronger background and distinction
      <div className="px-4 pt-4 pb-2 border-t border-blue-100 bg-blue-50/50 backdrop-blur-sm z-30 shadow-inner">
          
          {/* HEADER */}
          <h3 className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-3 flex items-center gap-1">
              <DownloadCloud size={14} /> Tệp đính kèm ({files.length})
          </h3>
          
          <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
              {files.map((file) => {
                  const { Icon, color } = getFileIconComponent(file.file.name, file.fileType);
                  const fileSizeMB = (file.file.size / 1024 / 1024).toFixed(1);
                  const fileNameTruncated = file.file.name.length > 15 ? `${file.file.name.substring(0, 12)}...` : file.file.name;
  
                  return (
                      <div 
                          key={file.id} 
                          className="relative group shrink-0 w-36 bg-white rounded-lg border border-blue-300 shadow-md overflow-hidden flex flex-col"
                      >
                          
                          {/* Preview Area (h-20 block) */}
                          <div className="h-20 bg-gray-100 relative flex items-center justify-center overflow-hidden">
                              {file.fileType === 'image' ? (
                                  // File ảnh
                                  <img src={file.previewUrl} className="w-full h-full object-cover" alt="Preview" />
                              ) : (
                                  // ✅ FIX: File PDF/AI/ZIP
                                  <div className="flex flex-col items-center justify-center p-2 text-center w-full">
                                      <Icon size={24} className={cn("mb-1", color)} />
                                      <span className="text-[10px] font-bold text-gray-700 truncate w-full px-1">
                                          {fileNameTruncated} 
                                      </span>
                                      <span className="text-[9px] text-gray-500 font-medium">{fileSizeMB} MB</span>
                                  </div>
                              )}
  
                              {/* Remove Button */}
                              <button 
                                  onClick={() => onRemove(file.id)}
                                  className="absolute top-1 right-1 bg-black/50 hover:bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all z-10"
                              >
                                  <X size={12} />
                              </button>
  
                              {/* Status Overlay (Loading/Error/Done) */}
                              {file.status === 'uploading' && (
                                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center px-4">
                                      <Progress value={file.progress} className="h-1.5 w-full bg-white/30 [&>div]:bg-blue-500" />
                                  </div>
                              )}
                              {file.status === 'error' && (
                                  <div className="absolute inset-0 bg-red-50/90 flex items-center justify-center text-red-500 text-xs font-bold">
                                      <AlertCircle size={16} className="mb-1"/> Lỗi
                                  </div>
                              )}
                              {file.status === 'done' && (
                                  <div className="absolute bottom-1 right-1 text-green-500 bg-white rounded-full">
                                      <CheckCircle2 size={16} />
                                  </div>
                              )}
                          </div>
  
                          {/* Context Switcher (Web2Print Logic) */}
                          <div className="p-2 bg-white flex flex-col gap-1">
                              {/* Context Tag Selector */}
                              <TooltipProvider>
                              <div className="flex gap-1 mt-1">
                                  {/* Nút File IN */}
                                  <Tooltip>
                                      <TooltipTrigger asChild>
                                          <button 
                                              onClick={() => onContextChange(file.id, "PRINT_FILE")}
                                              className={cn(
                                                  "flex-1 py-1 rounded text-[10px] font-bold flex items-center justify-center transition-all",
                                                  file.context === "PRINT_FILE" 
                                                      ? "bg-blue-100 text-blue-700 ring-1 ring-blue-200" 
                                                      : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                                              )}
                                          >
                                              <Printer size={10} className="mr-1"/> IN
                                          </button>
                                      </TooltipTrigger>
                                      <TooltipContent side="bottom"><p>File dùng để in ấn</p></TooltipContent>
                                  </Tooltip>
  
                                  {/* Nút MẪU Tham khảo */}
                                  <Tooltip>
                                      <TooltipTrigger asChild>
                                          <button 
                                              onClick={() => onContextChange(file.id, "REFERENCE")}
                                              className={cn(
                                                  "flex-1 py-1 rounded text-[10px] font-bold flex items-center justify-center transition-all",
                                                  file.context === "REFERENCE" 
                                                      ? "bg-orange-100 text-orange-700 ring-1 ring-orange-200" 
                                                      : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                                              )}
                                          >
                                              <Eye size={10} className="mr-1"/> MẪU
                                          </button>
                                      </TooltipTrigger>
                                      <TooltipContent side="bottom"><p>Ảnh tham khảo/Mẫu</p></TooltipContent>
                                  </Tooltip>
                              </div>
                              </TooltipProvider>
                          </div>
                      </div>
                  );
              })}
          </div>
      </div>
    );
  }
import { X, FileText, Image as ImageIcon, CheckCircle2, AlertCircle, Printer, Eye } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Badge } from "@/shared/components/ui/badge";
import { Progress } from "@/shared/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/shared/components/ui/tooltip";
import { StagedFile, FileContextType } from "./hooks/useSmartFileUpload";

interface FileStagingAreaProps {
  files: StagedFile[];
  onRemove: (id: string) => void;
  onContextChange: (id: string, context: FileContextType) => void;
}

export function FileStagingArea({ files, onRemove, onContextChange }: FileStagingAreaProps) {
  if (files.length === 0) return null;

  return (
    <div className="px-4 pt-3 pb-1 border-t border-gray-100 bg-gray-50/80 backdrop-blur-sm">
        <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
            {files.map((file) => (
                <div key={file.id} className="relative group shrink-0 w-36 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                    
                    {/* Preview Area */}
                    <div className="h-20 bg-gray-100 relative flex items-center justify-center overflow-hidden">
                        {file.fileType === 'image' ? (
                            <img src={file.previewUrl} className="w-full h-full object-cover" alt="Preview" />
                        ) : (
                            <div className="flex flex-col items-center justify-center text-gray-400">
                                <FileText size={24} className="mb-1" />
                                <span className="text-[10px] uppercase font-bold">{file.fileType}</span>
                            </div>
                        )}

                        {/* Remove Button */}
                        <button 
                            onClick={() => onRemove(file.id)}
                            className="absolute top-1 right-1 bg-black/50 hover:bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all z-10"
                        >
                            <X size={12} />
                        </button>

                        {/* Status Overlay */}
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
                        <p className="text-[10px] truncate text-gray-700 font-medium" title={file.file.name}>
                            {file.file.name}
                        </p>
                        
                        {/* Context Tag Selector */}
                        <TooltipProvider>
                        <div className="flex gap-1 mt-1">
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
            ))}
        </div>
    </div>
  );
}
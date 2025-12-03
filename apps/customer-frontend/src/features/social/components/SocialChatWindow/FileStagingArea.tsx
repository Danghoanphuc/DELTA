import { useState } from "react";
import ReactDOM from "react-dom";
import {
  X,
  FileText,
  Image as ImageIcon,
  Loader2,
  File,
  FileImage,
  FileSpreadsheet,
  FileArchive,
  Link as LinkIcon,
  FileWarning,
  PlayCircle,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { StagedFile } from "./hooks/useSmartFileUpload";
import { motion, AnimatePresence } from "framer-motion";

interface FileStagingAreaProps {
  files: StagedFile[];
  onRemove: (id: string) => void;
}

const getFileIconInfo = (
  fileName: string,
  fileType: string,
  linkType?: string
) => {
  if (fileType === "link") {
    if (linkType === "canva")
      return {
        Icon: () => (
          <span className="font-bold text-[7px] text-[#00C4CC]">CANVA</span>
        ),
        bg: "bg-[#00C4CC]/10",
        border: "border-[#00C4CC]/20",
      };
    if (linkType === "drive")
      return {
        Icon: () => (
          <span className="font-bold text-[7px] text-[#1FA463]">DRIVE</span>
        ),
        bg: "bg-[#1FA463]/10",
        border: "border-[#1FA463]/20",
      };
    return {
      Icon: LinkIcon,
      bg: "bg-blue-50",
      border: "border-blue-100",
      color: "text-blue-600",
    };
  }
  if (fileType === "image")
    return {
      Icon: ImageIcon,
      bg: "bg-purple-50",
      border: "border-purple-100",
      color: "text-purple-600",
    };
  if (fileType === "video")
    return {
      Icon: PlayCircle,
      bg: "bg-rose-50",
      border: "border-rose-100",
      color: "text-rose-600",
    };

  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  switch (ext) {
    case "pdf":
      return {
        Icon: FileText,
        bg: "bg-red-50",
        border: "border-red-100",
        color: "text-red-600",
      };
    case "ai":
    case "eps":
    case "psd":
      return {
        Icon: FileImage,
        bg: "bg-blue-50",
        border: "border-blue-100",
        color: "text-blue-600",
      };
    case "zip":
    case "rar":
      return {
        Icon: FileArchive,
        bg: "bg-amber-50",
        border: "border-amber-100",
        color: "text-amber-600",
      };
    case "xls":
    case "xlsx":
      return {
        Icon: FileSpreadsheet,
        bg: "bg-emerald-50",
        border: "border-emerald-100",
        color: "text-emerald-600",
      };
    default:
      return {
        Icon: File,
        bg: "bg-slate-50",
        border: "border-slate-100",
        color: "text-slate-600",
      };
  }
};

export function FileStagingArea({ files, onRemove }: FileStagingAreaProps) {
  if (files.length === 0) return null;

  return (
    // Clean container, no padding/margin here, let ChatInput handle it
    <div className="w-full">
      <div className="flex gap-2 overflow-x-auto custom-scrollbar snap-x items-end">
        <AnimatePresence mode="popLayout">
          {files.map((file) => (
            <FileItem key={file.id} file={file} onRemove={onRemove} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function FileItem({
  file,
  onRemove,
}: {
  file: StagedFile;
  onRemove: (id: string) => void;
}) {
  const [showPreview, setShowPreview] = useState(false);
  const isImage = file.fileType === "image";
  const { Icon, bg, border, color } = getFileIconInfo(
    file.file?.name || file.linkMeta?.title || "",
    file.fileType,
    file.linkMeta?.type
  );
  const name = file.file?.name || file.linkMeta?.title || "File";

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5, width: 0 }}
        className="relative group flex-shrink-0 snap-start select-none py-1"
      >
        <div
          className={cn(
            "relative w-14 h-14 rounded-xl overflow-hidden cursor-pointer transition-all shadow-sm group-hover:shadow-md ring-1 ring-black/5",
            isImage ? "bg-black/5" : cn(bg, border, "border")
          )}
          onClick={() => isImage && file.previewUrl && setShowPreview(true)}
        >
          {isImage && file.previewUrl ? (
            <img
              src={file.previewUrl}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              alt="Preview"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center flex-col gap-0.5 p-1">
              <div
                className={cn(
                  "p-1.5 rounded-lg bg-white/60 shadow-sm backdrop-blur-sm",
                  color
                )}
              >
                <Icon size={16} strokeWidth={2} />
              </div>
            </div>
          )}

          {file.status === "uploading" && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] flex items-center justify-center z-10">
              <Loader2 className="animate-spin text-blue-600" size={16} />
            </div>
          )}
          {file.status === "error" && (
            <div className="absolute inset-0 bg-red-50/90 flex items-center justify-center z-10">
              <FileWarning size={18} className="text-red-500" />
            </div>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(file.id);
          }}
          className="absolute -top-1 -right-1 z-20 w-5 h-5 flex items-center justify-center bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-red-500 rounded-full shadow-sm border border-stone-200 opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100"
        >
          <X size={10} strokeWidth={3} />
        </button>
      </motion.div>

      {/* MODAL PREVIEW */}
      {showPreview && isImage && file.previewUrl && (
        <ImagePreviewModal
          imageUrl={file.previewUrl}
          fileName={name}
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  );
}

function ImagePreviewModal({ imageUrl, fileName, onClose }: any) {
  return ReactDOM.createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 touch-none"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
      >
        <X size={24} />
      </button>
      <motion.img
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        src={imageUrl}
        alt={fileName}
        className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl select-none"
        onClick={(e) => e.stopPropagation()}
      />
    </motion.div>,
    document.body
  );
}

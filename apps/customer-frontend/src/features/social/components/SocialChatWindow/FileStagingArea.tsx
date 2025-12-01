import { useState, useEffect } from "react";
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
  CheckCircle2,
  FileWarning,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { StagedFile, FileContextType } from "./hooks/useSmartFileUpload";
import { motion, AnimatePresence } from "framer-motion";

interface FileStagingAreaProps {
  files: StagedFile[];
  onRemove: (id: string) => void;
  onContextChange: (id: string, context: FileContextType) => void;
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
          <span className="font-bold text-[10px] text-blue-600">CANVA</span>
        ),
        color: "bg-blue-100 text-blue-600",
      };
    if (linkType === "drive")
      return {
        Icon: () => (
          <span className="font-bold text-[10px] text-green-600">DRIVE</span>
        ),
        color: "bg-green-100 text-green-600",
      };
    return { Icon: LinkIcon, color: "bg-gray-100 text-gray-600" };
  }
  if (fileType === "image")
    return { Icon: ImageIcon, color: "bg-purple-100 text-purple-600" };

  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  switch (ext) {
    case "pdf":
      return { Icon: FileText, color: "bg-red-100 text-red-600" };
    case "ai":
    case "eps":
    case "psd":
      return { Icon: FileImage, color: "bg-blue-100 text-blue-600" };
    case "zip":
    case "rar":
      return { Icon: FileArchive, color: "bg-orange-100 text-orange-600" };
    case "xls":
    case "xlsx":
      return {
        Icon: FileSpreadsheet,
        color: "bg-emerald-100 text-emerald-600",
      };
    default:
      return { Icon: File, color: "bg-gray-100 text-gray-600" };
  }
};

export function FileStagingArea({
  files,
  onRemove,
  onContextChange,
}: FileStagingAreaProps) {
  const visibleFiles = files.filter(
    (f) => f.status !== "done" || f.fileType === "link"
  );

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

// Sub-component cho từng file item - MOBILE OPTIMIZED
function FileItem({
  file,
  onRemove,
}: {
  file: StagedFile;
  onRemove: (id: string) => void;
}) {
  const [showPreview, setShowPreview] = useState(false);
  const isImage = file.fileType === "image";
  const { Icon, color } = getFileIconInfo(
    file.file?.name || file.linkMeta?.title || "",
    file.fileType,
    file.linkMeta?.type
  );
  const name = file.file?.name || file.linkMeta?.title || "File";
  const size = file.file
    ? (file.file.size / 1024 / 1024).toFixed(1) + "MB"
    : "Link";

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8, width: 0 }}
        className="relative group flex-shrink-0 w-28 h-28 bg-white rounded-2xl border-2 border-gray-100 overflow-hidden snap-start shadow-sm hover:shadow-md transition-shadow"
      >
        {/* Nút xóa - Luôn hiển thị trên mobile */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(file.id);
          }}
          className="absolute top-2 right-2 z-10 p-1.5 bg-gray-900/70 hover:bg-red-500 text-white rounded-full opacity-100 group-hover:opacity-100 transition-all active:scale-90 touch-manipulation"
        >
          <X size={14} />
        </button>

        <div className="w-full h-full">
          {/* Preview Area - FULL SIZE */}
          <div
            className="w-full h-full relative bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden cursor-pointer active:scale-95 transition-transform"
            onClick={() => isImage && file.previewUrl && setShowPreview(true)}
          >
            {isImage && file.previewUrl ? (
              <img
                src={file.previewUrl}
                className="w-full h-full object-cover"
                alt="Preview"
                loading="lazy"
              />
            ) : (
              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center shadow-sm",
                  color
                )}
              >
                <Icon size={20} />
              </div>
            )}

            {/* Loading Overlay - IMPROVED */}
            {file.status === "uploading" && (
              <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center">
                <Loader2
                  className="animate-spin text-blue-600 mb-2"
                  size={20}
                />
                <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-blue-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${file.progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <span className="text-xs font-bold text-blue-600 mt-1.5">
                  {Math.round(file.progress)}%
                </span>
              </div>
            )}

            {/* Error Overlay */}
            {file.status === "error" && (
              <div className="absolute inset-0 bg-red-50/95 backdrop-blur-sm flex flex-col items-center justify-center">
                <FileWarning size={20} className="text-red-500 mb-1" />
                <span className="text-xs font-bold text-red-600">Lỗi tải</span>
              </div>
            )}

            {/* Success Badge */}
            {file.status === "done" && (
              <div className="absolute top-2 left-2 p-1 bg-green-500 rounded-full shadow-sm">
                <CheckCircle2 size={12} className="text-white" />
              </div>
            )}
          </div>

          {/* Hover Overlay - Hiện tên file khi hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end p-3 pointer-events-none">
            <div className="text-white text-xs font-semibold line-clamp-2 leading-tight">
              {name}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Image Preview Modal */}
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

// Simple Image Preview Modal
function ImagePreviewModal({
  imageUrl,
  fileName,
  onClose,
}: {
  imageUrl: string;
  fileName: string;
  onClose: () => void;
}) {
  return ReactDOM.createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
      >
        <X size={24} />
      </button>
      <div className="max-w-4xl max-h-[90vh] w-full h-full flex flex-col items-center justify-center">
        <img
          src={imageUrl}
          alt={fileName}
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />
        <p className="mt-4 text-white text-sm font-medium">{fileName}</p>
      </div>
    </motion.div>,
    document.body
  );
}

// FilePreviewModal.tsx - CHỈ cho PDF, Video và File không hỗ trợ preview
import { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, FileText, FileWarning, Loader2 } from "lucide-react";
import api from "@/shared/lib/axios";

interface FilePreviewModalProps {
  isOpen: boolean;
  file: any;
  onClose: () => void;
  onDownload: (e: any, file: any) => void;
}

export function FilePreviewModal({
  isOpen,
  file,
  onClose,
  onDownload,
}: FilePreviewModalProps) {
  const [hasError, setHasError] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);

  useEffect(() => {
    if (!isOpen || !file) return;

    setHasError(false);
    setIsLoadingUrl(false);
    setPreviewUrl(null);

    const fileKey =
      file.fileKey ||
      file.content?.fileKey ||
      file.content?.attachments?.[0]?.fileKey;
    const storage =
      file.storage || file.content?.attachments?.[0]?.storage || "cloudinary";
    const originalName =
      file.originalName ||
      file.name ||
      file.content?.attachments?.[0]?.originalName ||
      "file";
    const fileUrl =
      file.url || file.content?.attachments?.[0]?.url || file.content?.fileUrl;

    const isR2File = storage === "r2" || !!fileKey;

    if (isR2File && fileKey) {
      setIsLoadingUrl(true);
      api
        .get("/chat/r2/download", {
          params: { key: fileKey, filename: originalName, mode: "inline" },
        })
        .then((res) => {
          const url = res.data?.data?.downloadUrl || res.data?.downloadUrl;
          if (url) {
            setPreviewUrl(url);
          } else {
            setHasError(true);
          }
        })
        .catch(() => setHasError(true))
        .finally(() => setIsLoadingUrl(false));
    } else if (fileUrl) {
      setPreviewUrl(fileUrl);
    } else {
      setHasError(true);
    }
  }, [isOpen, file]);

  if (!isOpen || !file) return null;

  const fileFormat =
    file.format ||
    file.content?.attachments?.[0]?.format ||
    (file.originalName || file.name || "").split(".").pop()?.toLowerCase();
  const urlToCheck =
    previewUrl ||
    file.url ||
    file.content?.attachments?.[0]?.url ||
    file.content?.fileUrl;

  const isPdf =
    fileFormat === "pdf" ||
    urlToCheck?.match(/\.pdf$/i) ||
    (file.originalName || file.name || "").match(/\.pdf$/i);
  const isVideo =
    fileFormat?.match(/^(mp4|mov|avi|webm)$/i) ||
    urlToCheck?.match(/\.(mp4|mov|avi|webm)$/i);

  const modalContent = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-md flex flex-col h-[100dvh] w-screen"
        onClick={onClose}
      >
        {/* Header */}
        <div
          className="flex-shrink-0 h-16 flex items-center justify-between px-4 md:px-6 bg-gradient-to-b from-black/80 to-transparent"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3 text-white overflow-hidden">
            <div className="p-2 bg-white/10 rounded-lg shrink-0">
              <FileText size={18} />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold truncate max-w-[200px] md:max-w-md">
                {file.originalName ||
                  file.name ||
                  file.content?.attachments?.[0]?.originalName ||
                  "Preview"}
              </h3>
              <p className="text-[11px] text-white/60">
                {file.size
                  ? (file.size / 1024 / 1024).toFixed(2) + " MB"
                  : file.content?.attachments?.[0]?.size
                  ? (file.content.attachments[0].size / 1024 / 1024).toFixed(
                      2
                    ) + " MB"
                  : ""}
              </p>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div
          className="flex-1 w-full h-full flex items-center justify-center overflow-hidden p-4"
          onClick={(e) => e.stopPropagation()}
        >
          {isLoadingUrl ? (
            <div className="flex flex-col items-center">
              <Loader2 className="text-white animate-spin mb-4" size={40} />
              <p className="text-sm text-gray-400">Đang tải file...</p>
            </div>
          ) : hasError ? (
            <ErrorView onDownload={onDownload} file={file} />
          ) : (
            <>
              {/* PDF */}
              {isPdf && previewUrl && (
                <div className="w-full h-full max-w-5xl bg-white rounded-lg shadow-2xl overflow-hidden">
                  {(() => {
                    const isIOS =
                      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
                      !(window as any).MSStream;
                    const isAndroid = /Android/.test(navigator.userAgent);
                    const useMobileFallback = isIOS || isAndroid;

                    if (useMobileFallback) {
                      return (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 gap-4 p-6">
                          <FileText size={48} className="text-gray-400" />
                          <p className="text-center text-gray-600 text-sm px-4">
                            Trên thiết bị di động, vui lòng tải xuống để xem
                            file PDF
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDownload(e, file);
                            }}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:scale-95 transition-all shadow-lg font-medium"
                          >
                            Tải xuống PDF
                          </button>
                        </div>
                      );
                    }

                    return (
                      <iframe
                        src={previewUrl}
                        className="w-full h-full border-0"
                        title="PDF Preview"
                        onError={() => setHasError(true)}
                      />
                    );
                  })()}
                </div>
              )}

              {/* Video */}
              {isVideo && previewUrl && (
                <video
                  controls
                  autoPlay
                  className="max-w-full max-h-full rounded-lg shadow-2xl bg-black"
                >
                  <source
                    src={previewUrl}
                    type={`video/${fileFormat || "mp4"}`}
                  />
                </video>
              )}

              {/* File không hỗ trợ */}
              {!isPdf && !isVideo && !hasError && (
                <div className="text-center text-white/80">
                  <FileText size={64} className="mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">
                    Định dạng file này không hỗ trợ xem trước
                  </p>
                  <p className="text-sm text-white/60 mb-6">
                    Vui lòng tải xuống để xem
                  </p>
                  <button
                    onClick={(e) => onDownload(e, file)}
                    className="px-8 py-2.5 bg-white text-black hover:bg-gray-200 rounded-full font-bold transition-all shadow-lg"
                  >
                    Tải xuống
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Toolbar */}
        {!hasError && (isPdf || isVideo) && (
          <div className="flex-shrink-0 h-20 flex items-center justify-center pb-6">
            <button
              onClick={(e) => onDownload(e, file)}
              className="flex items-center gap-2 px-6 py-2 bg-white text-black hover:bg-gray-200 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-lg"
            >
              <Download size={14} />
              <span>Download</span>
            </button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );

  return ReactDOM.createPortal(modalContent, document.body);
}

const ErrorView = ({ onDownload, file }: any) => (
  <div className="text-center p-8 bg-white/5 rounded-2xl border border-white/10 max-w-sm backdrop-blur-sm">
    <FileWarning className="text-red-400 mx-auto mb-4" size={40} />
    <h3 className="text-lg font-semibold text-white mb-2">
      Không thể xem trước
    </h3>
    <p className="text-xs text-gray-400 mb-6">
      File có thể bị chặn hoặc không tồn tại.
    </p>
    <button
      onClick={(e) => onDownload(e, file)}
      className="px-6 py-2.5 bg-white text-black hover:bg-gray-200 rounded-full text-sm font-bold shadow-lg"
    >
      Tải xuống ngay
    </button>
  </div>
);

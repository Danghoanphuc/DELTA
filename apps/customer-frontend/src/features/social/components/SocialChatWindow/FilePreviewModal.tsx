// apps/customer-frontend/src/features/social/components/SocialChatWindow/FilePreviewModal.tsx
// ✅ FIXED: Thêm tính năng Zoom bằng lăn chuột (Mouse Wheel)

import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom"; 
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Download, ZoomIn, ZoomOut, 
  RotateCw, FileText, FileWarning, Loader2
} from "lucide-react";
import api from "@/shared/lib/axios";

interface FilePreviewModalProps {
  isOpen: boolean;
  file: any;
  onClose: () => void;
  onDownload: (e: any, file: any) => void;
}

export function FilePreviewModal({ isOpen, file, onClose, onDownload }: FilePreviewModalProps) {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);

  useEffect(() => {
    if (!isOpen || !file) return;

    // Reset state
    setScale(1);
    setRotation(0);
    setHasError(false);
    setIsLoadingUrl(false);
    setPreviewUrl(null);

    const isR2File = file.storage === 'r2' || file.fileKey;

      if (isR2File && file.fileKey) {
        setIsLoadingUrl(true);
        api.get('/chat/r2/download', {
          params: { 
            key: file.fileKey, 
            filename: file.originalName || file.name,
            mode: 'inline'
          }
        })
      .then((res) => {
        const url = res.data?.data?.downloadUrl;
        if (url) {
            setPreviewUrl(url);
        } else {
            setHasError(true);
        }
      })
      .catch((err) => {
        console.error("R2 Error:", err);
        setHasError(true);
      })
      .finally(() => setIsLoadingUrl(false));
    } else {
      setPreviewUrl(file.url);
    }
  }, [isOpen, file]);

  if (!isOpen || !file) return null;

  const urlToCheck = previewUrl || file.url;
  const isImage = file.type === "image" || urlToCheck?.match(/\.(jpeg|jpg|gif|png|webp|heic)$/i);
  const isPdf = urlToCheck?.match(/\.pdf$/i) || file.format === 'pdf';
  const isVideo = urlToCheck?.match(/\.(mp4|mov|avi)$/i);
  
  // ✅ LOGIC ZOOM BẰNG CHUỘT
  const handleWheel = (e: React.WheelEvent) => {
    if (!isImage) return;
    
    // Ngăn chặn lan truyền sự kiện nếu cần
    e.stopPropagation();

    // Hệ số zoom: Lăn lên (âm) -> Zoom In, Lăn xuống (dương) -> Zoom Out
    // Nhân với -0.001 để đảo chiều và giảm tốc độ cho mượt
    const zoomFactor = -e.deltaY * 0.001;
    
    setScale((prev) => {
        const newScale = prev + zoomFactor;
        // Giới hạn Zoom từ 0.5x đến 5x
        return Math.min(Math.max(0.5, newScale), 5);
    });
  };

  const CloseButton = () => (
    <button
      onClick={(e) => { e.stopPropagation(); onClose(); }}
      className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-[60]"
    >
      <X size={24} />
    </button>
  );

  const modalContent = (
    <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-md flex flex-col h-[100dvh] w-screen"
          onClick={onClose}
        >
          {/* --- 1. HEADER BAR --- */}
          <div 
            className="flex-shrink-0 h-16 flex items-center justify-between px-4 md:px-6 bg-gradient-to-b from-black/80 to-transparent relative z-50"
            onClick={(e) => e.stopPropagation()} 
          >
            <div className="flex items-center gap-3 text-white overflow-hidden">
               <div className="p-2 bg-white/10 rounded-lg shrink-0">
                  <FileText size={18}/>
               </div>
               <div className="min-w-0">
                  <h3 className="text-sm font-semibold truncate max-w-[200px] md:max-w-md">
                    {file.originalName || file.name || "Preview"}
                  </h3>
                  <p className="text-[11px] text-white/60">
                    {file.size ? (file.size / 1024 / 1024).toFixed(2) + " MB" : ""}
                  </p>
               </div>
            </div>
            
            <CloseButton />
          </div>

          {/* --- 2. MAIN CONTENT --- */}
          {/* ✅ Gắn sự kiện onWheel vào đây để bắt được cuộn chuột trên toàn vùng */}
          <div 
            className="flex-1 w-full h-full flex items-center justify-center overflow-hidden relative p-2 md:p-4"
            onClick={(e) => e.stopPropagation()} 
            onWheel={handleWheel} 
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
                {/* ẢNH */}
                {isImage && previewUrl && (
                  <motion.div
                    // ✅ Dùng transition type: false để zoom mượt hơn khi lăn chuột liên tục
                    animate={{ scale, rotate: rotation }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }} 
                    className="cursor-grab active:cursor-grabbing w-full h-full flex items-center justify-center"
                    drag
                    dragConstraints={{ left: -300, right: 300, top: -300, bottom: 300 }}
                  >
                    <img
                      src={previewUrl}
                      alt="Preview"
                      onError={() => setHasError(true)}
                      className="max-h-full max-w-full object-contain rounded shadow-2xl pointer-events-none" // pointer-events-none để tránh conflict drag
                    />
                  </motion.div>
                )}

                {/* PDF */}
                {isPdf && previewUrl && (
                   <div className="w-full h-full max-w-5xl bg-white rounded-lg shadow-2xl overflow-hidden relative">
                      <object
                        data={previewUrl}
                        type="application/pdf"
                        className="w-full h-full block"
                      >
                         <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 gap-4">
                            <p>Trình duyệt không hỗ trợ xem trực tiếp file này.</p>
                            <button 
                                onClick={(e) => onDownload(e, file)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Tải xuống để xem
                            </button>
                         </div>
                      </object>
                   </div>
                )}

                {/* VIDEO */}
                {isVideo && previewUrl && (
                   <video controls autoPlay className="max-w-full max-h-full rounded-lg shadow-2xl bg-black outline-none">
                      <source src={previewUrl} type={`video/${file.format || 'mp4'}`} />
                   </video>
                )}

                {/* FILE KHÔNG HỖ TRỢ */}
                {!isImage && !isPdf && !isVideo && !hasError && (
                   <div className="text-center text-white/80">
                      <FileText size={64} className="mx-auto mb-4 opacity-50"/>
                      <p className="text-lg font-medium">Định dạng file này không hỗ trợ xem trước</p>
                      <button
                        onClick={(e) => onDownload(e, file)}
                        className="mt-6 px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold transition-all"
                      >
                        Tải xuống máy
                      </button>
                   </div>
                )}
              </>
            )}
          </div>

          {/* --- 3. TOOLBAR --- */}
          <div className="flex-shrink-0 h-20 flex items-center justify-center pb-6 z-50 pointer-events-none">
            {!hasError && (
              <div className="flex items-center gap-2 p-2 bg-gray-900/90 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl pointer-events-auto">
                {isImage && (
                  <>
                    <ToolbarBtn icon={ZoomOut} onClick={() => setScale(s => Math.max(0.5, s - 0.25))} tooltip="Thu nhỏ" />
                    {/* Hiển thị mức zoom hiện tại */}
                    <span className="text-[10px] text-white/50 w-8 text-center font-mono">{Math.round(scale * 100)}%</span>
                    <ToolbarBtn icon={ZoomIn} onClick={() => setScale(s => Math.min(5, s + 0.25))} tooltip="Phóng to" />
                    <div className="w-px h-4 bg-white/20 mx-1" />
                    <ToolbarBtn icon={RotateCw} onClick={() => setRotation(r => r + 90)} tooltip="Xoay" />
                    <div className="w-px h-4 bg-white/20 mx-1" />
                  </>
                )}
                
                <button
                  onClick={(e) => onDownload(e, file)}
                  className="flex items-center gap-2 px-6 py-2 bg-white text-black hover:bg-gray-200 rounded-full text-xs font-bold uppercase tracking-wider transition-all ml-1 shadow-lg active:scale-95"
                >
                  <Download size={16} strokeWidth={2.5} /> Download
                </button>
              </div>
            )}
          </div>
        </motion.div>
    </AnimatePresence>
  );

  return ReactDOM.createPortal(modalContent, document.body);
}

const ToolbarBtn = ({ icon: Icon, onClick, tooltip }: any) => (
  <button
    onClick={(e) => { e.stopPropagation(); onClick(); }}
    title={tooltip}
    className="p-2.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all active:scale-90"
  >
    <Icon size={18} />
  </button>
);

const ErrorView = ({ onDownload, file }: any) => (
  <div className="text-center p-8 bg-white/5 rounded-2xl border border-white/10 max-w-sm backdrop-blur-sm">
    <FileWarning className="text-red-400 mx-auto mb-4" size={40} />
    <h3 className="text-lg font-semibold text-white mb-2">Không thể xem trước</h3>
    <p className="text-xs text-gray-400 mb-6">File có thể bị chặn hoặc không tồn tại.</p>
    <button
        onClick={(e) => onDownload(e, file)}
        className="px-6 py-2.5 bg-white text-black hover:bg-gray-200 rounded-full text-sm font-bold shadow-lg"
    >
        Tải xuống ngay
    </button>
  </div>
);
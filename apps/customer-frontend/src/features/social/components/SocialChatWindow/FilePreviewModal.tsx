// apps/customer-frontend/src/features/social/components/SocialChatWindow/FilePreviewModal.tsx
// ✅ FIXED: Thêm tính năng Zoom bằng lăn chuột (Mouse Wheel) + Pinch-to-zoom cho Mobile

import React, { useState, useEffect, useRef } from "react";
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
  
  // ✅ MOBILE: Touch state cho pinch-to-zoom
  const touchStartDistance = useRef<number | null>(null);
  const touchStartScale = useRef<number>(1);
  const isPinching = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !file) return;

    // Reset state
    setScale(1);
    setRotation(0);
    setHasError(false);
    setIsLoadingUrl(false);
    setPreviewUrl(null);

    // ✅ FIX: Kiểm tra fileKey từ nhiều nguồn (attachments array hoặc file object trực tiếp)
    const fileKey = file.fileKey || file.content?.fileKey || (file.content?.attachments?.[0]?.fileKey);
    const storage = file.storage || file.content?.attachments?.[0]?.storage || 'cloudinary';
    const originalName = file.originalName || file.name || file.content?.attachments?.[0]?.originalName || 'file';
    const fileUrl = file.url || file.content?.attachments?.[0]?.url || file.content?.fileUrl;
    
    const isR2File = storage === 'r2' || !!fileKey;

    if (isR2File && fileKey) {
      setIsLoadingUrl(true);
      api.get('/chat/r2/download', {
        params: { 
          key: fileKey, 
          filename: originalName,
          mode: 'inline'
        }
      })
      .then((res) => {
        // ✅ FIX: Backend trả về { data: { downloadUrl, ... } }
        const url = res.data?.data?.downloadUrl || res.data?.downloadUrl;
        if (url) {
            setPreviewUrl(url);
        } else {
            console.error("[FilePreviewModal] No downloadUrl in response:", res.data);
            setHasError(true);
        }
      })
      .catch((err) => {
        console.error("[FilePreviewModal] R2 Error:", err);
        setHasError(true);
      })
      .finally(() => setIsLoadingUrl(false));
    } else if (fileUrl) {
      // ✅ FIX: Dùng fileUrl trực tiếp nếu có (Cloudinary hoặc external URL)
      setPreviewUrl(fileUrl);
    } else {
      console.error("[FilePreviewModal] No fileKey or fileUrl found:", file);
      setHasError(true);
    }
  }, [isOpen, file]);

  if (!isOpen || !file) return null;

  // ✅ FIX: Lấy thông tin file từ nhiều nguồn
  const fileType = file.type || file.content?.attachments?.[0]?.type || 'file';
  const fileFormat = file.format || file.content?.attachments?.[0]?.format || 
                     (file.originalName || file.name || '').split('.').pop()?.toLowerCase();
  const urlToCheck = previewUrl || file.url || file.content?.attachments?.[0]?.url || file.content?.fileUrl;
  
  const isImage = fileType === "image" || 
                  fileFormat?.match(/^(jpeg|jpg|gif|png|webp|heic)$/i) ||
                  urlToCheck?.match(/\.(jpeg|jpg|gif|png|webp|heic)$/i);
  const isPdf = fileFormat === 'pdf' || 
                urlToCheck?.match(/\.pdf$/i) || 
                (file.originalName || file.name || '').match(/\.pdf$/i);
  const isVideo = fileType === "video" ||
                  fileFormat?.match(/^(mp4|mov|avi|webm)$/i) ||
                  urlToCheck?.match(/\.(mp4|mov|avi|webm)$/i);
  
  // ✅ LOGIC ZOOM BẰNG CHUỘT (Desktop)
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

  // ✅ MOBILE: Tính khoảng cách giữa 2 điểm chạm
  const getTouchDistance = (touch1: React.Touch, touch2: React.Touch): number => {
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // ✅ MOBILE: Xử lý bắt đầu pinch
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isImage || e.touches.length !== 2) return;
    
    e.stopPropagation();
    isPinching.current = true;
    const distance = getTouchDistance(e.touches[0], e.touches[1]);
    touchStartDistance.current = distance;
    touchStartScale.current = scale;
  };

  // ✅ MOBILE: Xử lý pinch đang diễn ra
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isImage || !isPinching.current || e.touches.length !== 2) return;
    
    e.stopPropagation();
    e.preventDefault(); // Ngăn scroll khi đang pinch
    
    const distance = getTouchDistance(e.touches[0], e.touches[1]);
    
    if (touchStartDistance.current !== null) {
      const scaleChange = distance / touchStartDistance.current;
      const newScale = touchStartScale.current * scaleChange;
      
      // Giới hạn Zoom từ 0.5x đến 5x
      setScale(Math.min(Math.max(0.5, newScale), 5));
    }
  };

  // ✅ MOBILE: Kết thúc pinch
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isImage) return;
    
    if (e.touches.length < 2) {
      isPinching.current = false;
      touchStartDistance.current = null;
    }
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
          className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-md flex flex-col h-[100dvh] w-screen overscroll-none"
          onClick={onClose}
          style={{ 
            // ✅ MOBILE: Ngăn scroll body khi modal mở
            touchAction: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
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
                    {file.originalName || file.name || file.content?.attachments?.[0]?.originalName || "Preview"}
                  </h3>
                  <p className="text-[11px] text-white/60">
                    {file.size 
                      ? (file.size / 1024 / 1024).toFixed(2) + " MB" 
                      : file.content?.attachments?.[0]?.size 
                        ? (file.content.attachments[0].size / 1024 / 1024).toFixed(2) + " MB"
                        : ""}
                  </p>
               </div>
            </div>
            
            <CloseButton />
          </div>

          {/* --- 2. MAIN CONTENT --- */}
          {/* ✅ Gắn sự kiện onWheel (desktop) + touch events (mobile) để bắt được zoom */}
          <div 
            ref={containerRef}
            className="flex-1 w-full h-full flex items-center justify-center overflow-hidden relative p-2 md:p-4 touch-none"
            onClick={(e) => e.stopPropagation()} 
            onWheel={handleWheel}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
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
                    // ✅ Dùng transition có điều kiện: mượt khi pinch, instant khi button zoom
                    animate={{ scale, rotate: rotation }}
                    transition={isPinching.current 
                      ? { type: false } // Không animation khi đang pinch để responsive hơn
                      : { type: "spring", stiffness: 300, damping: 30 }
                    } 
                    className="cursor-grab active:cursor-grabbing w-full h-full flex items-center justify-center touch-none select-none"
                    drag
                    dragConstraints={{ 
                      left: -300, 
                      right: 300, 
                      top: -300, 
                      bottom: 300 
                    }}
                    dragElastic={0.2}
                    // ✅ MOBILE: Cho phép drag ngay cả khi zoom
                    whileDrag={{ cursor: "grabbing" }}
                  >
                    <img
                      src={previewUrl}
                      alt="Preview"
                      onError={() => setHasError(true)}
                      draggable={false} // Ngăn native drag behavior
                      className="max-h-full max-w-full object-contain rounded shadow-2xl pointer-events-none user-select-none" 
                    />
                  </motion.div>
                )}

                {/* PDF */}
                {isPdf && previewUrl && (
                   <div className="w-full h-full max-w-5xl bg-white rounded-lg shadow-2xl overflow-hidden relative">
                      {/* ✅ DESKTOP: Dùng iframe cho PDF */}
                      {/* ✅ MOBILE: iOS Safari không hỗ trợ PDF trong iframe, dùng Google Docs Viewer */}
                      {(() => {
                        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
                        const isAndroid = /Android/.test(navigator.userAgent);
                        const useMobileFallback = isIOS || isAndroid;
                        
                        if (useMobileFallback) {
                          // ✅ MOBILE: Sử dụng Google Docs Viewer hoặc direct download
                          const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(previewUrl)}&embedded=true`;
                          
                          return (
                            <>
                              <iframe
                                src={googleViewerUrl}
                                className="w-full h-full border-0"
                                title="PDF Preview"
                                onError={() => setHasError(true)}
                              />
                              {/* Fallback nếu Google Viewer không hoạt động */}
                              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 gap-4 p-6">
                                <FileText size={48} className="text-gray-400" />
                                <p className="text-center text-gray-600 text-sm px-4">
                                  Trên thiết bị di động, vui lòng tải xuống để xem file PDF
                                </p>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); onDownload(e, file); }}
                                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:scale-95 transition-all shadow-lg font-medium"
                                >
                                  Tải xuống PDF
                                </button>
                              </div>
                            </>
                          );
                        }
                        
                        // ✅ DESKTOP: iframe trực tiếp
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
          <div className="flex-shrink-0 h-20 flex items-center justify-center pb-4 md:pb-6 z-50 pointer-events-none">
            {!hasError && (
              <div className="flex items-center gap-1.5 md:gap-2 p-1.5 md:p-2 bg-gray-900/90 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl pointer-events-auto max-w-[95vw] overflow-x-auto scrollbar-hide">
                {isImage && (
                  <>
                    <ToolbarBtn 
                      icon={ZoomOut} 
                      onClick={() => {
                        isPinching.current = false; // Reset pinch state
                        setScale(s => Math.max(0.5, s - 0.25));
                      }} 
                      tooltip="Thu nhỏ" 
                    />
                    {/* Hiển thị mức zoom hiện tại - ẩn trên mobile nhỏ để tiết kiệm không gian */}
                    <span className="text-[10px] text-white/50 w-6 md:w-8 text-center font-mono hidden sm:inline">
                      {Math.round(scale * 100)}%
                    </span>
                    <ToolbarBtn 
                      icon={ZoomIn} 
                      onClick={() => {
                        isPinching.current = false; // Reset pinch state
                        setScale(s => Math.min(5, s + 0.25));
                      }} 
                      tooltip="Phóng to" 
                    />
                    <div className="w-px h-4 bg-white/20 mx-0.5 md:mx-1" />
                    <ToolbarBtn icon={RotateCw} onClick={() => setRotation(r => r + 90)} tooltip="Xoay" />
                    <div className="w-px h-4 bg-white/20 mx-0.5 md:mx-1" />
                  </>
                )}
                
                <button
                  onClick={(e) => onDownload(e, file)}
                  className="flex items-center gap-1.5 md:gap-2 px-4 md:px-6 py-1.5 md:py-2 bg-white text-black hover:bg-gray-200 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all ml-0.5 md:ml-1 shadow-lg active:scale-95 touch-manipulation"
                >
                  <Download size={14} strokeWidth={2.5} className="md:w-4 md:h-4" /> 
                  <span className="hidden xs:inline">Download</span>
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
    className="p-2 md:p-2.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all active:scale-90 touch-manipulation"
    aria-label={tooltip}
  >
    <Icon size={16} className="md:w-[18px] md:h-[18px]" />
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
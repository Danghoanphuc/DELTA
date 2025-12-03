// ImagePreviewModal.tsx - Chỉ dành cho ảnh với zoom, rotate, drag
import React, { useState, useRef } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, ZoomIn, ZoomOut, RotateCw, Loader2 } from "lucide-react";

interface ImagePreviewModalProps {
  isOpen: boolean;
  imageUrl: string;
  imageName?: string;
  onClose: () => void;
  onDownload?: () => void;
}

export function ImagePreviewModal({
  isOpen,
  imageUrl,
  imageName = "Image",
  onClose,
  onDownload,
}: ImagePreviewModalProps) {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Touch state cho pinch-to-zoom
  const touchStartDistance = useRef<number | null>(null);
  const touchStartScale = useRef<number>(1);
  const isPinching = useRef(false);

  if (!isOpen) return null;

  // Reset state khi đóng/mở
  const handleClose = () => {
    setScale(1);
    setRotation(0);
    setIsLoading(true);
    setHasError(false);
    onClose();
  };

  // Zoom bằng chuột
  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    const zoomFactor = -e.deltaY * 0.001;
    setScale((prev) => Math.min(Math.max(0.5, prev + zoomFactor), 5));
  };

  // Pinch-to-zoom
  const getTouchDistance = (touch1: React.Touch, touch2: React.Touch) => {
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 2) return;
    e.stopPropagation();
    isPinching.current = true;
    touchStartDistance.current = getTouchDistance(e.touches[0], e.touches[1]);
    touchStartScale.current = scale;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPinching.current || e.touches.length !== 2) return;
    e.stopPropagation();
    e.preventDefault();

    const distance = getTouchDistance(e.touches[0], e.touches[1]);
    if (touchStartDistance.current) {
      const scaleChange = distance / touchStartDistance.current;
      const newScale = touchStartScale.current * scaleChange;
      setScale(Math.min(Math.max(0.5, newScale), 5));
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      isPinching.current = false;
      touchStartDistance.current = null;
    }
  };

  const modalContent = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-md flex flex-col h-[100dvh] w-screen"
        onClick={handleClose}
        style={{ touchAction: "none" }}
      >
        {/* Header */}
        <div
          className="flex-shrink-0 h-16 flex items-center justify-between px-4 md:px-6 bg-gradient-to-b from-black/80 to-transparent"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-sm font-semibold text-white truncate max-w-[70%]">
            {imageName}
          </h3>
          <button
            onClick={handleClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Image Container */}
        <div
          className="flex-1 w-full h-full flex items-center justify-center overflow-hidden p-4"
          onClick={(e) => e.stopPropagation()}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {isLoading && !hasError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="text-white animate-spin" size={40} />
            </div>
          )}

          {hasError ? (
            <div className="text-center text-white">
              <p className="mb-4">Không thể tải ảnh</p>
              {onDownload && (
                <button
                  onClick={onDownload}
                  className="px-6 py-2 bg-white text-black rounded-full font-bold"
                >
                  Tải xuống
                </button>
              )}
            </div>
          ) : (
            <motion.div
              animate={{ scale, rotate: rotation }}
              transition={
                isPinching.current
                  ? { type: false }
                  : { type: "spring", stiffness: 300, damping: 30 }
              }
              className="cursor-grab active:cursor-grabbing"
              drag
              dragMomentum={false}
              dragElastic={0}
              style={{
                width: "fit-content",
                height: "fit-content",
              }}
            >
              <img
                src={imageUrl}
                alt={imageName}
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setIsLoading(false);
                  setHasError(true);
                }}
                draggable={false}
                className="max-h-full max-w-full object-contain rounded shadow-2xl pointer-events-none select-none"
              />
            </motion.div>
          )}
        </div>

        {/* Toolbar */}
        {!hasError && (
          <div className="flex-shrink-0 h-20 flex items-center justify-center pb-6 pointer-events-none">
            <div className="flex items-center gap-2 p-2 bg-gray-900/90 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl pointer-events-auto">
              <button
                onClick={() => setScale((s) => Math.max(0.5, s - 0.25))}
                className="p-2.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all"
                title="Thu nhỏ"
              >
                <ZoomOut size={18} />
              </button>
              <span className="text-xs text-white/50 w-12 text-center font-mono">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={() => setScale((s) => Math.min(5, s + 0.25))}
                className="p-2.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all"
                title="Phóng to"
              >
                <ZoomIn size={18} />
              </button>
              <div className="w-px h-4 bg-white/20 mx-1" />
              <button
                onClick={() => setRotation((r) => r + 90)}
                className="p-2.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all"
                title="Xoay"
              >
                <RotateCw size={18} />
              </button>
              {onDownload && (
                <>
                  <div className="w-px h-4 bg-white/20 mx-1" />
                  <button
                    onClick={onDownload}
                    className="flex items-center gap-2 px-6 py-2 bg-white text-black hover:bg-gray-200 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-lg"
                  >
                    <Download size={14} />
                    <span>Download</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );

  return ReactDOM.createPortal(modalContent, document.body);
}

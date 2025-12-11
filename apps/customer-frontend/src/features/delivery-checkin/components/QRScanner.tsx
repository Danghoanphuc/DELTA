// apps/customer-frontend/src/features/delivery-checkin/components/QRScanner.tsx
/**
 * QR Code Scanner Component
 * Allows shippers to scan order QR codes for quick check-in
 */

import { useEffect, useRef, useState } from "react";
import { X, Camera, AlertCircle } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent } from "@/shared/components/ui/dialog";

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (orderNumber: string) => void;
}

export function QRScanner({ isOpen, onClose, onScan }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<number | null>(null);

  // Start camera
  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsScanning(true);
      }
    } catch (err: any) {
      console.error("Camera error:", err);
      setError("Không thể truy cập camera. Vui lòng cho phép quyền camera.");
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    setIsScanning(false);
  };

  // Scan QR code from video frame
  const scanFrame = async () => {
    if (!videoRef.current || !canvasRef.current || !isScanning) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) return;

    // Set canvas size to video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get image data
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    // Try to detect QR code using browser's built-in detector
    try {
      // @ts-ignore - BarcodeDetector is experimental
      if ("BarcodeDetector" in window) {
        // @ts-ignore
        const barcodeDetector = new BarcodeDetector({
          formats: ["qr_code"],
        });
        const barcodes = await barcodeDetector.detect(imageData);

        if (barcodes.length > 0) {
          const orderNumber = barcodes[0].rawValue;
          stopCamera();
          onScan(orderNumber);
          onClose();
        }
      } else {
        // Fallback: Use jsQR library (would need to install)
        // For now, show error
        setError(
          "Trình duyệt không hỗ trợ quét QR. Vui lòng nhập mã thủ công."
        );
        stopCamera();
      }
    } catch (err) {
      console.error("QR scan error:", err);
    }
  };

  // Start scanning when camera is ready
  useEffect(() => {
    if (isOpen && !isScanning) {
      startCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  // Scan frames periodically
  useEffect(() => {
    if (isScanning) {
      scanIntervalRef.current = window.setInterval(scanFrame, 300); // Scan every 300ms
    }

    return () => {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
    };
  }, [isScanning]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-0">
        <div className="relative">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              <h3 className="font-semibold">Quét mã QR đơn hàng</h3>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Video Preview */}
          <div className="relative bg-black aspect-video">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Scanning overlay */}
            {isScanning && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-64 border-4 border-white rounded-lg relative">
                  {/* Corner markers */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary" />

                  {/* Scanning line animation */}
                  <div className="absolute inset-x-0 top-0 h-1 bg-primary animate-scan" />
                </div>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="p-4 bg-gray-50">
            {error ? (
              <div className="flex items-start gap-2 text-red-600">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-600 text-center">
                Đưa mã QR vào khung hình để quét
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Add CSS animation for scanning line
const style = document.createElement("style");
style.textContent = `
  @keyframes scan {
    0% { transform: translateY(0); }
    100% { transform: translateY(256px); }
  }
  .animate-scan {
    animation: scan 2s linear infinite;
  }
`;
document.head.appendChild(style);

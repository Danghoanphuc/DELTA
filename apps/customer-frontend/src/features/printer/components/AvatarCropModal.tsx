// src/features/printer/components/AvatarCropModal.tsx
import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Slider } from "@/shared/components/ui/slider";
import { ZoomIn, ZoomOut, Move, RotateCcw, Check, X, Loader2 } from "lucide-react";
import { toast } from "@/shared/utils/toast";

interface AvatarCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  onSave: (file: File) => Promise<void>;
}

export function AvatarCropModal({ isOpen, onClose, imageSrc, onSave }: AvatarCropModalProps) {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isSaving, setIsSaving] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(new Image());

  // Reset state khi mở modal mới
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setPosition({ x: 0, y: 0 });
      imageRef.current.src = imageSrc;
    }
  }, [isOpen, imageSrc]);

  // Vẽ lên canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const img = imageRef.current;

    const draw = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Fill background (màu tối để làm nổi bật vùng crop)
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Tính toán kích thước ảnh sau khi zoom
      const scale = Math.max(canvas.width / img.width, canvas.height / img.height) * zoom;
      const w = img.width * scale;
      const h = img.height * scale;

      // Tính toán vị trí trung tâm
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Giới hạn vùng kéo thả (không cho kéo ảnh ra khỏi vùng crop)
      // Logic đơn giản hóa: cho phép kéo tự do một chút để trải nghiệm mượt hơn
      
      // Vẽ ảnh
      ctx.save();
      ctx.translate(centerX + position.x, centerY + position.y);
      ctx.drawImage(img, -w / 2, -h / 2, w, h);
      ctx.restore();

      // Vẽ lớp phủ tối bên ngoài vùng tròn
      ctx.save();
      ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
      ctx.beginPath();
      ctx.rect(0, 0, canvas.width, canvas.height);
      ctx.arc(centerX, centerY, 140, 0, 2 * Math.PI, true); // Vùng tròn trong suốt (r=140)
      ctx.fill("evenodd");
      ctx.restore();

      // Vẽ viền tròn hướng dẫn
      ctx.beginPath();
      ctx.arc(centerX, centerY, 140, 0, 2 * Math.PI);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
    };

    if (img.complete) {
      draw();
    } else {
      img.onload = draw;
    }
  }, [zoom, position, imageSrc]);

  // Handlers cho Drag
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  // Handlers cho Save
  const handleSave = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsSaving(true);

    try {
      // Tạo canvas tạm để cắt đúng hình tròn
      const tempCanvas = document.createElement("canvas");
      const size = 400; // Output size
      tempCanvas.width = size;
      tempCanvas.height = size;
      const tCtx = tempCanvas.getContext("2d");

      if (!tCtx) return;

      // Vẽ lại ảnh lên canvas tạm (nhưng chỉ lấy vùng trung tâm)
      // Tính toán tương tự như hàm draw ở trên nhưng map về kích thước output
      const img = imageRef.current;
      const scale = Math.max(canvas.width / img.width, canvas.height / img.height) * zoom;
      
      // Tỉ lệ giữa canvas hiển thị (400px) và canvas xuất (400px) là 1:1
      // Offset vị trí
      const offsetX = (canvas.width / 2 + position.x) - (img.width * scale) / 2;
      const offsetY = (canvas.height / 2 + position.y) - (img.height * scale) / 2;

      tCtx.drawImage(img, offsetX, offsetY, img.width * scale, img.height * scale);

      // Chuyển thành Blob (File)
      tempCanvas.toBlob(async (blob) => {
        if (blob) {
          const file = new File([blob], "avatar-cropped.png", { type: "image/png" });
          await onSave(file);
          onClose();
        } else {
          toast.error("Lỗi xử lý ảnh");
        }
        setIsSaving(false);
      }, "image/png", 1.0);

    } catch (error) {
      console.error(error);
      toast.error("Không thể lưu ảnh");
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isSaving && !open && onClose()}>
      <DialogContent className="sm:max-w-md p-0 gap-0 bg-gray-900 border-gray-800 text-white overflow-hidden">
        <DialogHeader className="p-4 bg-gray-900 border-b border-gray-800">
          <DialogTitle className="text-center text-white flex items-center justify-center gap-2">
            <Move className="w-4 h-4" /> Căn chỉnh ảnh đại diện
          </DialogTitle>
        </DialogHeader>

        <div className="relative w-full h-[400px] bg-black cursor-move touch-none select-none overflow-hidden flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={400}
            height={400}
            className="max-w-full max-h-full"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full text-xs text-gray-300 pointer-events-none">
            Kéo để di chuyển
          </div>
        </div>

        <div className="p-6 bg-gray-900 space-y-6">
          <div className="flex items-center gap-4">
            <ZoomOut className="w-5 h-5 text-gray-400" />
            <Slider
              value={[zoom]}
              min={1}
              max={3}
              step={0.1}
              onValueChange={([v]) => setZoom(v)}
              className="flex-1"
            />
            <ZoomIn className="w-5 h-5 text-gray-400" />
          </div>

          <div className="flex justify-between items-center pt-2">
             <Button 
               variant="ghost" 
               size="sm" 
               onClick={() => { setZoom(1); setPosition({x:0, y:0}); }}
               className="text-gray-400 hover:text-white hover:bg-gray-800"
             >
               <RotateCcw className="w-4 h-4 mr-2" /> Đặt lại
             </Button>
             <div className="flex gap-3">
                <Button variant="outline" onClick={onClose} disabled={isSaving} className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white">
                   <X className="w-4 h-4 mr-2" /> Hủy
                </Button>
                <Button onClick={handleSave} disabled={isSaving} className="bg-white text-black hover:bg-gray-200">
                   {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                   Lưu ảnh
                </Button>
             </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}